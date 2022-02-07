import {Router} from 'express';
import {hashPassword} from '../../auth/hash.js';
import {models} from '../../db/models/index.js';
import {getParamId, makeEndpoints} from '../helpers.js';
import {HTTP_CODE} from '../httpCodes.js';
import {vId, vUsername, vPassword} from '../validators.js';
import type {ApiMiddleware} from '../types.js';

const {users} = models;

const getAll: ApiMiddleware = async (_req, res) => {
	const allUsers = await users.findAll();
	res.status(HTTP_CODE.OK).json(allUsers);
};

const getById: ApiMiddleware = async (req, res) => {
	const id = getParamId(req);
	const user = await users.findByPk(id);
	if (user) {
		res.status(HTTP_CODE.OK).json(user);
	} else {
		res.status(HTTP_CODE.NOT_FOUND).end();
	}
};

const create: ApiMiddleware = async (req, res) => {
	if (req.body.id) {
		delete req.body.id;
	}
	const check = await users.findOne({
		where: {
			username: req.body.username
		}
	});
	if (check) {
		res.status(HTTP_CODE.BAD_REQUEST).send('User already exists');
	}
	const password = await hashPassword(req.body.password);
	const newRecord = await users.create({...req.body, password});
	res.status(HTTP_CODE.CREATED).json(newRecord);
};

const update: ApiMiddleware = async (req, res) => {
	const id = getParamId(req);

	if (req.body.id === id) {
		const newRecord = await users.update(req.body, {
			where: {
				id
			}
		});
		res.status(HTTP_CODE.OK).json(newRecord);
	} else {
		res.status(HTTP_CODE.BAD_REQUEST).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id})`);
	}
};

const remove: ApiMiddleware = async (req, res) => {
	const id = getParamId(req);
	await users.destroy({
		where: {
			id
		}
	});
	res.status(HTTP_CODE.OK).end();
};

export const usersRouter = Router();

makeEndpoints(usersRouter, {
	getAll: [getAll],
	getById: [getById, vId],
	create: [create, vUsername, vPassword],
	update: [update, vId, vUsername, vPassword],
	remove: [remove, vId]
});
