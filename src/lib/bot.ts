import { dryrunAo, evaluate, processesList } from './ao';
export async function getBotState(processId: string) {
	const result = await dryrunAo(processId, [{ name: 'Action', value: 'GetBotState' }]);
	// console.log(result)
	const state = result.Messages[0].Data;
	console.log(state);
	return JSON.parse(state);
}

export function isValidBotName(name: string) {
	return name.startsWith('b-');
}

export async function loadBotIntoProcess(process: string) {
	const request = await fetch('/lua/dumb-bot.lua');
	const code = await request.text();
	const messageId = await evaluate(process, code);
	return messageId;
}

export type BotType = {
	name: string;
	processId: string;
	color: string;
};
