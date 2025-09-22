import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("validate", "Revoke a claim issued by a claim issuer")
  .addParam("from", "Pays for transaction")
  .addParam("claim", "The content of a claim as a JSON string")
  .setAction(async (args: TaskArguments, hre) => {
    const signer = await hre.ethers.getSigner(args.from);

    const claim = JSON.parse(args.claim);

    console.log({ claim });

    console.log(claim);

    const claimIssuer = await hre.ethers.getContractAt(
      "ClaimIssuer",
      claim.issuer,
      signer
    );

    console.log(`Checking claim validity for`, {
      identity: claim.identity,
      topic: claim.topic,
      signature: claim.signature,
      data: claim.data,
    });

    const valid = await claimIssuer.isClaimValid(
      claim.identity,
      claim.topic,
      claim.signature,
      claim.data
    );

    console.log(`Claim Valid? ${valid ? "✅" : "❌"}`);
  });
