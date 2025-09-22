import { ethers } from "hardhat";

const log = (description: string, value: string) => {
  console.log(`${description}:`.padEnd(25), value);
};

async function main() {
  const [deploymentAuthorityWallet, claimIssuerWallet, identityBlueBankWallet] =
    await ethers.getSigners();

  // ??
  // const claimIssuer = await ethers.deployContract("ClaimIssuer", [issuerConnectId.address]);

  const ClaimIssuer = await ethers.getContractFactory("ClaimIssuer");
  const claimIssuer = await ClaimIssuer.connect(claimIssuerWallet).deploy(
    claimIssuerWallet.address,
  );
  log("Claim Issuer", claimIssuer.address);

  // Unsure if this step is required but was in the tests
  // await claimIssuer
  //   .connect(claimIssuerWallet)
  //   .addKey(
  //     ethers.utils.keccak256(
  //       ethers.utils.defaultAbiCoder.encode(
  //         ["address"],
  //         [claimIssuerWallet.address],
  //       ),
  //     ),
  //     3,
  //     1,
  //   );

  const Identity = await ethers.getContractFactory("Identity");
  const identityImplementation = await Identity.connect(
    deploymentAuthorityWallet,
  ).deploy(deploymentAuthorityWallet.address, true);
  const ImplementationAuthority = await ethers.getContractFactory(
    "ImplementationAuthority",
  );
  const implementationAuthority = await ImplementationAuthority.connect(
    deploymentAuthorityWallet,
  ).deploy(identityImplementation.address);
  const IdentityFactory = await ethers.getContractFactory("IdFactory");
  const identityFactory = await IdentityFactory.connect(
    deploymentAuthorityWallet,
  ).deploy(implementationAuthority.address);

  await identityFactory
    .connect(deploymentAuthorityWallet)
    .createIdentity(identityBlueBankWallet.address, "bluebank");

  const blueBankIdentity = await ethers.getContractAt(
    "Identity",
    await identityFactory.getIdentity(identityBlueBankWallet.address),
  );

  log("Blue Bank Identity", blueBankIdentity.address);

  const rawData = "AUS";
  const data = ethers.utils.defaultAbiCoder.encode(["string"], [rawData]);

  const claim = {
    // Unsure if needed
    id: "",
    identity: blueBankIdentity.address,
    issuer: claimIssuer.address,
    topic: "10101000300002",
    scheme: "10101000666003",
    data: data,
    signature: "",
    uri: "ipfs://bafkreicni4txvwwgqvintjoroxr4m36hm2w4ckk2jvtaqphqwmi6wzzhta",
  };

  claim.id = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256"],
      [claim.issuer, claim.topic],
    ),
  );

  claim.signature = await claimIssuerWallet.signMessage(
    ethers.utils.arrayify(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256", "bytes"],
          [claim.identity, claim.topic, claim.data],
        ),
      ),
    ),
  );

  log("Claim", JSON.stringify(claim));
  log("Claim signature", claim.signature);
  log("Claim id", claim.id);
  log("Claim Signature", claim.signature);

  const claimTx = await blueBankIdentity
    .connect(identityBlueBankWallet)
    .addClaim(
      claim.topic,
      claim.scheme,
      claim.issuer,
      claim.signature,
      claim.data,
      claim.uri,
    );
  log("Claim Issued", claimTx.hash);

  const isValid = await claimIssuer.isClaimValid(
    claim.identity,
    claim.topic,
    claim.signature,
    claim.data,
  );

  log("IsValid", isValid ? "✅" : "❌");

  const revokeTx = await claimIssuer
    .connect(claimIssuerWallet)
    .revokeClaim(claim.id, claim.identity);

  log("Claim Revoked", revokeTx.hash);

  const isValidAfterRevoke = await claimIssuer.isClaimValid(
    claim.identity,
    claim.topic,
    claim.signature,
    claim.data,
  );

  log("IsValid", isValidAfterRevoke ? "✅" : "❌");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
