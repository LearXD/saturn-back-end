import express from 'express'
import * as yup from 'yup';
import { NextFunction, Request, Response } from 'express';

import { Validator, ValidatorType } from '../../middlewares/validator';
import { UserValidator } from '../../middlewares/user-validator';
import { User } from '../../../../utils/user';
import { ServerError } from '../../error';

const router = express.Router();

router.post(
    '/:id/message',
    UserValidator.validate,
    Validator.validate(
        yup.object().shape({
            id: yup.number().required('É obrigatório informar o id do chat')
        }),
        ValidatorType.PARAMS
    ),
    Validator.validate(
        yup.object().shape({
            fromUser: yup.boolean()
                .required("É obrigatório informar o remetente"),
            content: yup.string()
                .max(2500, 'Você só pode mandar até 2500 caracteres')
                .required("É obrigatório informar o conteúdo")
        })
    ),
    async (user: User, req: Request, res: Response, next: NextFunction) => {

        const { fromUser, content } = req.body;
        const { id } = req.params;

        try {
            const chats = await user.getChats();
            const chat = chats.find(chat => chat.getData().id === parseInt(id));

            if (!chat) {
                return next(ServerError.from('Chat não encontrado', 404));
            }

            await chat.createMessage(content, fromUser);
            res.status(200).json({ message: 'Mensagem criada com sucesso' })
        } catch (error) {
            console.log(error);
            next(ServerError.from('Internal server error', 500))
        }
    }
)

router.post(
    '/',
    UserValidator.validate,
    Validator.validate(
        yup.object().shape({
            title: yup.string()
                .required("É obrigatório informar o título")
        })
    ),
    async (user: User, req: Request, res: Response, next: NextFunction) => {

        const { title } = req.body;

        try {
            const chat = await user.createChat(title);
            res.status(200).json({ chatId: chat.getData().id })
        } catch (error) {
            console.log(error);
            next(ServerError.from('Internal server error', 500))
        }
    }
)

router.delete(
    '/:id',
    UserValidator.validate,
    Validator.validate(
        yup.object().shape({
            id: yup.number()
        }),
        ValidatorType.PARAMS
    ),
    async (user: User, req: Request, res: Response, next: NextFunction) => {

        const { id } = req.params;

        try {
            const chat = (await user.getChats()).find(chat => chat.getData().id === parseInt(id));

            if (!chat) {
                return next(ServerError.from('Chat não encontrado', 404));
            }

            await chat.delete();
            res.status(200).json({ message: 'Chat deletado com sucesso' })

        } catch (error) {
            console.error(error);
            next(ServerError.from('Internal server error', 500))
        }
    }
)

router.get(
    '/list',
    UserValidator.validate,
    async (user: User, req: Request, res: Response, next: NextFunction) => {
        try {
            const chats = (await user.getChats()).map(chat => chat.getData());
            res.status(200).json({ chats })
        } catch (error) {
            console.error(error);
            next(ServerError.from('Internal server error', 500))
        }
    }
)

router.get(
    '/:id/messages',
    UserValidator.validate,
    Validator.validate(
        yup.object().shape({
            id: yup.number()
        }),
        ValidatorType.PARAMS
    ),
    async (user: User, req: Request, res: Response, next: NextFunction) => {

        const { id } = req.params;

        try {
            const chats = await user.getChats();
            const chat = chats.find(chat => chat.getData().id === parseInt(id));

            if (!chat) {
                return next(ServerError.from('Chat não encontrado', 404));
            }

            const messages = (await chat.getMessages()).map(message => message.getData());
            res.status(200).json({ messages })
        } catch (error) {
            console.log(error);
            next(ServerError.from('Internal server error', 500))
        }
    }
)


export default router;