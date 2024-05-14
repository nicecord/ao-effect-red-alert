<script lang="ts">
	import { addMyPlayerProcess } from './stores/game';

	function handleSubmit(event: SubmitEvent): void {
		const formData = new FormData(event.target as HTMLFormElement);
		const player = {
			processId: formData.get('processId') as string,
			name: formData.get('name') as string,
			ownerProcessId: (formData.get('ownerProcessId') || 'na') as string
		};

		addMyPlayerProcess(player);

		// Additional logic to handle bot data such as sending it to a server
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="mb-4 rounded bg-white px-2 pb-2 pt-6 shadow-lg"
>
	<p class="mb-4 text-sm font-light text-gray-500">Add Player (Under My Control)</p>
	<input
		type="text"
		id="processId"
		name="processId"
		autocomplete="off"
		required
		class="input-field"
		placeholder="Process ID"
	/>
	<input
		type="text"
		autocomplete="off"
		id="name"
		name="name"
		required
		class="input-field"
		placeholder="Bot Name"
	/>
	<!-- <input
		autocomplete="off"
		type="text"
		id="ownerProcessId"
		name="ownerProcessId"
		required
		class="input-field"
		placeholder="Owner Process ID"
	/> -->
	<button type="submit" class="btn-add-player">Add Player</button>
</form>

<style>
	.input-field {
		@apply mb-3 block w-full rounded border px-3 py-1 focus:outline-none focus:ring;
	}

	.btn-add-player {
		@apply rounded border border-gray-300 bg-white px-3 py-1  text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring;
	}
</style>
