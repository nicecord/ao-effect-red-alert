import { connect, createDataItemSigner } from "@permaweb/aoconnect";


const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect(
    {
        MU_URL: "https://mu.ao-testnet.xyz",
        CU_URL: "https://cu.ao-testnet.xyz",
        GATEWAY_URL: "https://arweave.net",
    },
);

// now spawn, message, and result can be used the same way as if they were imported directly
export const CRED = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"
export async function transfer(amount: number, receipt: string, token: string) {

}

export async function getTokenBalance(token: string, address: string) {
    const result = await dryrun({
        process: token,
        tags: [
            { name: 'Action', value: 'Balance' },
            { name: 'Target', value: address },
        ],
    });

    return result.Messages[0].Data;
}

export async function transferToken(from: string, to: string, qty: string) {
    const messageId = await message({
        process: from,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [
            { name: 'Action', value: 'TransferAOT' },
            { name: 'Recipient', value: to },
            { name: 'Quantity', value: qty },
        ],
    });

    console.log("transferToken:", messageId)
    return messageId;
}