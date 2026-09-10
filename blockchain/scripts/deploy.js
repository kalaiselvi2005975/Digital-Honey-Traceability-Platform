const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const HoneyTrace = await hre.ethers.getContractFactory("HoneyTrace");
  const contract = await HoneyTrace.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("HoneyTrace deployed to:", address);

  const deployment = {
    address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log("Deployment info saved to blockchain/deployment.json");

  const hardhatAccount0 =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const envPath = path.join(__dirname, "..", "..", "backend", ".env");
  const envBody = [
    "DEBUG=True",
    "SECRET_KEY=local-dev-secret-key-change-me",
    "ALLOWED_HOSTS=localhost,127.0.0.1",
    "FRONTEND_URL=http://localhost:5173",
    "CORS_ALLOWED_ORIGINS=http://localhost:5173",
    "BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545",
    "BLOCKCHAIN_NETWORK=hardhat",
    `HONEYTRACE_CONTRACT_ADDRESS=${address}`,
    `BLOCKCHAIN_PRIVATE_KEY=${hardhatAccount0}`,
    "",
  ].join("\n");
  fs.writeFileSync(envPath, envBody);
  console.log("Wrote backend/.env with contract address (local Hardhat key only).");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
