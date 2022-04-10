import {validatorResultMiddleware} from './middlewares/index.js';
import type {Request, Router} from 'express';
import type {ValidationChain} from 'express-validator';
import type {ApiMiddleware, IApiCRUDControllers} from './types';

export function errorWrapper(handler: ApiMiddleware): ApiMiddleware {
	return async function (req, res, next) {
		try {
			await handler(req, res);
		} catch (error) {
			next!(error);
		}
	};
}

export function getParamId(req: Request) {
	if (req.params.id && Number.isInteger(+req.params.id)) {
		return +req.params.id;
	}
	return;
}

// TODO оверхед
export function makeEndpoints(router: Router, mw: {[name in keyof IApiCRUDControllers]: [ApiMiddleware, ...ValidationChain[]]}) {
	router.get(`/`, mw.getAll.slice(1), validatorResultMiddleware, errorWrapper(mw.getAll[0]));
	router.get(`/:id`, mw.getById.slice(1), validatorResultMiddleware, errorWrapper(mw.getById[0]));
	router.post(`/`, mw.create.slice(1), validatorResultMiddleware, errorWrapper(mw.create[0]));
	router.put(`/:id`, mw.update.slice(1), validatorResultMiddleware, errorWrapper(mw.update[0]));
	router.delete(`/:id`, mw.remove.slice(1), validatorResultMiddleware, errorWrapper(mw.remove[0]));
}


