import type {Sequelize, Transaction, TransactionOptions} from 'sequelize/dist';
import {connection as mainConnection} from './index.js';
import {models} from './models/index.js';
import {IRoleModel} from './models/Role.model.js';

export async function runInTransaction(payloadFn: (t: Transaction) => Promise<void>, connection: Sequelize = mainConnection, options?: TransactionOptions) {
	const transaction = await connection.transaction(options);
	await payloadFn(transaction);
	transaction.commit();
}

// TODO возможно стоит сделать bulkCreate
export async function createRoles(roleNames: string[], transaction?: Transaction) {
	let rolesReq: Promise<[IRoleModel, boolean]>[] = [];
	for (const name of roleNames) {
		rolesReq.push(
			models.roles.scope(['noTs']).findOrCreate({
				where: {name},
				transaction
			})
		);
	}

	return Promise.all(rolesReq);
}
