import Arweave from 'arweave'
import fs from 'fs'
import path from 'path'
import Arbundles from "arbundles";

const arweave = Arweave.init({})
export async function generateWallet(walletName: string) {
    let wallet = await arweave.wallets.generate()
    fs.writeFileSync(path.resolve('wallets/', walletName + '.json'), JSON.stringify(wallet))
    return wallet
}

async function getWalletKey() {
    const res = await fetch('/wallet.json')
    const key = await res.json()
    return key
}

function createDataItemSigner(wallet: Arbundles.JWKInterface) {
    const signer = async ({ data, tags, target, anchor }: any) => {
        const signer = new Arbundles.ArweaveSigner(wallet)
        const dataItem = Arbundles.createData(data, signer, { tags, target, anchor })
        return dataItem.sign(signer)
            .then(async () => ({
                id: await dataItem.id,
                raw: await dataItem.getRaw()
            }))
    }

    return signer
}
export async function getJWKSigner() {
    const key = await getWalletKey() as Arbundles.JWKInterface
    const signer = new Arbundles.ArweaveSigner(key)
    return signer
}
export async function connectArConnect() {

}




export async function arConnect {
    console.log('arConnect');
    const result = await (window as any).arweaveWallet
        .connect(['SIGN_TRANSACTION', 'ACCESS_ADDRESS'])
        .then(() => {
        });
};

const arDisconnect = () => {
    (window as any).arweaveWallet.disconnect().then(() => (connected.value = false));
}

<<<<<<< HEAD
=======
export async function getArConnectActiveWallet() {
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
		return await getArConnectActiveWallet();
	} catch (e) {
		console.log(e);
		return '';
	}
}

export async function arDisconnect() {
	await window.arweaveWallet.disconnect();
}
