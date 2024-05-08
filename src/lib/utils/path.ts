import { GRIDSIZE, getCellIdByXY, getCellXYById, type Cell } from '$lib/Game.Grid';
export function findSimplePath(start: number, goal: number, grid: Cell[]) {
	const { x: sX, y: sY } = grid[start];
	const { x: gX, y: gY } = grid[goal];
	console.log(sX, sY, gX, gY);
	const path = [];
	if (gY > sY) {
		for (let dY = 1; dY <= gY - sY; dY++) {
			path.push(getCellIdByXY(sX, sY + dY));
		}
	} else {
		for (let dY = -1; dY >= gY - sY; dY--) {
			path.push(getCellIdByXY(sX, sY + dY));
		}
	}
	if (gX > sX) {
		for (let dX = 1; dX <= gX - sX; dX++) {
			path.push(getCellIdByXY(sX + dX, gY));
		}
	} else {
		for (let dX = -1; dX >= gX - sX; dX--) {
			path.push(getCellIdByXY(sX + dX, gY));
		}
	}
	return path;
}
export function findPath(start: number, goal: number, grid: Cell[]) {
	if (isNeighbor(start, goal)) {
		return [goal, start];
	}
	const openSet = new Set([start]);
	const cameFrom = new Map();

	const gScore = new Map<number, number>();
	gScore.set(start, 0);

	const fScore = new Map<number, number>();
	fScore.set(start, heuristic(grid[start], grid[goal]));

	while (openSet.size > 0) {
		let current = null;
		let currentMinScore = Infinity;

		for (const node of openSet) {
			if (fScore.get(node)) {
				if (fScore.get(node)! < currentMinScore) {
					currentMinScore = fScore.get(node)!;
					current = node;
				}
			}
		}

		if (current === goal) {
			return reconstructPath(cameFrom, goal, start);
		}
		if (!current) {
			return [];
		}

		openSet.delete(current);
		for (const neighbor of getNeighbors(current)) {
			if (grid[neighbor].isDangerous) {
				continue;
			}
			const tentativeGScore = gScore.get(current)! + 1; // Assuming cost between nodes is 1
			if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
				cameFrom.set(neighbor, current);
				gScore.set(neighbor, tentativeGScore);
				fScore.set(neighbor, tentativeGScore + heuristic(grid[neighbor], grid[goal]));
				if (!openSet.has(neighbor)) {
					openSet.add(neighbor);
				}
			}
		}
	}

	return [];
}

function heuristic(a: Cell, b: Cell) {
	// Manhattan distance on a square grid
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstructPath(cameFrom: Map<number, number>, current: number, start: number) {
	const totalPath = [current];
	while (cameFrom.has(current) && current !== start) {
		current = cameFrom.get(current) as number;
		totalPath.unshift(current);
	}
	return totalPath;
}

// Up = {x = 0, y = -1}, Down = {x = 0, y = 1},
//         Left = {x = -1, y = 0}, Right = {x = 1, y = 0},
//         UpRight = {x = 1, y = -1}, UpLeft = {x = -1, y = -1},
//         DownRight = {x = 1, y = 1}, DownLeft = {x = -1, y = 1}
export const moveDirections = {
	Up: { x: 0, y: -1 },
	Down: { x: 0, y: 1 },
	Left: { x: -1, y: 0 },
	Right: { x: 1, y: 0 },
	UpRight: { x: 1, y: -1 },
	UpLeft: { x: -1, y: -1 },
	DownRight: { x: 1, y: 1 },
	DownLeft: { x: 1, y: -1 }
};

export type MoveDirection = keyof typeof moveDirections;
function isNeighbor(a: number, b: number) {
	const neighbors = getNeighbors(a);
	if (neighbors.includes(b)) {
		return true;
	}
	return false;
}
function getNeighbors(nodeId: number) {
	const neighbors = [];
	const [nodeX, nodeY] = getCellXYById(nodeId);
	const directions = Object.values(moveDirections);
	for (const { x: dx, y: dy } of directions) {
		const newX = nodeX + dx,
			newY = nodeY + dy;
		if (newX > 0 && newX <= GRIDSIZE && newY > 0 && newY <= GRIDSIZE) {
			const neighorId = getCellIdByXY(newX, newY);
			neighbors.push(neighorId);
		}
	}
	return neighbors;
}
