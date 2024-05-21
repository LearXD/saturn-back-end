import { IncomingMessage } from "http";
import { WebSocketServerConfig } from "./interfaces/index.types";
import * as ws from 'ws';
import { Task } from "./utils/task";
import { UserValidator } from "../server/middlewares/user-validator";

export class WebSocketServer {

    private static instance: WebSocketServer;

    private server: ws.WebSocketServer;
    private tasks: Task[] = [];

    constructor(
        private readonly config: WebSocketServerConfig
    ) {
        this.server = new ws.WebSocketServer({ port: this.config.port });
        WebSocketServer.instance = this;
    }

    public static getInstance = () => WebSocketServer.instance;

    public start = () => {
        return new Promise((resolve, reject) => {
            this.server.on('listening', () => {
                this.init();
                resolve(this.config.port)
            })
            this.server.on('error', (error) => reject(error))
        })
    }

    public init = async () => {
        this.server.on('connection', async (client: ws.WebSocket, req: IncomingMessage) => {
            const uuid = req.url?.split('/')[1];
            const token = req.headers['sec-websocket-protocol']

            if (!uuid || !token) {
                client.send(JSON.stringify({ error: true, message: 'Invalid request' }))
                return client.close();
            }

            const user = await UserValidator.getUserByToken(token);

            if (!user) {
                client.send(JSON.stringify({ error: true, message: 'Invalid token' }))
                return client.close();
            }

            const task = this.getTask(uuid as string);
            if (!task) {
                client.send(JSON.stringify({ error: true, message: 'Task not found' }))
                return client.close();
            }

            if (task.getData()?.userId !== user.getData().id) {
                client.send(JSON.stringify({ error: true, message: 'Unauthorized' }))
                return client.close();
            }

            console.log(`Starting task ${uuid}`)
            await task.run(client);
            console.log(`Task ${uuid} finished`)

            this.tasks = this.tasks.filter(t => t.getUuid() !== uuid);
        });
    }

    public createTask = (task: Task) => {
        this.tasks.push(task);
    }

    public getTask = (uuid: string) => {
        return this.tasks.find(task => task.getUuid() === uuid);
    }
}