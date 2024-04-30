<script lang="ts">
	import { onMount } from 'svelte';
	import Bot from './ControlRoom.Bot.svelte';
	import { getMyBots, type BotType } from './bot';

	let bots: BotType[] = [];
	onMount(async () => {
		bots = await getMyBots();
	});
</script>

<p>Welcome to the control room</p>
<div>
	<ul>
		{#each bots as { processId, color, name }}
			<li><Bot {processId} {color} {name} /></li>
		{/each}
	</ul>
</div>
