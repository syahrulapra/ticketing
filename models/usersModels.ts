import mongoose, { Schema } from "mongoose";

enum role {
    Admin = "Admin",
    User = "User"
}

const usersSchema = new Schema(
	{
		username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: role.User
        }
	}
)

const Users = mongoose.model('Users', usersSchema);

export default Users