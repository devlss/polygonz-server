import {Router} from 'express';
import {models} from '../../db/models/index.js';
import {getParamId, makeEndpoints} from '../helpers.js';
import {HTTP_CODE} from '../httpCodes.js';
import {vId, vRoleName} from '../validators.js';
import type {ApiMiddleware} from '../types.js';

const {roles} = models;

const getAll: ApiMiddleware = async (_req, res) => {
	const allroles = await roles.findAll();
	res.status(HTTP_CODE.OK).json(allroles);
};

const getById: ApiMiddleware = async (req, res) => {
	const id = getParamId(req);
	const role = await roles.findByPk(id);
	if (role) {
		res.status(HTTP_CODE.OK).json(role);
	} else {
		res.status(HTTP_CODE.NOT_FOUND).end();
	}
};

const create: ApiMiddleware = async (req, res) => {
	if (req.body.id) {
		delete req.body.id;
	}
	const record = await roles.findOrCreate({
		where: {
			name: req.body.name
		}
	});
	if (!record[1]) {
		console.warn(`Role [${req.body.name}] already exists`);
	}
	res.status(HTTP_CODE.CREATED).json(record[0]);
};

const update: ApiMiddleware = async (req, res) => {
	const id = getParamId(req);

	if (req.body.id === id) {
		const newRecord = await roles.update(req.body, {
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

	await roles.destroy({
		where: {
			id
		}
	});
	res.status(HTTP_CODE.OK).end();
};

export const rolesRouter = Router();

makeEndpoints(rolesRouter, {
	getAll: [getAll],
	getById: [getById, vId],
	create: [create, vRoleName],
	update: [update, vId, vRoleName],
	remove: [remove, vId]
});
