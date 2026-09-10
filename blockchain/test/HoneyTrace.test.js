const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoneyTrace", function () {
  it("records and verifies events", async function () {
    const HoneyTrace = await ethers.getContractFactory("HoneyTrace");
    const contract = await HoneyTrace.deploy();
    await contract.waitForDeployment();

    const hash = ethers.id("test-event-hash");
    await contract.recordEvent("HN001", "HARVEST_RECORDED", hash);

    const verified = await contract.verifyRecord("HN001", "HARVEST_RECORDED", hash);
    expect(verified).to.equal(true);

    const [storedHash] = await contract.getRecord("HN001", "HARVEST_RECORDED");
    expect(storedHash).to.equal(hash);
  });

  it("prevents duplicate events", async function () {
    const HoneyTrace = await ethers.getContractFactory("HoneyTrace");
    const contract = await HoneyTrace.deploy();
    await contract.waitForDeployment();

    const hash = ethers.id("duplicate-test");
    await contract.recordEvent("HN001", "BATCH_CREATED", hash);

    await expect(
      contract.recordEvent("HN001", "BATCH_CREATED", hash)
    ).to.be.revertedWith("Event already recorded");
  });
});
