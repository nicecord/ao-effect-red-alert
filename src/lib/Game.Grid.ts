import { removeDuplicates } from './utils/array.utils';
import { dryrunAo, processesList, sendAOMessage } from './ao';
import { arConnect, getArConnectActiveWallet } from './wallet';
export const GRIDSIZE = 40;
export const ATTACKRANGE = 3;

export type Player = {
	processId: string;
	x: number;
	y: number;
	health: number;
	energy: number;
	lastTurn: number;
	name?: string;
	color?: string;
	my: boolean;
};

export type GameState = {
	GameMode: 'Playing';
	Players: {
		[k: string]: Player;
	};
};
export async function getPlayers(gameId: string): Promise<Player[]> {
	const result = await dryrunAo('', gameId, [
		{
			name: 'Action',
			value: 'GetGameState'
		}
	]);

	const data = result?.Messages[0]?.Data as string;
	if (data) {
		const gameState = JSON.parse(data) as GameState;
		return Object.entries(gameState.Players).map(([processId, player]) => {
			player.processId = processId;
			return player;
		});
	}
	return [];
}

export function getCellXYById(id: number) {
	return [Math.floor(id / GRIDSIZE) + 1, (id % GRIDSIZE) + 1];
}

export function getCellIdByXY(row: number, col: number) {
	return (row - 1) * GRIDSIZE + col - 1;
}

export function getCellsInAttackRange(row: number, col: number, range: number = ATTACKRANGE) {
	const rowRangeMin = Math.max(1, row - range);
	const rowRangeMax = Math.min(GRIDSIZE, row + range);
	const colRangeMin = Math.max(1, col - range);
	const colRangeMax = Math.min(GRIDSIZE, col + range);
	const cellsInRange = [];
	for (let row = rowRangeMin; row <= rowRangeMax; row++) {
		for (let col = colRangeMin; col <= colRangeMax; col++) {
			cellsInRange.push(getCellIdByXY(row, col));
		}
	}
	return cellsInRange;
}
export type Cell = {
	id: number;
	x: number;
	y: number;
	isDangerous: boolean;
	content: string;
};

export function generateGridCells(): Cell[] {
	return Array.from({ length: GRIDSIZE * GRIDSIZE }, (_, i) => ({
		id: i,
		x: Math.floor(i / GRIDSIZE) + 1,
		y: (i % GRIDSIZE) + 1,
		isDangerous: false,
		content: '' // This can be modified to include data like player or obstacle
	}));
}

export function getAllCellsInAttackingRange(bots: Player[]) {
	const cellInRange = [];
	for (const bot of bots) {
		if (!bot.my) {
			cellInRange.push(...getCellsInAttackRange(bot.x, bot.y));
		}
	}
	return removeDuplicates(cellInRange) as number[];
}

export async function playerAttack(
	myBot: string,
	targetBot: string,
	gameId: string,
	attackingEnergy: number
) {
	console.log('attacking', myBot);
	const tags = [
		{ name: 'AttackEnergy', value: attackingEnergy.toString() },
		{ name: 'Action', value: 'Attack' },
		{ name: 'Game', value: gameId }
	];
	const messageId = await sendAOMessage('', myBot, tags);
	console.log('attacking messageId', messageId);
}

export async function playerWithdraw(myBot: string, gameId: string) {
	const tags = [
		{ name: 'Action', value: 'Withdraw' },

		{ name: 'Game', value: gameId }
	];
	const messageId = await sendAOMessage('', myBot, tags);
	console.log('withdraw messageId', messageId);
}

export async function playerJoin(myBot: string, gameId: string) {
	const tags = [
		{ name: 'Action', value: 'Withdraw' },
		{ name: 'Game', value: gameId }
	];
	const messageId = await sendAOMessage('', myBot, tags);
	console.log('withdraw messageId', messageId);
}

async function getMyProcesses() {
	await arConnect();
	const activeAddress = await getArConnectActiveWallet();
	const processList = await processesList(activeAddress);
	return processList;
}
