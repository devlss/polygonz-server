import {Sequelize} from 'sequelize';
import {connection} from '../index.js';
import {RoleModelFactory} from './Role.model.js';
import {UserModelFactory} from './User.model.js';
import {UsersToRolesModelFactory} from './UsersToRoles.model.js';

function wireModels(sequelize: Sequelize) {
	const {User, Role} = sequelize.models;
	const usersToRoles = UsersToRolesModelFactory(sequelize);
	User.belongsToMany(Role, {through: usersToRoles, as: 'roles'});
	Role.belongsToMany(User, {through: usersToRoles});
}

function initModels(sequelize: Sequelize) {
	const users = UserModelFactory(sequelize);
	const roles = RoleModelFactory(sequelize);

	users.addScope('withRoles', {
		include: [{model: roles, attributes: ['name'], as: 'roles', through: {attributes: []}}]
	});
	wireModels(sequelize);
	return {
		users,
		roles
	};
}

export const models = initModels(connection);
