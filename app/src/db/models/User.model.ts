import {DataTypes, Model, Sequelize} from 'sequelize';
import type {IRoleModel} from './Role.model';
import type {commonAttributes} from './types';

interface IUserCreationAttributes {
	username: string;
	password: string;
	name?: string;
	avatarPath?: string;
	roles?: IRoleModel[];
}

interface IUserAttributes extends commonAttributes, IUserCreationAttributes {}

export interface IUserModel extends Model<IUserAttributes, IUserCreationAttributes> {}

export function UserModelFactory(sequelize: Sequelize) {
	return sequelize.define<IUserModel>(
		'User',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false
			},
			name: {
				type: DataTypes.STRING
			},
			avatarPath: {
				type: DataTypes.STRING
			}
		},
		{
			modelName: 'users',
			defaultScope: {
				attributes: { exclude: ['password'] },
			},
			scopes: {
				withPassword: {
					attributes: {exclude: []}
				},
				noPassword: {
					attributes: {exclude: ['password']}
				}
			}
		}
	);
}
