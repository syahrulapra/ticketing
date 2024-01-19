import mongoose, { Schema } from "mongoose";

enum status {
	Open = "Open",
	Answered = "Answered",
	Closed = "Closed"
}

enum priority {
	High = "High",
	Medium = "Medium",
	Low = "Low"
}

const ticketSchema = new Schema(
	{
		ticketNumber: { type: String },
		subject: { type: String, required: true },
		message: { type: String, required: true },
		status: {
			type: String,
			default: status.Open,
			enum: status
		},
		priority: {
			type: String,
			enum: priority,
			required: true
		}
	}
)

const Ticket = mongoose.model('Ticket', ticketSchema);

const ticketAnsweredSchema = new mongoose.Schema({
    tickets: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    message: { type: String, required: true },
});

const TicketAnswered = mongoose.model('TicketAnswered', ticketAnsweredSchema);

const counterSchema = new mongoose.Schema({
	id: String,
	seq: Number
});

const Counter = mongoose.model('Counter', counterSchema);

export { Ticket, Counter, TicketAnswered };