import {RequestHandler, Router} from 'express';
import {models} from '../../db/models/index.js';
import {getId, makeEndpoints, vId, vRoleName} from '../helper.js';
import {HTTP_CODE} from '../httpCodes.js';
import type {ApiMiddleware, IApiRoute} from '../types.js';

export class RolesRouteControllers implements IApiRoute {
	public router = Router();
	private roles;

	constructor() {
		this.roles = models.roles;
		makeEndpoints(this.router, {
			getAll: [this.getAll],
			getById: [this.getById, vId],
			create: [this.create, vRoleName],
			update: [this.update, vId, vRoleName],
			remove: [this.remove, vId]
		});
	}
	getAll: ApiMiddleware = async (_req, res) => {
		const allroles = await this.roles.findAll();
		res.status(HTTP_CODE.OK).json(allroles);
	};

	getById: ApiMiddleware = async (req, res) => {
		const id = getId(req);
		const user = await this.roles.findByPk(id);
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
			const check = await this.roles.findOne({
				where: {
					name: req.body.name
				}
			});
			if (check) {
				throw Error('Role already exists');
			}
			const newRecord = await this.roles.create(req.body);
			res.status(HTTP_CODE.CREATED).json(newRecord);
		}
	};

	update: ApiMiddleware = async (req, res) => {
		const id = getId(req);

		if (req.body.id === id) {
			const newRecord = await this.roles.update(req.body, {
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
		await this.roles.destroy({
			where: {
				id
			}
		});
		res.status(HTTP_CODE.OK).end();
	};
}

const cookieMiddleware: RequestHandler = (req, res, next) => {
	if (req.params['id']) {
		res.cookie('userId', req.params['id'], {
			httpOnly: true,
			maxAge: 3600000,
			sameSite: 'lax'
		});
	}
	next();
};
