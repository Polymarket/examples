import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber, Contract, ethers, Wallet } from "ethers";


function joinHexData(hexData: string[]): string {
    return `0x${hexData
        .map(hex => {
            const stripped = hex.replace(/^0x/, "");
            return stripped.length % 2 === 0 ? stripped : "0" + stripped;
        })
        .join("")}`;
}

function abiEncodePacked(...params: { type: string; value: any }[]): string {
    return joinHexData(
        params.map(({ type, value }) => {
            const encoded = ethers.utils.defaultAbiCoder.encode([type], [value]);

            if (type === "bytes" || type === "string") {
                const bytesLength = parseInt(encoded.slice(66, 130), 16);
                return encoded.slice(130, 130 + 2 * bytesLength);
            }

            let typeMatch = type.match(/^(?:u?int\d*|bytes\d+|address)\[\]$/);
            if (typeMatch) {
                return encoded.slice(130);
            }

            if (type.startsWith("bytes")) {
                const bytesLength = parseInt(type.slice(5));
                return encoded.slice(2, 2 + 2 * bytesLength);
            }

            typeMatch = type.match(/^u?int(\d*)$/);
            if (typeMatch) {
                if (typeMatch[1] !== "") {
                    const bytesLength = parseInt(typeMatch[1]) / 8;
                    return encoded.slice(-2 * bytesLength);
                }
                return encoded.slice(-64);
            }

            if (type === "address") {
                return encoded.slice(-40);
            }

            throw new Error(`unsupported type ${type}`);
        }),
    );
}

async function signTransactionHash(signer: Wallet, message: string) {
    const messageArray = ethers.utils.arrayify(message);
    let sig = await signer.signMessage(messageArray);
    let sigV = parseInt(sig.slice(-2), 16);

    switch (sigV) {
        case 0:
        case 1:
            sigV += 31;
            break;
        case 27:
        case 28:
            sigV += 4;
            break;
        default:
            throw new Error("Invalid signature");
    }

    sig = sig.slice(0, -2) + sigV.toString(16);

    return {
        r: BigNumber.from("0x" + sig.slice(2, 66)).toString(),
        s: BigNumber.from("0x" + sig.slice(66, 130)).toString(),
        v: BigNumber.from("0x" + sig.slice(130, 132)).toString(),
    };
}

export const signAndExecuteSafeTransaction = async (
    signer: Wallet,
    safe: Contract,
    to: string,
    data: string,
    overrides?: ethers.Overrides,
) : Promise<TransactionResponse> => {
    if( overrides == null) {
        overrides = {};
    };

    const nonce = await safe.nonce();
    const adjustedNonce = nonce;
    const value = "0";
    const safeTxGas = "0";
    const baseGas = "0";
    const gasPrice = "0";
    const gasToken = ethers.constants.AddressZero;
    const refundReceiver = ethers.constants.AddressZero;
    const operation = 0;

    const txHash = await safe.getTransactionHash(
        to,
        value,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        adjustedNonce
    );

    const rsvSignature = await signTransactionHash(signer, txHash);
    const packedSig = abiEncodePacked(
        { type: "uint256", value: rsvSignature.r },
        { type: "uint256", value: rsvSignature.s },
        { type: "uint8", value: rsvSignature.v },
    );

    return safe.execTransaction(
        to,
        value,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        packedSig,
        overrides
    );
}