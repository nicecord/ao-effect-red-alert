<script lang="ts">
	import { onMount } from 'svelte';
	import { shortenAOAddress } from './wallet';
	import { updateWallet, arDisconnect } from './stores/wallet';

	export let address;
	export let trunkBalance;
	export let credBalance;

	let showDetails = false;

	onMount(() => {
		const intervalId = setInterval(async () => {
			await updateWallet(address);
		}, 30000);

		return () => clearInterval(intervalId);
	});

	function toggleDetails() {
		showDetails = !showDetails;
	}

	async function disconnect() {
		await arDisconnect();
		// Implement logic to disconnect the wallet
	}

	function closeDetails() {
		showDetails = false;
	}
</script>

<div class="flex flex-col items-center rounded-lg bg-gray-100 p-1 shadow-md">
	{#if showDetails}
		<div class="text-gray-800">
			<p class="mb-2">TRUNK Balance: {trunkBalance}</p>
			<p class="mb-4">CRED Balance: {credBalance}</p>
			<div class="flex justify-between">
				<button class="mr-2 rounded bg-red-500 px-4 py-2 text-white" on:click={disconnect}
					>Disconnect</button
				>
				<button class="rounded bg-gray-500 px-4 py-2 text-white" on:click={closeDetails}
					>Close</button
				>
			</div>
		</div>
	{:else}
		<div class="flex items-center" on:click={toggleDetails} aria-hidden="true">
			<svg
				class="mr-2 h-5 w-5 fill-current text-gray-600"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
			>
				<path
					d="M18.296 7.73l-7-6a1.003 1.003 0 0 0-1.176 0l-7 6A1 1 0 0 0 3 9h14a1 1 0 0 0 .296-1.27zM10 2.414l5.647 4.893L11 11.828V15h-2v-3.172l-4.647-4.52L10 2.414zM5.382 8l-1.167 1 5.57 5.414 5.571-5.414-1.167-1L10 10.242 5.382 8zM16.381 9L11 13.758 5.619 9H16.38z"
				/>
			</svg>
			<span class="cursor-pointer text-blue-600 hover:underline">{shortenAOAddress(address)}</span>
		</div>
	{/if}
</div>
