import type { Player } from './Game.Grid';

let bots: Player[] = [];
export function addRandomBot() {
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
		getRandomId(),
		Math.floor(Math.random() * 100),
		Math.floor(Math.random() * 100),
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
	if (bots.length > 35) {
		return bots;
	}
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
