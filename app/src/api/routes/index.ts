import express, {Router} from 'express';
import cookieParser from 'cookie-parser';
import {usersRouter} from './users.js';
import {rolesRouter} from './roles.js';
import {authRouter} from './auth.js';
import {securityMiddlewareFactory} from '../middlewares/index.js';

export const apiRouter = Router();

apiRouter.use(cookieParser(), express.json());
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', securityMiddlewareFactory(['admin']), usersRouter);
apiRouter.use('/roles', securityMiddlewareFactory(['admin']), rolesRouter);
