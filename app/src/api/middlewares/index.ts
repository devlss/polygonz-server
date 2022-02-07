import {validationResult} from 'express-validator';
import {verifyAccessToken} from '../../auth/token.js';
import {HTTP_CODE} from '../httpCodes.js';
import type {Request, Response, Errback, NextFunction} from 'express';

/**
 * Middleware для обработки ошибок из валидатора
 * @param req   Запрос
 * @param res   Ответ
 * @param next  Вызов след. middleware
 */
export const validatorResultMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const result = validationResult(req);
	if (result.isEmpty()) {
		next();
	} else {
		res.status(HTTP_CODE.BAD_REQUEST).json({errors: result.array()});
	}
};

export function errorHandlerMiddleware(err: Errback, _req: Request, res: Response, next: NextFunction) {
	if (res.headersSent) {
		return next(err);
	}
	res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send('Internal server error');
	console.error('Controller error: ', err);
}

export function securityMiddlewareFactory(roles: string[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		const token = req.cookies['token'];
		if (token) {
			const parsedToken = verifyAccessToken(token);
			if (roles.every((role) => parsedToken.roles.includes(role))) {
				return next();
			}
		}
		res.status(HTTP_CODE.UNAUTHORIZED).end();
	};
}
