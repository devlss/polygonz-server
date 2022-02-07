import {Model, Sequelize} from 'sequelize';
import {onShutDown} from '../utils/index.js';

const {PG_HOST, PG_DB_NAME, PG_DB_OWNER_USERNAME, PG_DB_OWNER_PASSWORD, SEQUELIZE_IS_SYNC_FORCE} = process.env;

export function createConnection(db: string, dbUser: string, dbPassword: string, isSyncForce: boolean = false) {
	try {
		if (db && dbUser && dbPassword) {
			const connection = new Sequelize(db, dbUser, dbPassword, {
				dialect: 'postgres',
				host: PG_HOST || 'localhost',
				port: 5432,
				pool: {
					min: 0,
					max: 10,
					idle: 30000
				},
				define: {
					scopes: {
						noTs: {
							attributes: {
								exclude: ['updatedAt', 'createdAt']
							}
						}
					},
					hooks: {
						afterCreate: <T extends {createdAt?: string; updatedAt?: string}>(value: Model<T>) => {
							const dataValues = value.get();
							delete dataValues.createdAt;
							delete dataValues.updatedAt;
						}
					}
				},
				sync: {force: isSyncForce}
			});
			return connection;
		} else {
			throw new Error('No connect URI and/or credentials');
		}
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('[db] Unable to connect: ', error);

		throw error;
	}
}

export async function checkConnection(connection: Sequelize): Promise<void> {
	try {
		if (!connection) {
			throw new Error('Connection has not been created');
		}
		await connection.authenticate();
		// eslint-disable-next-line no-console
		console.log('[db] Connected');
		onShutDown(() =>
			connection.close().then(() => {
				// eslint-disable-next-line no-console
				console.log('[db] Disconnected');
			})
		);
		await connection.sync();
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('[db] Not connected: ', error);

		throw error;
	}
}

export const connection = createConnection(PG_DB_NAME!, PG_DB_OWNER_USERNAME!, PG_DB_OWNER_PASSWORD!, SEQUELIZE_IS_SYNC_FORCE === 'true');
