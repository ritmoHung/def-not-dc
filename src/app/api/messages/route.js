// # api/messages
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CustomError, handleApiError } from "@/app/utils/error.server";

// Mongoose
import connectDB from "@/app/utils/db/connectDB";
import Thread from "@/app/utils/db/models/thread";
import Message from "@/app/utils/db/models/message";



// # Create a new message
// For everyone; must be in the thread
export async function POST(req) {
    let message, level, status;

    try {
        const session = await auth();
        if (!session?.user.id) {
            throw new CustomError.AuthorizationError();
        }

        await connectDB();
		const messageData = await req.json();

        const newMessage = new Message(messageData);
        const createdMessage = await newMessage.save();

        if (!createdMessage) {
            throw new CustomError.CreationError(`Message '${messageData.id}' creation failed.`);
        } else {
            message = `Message '${messageData.id}' created successfully.`;
            level = "info";
            status = 200;
        }
    } catch (error) {
        ({ message, level, status } = handleApiError(error));
    }

    return NextResponse.json({ message, level }, { status });
}

// # Get all messages by thread_id param, returns in reverse createdAt order
// For everyone; must be in the thread
export async function GET(req) {
    let message, level, status;
	let data = [];

    try {
        const threadId = req.nextUrl.searchParams.get("thread_id");

        const session = await auth();
		const thread = await Thread.findOne({
            thread_id: threadId,
            $or: [
                { public: true },
                { public: false, "members.user_id": session.user.id },
            ]
        }, "thread_id").lean();
        if (!thread) {
            throw new CustomError.AuthorizationError("You do not have permission to view this thread or it does not exist.");
        }

        await connectDB();
        const projection = "-_id -v";
		const allMessages = await Message.find({ thread_id: threadId }, projection)
                                         .sort({ createdAt: 1 })
                                         .lean();

        if (allMessages.length === 0) {
            message = `No messages.`;
            level = "info";
            status = 200;
        } else {
			data = allMessages;
            message = `Messages retrieved successfully.`;
            level = "log";
            status = 200;
        }
    } catch (error) {
        ({ message, level, status } = handleApiError(error));
    }

    return NextResponse.json({ data, message, level }, { status });
}