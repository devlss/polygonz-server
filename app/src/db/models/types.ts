import type {Model, ModelStatic, Sequelize} from 'sequelize';

export type ModelFactory = (sequelize: Sequelize) => ModelStatic<Model>;

export interface commonAttributes {
	id: number;
	createdAt?: string;
	updatedAt?: string;
}
