<script lang="ts">
	import Bot from './Game.Control.Bot.svelte';
	import Settings from './Game.Control.Settings.svelte';
	import { type Player } from './Game.Grid';
	import { isWalletConnected, activeAddress } from './stores/wallet';
	export let players: Player[];

	let activeTab = 'manage';

	// Function to switch between tabs
	function switchTab(tab: string) {
		activeTab = tab;
	}

	// Function to handle adding players
	function addPlayer() {
		// Implement your logic here
	}

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
			My Trunk
		</button>
	</div>

	<!-- Tab content -->
	{#if activeTab === 'players'}
		<ul>
			{#each players as player}
				<Bot
					my={player.my}
					name={player.name}
					processId={player.processId}
					health={player.health}
					energy={player.energy}
					lastTurn={player.lastTurn}
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
