import {Model, Sequelize} from 'sequelize';
import type {commonAttributes} from './types';

interface IRoleCreationAttributes {
	name: string;
}

interface IRoleAttributes extends commonAttributes, IRoleCreationAttributes {}

export interface IRoleModel extends Model<IRoleAttributes, IRoleCreationAttributes> {}

export function UsersToRolesModelFactory(sequelize: Sequelize) {
	return sequelize.define('UsersToRoles', {}, {timestamps: false, freezeTableName: true});
}
