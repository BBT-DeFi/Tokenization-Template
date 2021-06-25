//require json file, mongo schema from other files
const {jsonInterface} = require("./jsonInterfaceStaking.js");
const {testAddress} = require("./database.js");

// set web3 provider for all later instances to use
const Web3 = require('web3');
var web3 = new Web3("https://rpc-testnet.bitkubchain.io");
const Contract = require('web3-eth-contract');
var Tx = require('ethereumjs-tx');
Contract.setProvider("https://rpc-testnet.bitkubchain.io");
var contract =new web3.eth.Contract(jsonInterfaceStaking, contractAddress);
// this also works too >> var contract =new Contract(jsonInterface, "0x8b6d333b732940301cc137c132df199835e6e451");


//variable for later uses.
var usdtContract = "0xb21F7043ECcA5F44031715CBcb2ead3ceC0d313f"; //usdt contract address
var contractAddress = "0x8999d5e99249E1a192eddb9359FE8BbD0E8aDB28"; //CWT staking contract
// put your metamask address below.
var address = "..."; 
var address2 = "...";
var address3 = "...";

//get balance function
function getBalance(address) {
    return new Promise(function(res, rej) {
      res(contract.methods.balanceOf(address).call());
    })
  }

//init getbalance function //uncomment to init.  
getBalance(address2)
    .then(function(result) {
      console.log("address balances of "+address2+" =",result); // "initResolve" 
      //bug, it log the global of address instead of function parameter
      return "getBalance function works";
    })
    .then(function(result) {
      console.log(result); // "normalReturn"
    });

//get decimals function
function getDecimal() {
  return new Promise(function(res, rej) {
      res(contract.methods.decimal().call()); //getdecimals() doesn't work. For CWT decimal() doesn't work
      //but decimal() does work
  })
  }

//init getdecimals function //uncomment to init.    
getDecimal()
  .then(function(result) {
      console.log("Token's Decimal = ", result); // "initResolve"
      return "ok, getDecimal function works";
  })
  .then(function(result) {
      console.log(result); // "normalReturn"
  });

//to find which methods is available in the solidity contract >>console.log(contract.methods);

//get supply function
function getSupply() {
    return new Promise(function(res, rej) {
      res(contract.methods.totalSupply().call());
    })
  }
  
//init getsupply function //uncomment to init.    
getSupply()
    .then(function(result) {
      console.log("total supply = ", result); // "initResolve"
      return "ok, getSupply function works";
    })
    .then(function(result) {
      console.log(result); // "normalReturn"
    });

//get name function
function getName() {
      return new Promise(function(res, rej) {
        res(contract.methods.name().call());
      })
    }

//init getname function //uncomment to init.        
getName()
      .then(function(result) {
        console.log("Token's name is ", result); // "initResolve"
        return "ok, getName function works";
      })
      .then(function(result) {
        console.log(result); // "normalReturn"
      });

//create stake function which user from API inputs fromAddress, _stake and privateKey parameters.
const createStake = async (fromAddress,_stake /*in ETH*/,privateKey) => {
  return new Promise (async (resolve,reject) => {
    
    // Who create an order
    var myAddress = fromAddress;

    //transferer's privatekey
    var privkey = privateKey

    // If your token is divisible to 18 decimal places, 1 = 0.000000000000000001 of your token
    var stakeAmount = _stake;

    //to add nonce that is newest
    var count = await web3.eth.getTransactionCount(myAddress);
    console.log(`num transactions so far: ${count}`);
    
    //to convert ETH from user's input to wei using string cause javascript can not accept overflow.
    var stringStake = stakeAmount.toString()
    var stakeWei = web3.utils.toWei(stringStake, 'ether');
    
    //change the gas price and limit according to your network. This case I use Bitkub testnet's value.
    var rawTransaction = {
      "from": myAddress, //who send this transaction
      "nonce": "0x" + count.toString(16), 
      "gasPrice": 0x00BA43B7400,//"0x004190AB00", change the gas price to 50000000000 wei works for BKC
      "gasLimit": 0x1C9C380,//"0x493E0", change the gas limit to 30000000 works for BKC.
      "to": contractAddress, //contract to be interacted with.
      "value": "0x0", //no ETH sent
      "data": contract.methods.createStake(stakeWei).encodeABI(),
      "chainId": 0x06545 //BKC testnet chain ID
  };

  // The private key must be for myAddress. This sign the transaction with privatekey.
  var privKey = new Buffer.from(privkey, 'hex');
  var tx = new Tx(rawTransaction);
  tx.sign(privKey);
  var serializedTx = tx.serialize();

  // Comment out these three lines if you don't really want to send the TX right now
  console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);//can't send this along with the receipt cause resolve can only return 1 variable
  var attemption = serializedTx.toString('hex');
  
  //print transaction ID.
  var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);

  //return var receipt to use as a variable when calling a function 
  resolve (/*"the receipt detail below \n"*/receipt) 
  reject("The transaction doesn't get through, please try again or adjust parameters")

  }
  )
}
//uncomment to initiate the function
//createStake(address,1, privateKey)

//overflow comes from the number is too large for JavaScript to handle. You can use a Big Number library or enter as a string.
//see https://docs.openzeppelin.com/learn/deploying-and-interacting#querying-state 
//https://docs.ethers.io/v5/api/utils/bignumber/#BigNumber--notes   for more detail for handling with big number.
//remember to input stake in ether unit

//remove stake function
const removeStake = async (fromAddress,_stake/*in ETH unit*/,privateKey) => {
  return new Promise (async (resolve,reject) => {
    
    // Who create an order
    var myAddress = fromAddress;

    //transferer's privatekey
    var privkey = privateKey

    // If your token is divisible to 18 decimal places, 1 = 0.000000000000000001 of your token
    var stakeAmount = _stake;

    //to add nonce that is newest
    var count = await web3.eth.getTransactionCount(myAddress);
    console.log(`num transactions so far: ${count}`);
    
    //to convert eth to wei because Javascript can't handle the big number
    var stringStake = stakeAmount.toString()
    var stakeWei = web3.utils.toWei(stringStake, 'ether');

    // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
    var rawTransaction = {
      "from": myAddress,
      "nonce": "0x" + count.toString(16),
      "gasPrice": 0x00BA43B7400,//"0x004190AB00", change the gas price to 50000000000 wei works
      "gasLimit": 0x1C9C380,//"0x493E0", change the gas limit to 30000000 works
      "to": contractAddress,
      "value": "0x0",
      "data": contract.methods.removeStake(stakeWei).encodeABI(),
      "chainId": 0x06545
  };

  // The private key must be for myAddress
  var privKey = new Buffer.from(privkey, 'hex');
  var tx = new Tx(rawTransaction);
  tx.sign(privKey);
  var serializedTx = tx.serialize();

  // Comment out these three lines if you don't really want to send the TX right now
  console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);//can't send this along with the receipt cause resolve can only return 1 variable
  var attemption = serializedTx.toString('hex');
  
  var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
  resolve (/*"the receipt detail below \n"*/receipt) //return var receipt to use as a variable when calling a function 
  reject("The transaction doesn't get through, please try again or adjust parameters")

  }
  )
}
//uncomment to initiate
//removeStake(address,1, privateKey)


//get the stake amount function
const stakeOf = async (fromAddress) => {
  return new Promise (async (resolve,reject) => {
  
  //calling stakeOf function from contract.  
  var staking = await contract.methods.stakeOf(fromAddress).call();
  console.log(`staking of ${fromAddress} : = ${staking}`);
  resolve (staking) //return var receipt to use as a variable when calling a function 
  //resolve can only return one variable
  reject("The transaction doesn't get through, please try again or adjust parameters")

  }
  )
}

//uncomment to initiate
stakeOf("0x768a9C2109D810CD460E65319e1209723b59650B")

//get the reward of the address function.
const rewardOf = async (fromAddress) => {
  return new Promise (async (resolve,reject) => {

  var rewardingOf = await contract.methods.rewardOf(fromAddress).call();
  console.log(`reward of the address ${fromAddress} : = ${rewardingOf}`);
  
  resolve (rewardingOf) //return var receipt to use as a variable when calling a function 
  //resolve can only return one variable
  reject("The transaction doesn't get through, please try again or adjust parameters")

  }
  )
}
//uncomment to initiate
rewardOf(address2)


//get balance of the usdt that user get from rewarding 
const balanceOfUSDT = async (fromAddress) => {
  return new Promise (async (resolve,reject) => {
  
  var balanceOfUSDT = await contract.methods.balanceOfUSDT(fromAddress).call();
  console.log(`reward of the address ${fromAddress} : = ${balanceOfUSDT}`);
  
  resolve (balanceOfUSDT) //return var receipt to use as a variable when calling a function 
  //resolve can only return one variable
  reject("The transaction doesn't get through, please try again or adjust parameters")

  }
  )
}
//uncomment to initiate
balanceOfUSDT("0x282331e3E075f633b203fB6c0E462ef0d6C21c8B")


//ditribute the reward by the admin function.
const distributeRewards = async (fromAddress,privateKey) => {
  return new Promise (async (resolve,reject) => {
    
    // Who create an order
    var myAddress = fromAddress;

    //transferer's privatekey
    var privkey = privateKey

    //to add nonce that is newest
    var count = await web3.eth.getTransactionCount(myAddress);
    console.log(`num transactions so far: ${count}`);
    
    // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
    var rawTransaction = {
      "from": myAddress,
      "nonce": "0x" + count.toString(16),
      "gasPrice": 0x00BA43B7400,//"0x004190AB00", change the gas price to 50000000000 wei works
      "gasLimit": 0x1C9C380,//"0x493E0", change the gas limit to 30000000 works
      "to": contractAddress,
      "value": "0x0",
      "data": contract.methods.distributeRewards(usdtContract).encodeABI(),
      "chainId": 0x06545
  };

  // The private key must be for myAddress
  var privKey = new Buffer.from(privkey, 'hex');
  var tx = new Tx(rawTransaction);
  tx.sign(privKey);
  var serializedTx = tx.serialize();

  // Comment out these three lines if you don't really want to send the TX right now
  console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);//can't send this along with the receipt cause resolve can only return 1 variable
  var attemption = serializedTx.toString('hex');
  
  var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
  resolve (/*"the receipt detail below \n"*/receipt) //return var receipt to use as a variable when calling a function 
  reject("The transaction doesn't get through, please try again or adjust parameters")

  }
  )
}
//uncomment to initiate
distributeRewards("0x768a9C2109D810CD460E65319e1209723b59650B", "ca0c18f3cb01d03c303adc970483250310c5eebbfc44c4f2771f129e909f3a20")


//input the token price both USDT and Crown from Admin.
const priceInput = async (fromAddress,privateKey, _usdtPrice, _crownPrice) => {
  return new Promise (async (resolve,reject) => {
    
    // Who create an order
    var myAddress = fromAddress;

    //transferer's privatekey
    var privkey = privateKey;

    //usdt price
    var usdtPrice = _usdtPrice*100; //require admin to input the two decimals only from the api. 
    //for example 30.15

    //crown price
    var crownPrice = _crownPrice*100; //require admin to input the two decimals only from the api. 30.15

    //to add nonce that is newest
    var count = await web3.eth.getTransactionCount(myAddress);
    console.log(`num transactions so far: ${count}`);
    
    // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
    var rawTransaction = {
      "from": myAddress,
      "nonce": "0x" + count.toString(16),
      "gasPrice": 0x00BA43B7400,//"0x004190AB00", change the gas price to 50000000000 wei works
      "gasLimit": 0x1C9C380,//"0x493E0", change the gas limit to 30000000 works
      "to": contractAddress,
      "value": "0x0",
      "data": contract.methods.priceInput(usdtPrice,crownPrice).encodeABI(),
      "chainId": 0x06545
  };

  // The private key must be for myAddress
  var privKey = new Buffer.from(privkey, 'hex');
  var tx = new Tx(rawTransaction);
  tx.sign(privKey);
  var serializedTx = tx.serialize();

  // Comment out these three lines if you don't really want to send the TX right now
  console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);//can't send this along with the receipt cause resolve can only return 1 variable
  var attemption = serializedTx.toString('hex');
  
  var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
  resolve (/*"the receipt detail below \n"*/receipt) //return var receipt to use as a variable when calling a function 
  reject("The transaction doesn't get through, please try again or adjust parameters")

  }
  )
}
//uncomment to init.
//priceInput(fromAddress,privateKey, _usdtPrice, _crownPrice) 

//transfer Crown token function.
const transferToken = async (fromAddress, toAddress, amount/*in ETH*/, privateKey/*, gaslimit*/) => {
    return new Promise (async (resolve,reject) =>{
    
    // Who holds the token now?
    var myAddress = fromAddress;

    //transferer's privatekey
    var privkey = privateKey
  
    // Who are we trying to send this token to?
    var destAddress = toAddress;
  
    // If your token is divisible to 8 decimal places, 42 = 0.00000042 of your token
    var transferAmount = amount;
  
    //determine gas limit 
    //var gasLimit = gaslimit; need to convert to hex first

    // Determine the nonce
    var count = await web3.eth.getTransactionCount(myAddress);
    console.log(`num transactions so far: ${count}`);
  
    // This file is just JSON stolen from the contract page on etherscan.io under "Contract ABI"
    //var abiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, './tt3.json'), 'utf-8'));
  
    //to convert eth to wei because Javascript can't handle the big number
    var stringAmount = transferAmount.toString()
    var transferWei = web3.utils.toWei(stringAmount, 'ether');

    // How many tokens do I have before sending?
    //var balance = await contract.methods.balanceOf(myAddress).call();
    //console.log(`Balance before send: ${balance}`);
  
    // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
    var rawTransaction = {
        "from": myAddress,
        "nonce": "0x" + count.toString(16),
        "gasPrice": 0x00BA43B7400,//"0x004190AB00", change the gas price to 50000000000 wei works
        "gasLimit": 0x1C9C380,//"0x493E0", change the gas limit to 30000000 works
        "to": contractAddress,
        "value": "0x0",
        "data": contract.methods.transfer(destAddress, transferWei).encodeABI(),
        "chainId": 0x06545
    };
  
    // The private key must be for myAddress
    var privKey = new Buffer.from(privkey, 'hex');
    var tx = new Tx(rawTransaction);
    tx.sign(privKey);
    var serializedTx = tx.serialize();
  
    // Comment out these three lines if you don't really want to send the TX right now
    console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);//can't send this along with the receipt cause resolve can only return 1 variable
    var attemption = serializedTx.toString('hex');
    
    var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    //console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
    resolve (/*"the receipt detail below \n"*/receipt) //return var receipt to use as a variable when calling a function 
    reject("The transaction doesn't get through, please try again or adjust parameters")
    //console.log(typeof receipt)

    // The balance may not be updated yet, but let's check
    balance = await contract.methods.balanceOf(myAddress).call();
    console.log(`Balance after send: ${balance}`);
    
    })
    
  }
//comment this out to not initiate function  
//transferToken(fromAddress,toAddress,2,privateKey);


//Batch transfer function
const batchTransfer = async (fromAddress, toAddressList, amountList /*in ETH unit*/, privateKey/*, gaslimit*/) => {
  return new Promise (async (resolve,reject) =>{
  
  //the old code is below
  // Who holds the token now?
  var myAddress = fromAddress;

  //transferer's privatekey
  var privkey = privateKey

  // Who are we trying to send this token to?
  var destAddress = toAddressList;

  // If your token is divisible to 8 decimal places, 42 = 0.00000042 of your token
  var transferAmount = amountList;

  //determine gas limit 
  //var gasLimit = gaslimit; need to convert to hex first

  //to convert eth to wei and we need to change every index in the array to wei
  for (let i = 0; i < transferAmount.length; i++) {
    var stringAmount = transferAmount[i].toString();
    var transferWei = web3.utils.toWei(stringAmount, 'ether');
    transferAmount[i] = transferWei ; 
  }
  //so now we get the array containing wei unit of Crown.

  // Determine the nonce
  var count = await web3.eth.getTransactionCount(myAddress);
  console.log(`num transactions so far: ${count}`);
  
  // How many tokens do I have before sending?
  //var balance = await contract.methods.balanceOf(myAddress).call();
  //console.log(`Balance before send: ${balance}`);

  // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
  var rawTransaction = {
      "from": myAddress,
      "nonce": "0x" + count.toString(16),
      "gasPrice": 0x00BA43B7400,//"0x004190AB00",
      "gasLimit": 0x1C9C380,//"0x493E0",
      "to": contractAddress,
      "value": "0x0",
      "data": contract.methods.multiTransfer(destAddress, transferAmount).encodeABI(),
      "chainId": 0x06545
  };

  // The private key must be for myAddress
  var privKey = new Buffer.from(privkey, 'hex');
  var tx = new Tx(rawTransaction);
  tx.sign(privKey);
  var serializedTx = tx.serialize();

  // attempting to signed the TX.
  console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);//can't send this along with the receipt cause resolve can only return 1 variable
  var attemption = serializedTx.toString('hex');
  
  //send signed tx.
  var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
  resolve (/*"the receipt detail below \n"*/receipt) //return var receipt to use as a variable when calling a function 
  reject("The transaction doesn't get through, please try again or adjust parameters")
  //note that receipt is an object. may be in the form of Json.

  // The balance may not be updated yet, but let's check
  balance = await contract.methods.balanceOf(myAddress).call();
  console.log(`Balance after send: ${balance}`);
  
  })
  
}
//comment this out to not initiate function  
//batchTransfer(fromAddress,[address,address3],[50000,20000],privateKey);


//create account function. Result >> address and private key.
createAccount = async (passphase) => {
  return new Promise(async (resolve, reject) => {
      try {
          const account = await web3.eth.accounts.create(passphase)
          resolve(account)
      } catch (error) {
          reject(new Error(error))
      }      
  });
}

//encryptPriv. input privatekey >> output Json object.
encryptPriv = async (plainPriv, password) => {
  return new Promise(async (resolve, reject) => {
      const encryptedJson = await web3.eth.accounts.encrypt(plainPriv, password)
      resolve(encryptedJson)
  });
}

//hashPassword function
hashPassword = async (password) => {
  return new Promise(async (resolve, reject) => {
      const hashedPass = await web3.eth.accounts.hashMessage(password);
      resolve(hashedPass)
  });
}

//decryptAccount function. Input encryptPriv Json >> output {address, privatekey}
decryptAccount = async (enPriKey,password )=> {
  return new Promise(async (resolve,reject) =>{
      const decryptedPass = await web3.eth.accounts.decrypt(enPriKey, password)
      resolve(decryptedPass)
  });
}

//add generated account to mongo function using testAddress schema.
addAccountToMongo = async(newAddress,enPriKey,encryptedPass) => {
  return new Promise (async (resolve,reject) =>{
  var Address1 = await new testAddress({
    address: newAddress["address"],
    //priKey : newAddress["privateKey"], //can not name the propertie as privateKey, don't know why
    encryptedPrivateKey : enPriKey,
    password : encryptedPass
  })
  Address1.save()
  .then(doc => {
    console.log(doc)
  })
  .catch(err => {
    console.error(err)
  });
});
}

//Find Accounts in mongo function. You can put more parameter to scope the findings.
findAccounts = async(address) => {
  var findAccount = []; //
  return new Promise (async (resolve,reject) =>{
  await testAddress
  .find({
    address : address
    //privatekey : "0x234hfs34jokih4njknfsdd3" ,  // search query
    //password : ""
  })
  .then(doc => {
    findAccount = doc
    //resolve (findAccount)
    //console.log("found an address >> ", findAccount)
  })
  .catch(err => {
    console.error(err)
  })
  //console.log(findAccount)
  resolve (findAccount)
});
}
//*/
//console.log(findAccounts("0x1E0bee715DEf8f2A52A2f66f92EbBF27CAC20454"))

//find private key
findPri = async(address) => {
  var findPris = []; //
  return new Promise (async (resolve,reject) =>{
  await testAddress
  .find({
    address : address
    //encryptedPrivateKey : "0x234hfs34jokih4njknfsdd3" ,  // search query
    //password : ""
  })
  .then(doc => {
    findPris = doc
    console.log("found an privatekey >> ", findPris)
  })
  .catch(err => {
    console.error(err)
  })
  //console.log(findAccount)
  resolve (findPris)
});
}

//count the account amount containing in the mongo.
countAcc= async() => {
  return new Promise (async (resolve,reject) =>{
  var count = await testAddress.countDocuments({})
  
  resolve (count)
  var num = count 
  //console.log(num) >>undefined
});
}

//aggregate all the function to be initiated in one place if you want to. But I don't.
( async function () {

  //const found = await findAccounts("0x157FdF7344863F58B9211F514322bC4BcBC9f4a6");
  //console.log(found);
  //const foundPri = await findPri("0x157FdF7344863F58B9211F514322bC4BcBC9f4a6");
})()

//export the function here to be used in other files.
module.exports = {countAcc,findAccounts,
  addAccountToMongo,decryptAccount,hashPassword,encryptPriv,createAccount,
transferToken,batchTransfer,getBalance,getDecimal,getName,getSupply,createStake,removeStake, distributeRewards,rewardOf, stakeOf, priceInput}
