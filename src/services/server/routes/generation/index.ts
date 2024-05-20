import express from 'express'
import * as yup from 'yup';
import { NextFunction, Request, Response } from 'express';

import { Validator } from '../../middlewares/validator';
import { UserValidator } from '../../middlewares/user-validator';
import { User } from '../../../../utils/user';
import { LLAMA } from '../../../llama';
import { ServerError } from '../../error';

const router = express.Router();

router.post(
    '/',
    UserValidator.validate,
    Validator.validate(yup.object().shape({
        chatId: yup.number()
            .required("É obrigatório informar o chat"),
        content: yup.string()
            .max(2500, 'Você só pode mandar até 2500 caracteres')
            .required("É obrigatório informar o conteúdo")
    })),
    async (user: User, req: Request, res: Response, next: NextFunction) => {
        const { content, chatId } = req.body;

        try {

            const chat = (await user.getChats()).find(chat => chat.getData().id === chatId);

            if (!chat) {
                throw next(ServerError.from('Chat não encontrado', 404))
            }

            if (req.headers.accept && req.headers.accept === 'text/event-stream') {

                await chat.createMessage(content, true);

                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');

                let generated = ""
                const abortController = new AbortController();

                for await (const token of LLAMA.generate(content, abortController)) {
                    generated += token.content;
                    res.write(token.content);
                }

                await chat.createMessage(generated, false);
                res.end();
                return;
            }

            next(ServerError.from('Invalid request', 400));
        } catch (error: Error | any) {
            next(new ServerError(error, 500))
        }
    }
)

export default router;