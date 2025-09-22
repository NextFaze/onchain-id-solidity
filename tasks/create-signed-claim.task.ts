import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("create-signed-claim", "Create a signed claim")
  .addParam("issuerAddress", "The address of issuer")
  .addParam("identity", "The address of the identity")
  .addParam("issuer", "The address of the claim issuer")
  .addParam("topic", "Plain string data to have as a claim")
  .addParam("scheme", "Plain string data to have as a claim")
  .addParam("data", "Plain string data to have as a claim")
  .addParam("uri", "Plain string data to have as a claim")
  .setAction(async (args: TaskArguments, hre) => {
    // const [_, claimIssuer] = await hre.ethers.getSigners();
    // Issuer address
    const signer = await hre.ethers.getSigner(args.from);

    const data = hre.ethers.utils.defaultAbiCoder.encode(
      ["string"],
      [args.data]
    );

    const claim = {
      // Unsure if needed
      id: "",
      identity: args.identity,
      issuer: args.issuer,
      // e.g. "10101000300002",
      // scheme: "10101000666003",
      topic: args.topic,
      scheme: args.scheme,
      data: data,
      signature: "",
      // e.g., "ipfs://bafkreicni4txvwwgqvintjoroxr4m36hm2w4ckk2jvtaqphqwmi6wzzhta",
      uri: args.uri,
    };

    claim.id = hre.ethers.utils.keccak256(
      hre.ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [claim.issuer, claim.topic]
      )
    );

    claim.signature = await signer.signMessage(
      hre.ethers.utils.arrayify(
        hre.ethers.utils.keccak256(
          hre.ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "bytes"],
            [claim.identity, claim.topic, claim.data]
          )
        )
      )
    );

    console.log(JSON.stringify(claim));
  });
