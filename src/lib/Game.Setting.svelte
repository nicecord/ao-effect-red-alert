<script lang="ts">
	import { onMount } from 'svelte';
	import Bot from './Game.Setting.Bot.svelte';
	import { getArConnectActiveWallet, arConnect, shortenAOAddress } from '$lib/wallet';
	import {
		addMyBotProcess,
		getMyBotProcesses,
		removeMyBotProcess,
		type BotLocalSetting
	} from './Game.Setting';
	let activeAddress: string = '';
	let myBotProcesses: BotLocalSetting[] = [];

	async function connectAr() {
		activeAddress = await arConnect();
	}

	// Function to handle form submission with types specified
	function handleSubmit(event: SubmitEvent): void {
		const formData = new FormData(event.target as HTMLFormElement);
		const botData = {
			processId: formData.get('processId') as string,
			name: formData.get('name') as string,
			ownerProcessId: formData.get('ownerProcessId') as string
		};
		myBotProcesses = addMyBotProcess(botData);
		// Additional logic to handle bot data such as sending it to a server
	}
	function handleRemoveBot(botProcessId: string) {
		myBotProcesses = removeMyBotProcess(botProcessId);
	}
	// Add code to handle
	onMount(() => {
		myBotProcesses = getMyBotProcesses();
	});
</script>

<div class="m-1">
	<div>
		{#if !activeAddress}
			<button
				class="rounded bg-blue-500 px-2 py-1 font-bold text-white hover:bg-blue-700"
				on:click={connectAr}>Connect Wallet</button
			>
		{:else}
			<span> {activeAddress}</span>
		{/if}
	</div>
	<div class="m-2">
		{#if myBotProcesses.length === 0}
			<span> No bots added yet </span>
		{:else}
			<div class="flex">
				{#each myBotProcesses as process}
					<Bot {...process} onRemove={handleRemoveBot} />
				{/each}
			</div>
		{/if}
	</div>
	<div class="flex items-center justify-start bg-gray-100">
		<div class="w-full max-w-xs">
			<form
				on:submit|preventDefault={handleSubmit}
				class="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md"
			>
				<div class="mb-4">
					<label for="processId" class="mb-2 block text-sm font-bold text-gray-700"
						>Process ID:</label
					>
					<input
						type="text"
						id="processId"
						name="processId"
						required
						class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
					/>
				</div>
				<div class="mb-4">
					<label for="name" class="mb-2 block text-sm font-bold text-gray-700">Bot Name:</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
					/>
				</div>
				<div class="mb-6">
					<label for="ownerProcessId" class="mb-2 block text-sm font-bold text-gray-700"
						>Owner Process ID:</label
					>
					<input
						type="text"
						id="ownerProcessId"
						name="ownerProcessId"
						required
						class="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
					/>
				</div>
				<div class="flex items-center justify-between">
					<button
						type="submit"
						class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
					>
						Add Bot
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<style>
	/* Optional local styles if needed */
</style>
