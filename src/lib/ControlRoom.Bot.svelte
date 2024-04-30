<script lang="ts">
	import { shortenAOAddress } from '$lib/wallet';
	import { transferToken } from '$lib/ao';
	export let processId;
	export let name;
	export let color;
	async function fillUp() {
		await transferToken('', 'abc', '500');
	}

	function toggleFight(event: Event) {
		const checkbox = event.target as HTMLInputElement;
		const isChecked = checkbox.checked;

		// Add your logic here based on whether the checkbox is checked or not
		if (isChecked) {
			// Checkbox is checked
			console.log('Fight mode activated!');
			// Add more actions here if needed
		} else {
			// Checkbox is unchecked
			console.log('Fight mode deactivated!');
			// Add more actions here if needed
		}
	}
	async function move(direction: string) {
		console.log('Moving ' + direction);
	}
</script>

<div>
	<span style="background-color: {color};" id={processId}> {shortenAOAddress(processId)}</span>
	<span>{name}</span>
	<span>
		<button> ⚔️ </button>
	</span>
	<span class="controller">
		<div>
			<button class="up" on:click={() => move('Up')}>↑</button>
			<button class="down" on:click={() => move('Down')}>↓</button>
			<button class="left" on:click={() => move('Left')}>←</button>
			<button class="right" on:click={() => move('Right')}>→</button>
		</div>
		<div>
			<button on:click={() => move('UpLeft')}>↖</button>
			<!-- This button is for future use -->
			<button on:click={() => move('UpRight')}>↗</button>
			<!-- These buttons are for future use -->
			<button on:click={() => move('DownLeft')}>↙</button>
			<button on:click={() => move('DownRight')}>↘</button>
		</div>
	</span>
</div>

<style>
	/* Add some basic styling */
</style>
