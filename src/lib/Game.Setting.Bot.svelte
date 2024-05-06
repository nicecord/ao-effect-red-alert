<script lang="ts">
	import { getBotState, loadBotCodeIntoProcess } from './Game.Control';
	import { getCREDBalance, transferCREDToken } from './ao';
	import { shortenAOAddress } from './wallet';

	export let name: string;
	export let processId: string;
	export let ownerProcessId: string;
	export let onRemove: (botProcessId: string) => void; // Function passed from parent to handle bot removal

	// Function to handle token transfer
	async function addCRED(target: string) {
		// Implementation needed for token transfer
		console.log('send CRED to ', target);
		await transferCREDToken(target, '1000');
	}

	// Function to handle code loading
	async function loadCode(bot: string) {
		console.log('Loading code for', processId);
		await loadBotCodeIntoProcess(bot);
		// Implementation needed for loading code
	}
</script>

<div class="w-full max-w-sm rounded-lg bg-white p-4 shadow-md">
	<div class="mb-2 text-lg font-bold">{name}</div>
	<p class="mb-1 text-base text-gray-700">
		Process ID: {shortenAOAddress(processId)}
	</p>
	<p class="text-base text-gray-700">
		Owner Process ID: {shortenAOAddress(ownerProcessId)}
	</p>
	<p class="text-base text-gray-700">
		Cred Balance: {#await getCREDBalance(processId) then balance}
			{balance}
		{/await}
	</p>
	<p class="text-base text-gray-700">
		Bot Version: {#await getBotState(processId) then botState}
			{botState.BotVersion}
		{:catch}
			<p class="text-sm text-red-400">bot is not compatible. Load Lua Code</p>
		{/await}
	</p>
	<div class="mt-4 flex space-x-2">
		<button
			class="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
			on:click={() => addCRED(processId)}
		>
			Fill CRED
		</button>
		<button
			class="focus:shadow-outline rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none"
			on:click={() => loadCode(processId)}
		>
			Load Lua Code
		</button>
		<button
			class="focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
			on:click={() => onRemove(processId)}
		>
			Remove Bot
		</button>
	</div>
</div>
