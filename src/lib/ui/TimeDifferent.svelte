<script lang="ts">
	import { onMount } from 'svelte';

	export let lastTurn: number; // Initialize last turn timestamp

	let timeDifference: number;
	// Function to calculate the time difference in seconds
	function getTimeDifference() {
		const currentTime = Date.now(); // Get current time in milliseconds
		return currentTime - lastTurn; // Calculate difference in seconds
	}

	// Update time difference every second
	onMount(() => {
		const interval = setInterval(() => {
			timeDifference = getTimeDifference();
		}, 1000);
		return () => clearInterval(interval);
	});

	function formatTimeDifference(n: number) {
		const d = Math.min(999, Math.floor(timeDifference / 1000));
		return String(d).padStart(3, '0');
	}
	// Store the time difference in seconds
	timeDifference = getTimeDifference();
</script>

<div class="flex items-center">
	<i
		class="fas fa-times-circle {timeDifference < 10000
			? 'text-green-500'
			: timeDifference < 60000
				? 'text-yellow-500'
				: 'text-red-500'}">{formatTimeDifference(timeDifference)}</i
	>
</div>
