<script lang="ts">
	import { onMount } from 'svelte';
	import { isWalletConnected, activeAddress, arConnect, updateWallet } from './stores/wallet';
	import ConnectedWallet from './ConnectedWallet.svelte';

	async function connectAR() {
		await arConnect();
	}
</script>

{#if $activeAddress?.address}
	{#key $activeAddress.address}
		<ConnectedWallet
			address={$activeAddress.address}
			trunkBalance={$activeAddress.trunkBalance}
			credBalance={$activeAddress.credBalance}
		/>
	{/key}
{:else}
	<button
		on:click={connectAR}
		class="group relative mb-2 me-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500 dark:text-white dark:focus:ring-blue-800"
	>
		<span
			class="relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900"
		>
			Connect
		</span>
	</button>
{/if}
