import { LLAMA } from "./services/llama";
import { Server } from "./services/server";
import { Environment } from "./utils/env";

const init = async () => {

    Environment.init();

    const server = new Server({ port: 3000 })
    const port = await server.start();

    console.log(`Servidor iniciado na porta ${port}`)
}

init();
