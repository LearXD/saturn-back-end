import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { Message } from "../messages";

export class Chat {

    constructor(
        private data: Prisma.$ChatPayload['scalars']
    ) { }

    public static async create(data: Prisma.ChatUncheckedCreateInput) {
        return new Chat(await prisma.chat.create({ data }))
    }

    public static async findById(id: number) {
        const data = await prisma.chat.findUnique({
            where: { id }
        })

        if (!data) {
            throw new Error("Chat not found")
        }

        return new Chat(data)
    }

    public async delete() {
        const messages = await this.getMessages();
        await Promise.all(messages.map((message) => message.delete()))

        return prisma.chat.delete({
            where: {
                id: this.data.id
            }
        })
    }

    public save() {
        return prisma.chat.update({
            data: this.data,
            where: {
                id: this.data.id
            }
        })
    }

    public async createMessage(content: string, fromUser: boolean) {
        return await Message.create({ content, fromUser, chatId: this.data.id })
    }

    public async getMessages() {
        const messages = (
            await prisma.message.findMany({
                where: {
                    chatId: this.data.id
                }
            })
        ).map(
            (message) => new Message(message)
        )

        return messages
    }

    public getData() {
        return this.data
    }
}