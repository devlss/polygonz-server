import express, {Request, Response} from 'express';
import {HTTP_CODE} from './httpCodes.js';
import {errorHandlerMiddleware} from './middlewares/index.js';

import {apiRouter} from './routes/index.js';

const server = express();

export function createApi(port: number) {
	server.use('/api', apiRouter);

	server.use((_req: Request, res: Response) => {
		res.status(HTTP_CODE.NOT_FOUND).end();
	}, errorHandlerMiddleware);

	try {
		server.listen(port, () => {
			// eslint-disable-next-line no-console
			console.log(`Launched @ ${port}!`);
		});
	} catch (err) {
		console.error('Server error: ', err);
	}
}
