import jwt from 'jsonwebtoken';
import {loadFileFromRoot} from '../utils/files.js';

const privateKey = loadFileFromRoot('.keys', 'private_key.pem');
const publicKey = loadFileFromRoot('.keys', 'public_key.pem');

interface ITokenPayload {
	id: number;
	roles: string[];
}

export function generateAccesToken(id: number, roles: string[] = []) {
	return jwt.sign(
		{
			id,
			roles
		},
		privateKey,
		{
			expiresIn: '1d',
			algorithm: 'RS256'
		}
	);
}

export function verifyAccessToken(token: string) {
	return jwt.verify(token, publicKey) as ITokenPayload;
}
