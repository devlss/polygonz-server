import {checkConnection, connection} from './db/index.js';
import {createApi} from './api/index.js';

const PORT = process.argv[2] || process.env.PORT || 3000;

async function connectDB() {
	return checkConnection(connection);
}

async function connectApi() {
	await connectDB();
	createApi(+PORT);
}

connectApi();
