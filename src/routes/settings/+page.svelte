<script lang="ts">
	import { onMount } from 'svelte';
	import { getArConnectActiveWallet, arConnect, shortenAOAddress } from '$lib/wallet';
	import { processesList, spawnProcess } from '$lib/ao';
	import { getBotState, isValidBotName, loadBotIntoProcess } from '$lib/bot';
	import { loadGrid } from '$lib/game';
	let botName: string = '';
	let gridName: string = '';
	let activeAddress = '';
	let myBots: { name: string; processId: string }[] = [];
	let grids: { name: string; processId: string }[] = [];
	function isValidGridName(name: string) {
		return name.startsWith('g-');
	}
	async function loadBot(processId: string) {
		const messageId = await loadBotIntoProcess(processId);
		console.log('load bot messageId', messageId);
	}
	async function createBot() {
		if (!botName) {
			return;
		}
		const processId = await spawnProcess(botName);
		myBots.push({ name: botName, processId });
		myBots = myBots;
	}

	async function createGrid() {
		if (!gridName) {
			return;
		}
		const processId = await spawnProcess(gridName);
		grids.push({ name: gridName, processId });
		grids = grids;
	}

	async function init() {
		await arConnect();
		activeAddress = await getArConnectActiveWallet();
		const processList = await processesList(activeAddress);
		const botProcesses = processList.filter(({ name }) => isValidBotName(name));
		myBots.push(...botProcesses);
		myBots = myBots;
		grids = processList.filter(({ name }) => isValidGridName(name));
	}

	onMount(async () => {
		await init();
	});
</script>

<h1>Settings</h1>
<div>
	<h2>wallet settings</h2>
	<div>
		<button on:click={arConnect}>connect to ARConnect</button>
		<span>address: {activeAddress}</span>
	</div>
	<div>
		<button> Load Wallet.json </button>
	</div>
	<div>
		<button> generate a new wallet</button>
	</div>
</div>

<div>
	<h2>Bot settings</h2>
	<div>
		<label for="botName">
			<span> create a new bot</span>
			<input id="botName" type="text" bind:value={botName} />
			<button disabled={!isValidBotName(botName)} on:click={createBot}>create</button>
		</label>
	</div>

	{#each myBots as bot}
		<div>
			<span>name: {bot.name}</span><span style="margin-left: 10px;"
				>Process Id: {shortenAOAddress(bot.processId)}</span
			>
			<button on:click={() => loadBot(bot.processId)}>load bot</button>
			{#await getBotState(bot.processId) then botState}
				<span>botVersion: {botState.BotVersion} </span>
			{/await}
		</div>
	{/each}
</div>

<div>
	<h2>Grid Setting</h2>
	<div>
		<label for="GridName">
			<span> create a new grid</span>
			<input id="gridName" type="text" bind:value={gridName} />
			<button disabled={!isValidGridName(gridName)} on:click={createBot}>create</button>
		</label>
	</div>
	{#each grids as grid}
		<div>
			<span>name: {grid.name}</span><span style="margin-left: 10px;"
				>Process Id: {shortenAOAddress(grid.processId)}</span
			>
			<button on:click={() => loadGrid(grid.processId)}>load bot</button>
		</div>
	{/each}
</div>
