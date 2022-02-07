import bcrypt from 'bcrypt';

export async function hashPassword(password: string) {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt);
}

export function checkPassword(password: string, hash: string) {
	return bcrypt.compare(password, hash);
}
