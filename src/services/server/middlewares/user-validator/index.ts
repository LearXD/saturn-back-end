import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express"
import { Environment } from '../../../../utils/env';
import { JWTUserInterface } from '../../../../utils/user/interfaces/index.types';
import { User } from '../../../../utils/user';

export class UserValidator {
    static validate = async (req: Request, res: Response, next: NextFunction) => {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({ message: 'Token not provided' });
        }

        const [bearer, token] = authorization.split(' ');

        if (bearer !== 'Bearer') {
            return res.status(401).json({ message: 'Token malformatted' });
        }

        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }

        try {
            const data = jwt.verify(token, Environment.getJWTPassword()) as JWTUserInterface;
            const user = await User.findById(data.id)

            next(user);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({ message: error.message });
            }

            return res.status(500).json({ message: 'Internal Server Error' });
        }

    }
}