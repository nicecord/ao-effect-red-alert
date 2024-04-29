<script lang="ts">
	import type { Player } from '$lib/game';
	export let player: Player;
</script>

<div class:friend={player.isFriend}>
	{player.energy}
</div>

<style>
	.friend {
		background-color: chocolate;
	}
</style>
