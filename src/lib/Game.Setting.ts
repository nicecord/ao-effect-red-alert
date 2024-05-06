import { spawnProcess } from './ao';
import { loadBotIntoProcess } from './bot';
const MY_BOT_KEYS = '_mybotprocesses';
export type BotLocalSetting = {
	processId: string;
	name: string;
	ownerProcessId: string;
};
export async function loadBot(processId: string) {
	const messageId = await loadBotIntoProcess(processId);
	console.log('load bot messageId', messageId);
}

export async function createBot() {
	const processId = await spawnProcess();
	console.log(processId);
}
export function addMyBotProcess(bot: BotLocalSetting) {
	const bots = getMyBotProcesses();
	bots.push(bot);
	window.localStorage.setItem(MY_BOT_KEYS, JSON.stringify(bots));
	return bots;
}

export function removeMyBotProcess(botProcessId: string) {
	const bots = getMyBotProcesses().filter((b) => b.processId !== botProcessId);
	window.localStorage.setItem(MY_BOT_KEYS, JSON.stringify(bots));
	return bots;
}
export function getMyBotProcesses(): BotLocalSetting[] {
	const storedBotsString = window.localStorage.getItem(MY_BOT_KEYS);
	if (storedBotsString) {
		return JSON.parse(storedBotsString);
	}
	return [];
}
