import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { ServerConfig } from "./interfaces/index.types";

import login from './routes/auth/login'
import register from './routes/auth/register'
import generation from './routes/generation'
import chat from './routes/chat'
import profile from './routes/profile'

import { ServerError } from './error';

export class Server {

    private instance: express.Application;

    constructor(
        private readonly config: ServerConfig
    ) {
        this.instance = express();
    }

    public registerMiddlewares = () => {
        this.instance.use(bodyParser.json())
        this.instance.use(cors())
    }

    public registerRoutes = () => {
        console.log('Registrando rotas...')

        this.instance.use('/generation', generation)

        this.instance.use('/auth/login', login)
        this.instance.use('/auth/register', register)

        this.instance.use('/chat', chat)
        this.instance.use('/profile', profile)
    }

    public registerDefaultRoutes = () => {
        console.log('Registrando rotas padrões...')

        this.instance.use('/', (req, res) => {
            res.status(404).send({ message: 'Route not found' });
        });

        this.instance.use('/', (
            error: ServerError | any,
            req: Request,
            res: Response,
            next: NextFunction
        ) => {
            if (error instanceof ServerError) {
                return res.status(error.getStatus()).send({ message: error.getMessage() });
            }

            res.status(500).send({ error: true, message: 'Unknown Server Error' });
        });
    }

    public init = async () => {
        this.registerMiddlewares();
        this.registerRoutes();
        this.registerDefaultRoutes();
    }

    public start = () => {
        return new Promise((resolve) => {
            this.init();
            this.instance.listen(this.config.port, () => {
                resolve(this.config.port)
            });
        })
    }
}
