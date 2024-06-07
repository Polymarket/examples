import { BigNumber, ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { erc20Abi, erc1155Abi } from "../abis"


const ERC20_INTERFACE = new Interface(erc20Abi);
const ERC1155_INTERFACE = new Interface(erc1155Abi);


export const encodeErc20Transfer = (to: string, value: BigNumber): string => {
    return ERC20_INTERFACE.encodeFunctionData(
        "transfer(address,uint256)",
        [to, value]
    );
}

export const encodeErc1155TransferFrom = (from: string, to: string, id: string, value: BigNumber): string => {
    return ERC1155_INTERFACE.encodeFunctionData(
        "safeTransferFrom(address,address,uint256,uint256,bytes)",
        [from, to, id, value, ethers.constants.HashZero]
    );
}

export const encodeErc20Approve = (spender: string, approvalAmount: BigNumber): string => {
    return ERC20_INTERFACE.encodeFunctionData(
        "approve(address,uint256)",
        [spender, approvalAmount]
    );
}

export const encodeErc1155Approve = (spender: string, approval: boolean): string => {
    return ERC1155_INTERFACE.encodeFunctionData(
        "setApprovalForAll(address,bool)",
        [spender, approval],
    );
}

