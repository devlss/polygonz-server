import express, {Router} from 'express';
import cookieParser from 'cookie-parser';
import {UsersRouteControllers} from './users.js';
import {RolesRouteControllers} from './roles.js';
import {AuthRouteControllers} from './auth.js';
import {securityMiddlewareFactory} from '../middlewares/index.js';

export class ApiRouter {
	public router = Router();
	constructor() {
		this.router.use(cookieParser(), express.json());
		this.router.use('/auth', new AuthRouteControllers().router);
		this.router.use('/users', securityMiddlewareFactory(['admin']), new UsersRouteControllers().router);
		this.router.use('/roles', securityMiddlewareFactory(['admin']), new RolesRouteControllers().router);
	}
}
