import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("add-key", "Add a purpose to a key on an identity")
  .addParam("holderAddress", "Identity Holder address")
  .addParam("identity", "The address of the identity")
  .addParam("key", "The key (ethereum address)")
  .addParam("type", "The type of the key (ECDSA = 1)")
  .addParam(
    "purpose",
    "The purpose to add (MANAGEMENT = 1, ACTION = 2, CLAIM = 3)"
  )
  .setAction(async (args: TaskArguments, hre) => {
    const signer = await hre.ethers.getSigner(args.holderAddress);

    const identity = await hre.ethers.getContractAt(
      "Identity",
      args.identity,
      signer
    );

    const keyHash = hre.ethers.utils.keccak256(
      hre.ethers.utils.defaultAbiCoder.encode(["address"], [args.key])
    );

    const tx = await identity.addKey(keyHash, args.purpose, args.type);

    console.log(
      `Add purpose ${args.purpose} to key ${args.key} (hash: ${keyHash}) on identity ${args.identity} tx: ${tx.hash}`
    );

    await tx.wait();

    console.log(
      `Add purpose ${args.purpose} to key ${args.key} (hash: ${keyHash}) on identity ${args.identity} tx mined: ${tx.hash}`
    );
  });
