import fs from 'fs';
import path from 'path';

/**
 * Провека, является ли путь корнем файловой структуры
 * @param pathString путь для проверки
 * @returns {boolean}
 */
const isRoot = (pathString: string): boolean => {
	return process.platform == 'win32' ? pathString.split(path.sep)[1] === '' : '/' === pathString;
};

// TODO подумать над лучшим способом
/**
 * Попытка получить корневой путь проекта
 * @returns {string} Корневой путь проекта
 */
const getRootPath = (): string => {
	const PACKAGE = 'package.json';
	let currentPath = process.cwd();
	do {
		if (fs.existsSync(path.join(currentPath, PACKAGE))) {
			return currentPath;
		} else {
			currentPath = path.join(currentPath, '..');
		}
	} while (!isRoot(currentPath));
	throw new Error('Config file is absent');
};

/**
 * Загрука файла по пути от корня проекта
 * @param paths Путь от корня проекта
 * @returns {Buffer} Буффер с файлом
 */
export const loadFileFromRoot = (...paths: string[]): Buffer => {
	return fs.readFileSync(path.join(getRootPath(), ...paths));
};
