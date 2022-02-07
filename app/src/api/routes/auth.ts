import {CookieOptions, Router} from 'express';
import {Transaction} from 'sequelize/dist';
import {checkPassword, hashPassword} from '../../auth/hash.js';
import {generateAccesToken} from '../../auth/token.js';
import {createRoles, runInTransaction} from '../../db/helper.js';
import {models} from '../../db/models/index.js';
import {IUserModel} from '../../db/models/User.model.js';
import {errorWrapper, vPassword, vUsername} from '../helper.js';
import {HTTP_CODE} from '../httpCodes.js';
import {validatorResultMiddleware} from '../middlewares/index.js';
import type {ApiMiddleware} from '../types.js';

export class AuthRouteControllers {
	public router = Router();
	private users;

	constructor() {
		this.users = models.users;
		this.router.post('/login', [vUsername, vPassword], validatorResultMiddleware, errorWrapper(this.login));
		this.router.post('/registration', [vUsername, vPassword], validatorResultMiddleware, errorWrapper(this.registration));
	}

	login: ApiMiddleware = async (req, res) => {
		const user = await this.#findUser(req.body.username, ['withPassword', 'withRoles', 'noTs']);
		if (user && (await checkPassword(req.body.password, user.getDataValue('password')))) {
			this.#clearPassword(user.get());

			res.status(HTTP_CODE.OK)
				.cookie(...this.#setToken(user))
				.json(user);
		} else {
			res.status(HTTP_CODE.UNAUTHORIZED).end();
		}
	};

	registration: ApiMiddleware = async (req, res) => {
		if (req.body.id) {
			res.status(HTTP_CODE.BAD_REQUEST).send(`Bad request: ID should not be provided, since it is determined automatically by the database.`);
		} else {
			const check = await this.#findUser(req.body.username);
			if (check) {
				res.status(HTTP_CODE.BAD_REQUEST).send('User has not been created');
			}

			const password = await hashPassword(req.body.password);

			let newUser;
			await runInTransaction(async (transaction: Transaction) => {
				newUser = await this.users.scope('noTs').create(
					{
						...req.body,
						password
					},
					{transaction}
				);
				const newRoles = (await createRoles(req.body.roles, transaction)).map(([data]) => data);
				//@ts-ignore
				await newUser.setRoles(newRoles, {transaction});

				this.#clearPassword(newUser.get());
				newUser.setDataValue('roles', newRoles);
			});

			res.status(HTTP_CODE.CREATED).json(newUser);
		}
	};

	#findUser = async (username: string, scopes: string[] = [], exclude: string[] = []) =>
		this.users.scope(scopes).findOne({
			where: {username},
			attributes: {exclude}
		});

	#clearPassword = <T extends {password: string}>(obj: T) => {
		delete (<Partial<T>>obj).password;
	};

	#setToken = (user: IUserModel): [name: string, val: string, options: CookieOptions] => {
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

	// #transformRoles = <T extends {roles: IRoleModel}>(obj: T) => {
	// 	delete (<Partial<T>>obj).password;
	// };
}
