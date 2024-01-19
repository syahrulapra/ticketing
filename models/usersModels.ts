import mongoose, { Schema } from "mongoose";

const usersSchema = new Schema(
	{
		username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
	}
)

const Users = mongoose.model('Users', usersSchema);

export default Users