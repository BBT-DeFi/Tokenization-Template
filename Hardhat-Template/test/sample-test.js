const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi } = require("../frontend-dapp1/src/artifacts/contracts/Token.sol/Token.json") 

describe("Greeter", function() {
  it("Should return the new greeting once it's changed", async function() {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    
    await greeter.deployed();
    expect(await greeter.greet()).to.equal("Hello, world!");

    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

describe("Token Supply", function() {
  it("Should return the total supply is equal 1000 MON", async function() {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("MON Token", "MON", 1000);
    
    await token.deployed();
    const totalSupply = await token.totalSupply() / (10**18)
    expect(totalSupply).to.equal(1000);
  });
});

describe("Transfer Token", function() {
  it("Transfer MON token to another address", async function() {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("MON Token", "MON", 1000)

    await token.deployed();
    const senderWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    const recieverWallet = "0x57054419a0d667C74c3404F52119344ec018021A"
    expect(senderWallet).to.be.properAddress;
    expect(recieverWallet).to.be.properAddress;
    
    })
})