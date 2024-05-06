<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import {
		playerAttack,
		generateGridCells,
		getAllCellsInAttackingRange,
		type Player,
		getPlayers,
		type Cell,
		getCellIdByXY
	} from './Game.Grid';
	import GameControl from './Game.Control.svelte';
	import { getMyBotProcesses } from './Game.Setting';
	import { addRandomBot } from './GameState.Mock';
	import { findPath, findSimplePath } from './utils/path';

	export let gameId = '';
	let cells = generateGridCells();
	let players: Player[] = [];
	let myBotProcesses: { name: string; processId: string }[] = [];
	let selectedPlayerId: string = '';
	let selectedCellId: number | undefined;
	$: isDemoMode = !gameId;
	$: updatePlayers(players, myBotProcesses);
	$: updateCells(players);
	$: paths = pathToTarget(selectedPlayerId, selectedCellId, cells);

	function autoMove(paths) {}
	function pathToTarget(playerId: string, goal: number | undefined, cells: Cell[]) {
		if (!selectedPlayerId || goal === undefined) {
			return [];
		}
		const player = players.find((p) => p.processId === playerId);
		if (!player) {
			return [];
		}
		const paths = findPath(getCellIdByXY(player.x, player.y), goal, cells);
		console.log('find path', paths);
		return paths;
	}

	function updateCells(players: Player[]) {
		const dangerousCells = getAllCellsInAttackingRange(players);
		for (let cellId of dangerousCells) {
			cells[cellId].isDangerous = true;
		}
	}
	// Function to add a bot to the grid
	function updatePlayers(players: Player[], myProcess: typeof myBotProcesses) {
		players = players.map((player) => ({
			...player,
			my: myProcess.some((process) => process.processId === player.processId)
		}));
	}

	function getBotById(id: string) {
		return players.find((bot) => (bot.processId = id));
	}

	function clickCell(event: MouseEvent) {
		if (!selectedPlayerId) {
			return;
		}
		const element = event.target as HTMLElement;
		const isCell = element?.classList.contains('cell');

		if (isCell) {
			const cellId = Number.parseInt(element.dataset.cellId || '');
			if (!isNaN(cellId)) {
				if (selectedCellId !== cellId) {
					selectedCellId = cellId;
				} else {
					selectedCellId = undefined;
				}
			}
		}

		// Handle the click event on the grid cell
		// You can now perform actions based on the clicked cell
	}

	function clickBot(id: string) {
		const bot = getBotById(id);
		if (!bot) {
			return;
		}
		if (bot.my) {
			if (id === selectedPlayerId) {
				selectedPlayerId = '';
				selectedCellId = undefined;
			} else {
				selectedPlayerId = id;
			}
			return;
		}

		if (selectedPlayerId) {
			playerAttack(selectedPlayerId, id, gameId, bot.energy);
		}
	}

	onMount(() => {
		myBotProcesses = getMyBotProcesses();
		if (isDemoMode) {
			for (let i = 0; i < 25; i++) {
				players = addRandomBot();
			}
		}

		return;
		const interval = setInterval(async () => {
			players = await getPlayers(gameId);
		}, 10000);

		return () => clearInterval(interval);
	});
</script>

<h1 class="text-1xl m-4 text-center">game: {gameId}</h1>
<div class="ml-2 flex border">
	<div class="relative">
		<div
			on:click|stopPropagation={clickCell}
			aria-hidden="true"
			class="grid grid-cols-[repeat(40,20px)] grid-rows-[repeat(40,20px)] justify-items-stretch"
		>
			{#each cells as cell}
				<div
					class="cell border border-gray-300 {cell.id == selectedCellId
						? 'bg-gray-300'
						: 'bg-gray-100'} {paths.includes(cell.id) && 'bg-gray-200'}
						hover:scale-125"
					data-cell-id={cell.id}
					class:isDangerous={cell.isDangerous}
					class:isSelected={cell.id === selectedCellId}
				></div>
			{/each}
		</div>

		{#each players as bot}
			<button
				class:isMy={bot.my}
				class:isSelected={bot.processId === selectedPlayerId}
				class="bot absolute z-10 flex flex-col justify-start rounded border bg-opacity-10 p-[1px]"
				style="top: {(bot.x - 1) * 20}px; left: {(bot.y - 1) * 20}px"
				transition:fly={{ duration: 300, delay: 0 }}
				on:click={() => {
					clickBot(bot.processId);
				}}
			>
				<div class="health-meter">
					<div class="health-progress" style="width: {bot.health}%;"></div>
				</div>
				<div />
				<div class="energy-meter">
					<div class="energy-progress" style="width: {bot.energy}%;"></div>
				</div>
			</button>
		{/each}
	</div>
	<div class="ml-1 max-w-96 border border-red-400">
		<GameControl {players} />
	</div>
</div>

<style>
	@keyframes dangerousZone {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.15;
		}
	}
	@keyframes isMyBot {
		0%,
		100% {
			transform: scale(1.5);
		}
		50% {
			transform: scale(0.7);
		}
	}
	@keyframes rotateBot {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.bot {
		width: 20px;
		height: 20px;
		transition: transform 0.3s ease-in-out;
	}
	.bot.isMy {
		animation: isMyBot 1s infinite;
	}

	.bot.isSelected {
		animation: rotateBot 5s linear infinite;
	}

	.cell.isDangerous {
		background-color: red;
		animation: dangerousZone 1s infinite;
	}
	.health-meter {
		width: 100%;
		height: 5px; /* Adjust according to your design */
		background-color: purple;
		border: yellow 2px;
		border-radius: 5%;
	}
	.energy-meter {
		width: 100%;
		height: 5px; /* Adjust according to your design */
		background-color: purple;
		border: yellow 2px;
		border-radius: 5%;
	}

	.health-progress {
		height: 100%;
		background-color: rgba(0, 255, 0, 0.7); /* Adjust colors as needed */
		transition: width 0.3s ease-in-out;
	}

	.energy-progress {
		height: 100%;
		background-color: red;
		transition: width 0.3s ease-in-out;
	}
</style>
