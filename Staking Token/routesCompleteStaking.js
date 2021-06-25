//set all the instances.
const Web3 = require('web3');
var web3 = new Web3("https://rpc-testnet.bitkubchain.io");
const express = require('express')
const app = express()
const port = 3005
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
app.use(bodyParser.json()); //to get the request param to the api
app.use(bodyParser.urlencoded({ extended: true }));

//import module from other files.
const {testAddress} = require("./database.js");
const {countAcc,findAccounts,addAccountToMongo,decryptAccount,hashPassword,encryptPriv,createAccount,
  transferToken,batchTransfer,getBalance,getDecimal,getName,getSupply,createStake,removeStake, 
  distributeRewards,rewardOf, stakeOf, priceInput} = require("./web3FunctionStaking.js")
//bug "batchTransfer is not a function" comes when you didn't module.exports = {batchTransfer}


///*  log the port listening.
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
//*/
///*


///* get address detail (encrypted version)
app.get("/gets/accounts/encrypted", async (req, res) => {
	
	// from request API
	var address =  req.body.address; 

	//var password = req.body.password;

	//call findAccounts function.
	var foundAd = await findAccounts(address);	
	
	console.log("API call : addresss here" , foundAd)
	res.send(foundAd)
})

///*
// get the account's privatekey (decrypted version)
app.get("/gets/privateKey/decrypted", async (req, res) => {
	
	var address =  req.body.address; 

	var password = req.body.password;

	//get the Json object from the mongo but it returns in array containing Json.
	var foundAd = await findAccounts(address); 
	
	//In order to decrypt the private key, we need to convert the array to json first cause it can only encrypt json. else will return error.
	var encryptedAcc = foundAd[0]  //Json type of foundAd.
	
	//get the the encrypted private key as a result, then we pass it to the decrypt account function.
	var enPriKey = encryptedAcc.encryptedPrivateKey; 
	var decryptedAccount = await decryptAccount(enPriKey,password); //Promise { <pending> } comes from async await because it doesn't have the value yet

	//log the found account and the decrypted privatekey.
	console.log("API call : addresss here" , foundAd)
	console.log("API call : privatekey here",decryptedAccount);

	//return the decryptedAccount variable to user API.
	res.send(decryptedAccount)
})

//get address balances
app.get("/gets/balances/address", async (req, res) => {
	
	var address =  req.body.address; 

	var balances = await getBalance(address)
	
	console.log("API call : addresss' balance = " , balances)
	res.send(balances)
})

//get token's name
app.get("/gets/token/name", async (req, res) => {
	
	var tokenName = await getName()

	console.log("API call : Token's name = " , tokenName)
	res.send(tokenName) //
})

//get token's supply 
app.get("/gets/token/supply", async (req, res) => {
	
	var tokenSupply = await getSupply()

	console.log("API call : Token's supply = " , tokenSupply)

	res.send(tokenSupply) //
})

//get decimal 
app.get("/gets/token/decimal", async (req, res) => {
	var decimal = await getDecimal()

	console.log("API call : Token's decimal = " , decimal)

	res.send(decimal) //
})

///* create the new user and also add it to mongo.
app.post("/posts/newUser", async (req, res) => {
	
	var password =  req.body.password; //what if user forget password? He's done.

	//create account with password
	var account =  await createAccount(password) ;

	//get the total number of user to assign the user ID.
	var num = await countAcc();
	var newNum = num +1;

	//encrypt private key and password before sending to mongo.
	var encryptedJson = await encryptPriv(account.privateKey, password);
	var hashedPass = await hashPassword(password);

	//collect to mongo.
	var post = new testAddress({
		//userName : req.body.userName, //will implement later for user to choose their own usernames.
		userID : newNum,  //a bug is that it should retreive the maximum user ID not counting the amount in case some ID was deleted 
		address: account.address,
		encryptedPrivateKey :  encryptedJson,
		hashedPassword: hashedPass //password//hashedPass,
	})
	
	await post.save()
	console.log("API call : ", post);

	//response to user API with multiple lines.
	res.write("the address detail below \n "+post.toString()+ "\n" ); 
	res.write("the userID = " +newNum.toString());
	res.end();
	
})

//*/ send transfer by API.
app.post("/posts/transfer", async (req, res) => {
	//let receipt; //declare here doesn't help to get the promise resolved variable, but changing the async func to return proper resolve does.
	var fromAddress =  req.body.fromAddress; 
	var toAddress = req.body.toAddress;
	var amount = req.body.amount;
	var privateKey = req.body.privateKey;
	//var prebalance = getBalance(fromAddress); //need to write new promise to get the balances after the transferToken is done
	var transferring = await transferToken(fromAddress, toAddress, amount, privateKey) //take s out of transferToken
	// transferToken(fromAddress, toAddress, amount, privateKey).then(() => {
	// 	var mida = bida + 1;
	// 	console.log (mida);
	// })
	console.log("API call : transfer detail >>",  transferring);
	//res.write("\nsee transaction detail below\n")
	res.send(await transferring) //res.write(await transferring) doesn't work but res.send does.
	//res.write("\nsee sender's current balance below\n") 
	//res.write(await prebalance) // 
	//res.end();
})

//batch transfer
//example >> batchTransfer(fromAddress,[address,address3],[5,2],privateKey);
app.post("/posts/batchTransfer", async (req, res) => {
	
	//get param from request.
	var fromAddress =  req.body.fromAddress; 
	var toAddress = req.body.toAddress;
	var amount = req.body.amount;
	var privateKey = req.body.privateKey;

	//var prebalance = getBalance(fromAddress); //need to write new promise to get the balances after the transferToken is done
	var transferring = await batchTransfer(fromAddress, toAddress, amount, privateKey) //take s out of transferToken
	// transferToken(fromAddress, toAddress, amount, privateKey).then(() => {

	console.log("API call : batchTransfer detail >>",  transferring);

	res.send(await transferring) //res.write(await transferring) doesn't work but res.send does.
	//res.write("\nsee sender's current balance below\n") 
	//res.write(await prebalance) 
	//res.end();
})


//------------------------------------------------------------------------


//*******  STAKING API BELOW  *********

//GET THE staking amount
app.get("/gets/stakeOf/address", async (req, res) => {
	
	var address =  req.body.address; 

	var staking = await stakeOf(address)
	
	console.log("API call : addresss' stakes = " , staking)
	res.send(staking)
})

//get the reward of address.
app.get("/gets/rewardOf/address", async (req, res) => {
	
	var address =  req.body.address; 

	var rewarding = await rewardOf(address)
	
	console.log("API call : addresss' rewards = " , rewarding)
	res.send(rewarding)
})

//create staking from API
app.post("/posts/createStake", async (req, res) => {
	
	var fromAddress =  req.body.fromAddress; 
	var _stake = req.body.stake;
	var privateKey = req.body.privateKey;

	//staking function.
	var staking = await createStake(fromAddress, _stake, privateKey) 
	
	console.log("API call : staking detail >>",  staking);

	res.send(await staking) //res.write(await transferring) doesn't work but res.send does.

})

//remove stake func
app.post("/posts/removeStake", async (req, res) => {
	
	var fromAddress =  req.body.fromAddress; 
	var _stake = req.body.stake;
	var privateKey = req.body.privateKey;

	// Unstaking function.
	var staking = await removeStake(fromAddress, _stake, privateKey)
	
	console.log("API call : Unstaking detail >>",  staking);

	res.send(await staking) //res.write(await transferring) doesn't work but res.send does.

})

//price input from api
app.post("/posts/priceInput", async (req, res) => {
	
	var fromAddress =  req.body.fromAddress; 
	var privateKey = req.body.privateKey;
	var _usdtPrice = req.body.usdtPrice;
	var _crownPrice = req.body.crownPrice;


	//input price function.
	var inputPrice = await priceInput(fromAddress, privateKey,_usdtPrice,_crownPrice ) 
	
	console.log("API call : price input detail >>",  inputPrice);

	res.send(await inputPrice) //res.write(await transferring) doesn't work but res.send does.

})

//distribute reward func
app.post("/posts/distributeRewards", async (req, res) => {
	
	var fromsAddress =  req.body.fromAddress; 
	var privateKey = req.body.privateKey;

	//distribute function.
	var distribute = await distributeRewards(fromAddress, privateKey) 
	
	console.log("API call : distributeRewards detail >>",  distribute);

	res.send(await distribute) //res.write(await transferring) doesn't work but res.send does.

})

