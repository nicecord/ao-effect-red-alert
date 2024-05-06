import { connect, createDataItemSigner } from '@permaweb/aoconnect';
import { getSigner } from './wallet';
const MU_URL = 'https://mu.ao-testnet.xyz';
const CU_URL = 'https://cu.ao-testnet.xyz';
const GATEWAY_URL = 'https://arweave.net';
export const MODULE = '1PdCJiXhNafpJbvC-sjxWTeNzbf9Q_RfUNs84GYoPm0';
export const SCHEDULER = '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA';
const BACKEND_URL = 'https://arweave-search.goldsky.com/graphql';

import { getJWKSigner } from './wallet';

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect({
	MU_URL: 'https://mu.ao-testnet.xyz',
	CU_URL: 'https://cu.ao-testnet.xyz',
	GATEWAY_URL: 'https://arweave.net'
});

// now spawn, message, and result can be used the same way as if they were imported directly
export const CRED = 'Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc';
// export async function transfer(amount: number, receipt: string, token: string) {

export async function getTokenBalance(token: string, address: string) {
	const result = await dryrun({
		process: token,
		tags: [
			{ name: 'Action', value: 'Balance' },
			{ name: 'Target', value: address }
		]
	});

	return result.Messages[0].Data;
}
export async function getCREDBalance(address: string) {
	const result = await dryrun({
		process: CRED,
		tags: [
			{ name: 'Action', value: 'Balance' },
			{ name: 'Target', value: address }
		]
	});

export async function getCREDBalance(address: string) {
	const result = await dryrun({
		process: CRED,
		tags: [
			{ name: 'Action', value: 'Balance' },
			{ name: 'Target', value: address }
		]
	});

	return result.Messages[0].Data;
}

export async function transferCRED(to: string, qty: string) {
	return await transferToken(CRED, to, qty);
}

export async function transferToken(token: string, to: string, qty: string) {
	// const signer = await getJWKSigner()
	const messageId = await message({
		process: token,
		signer: createDataItemSigner(Aocon),
		tags: [
			{ name: 'Action', value: 'Transfer' },
			{ name: 'Recipient', value: to },
			{ name: 'Quantity', value: qty }
		]
	});

	console.log('transferToken:', messageId);
	return messageId;
}

export async function transferToken(token: string, to: string, qty: string) {
	const messageId = await sendAOMessage('', token, [
		{ name: 'Action', value: 'Transfer' },
		{ name: 'Recipient', value: to },
		{ name: 'Quantity', value: qty }
	]);

	console.log('transferToken:', messageId);
	return messageId;
}

export async function sendAOMessage(
	from: string,
	targetProcess: string,
	tags: { name: string; value: string }[]
) {
	const signer = await getSigner();
	const messageId = await message({
		process: targetProcess,
		tags,
		signer
	});
	return messageId;
}

export async function dryrunAo(
	sender: string,
	targetProcess: string,
	tags: { name: string; value: string }[]
) {
	const result = await dryrun({
		process: targetProcess,
		tags
	});
	return result;
}

export async function processesList(
	address: string
): Promise<{ processId: string; name: string }[]> {
	return fetch(BACKEND_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query: generateProcessesQuery(address)
		})
	})
		.then((res) => res.json())
		.then((data) => {
			const edges = data.data?.transactions?.edges;
			return edges?.map(
				(edge: { node: { id: string; tags: { name: string; value: string }[] } }) => {
					return {
						processId: edge.node.id,
						name: edge.node.tags.find((tag) => tag.name === 'Name')?.value
					};
				}
			);
		});
}

function generateProcessesQuery(address: string) {
	return `query {
	  transactions(first: 100, owners: ["${address}"], tags: [
		{name: "Type", values: ["Process"]},
		{name: "Variant", values: ["ao.TN.1"]},
		{name: "Data-Protocol", values: ["ao"]}
	  ]) {
		edges {
		  node {
			id
			tags {
			  name
			  value
			}
		  }
		}
	  }
	}`;
}

export async function spawnProcess(name: string = 'default') {
	try {
		const processId = await spawn({
			module: MODULE,
			scheduler: SCHEDULER,
			signer: createDataItemSigner(window.arweaveWallet),
			tags: [{ name: 'Name', value: name }]
		});

		return processId;
	} catch (error) {
		console.log('spawnProcess --> error:', error);
		return '';
	}
}

export async function evaluate(process: string, data: string) {
	try {
		const messageId = await message({
			process,
			signer: createDataItemSigner(window.arweaveWallet),
			tags: [{ name: 'Action', value: 'Eval' }],
			data
		});

		return messageId;
	} catch (error) {
		console.log('evaluate --> error:', error);
		return '';
	}
}
