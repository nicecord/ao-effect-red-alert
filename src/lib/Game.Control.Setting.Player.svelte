<script lang="ts">
	import { getBotState, loadBotCodeIntoProcess } from './Game.Control';
	import { selectedGameId } from './stores/game';
	import { getCREDBalance, transferCREDToken } from './ao';
	import { shortenAOAddress } from './wallet';
	import { activeAddress } from './stores/wallet';
	import { playerJoin, playerWithdraw } from './Game.Grid';
	export let name: string;
	export let processId: string;
	export let ownerProcessId: string;
	export let onRemove: (botProcessId: string) => void; // Function passed from parent to handle bot removal
	// $: isFullFeature = $activeAddress?.eligible;
	$: isFullFeature = true;
	const disabledExplanation =
		'Connect a wallet and own at least 0.1 TRUNK tokens to enable this feature.';
	// Function to handle token transfer
	async function joinGame(playerId: string, gameId: string) {
		console.log('player join game', playerId, gameId);
		const message = await playerJoin(playerId, gameId);
		console.log('join game message id', message);
	}
	async function leftGame(playerId: string, gameId: string) {
		console.log('player left game', playerId, gameId);
		const message = await playerWithdraw(playerId, gameId);
		console.log('left game message id', message);
	}

	// Function to handle code loading
	async function loadCode(bot: string) {
		console.log('Loading code for', processId);
		await loadBotCodeIntoProcess(bot);
	}
</script>

<div class="rounded-lg bg-white p-3 shadow-md">
	<div class="mb-1 flex items-center justify-between">
		<div class="text-lg font-bold">{name}</div>
		<p class="ml-2 text-sm text-gray-700">
			{shortenAOAddress(processId)}
		</p>
	</div>
	<div class="mb-1 flex items-center justify-between">
		<p class="mb-1 text-sm text-gray-700">
			Owner: {shortenAOAddress(ownerProcessId)}
		</p>
		<p class="mb-1 text-sm text-gray-700">
			Ver: {#await getBotState(processId)}
				...
			{:then botState}
				{botState.BotVersion}
			{:catch}
				'NA'
			{/await}
		</p>
	</div>
	<div class="flex space-x-2">
		<button
			class="btn-fill-cred"
			disabled={!isFullFeature}
			on:click={() => joinGame(processId, $selectedGameId)}
		>
			Join Game
		</button>
		<button
			class="btn-fill-cred"
			disabled={!isFullFeature}
			on:click={() => leftGame(processId, $selectedGameId)}
		>
			Left Game
		</button>
		<button class="btn-load-code" disabled={!isFullFeature} on:click={() => loadCode(processId)}>
			Load Code
		</button>
		<button class="btn-remove" on:click={() => onRemove(processId)}> Remove </button>
	</div>
</div>

<style>
	.btn-fill-cred {
		@apply rounded-md bg-blue-400 px-4 py-2 text-sm text-white;
	}

	.btn-fill-cred:hover {
		@apply bg-blue-700;
	}

	.btn-load-code {
		@apply rounded-md bg-green-400 px-4 py-2 text-sm text-white;
	}

	.btn-load-code:hover {
		@apply bg-green-700;
	}

	.btn-remove {
		@apply rounded-md bg-red-400 px-4 py-2 text-sm text-white;
	}

	.btn-remove:hover {
		@apply bg-red-700;
	}
	/* Apply styles when button is disabled */
	.btn-fill-cred:disabled,
	.btn-load-code:disabled,
	.btn-remove:disabled {
		@apply cursor-not-allowed bg-gray-300 text-gray-600;
	}
</style>
