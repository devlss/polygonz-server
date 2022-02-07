import {RequestHandler, Router} from 'express';
import {hashPassword} from '../../auth/hash.js';
import {models} from '../../db/models/index.js';
import {getId, makeEndpoints, vId, vPassword, vUsername} from '../helper.js';
import {HTTP_CODE} from '../httpCodes.js';
import type {ApiMiddleware, IApiRoute} from '../types.js';

export class UsersRouteControllers implements IApiRoute {
	public router = Router();
	private users;

	constructor() {
		this.users = models.users;
		makeEndpoints(this.router, {
			getAll: [this.getAll],
			getById: [this.getById, vId],
			create: [this.create, vUsername, vPassword],
			update: [this.update, vId, vUsername, vPassword],
			remove: [this.remove, vId]
		});
	}
	getAll: ApiMiddleware = async (_req, res) => {
		const allUsers = await this.users.findAll();
		res.status(HTTP_CODE.OK).json(allUsers);
	};

	getById: ApiMiddleware = async (req, res) => {
		const id = getId(req);
		const user = await this.users.findByPk(id);
		if (user) {
			res.status(HTTP_CODE.OK).json(user);
		} else {
			res.status(HTTP_CODE.NOT_FOUND).end();
		}
	};

	create: ApiMiddleware = async (req, res) => {
		if (req.body.id) {
			res.status(HTTP_CODE.BAD_REQUEST).send(`Bad request: ID should not be provided, since it is determined automatically by the database.`);
		} else {
			const check = await this.users.findOne({
				where: {
					username: req.body.username
				}
			});
			if (check) {
				throw Error('Not created');
			}
			const newRecord = await this.users.create({...req.body, password: hashPassword(req.body.password)});
			res.status(HTTP_CODE.CREATED).json(newRecord);
		}
	};

	update: ApiMiddleware = async (req, res) => {
		const id = getId(req);

		if (req.body.id === id) {
			const newRecord = await this.users.update(req.body, {
				where: {
					id
				}
			});
			res.status(HTTP_CODE.OK).json(newRecord);
		} else {
			res.status(HTTP_CODE.BAD_REQUEST).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`);
		}
	};

	remove: ApiMiddleware = async (req, res) => {
		const id = getId(req);
		await this.users.destroy({
			where: {
				id
			}
		});
		res.status(HTTP_CODE.OK).end();
	};
}
