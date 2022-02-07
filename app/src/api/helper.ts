import {Request, Router} from 'express';
import {body, param, ValidationChain} from 'express-validator';
import {validatorResultMiddleware} from './middlewares/index.js';
import {ApiMiddleware} from './types';

export function errorWrapper(handler: ApiMiddleware): ApiMiddleware {
	return async function (req, res, next) {
		try {
			await handler(req, res);
		} catch (error) {
			next!(error);
		}
	};
}

export function getId(req: Request) {
	if (req.params.id && Number.isInteger(+req.params.id)) {
		return +req.params.id;
	}
	return;
}

export function makeEndpoints(router: Router, mw: {[name: string]: [ApiMiddleware, ...ValidationChain[]]}) {
	router.get(`/`, mw.getAll.slice(1), validatorResultMiddleware, errorWrapper(mw.getAll[0]));
	router.get(`/:id`, mw.getById.slice(1), validatorResultMiddleware, errorWrapper(mw.getById[0]));
	router.post(`/`, mw.create.slice(1), validatorResultMiddleware, errorWrapper(mw.create[0]));
	router.put(`/:id`, mw.update.slice(1), validatorResultMiddleware, errorWrapper(mw.update[0]));
	router.delete(`/:id`, mw.remove.slice(1), validatorResultMiddleware, errorWrapper(mw.remove[0]));
}

export const vId = param('id', 'Id must be number').isNumeric();
export const vUsername = body('username', 'Username must not be empty').notEmpty();
export const vPassword = body('password', 'Length must be between 6 and 10 symbols').isLength({min: 6, max: 10});
export const vRoleName = body('name', 'Role name must not be empty and in lowercase').notEmpty().isLowercase();
