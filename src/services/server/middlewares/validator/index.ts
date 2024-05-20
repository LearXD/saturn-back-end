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
        return (data: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                req[type] = schema.validateSync(req[type], { stripUnknown: true });
                next(data);
            } catch (error) {
                if (error instanceof yup.ValidationError) {
                    return next(ServerError.from(error.errors.join(', '), 400))
                }
                return next(ServerError.from('Internal server error', 500))
            }
        };
    }
}