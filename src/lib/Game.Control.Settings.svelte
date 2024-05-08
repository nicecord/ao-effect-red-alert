<script lang="ts">
	import Player from './Game.Control.Setting.Player.svelte';
	import { myPlayerProcesses, removeMyPlayerProcess } from './stores/game';
	import { isWalletConnected, activeAddress } from './stores/wallet';
	import FormAddMyPlayer from './Form.AddMyBot.svelte';
	function handleRemoveBot(botProcessId: string) {
		removeMyPlayerProcess(botProcessId);
	}
	// Function to handle form submission with types specified
</script>

{#if !$activeAddress?.eligible}
	<div class="mt-2 rounded bg-blue-50 p-2 text-sm text-gray-400">
		<p>To be eligible to use the full feature, you must hold at least 0.2 TRUNK tokens.</p>
	</div>
{/if}
<div class="mb-4 flex flex-col flex-wrap rounded bg-white shadow-lg">
	{#each $myPlayerProcesses as process}
		<Player {...process} onRemove={handleRemoveBot} />
	{/each}
</div>
<div>
	<FormAddMyPlayer />
</div>

<style>
	/* Optional local styles if needed */
</style>
