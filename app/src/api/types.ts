import {Request, Response, NextFunction} from 'express';

export interface IApiRoute {
	getAll: ApiMiddleware;
	getById: ApiMiddleware;
	create: ApiMiddleware;
	update: ApiMiddleware;
	remove: ApiMiddleware;
}

export type ApiMiddleware = (req: Request, res: Response, next?: NextFunction) => Promise<void>;

