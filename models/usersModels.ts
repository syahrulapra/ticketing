import mongoose, { Document, Schema } from "mongoose";

enum role {
    Admin = "Admin",
    User = "User"
}

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: string;
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

const Users = mongoose.model<IUser>('Users', usersSchema);

export default Users