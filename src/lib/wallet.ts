import Arweave from 'arweave'
import fs from 'fs'
import path from 'path'
export async function generateWallet(walletName: string) {
    let wallet = await Arweave.init({}).wallets.generate()
    fs.writeFileSync(path.resolve('wallets/', walletName + '.json'), JSON.stringify(wallet))
    return wallet
}

export async function getWallet() {
    return ''
}