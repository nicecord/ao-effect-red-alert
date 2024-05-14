import { removeDuplicates } from './utils/array.utils';
import { dryrunAo, sendMessageAo } from './ao';
import { moveDirections, type MoveDirection } from './utils/path';
import {
	addRandomBot,
	attack as attackMock,
	getMockPlayers,
	move as moveMock,
	removeBot as removeBotMock
} from './GameState.Mock';
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
	// console.log('trying to get game state for', gameId);
	if (!gameId) {
		const players = getMockPlayers(10);
		console.log(players);
		return players;
	}
	const result = await dryrunAo(gameId, [
		{
			name: 'Action',
			value: 'GetGameState'
		}
	]);

	const data = result?.Messages[0]?.Data as string;
	if (data) {
		const gameState = JSON.parse(data) as GameState;
		const players = Object.entries(gameState.Players).map(([processId, player]) => {
			player.processId = processId;
			return player;
		});
		console.log(players);
		return players;
	}
	return [];
}

export function getCellXYById(id: number): [number, number] {
	return [(id % GRIDSIZE) + 1, Math.floor(id / GRIDSIZE) + 1];
}

export function getCellIdByXY(x: number, y: number) {
	return (y - 1) * GRIDSIZE + x - 1;
}

export function getCellsInAttackRange(x: number, y: number, range: number = ATTACKRANGE) {
	const xRangeMin = Math.max(1, x - range);
	const xRangeMax = Math.min(GRIDSIZE, x + range);
	const yRangeMin = Math.max(1, y - range);
	const yRangeMax = Math.min(GRIDSIZE, y + range);
	const cellsInRange = [];
	for (let y = yRangeMin; y <= yRangeMax; y++) {
		for (let x = xRangeMin; x <= xRangeMax; x++) {
			cellsInRange.push(getCellIdByXY(x, y));
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
	return Array.from({ length: GRIDSIZE * GRIDSIZE }, (_, i) => {
		const [x, y] = getCellXYById(i);
		return {
			id: i,
			x,
			y,
			isDangerous: false,
			content: '' // This can be modified to include data like player or obstacle
		};
	});
}

export function getPlayerMoveDirection(
	startCellId: number,
	targetCellId: number
): MoveDirection | undefined {
	const [sX, sY] = getCellXYById(startCellId);
	const [tX, tY] = getCellXYById(targetCellId);
	const dY = tY - sY;
	const dX = tX - sX;
	for (const [key, value] of Object.entries(moveDirections)) {
		if (value.x === dX && value.y === dY) {
			return key as MoveDirection;
		}
	}
}
export function getAllCellsInAttackingRange(bots: { x: number; y: number }[]) {
	const cellInRange = [];
	for (const bot of bots) {
		cellInRange.push(...getCellsInAttackRange(bot.x, bot.y));
	}
	return removeDuplicates(cellInRange) as number[];
}

export async function playerAttack(playerId: string, gameId: string, attackEnergy: number) {
	console.log('attacking', playerId, attackEnergy);

	if (!gameId) {
		attackMock(playerId, attackEnergy, ATTACKRANGE);
		return;
	}
	console.log('attacking', playerId);
	const tags = [
		{ name: 'AttackEnergy', value: attackEnergy.toString() },
		{ name: 'Action', value: 'Attack' },
		{ name: 'Game', value: gameId }
	];
	const messageId = await sendMessageAo('', playerId, tags);
	console.log('attacking messageId', messageId);
}

export async function playerWithdraw(playerId: string, gameId: string) {
	if (!gameId) {
		removeBotMock(playerId);
		return;
	}
	const tags = [
		{ name: 'Action', value: 'Withdraw' },

		{ name: 'Game', value: gameId }
	];
	const messageId = await sendMessageAo('', playerId, tags);
	console.log('withdraw messageId', messageId);
	return messageId;
}

export async function playerMove(playerid: string, gameId: string, direction: MoveDirection) {
	if (!gameId) {
		moveMock(playerid, direction);
		return;
	}
	const tags = [
		{ name: 'Action', value: 'Move' },

		{ name: 'Game', value: gameId },
		{ name: 'Direction', value: direction }
	];
	const messageId = await sendMessageAo('', playerid, tags);
	return messageId;
}

export async function playerJoin(playerId: string, gameId: string) {
	if (!gameId) {
		addRandomBot(playerId);
		return '';
	}

	const tags = [
		{ name: 'Action', value: 'Join' },
		{ name: 'Game', value: gameId }
	];
	const messageId = await sendMessageAo('', playerId, tags);
	console.log('join game messageId', messageId);
}
