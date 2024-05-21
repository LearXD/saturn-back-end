import express from 'express'
import * as yup from 'yup';
import jwt from 'jsonwebtoken';

import { Validator } from '../../../middlewares/validator';
import { User } from '../../../../../utils/user';
import { Environment } from '../../../../../utils/env';
import { ServerError } from '../../../error';

const router = express.Router();

router.post(
    '/',
    Validator.validate(yup.object().shape({
        email: yup.string()
            .email('Formato de E-mail inválido')
            .required("É obrigatório informar o e-mail"),
        password: yup.string()
            .required('É obrigatório informar a senha')
            .min(6, 'Sua senha deve conter no mínimo 6 caracteres')
    })),
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { email, password } = req.body;

        try {
            const user = await User.findByEmail(email)

            if (!user) {
                return next(ServerError.from('Senha ou E-mail incorretos!', 404))
            }

            if (!user.checkPassword(password)) {
                return next(ServerError.from('Senha ou E-mail incorretos!', 401))
            }

            const token = jwt.sign({ id: user.getData().id }, Environment.getJWTPassword(), { expiresIn: '1d' })
            res.status(200).json({ token })
        } catch (error) {
            console.log(error)
            next(ServerError.from('Internal server error', 500))
        }
    }
)

export default router;