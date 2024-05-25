import { LLAMA } from "./services/llama";
import { Server } from "./services/server";
import { WebSocketServer } from "./services/web-socket";
import { Environment } from "./utils/env";

const init = async () => {

    Environment.init();

    const server = new Server({ port: Environment.getApiPort() })
    const port = await server.start();

    const socket = new WebSocketServer({ port: Environment.getWsPort() })
    const socketPort = await socket.start();

    console.log(`Servidor iniciado na porta ${port}`)
    console.log(`Servidor de WebSocket iniciado na porta ${socketPort}`)
}

init();
