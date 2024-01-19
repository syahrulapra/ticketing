import { serve } from '@hono/node-server'
import { Context, Hono, Next } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { logger } from 'hono/logger'
import { jwt, sign } from 'hono/jwt'
import { cors } from 'hono/cors'
import mongoose from 'mongoose'
import { Ticket, Counter, TicketAnswered } from '../models/ticketModels'
import Users from '../models/usersModels'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'

const app = new Hono()

dotenv.config()

mongoose.connect(process.env.DB_URL!)
const conn = mongoose.connection

conn.on('error', () => {
  console.log('connection failed')
  process.exit
}).once('open', () => {
  console.log('Database Connected')
})

const salt = 10

app.use('*', logger())
app.use('*', prettyJSON())
app.use('/ticket/*', cors())

app.use('/login', async (c) => {
  const { email, password } = await c.req.json()

  const user = await Users.findOne({ email: email })

  if(!user) {
    return c.json({message: "User not found"}, {status: 404})
  }

  if(!user.password) {
    return c.json({message: "Password not set"}, {status: 404})
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if(isPasswordValid) {
    const payload = {
      id: user.id.toString(),
      name: user.username, 
      role: user.role
    }

    const secret = process.env.JWT_SECRET!

    const token = await sign(payload, secret)

    return c.json({
      data: payload,
      token: token
    })
  } else {
      return c.json({message: "Wrong password"}, {status: 403})
  }
})

app.use('/ticket/*', (c, next) => {
  const jwtMiddlewaare = jwt({
    secret: process.env.JWT_SECRET!,
  })

  return jwtMiddlewaare(c, next)
})

const authorize = (roles: string | string[]) => {
  return async (c: Context, next: Next) => {
    const payload = c.get('jwtPayload')
    if (payload && roles.includes(payload.role)) {
      await next()
    } else {
      return c.json({ message: "Forbidden" }, { status: 403 })
    }
  }
}

app.post('/register', 
// authorize('Admin'), //jika dibutuhkan
async (c) => {
  try {
    const { username, email, password, role } = await c.req.json()
    const hashedPassword = bcrypt.hashSync(password, salt)
    const users = await Users.create({
      username,
      email,
      password: hashedPassword,
      role
    })

    return c.json({ message: "Created", data: users }, { status: 201 })
  } catch (err) {
    console.log(err)
    return c.json({ message: "Vailed" }, { status: 500 })
  }
})

app.get('/ticket', authorize(['Admin', 'User']), async (c) => {
  const page: number = Number(c.req.query('page')) || 1
  const size: number = Number(c.req.query('size')) || 10
  const skip: number = (page - 1) * size
  
  try {
    const ticket = await Ticket.find()
    .skip(skip)
    .limit(size)

    return c.json({ tickets: ticket }, { status: 200 })
  } catch (err) {
    console.log(err)
    return c.json({ err: err }, { status: 500 })
  }
})

app.post('/ticket', authorize('User'), async (c) => {
  const counter = await Counter.findOneAndUpdate(
    { id: "autoval" },
    { "$inc": { "seq": 1 } },
    { new: true, upsert: true }
  )

  const date = new Date()
  const formattedDate = date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })

  try {
    const { subject, message, priority } = await c.req.json()
    const ticketNumber = "int" + formattedDate.replace(/\//g, '') + counter.seq
    const ticket = await Ticket.create({
      ticketNumber,
      subject,
      message,
      priority
    })

    return c.json({ message: "Created", data: ticket }, { status: 201 })
  } catch (err) {
    console.log(err)
    return c.json({ message: "Vailed" }, { status: 500 })
  }
})

app.get('/ticket/answered/:id', authorize('User'), async (c) => { 
  const id = c.req.param('id')
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return c.json({ message: "id not found" }, { status: 404 })
  }

  try {
    const ticket = await TicketAnswered.findById(id).populate('tickets')

    if(!ticket) {
      return c.json({ message: "id not found" }, { status: 404 })
    }

    return c.json({ tickets: ticket }, { status: 200 })
  } catch (err) {
    console.log(err)
    return c.json({ err: err }, { status: 500 })
  }
})

app.post('/ticket/:number', authorize('Admin'), async (c) => {
  const number = c.req.param('number')
  
  try {
    const { message } = await c.req.json()

    const ticketUp = await Ticket.updateOne({ ticketNumber: number }, {
      status: "Answered"
    })

    if(ticketUp.modifiedCount === 0) {
      return c.json({ message: "ticketNumber not found" }, { status: 404 })
    }

    const ticket = await Ticket.findOne({ ticketNumber: number })

    const data = await TicketAnswered.create({
      tickets: ticket?._id,
      message
    })
    
    return c.json({ message: "Answered", data: data }, { status: 201 })
  } catch(err) {
    console.log(err)
    return c.json({ message: "Vailed" }, { status: 500 })
  }
})

app.put('/ticket/close/:number', authorize('User'), async (c) => {
  const number = c.req.param('number')
  
  try {
    const ticket = await Ticket.updateOne({ ticketNumber: number }, {
      status: "Closed"
    })

    if(ticket.modifiedCount === 0) {
      return c.json({ message: "ticketNumber not found" }, { status: 404 })
    }

    const data = await Ticket.findOne({ ticketNumber: number }) 
    
    return c.json({ message: "Closed", data: data }, { status: 201 })
  } catch(err) {
    console.log(err)
    return c.json({ message: "Vailed" }, { status: 500 })
  }
})

app.delete('/ticket/:id', authorize('User'), async (c) => {
  const id = c.req.param('id')

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return c.json({ message: "id not found" }, { status: 404 })
  }

  try {
    const ticket = await Ticket.findByIdAndDelete(id)

    if(!ticket) {
      return c.json({ message: "id not found" }, { status: 404 })
    }

    return c.json({message: "Deleted", id: id}, {status: 201})
  } catch(err) {
    console.log(err)
    return c.json({message: "Vailed"}, {status: 500})
  }
})


const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})