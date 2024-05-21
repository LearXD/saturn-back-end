import express from 'express';
import * as yup from 'yup';
import { ServerError } from '../../error';

export type ValidatorTypes = 'body' | 'query' | 'params';
export enum ValidatorType {
    BODY = 'body',
    QUERY = 'query',
    PARAMS = 'params'
}

export class Validator {
    static validate = (schema: yup.Schema, type: ValidatorTypes = 'body') => {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.log('Validando...')

            try {
                req[type] = schema.validateSync(req[type], { stripUnknown: true });
                next();
            } catch (error) {
                if (error instanceof yup.ValidationError) {
                    return res.status(400).json({ message: error.message });
                }
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        };
    }
}