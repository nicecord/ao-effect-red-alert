<script lang="ts">
	import { onMount } from 'svelte';
	import Bot from './Game.Setting.Bot.svelte';
	import {
		addMyBotProcess,
		getMyBotProcesses,
		removeMyBotProcess,
		type BotLocalSetting
	} from './Game.Setting';
	let activeAddress: string = '';
	let myBotProcesses: BotLocalSetting[] = [];

	function handleRemoveBot(botProcessId: string) {
		myBotProcesses = removeMyBotProcess(botProcessId);
	}
	// Function to handle form submission with types specified
	// Add code to handle
	onMount(() => {
		myBotProcesses = getMyBotProcesses();
	});
</script>

<div class="m-2">
	{#if myBotProcesses.length === 0}
		<span> No bots added yet </span>
	{:else}
		<div class="flex flex-wrap">
			{#each myBotProcesses as process}
				<Bot {...process} onRemove={handleRemoveBot} />
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Optional local styles if needed */
</style>
