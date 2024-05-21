import express from 'express'
import * as yup from 'yup';
import { Validator } from '../../../middlewares/validator';
import { User } from '../../../../../utils/user';
import { ServerError } from '../../../error';

const router = express.Router();

router.post(
    '/',
    Validator.validate(yup.object().shape({
        username: yup.string()
            .required('É obrigatório informar o nome de usuário')
            .min(3, 'O nome de usuário deve conter no mínimo 3 caracteres'),
        password: yup.string()
            .required('É obrigatório informar a senha')
            .min(6, 'A senha deve conter no mínimo 6 caracteres'),
        email: yup.string()
            .email('Formato de E-mail inválido')
            .required('É obrigatório informar o e-mail')
    })),
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { username, password, email } = req.body;

        try {
            const success = await User.create({ username, password, email })

            if (!success) {
                return next(ServerError.from('Já existe um usuário com este e-mail!', 400))
            }

            res.status(200).json({ message: 'Usuário criado com sucesso!' })
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' })
        }
    }
)

export default router;