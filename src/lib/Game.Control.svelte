<script lang="ts">
	import Bot from './Game.Control.Bot.svelte';
	import Settings from './Game.Control.Settings.svelte';
	import { type Player } from './Game.Grid';
	import { playerWatchList } from './stores/game';
	import { createEventDispatcher } from 'svelte';
	export let players: Player[];
	const dispatch = createEventDispatcher();
	let activeTab = 'players';

	// Function to switch between tabs
	function switchTab(tab: string) {
		activeTab = tab;
	}

	function handlePlayerChecked(event: CustomEvent<{ playerId: string; isChecked: boolean }>) {
		console.log('player checked', event.detail);
		const { playerId, isChecked } = event.detail;
		const index = $playerWatchList.findIndex((v) => v === playerId);
		if (isChecked) {
			if (index < 0) {
				$playerWatchList = [...$playerWatchList, playerId];
			}
		} else {
			if (index >= 0) {
				$playerWatchList.splice(index, 1);
				$playerWatchList = $playerWatchList;
			}
		}
	}

	function handlePlayerAction(playerId: string, action: string) {
		dispatch('playerAction', { playerId, action });
	}
	// Function to handle adding players

	// Function to handle managing players
	$: players = players
		// .filter((p) => !myProcesses.some((m) => m.processId === p.processId))
		.sort((a, b) => {
			if (a.my !== b.my) {
				return a.my ? -1 : 1;
			}

			// Then sort by health (lower health comes first)
			if (a.health !== b.health) {
				return a.health - b.health;
			}

			// Finally, sort by energy (lower energy comes first)
			return a.energy - b.energy;
		});
</script>

<div class="mx-auto p-4">
	<!-- Tab buttons -->
	<div class="mb-4 flex space-x-4">
		<button
			class="rounded-md bg-blue-500 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
			class:opacity-50={activeTab === 'players'}
			on:click={() => switchTab('players')}
		>
			Players
		</button>
		<button
			class="rounded-md bg-blue-500 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
			class:opacity-50={activeTab === 'manage'}
			on:click={() => switchTab('manage')}
		>
			My Team
		</button>
	</div>

	<!-- Tab content -->
	{#if activeTab === 'players'}
		<span> total Players: {players?.length}</span> <span> </span>
		<ul>
			{#each players as player (player.processId)}
				<Bot
					my={player.my}
					name={player.name}
					processId={player.processId}
					health={player.health}
					energy={player.energy}
					lastTurn={player.lastTurn}
					isChecked={$playerWatchList.includes(player.processId)}
					on:playerChecked={handlePlayerChecked}
					{handlePlayerAction}
				/>
			{/each}
		</ul>
	{:else if activeTab === 'manage'}
		<Settings />
	{/if}
</div>

<style>
	/* Add your custom styles here */
</style>
