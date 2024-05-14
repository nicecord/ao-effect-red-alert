import type { Player } from './Game.Grid';
import { moveDirections, type MoveDirection } from './utils/path';

let bots: Player[] = [];

export function addRandomBot(id?: string) {
	let x,
		y,
		attempts = 0;
	do {
		x = Math.floor(Math.random() * 40) + 1;
		y = Math.floor(Math.random() * 40) + 1;
		attempts++;
		// Prevent infinite loops by limiting the number of attempts
		if (attempts > 100) {
			console.error('Too many attempts to place bot ');
			return []; // Exit the function if too many attempts
		}
	} while (isOccupied(x, y));
	return addBot(
		x,
		y,
		id || getRandomId(),
		Math.floor(Math.random() * 100),
		Math.floor(Math.random() * 20),
		bots.length < 1
		// Math.random() < 0.3
	);
}
// Function to remove a bot from the grid
export function removeBot(id: string) {
	bots = bots.filter((bot) => bot.processId !== id);
	return bots;
}
// Generate a random color for each bot
function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function isOccupied(row: number, col: number) {
	return bots.some((bot) => bot.x === row && bot.y === col);
}
function getRandomId() {
	return Math.random().toString(36).substring(2, 10);
}
function addBot(row: number, col: number, id: string, health: number, energy: number, my: boolean) {
	bots = [
		...bots,
		{
			processId: id,
			x: row,
			y: col,
			color: getRandomColor(),
			health,
			energy,
			my,
			lastTurn: Date.now()
		}
	];
	return bots;
}
function tick() {
	bots[0].energy = 100;
	for (const b of bots) {
		const shouldIncrease = Math.random() < 0.5;
		if (shouldIncrease) {
			const sinceLastTurn = Date.now() - b.lastTurn;
			const energyIncrease = Math.floor(sinceLastTurn / 3000);
			b.energy = Math.min(100, b.energy + energyIncrease);
		}

		const shouldMove = Math.random() < 0.2 && b !== bots[0];
		if (shouldMove) {
			const direction = Object.keys(moveDirections)[Math.floor(Math.random() * 8)] as MoveDirection;
			b.lastTurn = Date.now();
			playerMove(b, direction);
		}
	}
}
export function getMockPlayers(numberOfBots: number) {
	if (bots.length === 0) {
		for (let i = 0; i < numberOfBots; i++) {
			addRandomBot(i + '_bot_bot');
		}
	}
	tick();
	return bots;
}
function playerMove(b: { x: number; y: number }, direction: MoveDirection) {
	const { x, y } = moveDirections[direction];
	const xN = Math.min(40, Math.max(1, b.x + x));
	const yN = Math.min(40, Math.max(1, b.y + y));
	if (!isOccupied(xN, yN)) {
		b.x = xN;
		b.y = yN;
	}
}
export function move(playerId: string, direction: MoveDirection) {
	const b = bots.find((b) => b.processId === playerId);
	if (b) {
		b.lastTurn = Date.now();
		playerMove(b, direction);
	}
}
function isInAttackRange(a: { x: number; y: number }, b: { x: number; y: number }, range: number) {
	return Math.abs(a.x - b.x) <= range && Math.abs(a.y - b.y) <= range;
}
export function attack(playerId: string, energy: number, range: number) {
	const player = bots.find((b) => b.processId === playerId);
	if (player) {
		player.lastTurn = Date.now();
		const playersInRange = bots.filter((b) => {
			return isInAttackRange(b, player, range) && playerId !== b.processId;
		});
		const attackEnergy = Math.min(player.energy, energy);
		player.energy -= attackEnergy;
		const damage = Math.floor(Math.random() * 2 * attackEnergy * (1 / 3));
		for (const p of playersInRange) {
			console.log('process under attack', p.processId);
			p.health -= damage;
			if (p.health <= 0) {
				removeBot(p.processId);
				console.log('eliminate bot', p.processId);
			}
		}
	}
}
