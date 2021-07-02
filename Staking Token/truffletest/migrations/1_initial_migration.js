const Crown = artifacts.require("CrownToken");
const Usdt = artifacts.require("USDT");

// const a = async function() {
//   const b = await web3.eth.getAccounts()
//   console.log(b);
// }


module.exports = async function (deployer) {
   //const accounts = await web3.eth.getAccounts();
  // const acc1 = accounts[1];
  deployer.deploy(Crown,"C2","C2",140000000,18);

  deployer.deploy(Usdt,30000000000,6);

};


// module.exports = function(deployer, network, accounts) {
//   // Use the accounts within your migrations.
// }
