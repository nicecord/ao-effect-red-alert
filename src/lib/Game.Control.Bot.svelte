<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getCREDBalance } from './ao';
	import { shortenAOAddress } from './wallet';
	import TimeDifferent from './ui/TimeDifferent.svelte';
	export let isChecked: boolean;
	export let name: string | undefined;
	export let health: number | undefined;
	export let energy: number | undefined;
	export let processId: string;
	export let lastTurn: number;
	export let my: boolean;
	export let handlePlayerAction: (playerId: string, action: string) => void;
	type ActionType = 'withdraw' | 'attack';
	const dispatch = createEventDispatcher();

	function handleCheckboxChange(event: Event) {
		const target = event.target as HTMLInputElement;
		isChecked = target.checked;
		dispatch('playerChecked', { playerId: processId, isChecked });
	}
</script>

<li class="m-[2px] flex items-center bg-gray-200 text-xs" class:bg-green-100={my}>
	<span class="flex-shrink-0 flex-grow-0 basis-24 truncate border border-red-100">
		<i class="fas fa-robot"></i>
		{name || shortenAOAddress(processId)}
	</span>
	<span class="basis-10">
		<i class="fas fa-heartbeat"></i>
		{health || 0}
	</span>
	<span class="basis-10">
		<TimeDifferent {lastTurn} />
	</span>
	<span class="basis-12">
		<i class="fas fa-bolt"></i>
		{energy || 0}
	</span>
	<span class="grow">
		{#if my}
			<button
				class="w-6 border border-gray-500 hover:scale-90"
				on:click={() => handlePlayerAction(processId, 'attack')}
			>
				⚔️</button
			>
			<button
				class="ml-1 w-6 border border-gray-500 hover:scale-90"
				on:click={() => handlePlayerAction(processId, 'withdraw')}
			>
				🏃‍♀️‍➡️</button
			>
		{:else}
			<span>
				<input type="checkbox" bind:checked={isChecked} on:change={handleCheckboxChange} />
			</span>
		{/if}
	</span>
</li>
