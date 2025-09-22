import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("get-keys-by-purpose", "Get keys in identity by purpose")
  .addParam("from", "Will pay the gas for the transaction")
  .addParam("identity", "The address of the identity")
  .addParam(
    "purpose",
    "The purpose; 1 = MANAGEMENT, 2 = ACTION, 3 = CLAIM, 4 = ENCRYPTION"
  )
  .setAction(async (args: TaskArguments, hre) => {
    const signer = await hre.ethers.getSigner(args.from);

    const identity = await hre.ethers.getContractAt(
      "Identity",
      args.identity,
      signer
    );

    const keys = await identity.getKeysByPurpose(args.purpose);
    console.log(
      `Keys for identity at ${identity.address} with purpose ${
        args.purpose
      }: ${JSON.stringify(keys)} `
    );
  });
