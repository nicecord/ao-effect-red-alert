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
	import { myPlayerProcesses, playerWatchList } from './stores/game';
	import Title from './Game.Grid.Title.svelte';
	export let gameId = '';
	let cells = generateGridCells();
	let players: Player[] = [];
	let selectedPlayerId: string = '';
	let selectedCellId: number | undefined;
	// $: isDemoMode = !gameId;
	$: updateCells(players, $myPlayerProcesses);
	$: updatePlayers(players, $myPlayerProcesses);
	$: plannedPath = findPlannedPath(selectedPlayerId, selectedCellId, players);

	function findPlannedPath(
		playerId: string,
		targetCellId: number | undefined,
		players: { processId: string; x: number; y: number }[]
	) {
		if (playerId && targetCellId && players.length > 0) {
			const player = players.find((p) => p.processId === playerId);
			if (!player) {
				return [];
			}
			const sourceCellId = getCellIdByXY(player.x, player.y);

			if (sourceCellId === targetCellId) {
				return [];
			}

			const foundPath = findPath(
				sourceCellId,
				targetCellId,
				players.filter((p) => p.processId !== playerId)
			);

			if (foundPath.length < 2) {
				return [];
			}

			console.log('find path', foundPath);
			const moveDirection = getPlayerMoveDirection(foundPath[0], foundPath[1]);
			if (moveDirection) {
				console.log('playing moving', selectedPlayerId, moveDirection);
				playerMove(selectedPlayerId, gameId, moveDirection).then((m) =>
					console.log('moving message id', m)
				);
			}
			return foundPath;
		} else {
			return [];
		}
	}

	function updateCells(players: Player[], myPlayers: { processId: string }[]) {
		const dangerousCells = getAllCellsInAttackingRange(
			players.filter((p) => !myPlayers.some((m) => m.processId === p.processId))
		);
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
		return players.find((bot) => bot.processId === id);
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
	}

	// Handle the click event on the grid cell
	// You can now perform actions based on the clicked cell

	function clickBot(id: string) {
		const bot = getBotById(id);
		console.log('clic bot', id);
		if (!bot) {
			return;
		}
		if (id === selectedPlayerId) {
			selectedPlayerId = '';
			selectedCellId = undefined;
			return;
		}

		if (selectedPlayerId && getBotById(selectedPlayerId)) {
			playerAttack(selectedPlayerId, gameId, bot.energy);
			return;
		}
		selectedPlayerId = id;
	}

	async function attack(id: string) {
		const bot = getBotById(id);
		if (bot) {
			const messageId = await playerAttack(id, gameId, bot.energy);
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

	async function handlePlayerAction(
		event: CustomEvent<{ action: 'withdraw' | 'attack'; playerId: string }>
	) {
		console.log('handle player action', event.detail);
		switch (event.detail.action) {
			case 'attack':
				await attack(event.detail.playerId);
				return;
			case 'withdraw':
				await withdraw(event.detail.playerId);
				return;
		}
	}
	async function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'KeyA') {
			if (selectedPlayerId) {
				await attack(selectedPlayerId);
			}
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
<svelte:window on:keydown={handleKeydown} />
<div class="ml-2 flex border">
	<div class="relative">
		<div
			on:click|stopPropagation={clickCell}
			aria-hidden="true"
			class="grid grid-cols-[repeat(40,20px)] grid-rows-[repeat(40,20px)] justify-items-stretch"
		>
			{#each cells as cell (cell.id)}
				<div
					class="cell border border-gray-300 {cell.id == selectedCellId
						? 'bg-gray-300'
						: 'bg-gray-100'} {plannedPath.includes(cell.id) && 'bg-gray-200'}
						hover:scale-125"
					data-cell-id={cell.id}
					class:isDangerous={cell.isDangerous}
					class:isSelected={cell.id === selectedCellId}
				></div>
			{/each}
		</div>

		{#each players as bot (bot.processId)}
			<button
				class:isMy={bot.my}
				class:underWatch={$playerWatchList.includes(bot.processId)}
				class:isSelected={bot.processId === selectedPlayerId}
				class="bot absolute z-10 flex flex-col justify-start rounded border border-red-500 bg-opacity-10 p-[1px]"
				style="top: {(bot.y - 1) * 20}px; left: {(bot.x - 1) * 20}px"
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
		<GameControl {players} on:playerAction={handlePlayerAction} />
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
		transition: all 1s ease-in-out;
		@apply scale-150;
	}
	.bot.isMy {
		animation: isMyBot 1s infinite;
		@apply bg-teal-500;
	}

	.bot.underWatch {
		@apply scale-150;
		@apply bg-orange-400;
	}
	.bot.isSelected {
		@apply ring-8;
	}

	.cell.isDangerous {
		@apply /*
		animation: dangerousZone 1s infinite; */ bg-red-50;
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
