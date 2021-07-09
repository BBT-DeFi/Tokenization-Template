require("@nomiclabs/hardhat-waffle");
require("./tasks/task")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.3"
      },
      {
        version: "0.6.7",
        settings: { } 
      }
    ]
  },
  paths: {
    artifacts: './frontend-dapp1/src/artifacts',
  },
  networks: {
    hardhat: {},
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/AhUOkdFOBsLukGXJYh615sShJaoj2ekm",
      accounts: [`0x6dd8da24d55c8774a642413b94c27380d6bcc6f382ded0068ea27ee93dd20bb6`]
    }
  }
};
