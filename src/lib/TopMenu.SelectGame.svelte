<script lang="ts">
	const gameList = [
		{ name: 'DragonBallZ', processId: 'A42SJ0XqQC0ISHbBwm5Nv-yMQja-PgP5vMwuZtIWds8' },
		{ name: 'Matrix2', processId: '4xABPxOKVuXGYFEQWPq9R7dneQO1B2WHBAhX85TmF8Y' },
		{ name: 'MarioWorld', processId: 'ERRyYc0K3XurSBjpiTceT7Cg9acJaz-bES6w8SXhk-M' },
		{ name: 'SonicVerse', processId: 'kVO15FhzzirOiJWMwHIpQW14pt-E0BOy2tV1icW0iaY' },
		{ name: 'BikiniBottom', processId: '-vsAs0-3xQw6QUAYbUuonTbXAnFNJtzqhriKKOymQ9w' },
		{ name: 'Development', processId: '' }
	];
	import { selectedGameId, setSelectedGameId } from './stores/game';
	let handleChange = (event: Event) => {
		// Define the handleChange function
		const target = event.target as HTMLSelectElement;
		setSelectedGameId(target.value);
	};
</script>

<!-- Dropdown list for game selection -->
<div class="relative">
	Game:
	<select
		bind:value={$selectedGameId}
		on:change={handleChange}
		class="min-w-42 appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
	>
		{#each gameList as { name, processId }}
			<option value={processId}>{name}</option>
		{/each}
	</select>
	<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
		<svg
			class="h-5 w-5 text-gray-400"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"
			></path>
		</svg>
	</div>
</div>
