import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { Chat } from "../chat";
import bcrypt from "bcrypt";
import { Environment } from "../env";

export class User {

    constructor(
        private data: Prisma.$UserPayload['scalars']
    ) { }

    public static async create(data: Prisma.UserCreateInput) {
        const exists = await prisma.user.findUnique({ where: { email: data.email } })

        if (exists) {
            throw new Error("Usuário já existe")
        }

        const password = await bcrypt.hash(Environment.getBcryptPassword() as any, 10);
        console.log(password)

        const user = await prisma.user.create({
            data: {
                ...data,
                password
            }
        })
        return new User(user)
    }

    public static async findById(id: number) {
        const data = await prisma.user.findUnique({
            where: { id }
        })

        if (!data) {
            throw new Error("Usuário não encontrado")
        }

        return new User(data)
    }

    public static async findByEmail(email: string) {
        const data = await prisma.user.findUnique({
            where: { email }
        })

        if (!data) {
            throw new Error("Usuário não encontrado com este e-mail")
        }

        return new User(data)
    }

    public save() {
        return prisma.user.update({
            data: this.data,
            where: {
                id: this.data.id
            }
        })
    }

    public checkPassword(password: string) {
        return bcrypt.compareSync(password, this.data.password)
    }

    public async createChat(title: string) {
        return await Chat.create({ userId: this.data.id, title })
    }

    public async getChats() {
        return (
            await prisma.chat.findMany({
                where: {
                    userId: this.data.id
                }
            })
        ).map(
            (chat) => new Chat(chat)
        )
    }

    public getData() {
        return this.data
    }
}