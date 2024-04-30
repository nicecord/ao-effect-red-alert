import { evaluate } from './ao';
export async function loadGrid(process: string) {
	const request = await fetch('/lua/gridgame.lua');
	const code = await request.text();
	const messageId = await evaluate(process, code);
	return messageId;
}

export type Player = {
	x: number;
	y: number;
	energy: number;
	name?: string;
	lastTurn: number;
	isFriend: boolean;
	processId: string;
};

export type GameState = {
	GameMode: 'Playing' | 'Loading';
	Players: {
		[k: string]: Player;
	};
};

const GameStateSampleData = {
	GameMode: 'Loading',
	Players: {
		r_BpEHut3NcRKflHeO0QtMGo1AARVW1EUo50XFzGhWk: {
			x: 17,
			energy: 66,
			health: 100,
			name: 'ao-grid',
			lastTurn: 1713940664797,
			y: 2
		},
		'NbgkjGN8ldlqTVreV4HyunggPgyzdwsOArvvp-_HQgM': {
			x: 17,
			energy: 77,
			health: 50,
			lastTurn: 1713940664476,
			y: 18
		}
	}
};

export function getPlayerByXY(x: number, y: number, players: GameState['Players']) {
	for (const [processId, player] of Object.entries(players)) {
		if (player.x === x && player.y === y) {
			return { ...player, processId };
		}
	}
	return null;
}

export function getLatestLastTurn(players: GameState['Players']) {
	let lastTurn = 0;
	for (const player of Object.values(players)) {
		if (player.lastTurn > lastTurn) {
			lastTurn = player.lastTurn;
		}
	}
	return lastTurn;
}

function isFriend(processId: string): boolean {
	if (Math.random() * 10 < 3) {
		return true;
	} else {
		return false;
	}
}

export function getControlledBots() {
	return [
		'XSyAKUOXXsYI3sATGRuTW4uWF8Jhok25mJm1jQ1LITk', //乾
		'9hQqBk5AEJDKvCcVwDotfdgQMUzuxQoON4mKvXkzpr0', //坤
		'QSxypl2HPitYaPHPv9indZCo5s1Kpgvl8NyUnMZxVA0', //震
		'KxEAayZTkUufuZXHztm0Nz1hGYilJR71sSD-9_iTNEg', //巽
		'zZ-3GM0O_8eYpUYW4hqY0hmOwbfANLEh_Udk6pqP9yg', //坎
		'A9z5thsmhURWHgLGabvGaBDpCLrbRZ8EG2jy7phbdr0', //离
		'4Es_e1DSLDk4wicwO9-hmygj1ACGTy4Xkie59Tew-Yo', //艮
		'cEbthI8hLlqzj4Q9aPgafeevSjcbotD2oRhxMBE_Y10' //兑
	];
}

const commanderProcessId = 'sPrj-GOt5fgfohZK5jCqh4ZfIn5cbD74RHgS9SX7KVE';

const walletAddress = 'Eie95scN9YKABaLXjw5BfDRlvsLmn4iR6SPfAvMPx4k';
