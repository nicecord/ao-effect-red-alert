import { dryrunAo, evaluate } from './ao';

export async function getBotState(processId: string) {
	const result = await dryrunAo('', processId, [{ name: 'Action', value: 'GetBotState' }]);
	const state = result.Messages[0].Data;
	return JSON.parse(state);
}

export function isValidBotName(name: string) {
	return name.startsWith('b-');
}

export async function loadBotCodeIntoProcess(process: string) {
	const request = await fetch('/lua/dumb-bot.lua');
	const code = await request.text();
	const messageId = await evaluate(process, code);
	return messageId;
}
