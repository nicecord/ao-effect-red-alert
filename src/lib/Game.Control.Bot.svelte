<script lang="ts">
	import { onMount } from 'svelte';
	import { getCREDBalance } from './ao';
	import { shortenAOAddress } from './wallet';

	export let name: string | undefined;
	export let health: number | undefined;
	export let energy: number | undefined;
	export let processId: string;
	export let my: boolean;
</script>

<li class="m-[2px] flex items-center justify-between text-xs" class:bg-green-100={my}>
	<span class="flex-shrink-0 flex-grow-0 basis-24">
		<i class="fas fa-robot"></i>
		{name || shortenAOAddress(processId)}
	</span>
	<span class="basis-14">
		<i class="fas fa-heartbeat"></i>
		{health || 0}
	</span>
	<span class="basis-10">
		<i class="fas fa-bolt"></i>
		{energy || 0}
	</span>
</li>
