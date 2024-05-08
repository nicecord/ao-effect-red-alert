import { writable } from 'svelte/store';
const MY_PLAYER_KEYS = '_myplayer_processes';
const SELECTED_GAME_ID = '_selected_game_id';

export const myPlayerProcesses = writable<PlayerLocalSetting[]>(getMyPlayerProcesses());
export const selectedGameId = writable<string>(getSelectedGameId());

export type PlayerLocalSetting = {
	processId: string;
	name: string;
	ownerProcessId: string;
};

export function addMyPlayerProcess(bot: PlayerLocalSetting) {
	const bots = getMyPlayerProcesses();
	const existingProcess = bots.findIndex((p) => p.processId === bot.processId);
	if (existingProcess > 0) {
		bots[existingProcess] = bot;
	} else {
		bots.push(bot);
	}
	window.localStorage.setItem(MY_PLAYER_KEYS, JSON.stringify(bots));
	myPlayerProcesses.set(bots);
	return bots;
}

export function removeMyPlayerProcess(botProcessId: string) {
	const bots = getMyPlayerProcesses().filter((b) => b.processId !== botProcessId);
	window.localStorage.setItem(MY_PLAYER_KEYS, JSON.stringify(bots));
	myPlayerProcesses.set(bots);
	return bots;
}

export function getMyPlayerProcesses(): PlayerLocalSetting[] {
	const storedBotsString = window?.localStorage.getItem(MY_PLAYER_KEYS) || '[]';
	if (storedBotsString) {
		return JSON.parse(storedBotsString);
	}
	return [];
}

export function getSelectedGameId() {
	return window?.localStorage.getItem(SELECTED_GAME_ID) || '';
}
export function setSelectedGameId(gameId: string) {
	window.localStorage.setItem(SELECTED_GAME_ID, gameId);
	selectedGameId.set(gameId);
}
