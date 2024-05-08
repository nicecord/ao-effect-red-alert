<script lang="ts">
	// Create an array to represent the rows in the grid
	import Player from './Game.Bot.svelte';
	import { getLatestLastTurn, getLatestGameState, type GameState, getPlayerByXY } from '$lib/game';
	let lastestGameState: GameState | null = null;
	let players: GameState['Players'];

	import { selectedGameId } from './stores/game';
</script>

<p>{new Date()}</p>
{#if !lastestGameState}
	<p>initializing</p>
	<p>loading</p>
{:else}
	<p>total player {Object.values(players).length}</p>
	<p>latest game status date {new Date(getLatestLastTurn(players))}</p>
	<p>{(Date.now() - getLatestLastTurn(players)) / 1000}</p>

	<div class="grid">
		{#each rows as row, rowIndex}
			{#each row as cell, colIndex}
				{@const player = getPlayerByXY(rowIndex, colIndex, players)}
				<button type="button" class="cell" on:click={() => handleCellClick(rowIndex, colIndex)}>
					{#if player}
						<Player {player} />
					{/if}
				</button>
			{/each}
		{/each}
	</div>
{/if}
{#key selectedGame.processId}
	<GameGrid gameId={selectedGame.processId}></GameGrid>
{/key}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(41, 20px); /* Creates 40 columns */
		grid-gap: 0px; /* Optional: adds a gap between cells */
		padding-left: 10px;
	}
	.cell {
		width: 20px;
		height: 20px;
		background-color: #f0f0f0; /* Light grey background */
		border: 1px solid #ccc; /* Cell border */
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer; /* Changes the mouse cursor to a pointer when hovering over cells */
	}
</style>
