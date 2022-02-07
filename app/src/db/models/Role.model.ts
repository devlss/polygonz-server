import {DataTypes, Model, Sequelize} from 'sequelize';
import type {commonAttributes} from './types';

interface IRoleCreationAttributes {
	name: string;
}

interface IRoleAttributes extends commonAttributes, IRoleCreationAttributes {}

export interface IRoleModel extends Model<IRoleAttributes, IRoleCreationAttributes> {}

export function RoleModelFactory(sequelize: Sequelize) {
	return sequelize.define<IRoleModel>(
		'Role',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			}
		},
		{
			modelName: 'roles',
			scopes: {
				onlyName: {
					attributes: ['name']
				}
			}
		}
	);
}
