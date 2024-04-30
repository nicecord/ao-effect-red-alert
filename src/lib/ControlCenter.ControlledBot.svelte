<script lang="ts">
	import { getCREDBalance, transferCRED } from '$lib/ao';
	export let botId: string;
	import { onMount } from 'svelte';
	let credBalance: number;

	async function rechargeCred() {
		const messageId = await transferCRED(botId, '1000');
	}

	onMount(() => {
		console.log('the component has mounted');
		// get dom element by id
		console.log(document.getElementById('tag'));
		//intervals functions
		const interval = setInterval(async () => {
			const balance = await getCREDBalance(botId);
			credBalance = balance;
		}, 3000);
		//If a function is returned from onMount, it will be called when the component is unmounted.
		return () => clearInterval(interval);
	});
</script>

<div class="dashboard">
	<p>
		{botId}
	</p>
	<button on:click={rechargeCred}> recharge </button>
	<button> attack </button>
	<button> move </button>
	<div>
		{#if !credBalance}
			...
		{:else}
			{credBalance}
		{/if}
	</div>
</div>

<style>
	.dashboard {
		display: flex;
		align-items: center;
		gap: 10px; /* Space between elements */
	}
	.dashboard button {
		min-width: 80px;
	}
</style>
