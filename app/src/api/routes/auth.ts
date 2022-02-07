import {CookieOptions, Router} from 'express';
import {Transaction} from 'sequelize/dist';
import {checkPassword, hashPassword} from '../../auth/hash.js';
import {generateAccesToken} from '../../auth/token.js';
import {createRoles, runInTransaction} from '../../db/helpers.js';
import {models} from '../../db/models/index.js';
import {errorWrapper} from '../helpers.js';
import {HTTP_CODE} from '../httpCodes.js';
import {validatorResultMiddleware} from '../middlewares/index.js';
import {vUsername, vPassword} from '../validators.js';
import type {IUserModel} from '../../db/models/User.model.js';
import type {ApiMiddleware} from '../types.js';

const {users} = models;

const login: ApiMiddleware = async (req, res) => {
	const user = await findUser(req.body.username, ['withPassword', 'withRoles', 'noTs']);
	if (user && (await checkPassword(req.body.password, user.getDataValue('password')))) {
		clearPassword(user.get());

		res.status(HTTP_CODE.OK)
			.cookie(...setToken(user))
			.json(user);
	} else {
		res.status(HTTP_CODE.UNAUTHORIZED).end();
	}
};

const registration: ApiMiddleware = async (req, res) => {
	if (req.body.id) {
		res.status(HTTP_CODE.BAD_REQUEST).send(`Bad request: ID should not be provided, since it is determined automatically by the database.`);
	} else {
		const check = await findUser(req.body.username);
		if (check) {
			res.status(HTTP_CODE.BAD_REQUEST).send('User has not been created');
		}

		const password = await hashPassword(req.body.password);

		let newUser;
		await runInTransaction(async (transaction: Transaction) => {
			newUser = await users.scope('noTs').create(
				{
					...req.body,
					password
				},
				{transaction}
			);
			const newRoles = (await createRoles(req.body.roles, transaction)).map(([data]) => data);
			//@ts-ignore
			await newUser.setRoles(newRoles, {transaction});

			clearPassword(newUser.get());
			newUser.setDataValue('roles', newRoles);
		});

		res.status(HTTP_CODE.CREATED).json(newUser);
	}
};

const findUser = async (username: string, scopes: string[] = [], exclude: string[] = []) =>
	users.scope(scopes).findOne({
		where: {username},
		attributes: {exclude}
	});

const clearPassword = <T extends {password: string}>(obj: T) => {
	delete (<Partial<T>>obj).password;
};

const setToken = (user: IUserModel): [name: string, val: string, options: CookieOptions] => {
	return [
		'token',
		generateAccesToken(
			user.getDataValue('id'),
			user.getDataValue('roles')?.map((roleModel) => roleModel.getDataValue('name'))
		),
		{
			httpOnly: true,
			maxAge: 3600000,
			sameSite: 'lax'
		}
	];
};

export const authRouter = Router();

authRouter.post('/login', [vUsername, vPassword], validatorResultMiddleware, errorWrapper(login));
authRouter.post('/registration', [vUsername, vPassword], validatorResultMiddleware, errorWrapper(registration));

// transformRoles = <T extends {roles: IRoleModel}>(obj: T) => {
// 	delete (<Partial<T>>obj).password;
// };
