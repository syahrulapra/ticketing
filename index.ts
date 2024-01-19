import { serve } from '@hono/node-server'
import { Hono } from 'hono'
// import connectDB from '../config/db'
import Ticket from '../models/userModels'

const app = new Hono()

// connectDB()

app.get('/', async (c) => {
  // try {
  //   const ticket = await Ticket.find()
  //     .exec()
  //   c.json({ tickets: ticket }, { status: 200 })
  // } catch (err) {
  //   c.json({ err: err }, { status: 500 })
  // }
  c.json('hello world')
})

app.get('/users', async (c) => {
  c.json('hello World')
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
