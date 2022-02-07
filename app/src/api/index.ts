import express, {Request, Response} from 'express';
import {HTTP_CODE} from './httpCodes.js';
import {errorHandlerMiddleware} from './middlewares/index.js';

import {ApiRouter} from './routes/index.js';

const server = express();

// const pathToApp = path.join(__dirname, '..', 'public');
// const pathToIndex = path.join(pathToApp, 'index.html');

// server.use(express.static(pathToApp));

export function createApi(port: number) {
	server.use('/api', new ApiRouter().router);

	server.use((_req: Request, res: Response) => {
		res.status(HTTP_CODE.NOT_FOUND).end();
	}, errorHandlerMiddleware);

	server.listen(port, () => {
		// eslint-disable-next-line no-console
		console.log(`Launched @ ${port}!`);
	});
}
