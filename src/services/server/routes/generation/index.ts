import express from 'express'
import * as yup from 'yup';
import { NextFunction, Request, Response } from 'express';

import { Validator } from '../../middlewares/validator';
import { UserValidator } from '../../middlewares/user-validator';
import { User } from '../../../../utils/user';
import { LLAMA } from '../../../llama';
import { ServerError } from '../../error';
import { Task } from '../../../web-socket/utils/task';
import { WebSocketServer } from '../../../web-socket';
import { v4 } from 'uuid';
import { PromptBuilder } from '../../../llama/utils/prompt';

PromptBuilder.load('./prompt.txt')
const router = express.Router();

router.post(
    '/',
    Validator.validate(yup.object().shape({
        chatId: yup.number()
            .required("É obrigatório informar o chat"),
        content: yup.string()
            .max(2500, 'Você só pode mandar até 2500 caracteres')
            .required("É obrigatório informar o conteúdo")
    })),
    UserValidator.validate,
    async (user: User, req: Request, res: Response, next: NextFunction) => {
        const { content, chatId } = req.body;

        console.log(PromptBuilder.getInstance().getPrompt({ PROMPT: content }))

        try {

            const chat = (await user.getChats()).find(chat => chat.getData().id === chatId);

            if (!chat) {
                return next(ServerError.from('Chat não encontrado', 404))
            }

            await chat.createMessage(content, true);
            const uuid = v4();

            WebSocketServer.getInstance().createTask(
                new Task(
                    uuid,
                    async (client) => {
                        let generated = ""
                        const abortController = new AbortController();

                        client.on('close', () => abortController.abort())

                        for await (
                            const token of LLAMA.generate(
                                PromptBuilder.getInstance().getPrompt({ PROMPT: content }),
                                abortController
                            )
                        ) {
                            generated += token.content;
                            client.send(token.content);
                        }

                        await chat.createMessage(generated, false);
                        client.close();
                    },
                    {
                        userId: user.getData().id,
                    }
                )
            )

            return res.send({ message: 'Mensagem enviada', uuid });
        } catch (error: Error | any) {
            console.log(error)
            next(new ServerError(error, 500))
        }
    }
)

export default router;