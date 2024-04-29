<script>
	import { getControlledBots } from '$lib/game';
	import ControlledBot from './ControlCenter.ControlledBot.svelte';
	let controlledBots = getControlledBots();
</script>

<div>
	<p>My Gangster</p>
	<ul>
		{#each controlledBots as bot}
			<li><ControlledBot botId={bot}></ControlledBot></li>
		{/each}
	</ul>
</div>

<div>OtherPlayers</div>
