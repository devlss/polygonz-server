import type {Request, Response, NextFunction} from 'express';

export interface IApiCRUDControllers {
	getAll: ApiMiddleware;
	getById: ApiMiddleware;
	create: ApiMiddleware;
	update: ApiMiddleware;
	remove: ApiMiddleware;
}

export type ApiMiddleware = (req: Request, res: Response, next?: NextFunction) => Promise<void>;

