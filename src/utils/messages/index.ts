import { Prisma } from "@prisma/client";
import prisma from "../prisma";

export class Message {

    constructor(
        private data: Prisma.MessageUncheckedCreateInput
    ) { }

    public static async create(data: Prisma.MessageUncheckedCreateInput) {
        return new Message(await prisma.message.create({ data }))
    }

    public static async findById(id: number) {
        const data = await prisma.message.findUnique({
            where: { id }
        })

        if (!data) {
            throw new Error("Message not found")
        }

        return new Message(data)
    }

    public delete() {
        return prisma.message.delete({
            where: {
                id: this.data.id
            }
        })
    }

    public save() {
        return prisma.message.update({
            data: this.data,
            where: {
                id: this.data.id
            }
        })
    }

    public getData() {
        return this.data
    }
}