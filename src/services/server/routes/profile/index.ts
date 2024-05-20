import express, { Request, Response, NextFunction } from 'express'
import { UserValidator } from '../../middlewares/user-validator';
import { User } from '../../../../utils/user';

const router = express.Router();

router.get(
    '/',
    UserValidator.validate,
    (user: User, req: Request, res: Response, next: NextFunction) => {
        const { username, email, id } = user.getData()
        res.status(200).json({ id, username, email })
    }
)

export default router;