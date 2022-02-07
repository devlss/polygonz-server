// TODO необходимо сделать нормальное завершение работы
export const onShutDown = (cb: () => void): void => {
	process.on('SIGTERM', cb);
	process.on('SIGINT', cb);
};

/**
 * Таймаут с промисом
 * @param timeout Время таймаута в ms
 */
export const timer = async (timeout: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, timeout));

/**
 * Реализация цикла попыток подключения к БД
 * @param count Кол-во попыток
 * @param timeout Таймаут между попытками
 * @param fn Функция для повторения
 */
export const retryConnect = async <T>(count: number, timeout: number, fn: () => Promise<T | undefined>): Promise<T | undefined> => {
	let c = count;
	/* eslint-disable no-await-in-loop */
	while (c--) {
		try {
			return await fn();
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log('Reconnecting...');

			await timer(timeout);
		}
	}

	return undefined;
};
