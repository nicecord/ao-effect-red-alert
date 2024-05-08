import { getCREDBalance, getTrunkBalance } from '$lib/ao';
import { writable, get } from 'svelte/store';
export const MIN_TRUNK = 200;
export const isWalletConnected = writable<boolean>(false);

export const activeAddress = writable<
	| {
			address: string;
			eligible: boolean;
			trunkBalance: number;
			credBalance: number;
	  }
	| undefined
>();

async function getArConnectActiveWallet() {
	let address;
	try {
		address = await window.arweaveWallet.getActiveAddress();
	} catch (error) {
		return '';
	}

	return address;
}

export async function arConnect() {
	try {
		await window.arweaveWallet.connect(['SIGN_TRANSACTION', 'ACCESS_ADDRESS']);
		isWalletConnected.set(true);
		const address = await getArConnectActiveWallet();
		activeAddress.set({ address, eligible: false, credBalance: 0, trunkBalance: 0 });
		await updateWallet(address);
	} catch (e) {
		console.log(e);
		return '';
	}
}

export async function arDisconnect() {
	await window.arweaveWallet.disconnect();
	activeAddress.set(undefined);
	isWalletConnected.set(false);
}

export async function updateWallet(address: string) {
	const credBalance = await getCREDBalance(address);
	const trunkBalance = await getTrunkBalance(address);
	const current = get(activeAddress);
	if (current) {
		activeAddress.set({
			...current,
			eligible: trunkBalance > MIN_TRUNK,
			credBalance,
			trunkBalance
		});
	}
}
