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
		getCellIdByXY,
		playerWithdraw,
		getPlayerMoveDirection,
		playerMove
	} from './Game.Grid';
	import GameControl from './Game.Control.svelte';
	import { findPath } from './utils/path';
	import { myPlayerProcesses } from './stores/game';
	import Title from './Game.Grid.Title.svelte';
	import { getMockPlayers } from './GameState.Mock';
	export let gameId = '';
	let cells = generateGridCells();
	let players: Player[] = [];
	let selectedPlayerId: string = '';
	let selectedCellId: number | undefined;
	let paths: number[] = [];
	// $: isDemoMode = !gameId;
	$: updateCells(players);
	$: updatePlayers(players, $myPlayerProcesses);

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
		for (const cell of cells) {
			cell.isDangerous = false;
		}
		for (let cellId of dangerousCells) {
			cells[cellId].isDangerous = true;
		}
	}

	function updatePlayers(input: Player[], myProcess: typeof $myPlayerProcesses) {
		players = input.map((p) => ({
			...p,
			my: myProcess.some((process) => process.processId === p.processId)
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

		if (selectedCellId && selectedPlayerId) {
			const plannedPaths = pathToTarget(selectedPlayerId, selectedCellId, cells);

			if (plannedPaths.length < 2) {
				return;
			}
			paths = plannedPaths;
			const moveDirection = getPlayerMoveDirection(plannedPaths[0], plannedPaths[1]);
			if (moveDirection) {
				console.log('playing moving', selectedPlayerId, moveDirection);
				playerMove(selectedPlayerId, gameId, moveDirection).then((m) =>
					console.log('moving message id', m)
				);
			}
		}
	}

	// Handle the click event on the grid cell
	// You can now perform actions based on the clicked cell

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

	async function attack(id: string) {
		const bot = getBotById(id);
		if (bot) {
			const messageId = await playerAttack(id, '', gameId, bot.energy);
			console.log('attack meesage id', messageId);
		}
	}

	async function withdraw(id: string) {
		const bot = getBotById(id);
		if (bot) {
			const messageId = await playerWithdraw(id, gameId);
			console.log('withdraw', messageId);
		}
	}
	onMount(() => {
		getPlayers(gameId).then((p) => {
			players = p;
		});
		const interval = setInterval(async () => {
			players = await getPlayers(gameId);
		}, 3000);

		return () => clearInterval(interval);
	});
</script>

<Title />
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
			{#if bot.processId === selectedPlayerId}
				<div
					class="options-popup"
					style="top: {(bot.x - 1) * 20 - 20}px; left: {(bot.y - 1) * 20 + 20}px"
				>
					<button
						on:click|stopPropagation={async () => await withdraw(bot.processId)}
						class="icon-button"
					>
						<i class="fas fa-door-open" style="color: green;"></i>
					</button>
					<button
						on:click|stopPropagation={async () => await attack(bot.processId)}
						class="icon-button"
					>
						<i class="fa fa-bolt" style="color: red;"></i>
					</button>
				</div>
			{/if}
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
	<div class="ml-1 w-96 border">
		<GameControl {players} />
	</div>
</div>

<style lang="postcss">
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
		@apply /*
		animation: dangerousZone 1s infinite; */ bg-red-100;
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
		background-color: blue;
		transition: width 0.3s ease-in-out;
	}
	.options-popup {
		position: absolute;
		background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent white */
		/* border: 1px solid #ccc; */
		padding: 2px;
		border-radius: 5px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		display: flex;
	}
	.icon-button {
		background: none;
		border: none;
		cursor: pointer;
		color: #333; /* Icon color */
		font-size: 20px; /* Adjust size as needed */
		margin: 0 5px;
	}
	.icon-button:hover {
		color: #666; /* Darker color on hover */
	}
</style>
