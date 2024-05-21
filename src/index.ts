import { LLAMA } from "./services/llama";
import { Server } from "./services/server";
import { WebSocketServer } from "./services/web-socket";
import { Environment } from "./utils/env";

const init = async () => {

    Environment.init();

    const server = new Server({ port: 3000 })
    const port = await server.start();

    const socket = new WebSocketServer({ port: 3001 })
    const socketPort = await socket.start();

    console.log(`Servidor iniciado na porta ${port}`)
    console.log(`Servidor de WebSocket iniciado na porta ${socketPort}`)
}

init();
