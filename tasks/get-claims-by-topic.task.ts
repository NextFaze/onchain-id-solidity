import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("get-claims-by-topic", "Get claims of identity by topic")
  .addParam("from", "Will pay the gas for the transaction")
  .addParam("identity", "The address of the identity")
  .addParam("topic", "A uint256 number which represents the topic of the claim")
  .setAction(async (args: TaskArguments, hre) => {
    const signer = await hre.ethers.getSigner(args.from);

    const identity = await hre.ethers.getContractAt(
      "Identity",
      args.identity,
      signer
    );

    const claimIds = await identity.getClaimIdsByTopic(args.topic);
    const claims = await Promise.all(
      claimIds.map(async (id) => {
        const data = await identity.getClaim(id);
        return {
          id,
          identity: identity.address,
          issuer: data[2],
          topic: data[0],
          scheme: data[1],
          data: data[4],
          signature: data[3],
          uri: data[5],
        };
      })
    );

    console.log(
      `Claims in topic: ${args.topic} of identity: ${
        args.identity
      }: ${JSON.stringify(claims)}`
    );

    return claims;
  });
