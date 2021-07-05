const Crown = artifacts.require("CrownToken");
const Usdt  = artifacts.require("USDT");
var instance; 
var instance2;
var balance1;
var balance2;
var reward1;
var reward2;
var usdtBalance1;
var usdtBalance2;
var crownPrice;
var stableCoinPrice;
var staAddress;
var decimalStableCoins;
var RewardToStableCoinMicroether1;
var RewardToStableCoinMicroether2;

async function getAllBalance (address1, address2, address3, address4) {
  balance1 = await instance.balanceOf.call(address1);
  balance2 = await instance.balanceOf.call(address2);
  balance3 = await instance.balanceOf.call(address3);
  balance4 = await instance.balanceOf.call(address4);
  staking1 = await instance.stakeOf(address1)
  staking2 = await instance.stakeOf(address2)
  staking3 = await instance.stakeOf(address3)
  staking4 = await instance.stakeOf(address4)
  reward1 = await instance.rewardOf(address1)
  reward2 = await instance.rewardOf(address2)
  reward3 = await instance.rewardOf(address3)
  reward4 = await instance.rewardOf(address4)
  usdtBalance1 = await instance2.balanceOf(address1)
  usdtBalance2 = await instance2.balanceOf(address2);
  usdtBalance3 = await instance2.balanceOf(address3)
  usdtBalance4 = await instance2.balanceOf(address4);
  console.log('balance1 = ',balance1,'balance2 = ',balance2,'usdt1 = ',usdtBalance1,'usdt2 = ',usdtBalance2);
}
async function sleep(ms){
  return new Promise((resolve) => setTimeout(resolve,ms));
}


//every time you call contract, all it() inside the contract will derive the previos state of the contract synchronously (from up to below)
//so you don't have to new() the contract everytime. 
contract("Crown Token", accounts => {
    it("Should return the correct balanceOf accounts0, 1 and 2", async function() {
        instance = await Crown.deployed()
        let balance = await instance.balanceOf.call(accounts[0]);
        let balance1 = await instance.balanceOf.call(accounts[1]);
        let balance2 = await instance.balanceOf.call(accounts[2]);
        //console.log(balance.toNumber());
        //const balance = await instance.balanceOf(accounts[0]);
        //console.log(await instance.balanceOf(accounts[1]));
        //assert.equal(instance.balanceOf(accounts[1]), 0);
        
        //convert from eth to wei
        var Amount = 140000000; //140Meth is with accounts[0] at the beginning
        var stringStake = Amount.toString()
        var stakeWei = web3.utils.toWei(stringStake, 'ether');
        assert.equal(balance.valueOf(), stakeWei);
        assert.equal(balance1.valueOf(), 0);
        assert.equal(balance2.valueOf(), 0);
        //console.log("instance add",instance.address);
        // await crown.setGreeting("Hola, mundo!");
    
        // assert.equal(await greeter.greet(), "Hola, mundo!");
    });
    //console.log(crown);

    it("should transfer the coin to account1 and 2", async () => {
        
        //instantiate the contract to be used 
        instance = await Crown.deployed();

        //convert from eth to wei
        var stakeAmount = 100;
        var stringStake = stakeAmount.toString()
        var stakeWei = web3.utils.toWei(stringStake, 'ether');

        //transfer from accounts[0] to accounts[1] and accounts[2]
        await instance.transfer(accounts[1],stakeWei)
        await instance.transfer(accounts[2],stakeWei)

        //const balance1 = await instance.balanceOf.call(accounts[1]);
        //const balance2 = await instance.balanceOf.call(accounts[2]);
        
        //await instance.transfer(accounts[0],stakeWei,{from:accounts[1]})//.send({from:accounts[1]})
        
        //test balances
        const balance2 = await instance.balanceOf.call(accounts[2]);
        const balance1 = await instance.balanceOf.call(accounts[1]);
        assert.equal(balance1.valueOf(), stakeWei);
        assert.equal(balance2.valueOf(), stakeWei);
      });
    
    it("crown address should have usdt balances afrer transfering", async () => {
      
      //instantiate the contract to be used 
      instance = await Crown.deployed();
      instance2 = await Usdt.deployed();

      //convert from eth to Mwei
      var stakeAmount = 100;
      var stringStake = stakeAmount.toString()
      var stakeMWei = web3.utils.toWei(stringStake, 'Mwei');//Mwei = 10^6 wei

      //transfer Usdt from account0 to CrownContract address
      await instance2.transfer(instance.address,stakeMWei)
      //await instance.transfer(accounts[2],stakeWei)

      //const balance1 = await instance.balanceOf.call(accounts[1]);
      //const balance2 = await instance.balanceOf.call(accounts[2]);
      
      //await instance.transfer(accounts[0],stakeWei,{from:accounts[1]})//.send({from:accounts[1]})
      //test balances
      //const balance2 = await instance.balanceOf.call(accounts[2]);
      //const balance1 = await instance.balanceOf.call(accounts[1]);
      const crownUsdtBalanc = await instance2.balanceOf.call(instance.address)
      assert.equal(crownUsdtBalanc.valueOf(), stakeMWei);
      //assert.equal(balance2.valueOf(), stakeWei);
    });
      
    
    it("user can't stake or remove stake outside staking period", async () => {
      
      //instantiate the contract to be used 
      instance = await Crown.deployed();
      instance2 = await Usdt.deployed();

      //convert from eth to wei
      var stakeAmount = 100;
      var stringStake = stakeAmount.toString()
      var stakeWei = web3.utils.toWei(stringStake, 'ether');

      //const balance1 = await instance.balanceOf.call(accounts[1]);
      //const balance2 = await instance.balanceOf.call(accounts[2]);
      
      //here you can specify who send the transaction by {from: addressxxx}
      //assert.throws(await instance.createStake(stakeWei,{from:accounts[1]}), Error, "boo")
      await instance.createStake(stakeWei,{from:accounts[1]});
      
      //await instance.removeStake(stakeWei,{from:accounts[1]});

      //test balances
      //const balance2 = await instance.balanceOf.call(accounts[2]);
      //const balance1 = await instance.balanceOf.call(accounts[1]);
      //const staking = await instance2.stakeOf(accounts[1])
      //const balances
      //assert.equal(staking.valueOf(), 0);
      //assert.equal(balance2.valueOf(), stakeWei);
    });

    it("user have correct balances and stake after staking when the staking period was added by admin", async () => {
    
      //instantiate the contract to be used 
      instance = await Crown.deployed();
      instance2 = await Usdt.deployed();

      //convert from eth to wei
      var stakeAmount = 100;
      var stringStake = stakeAmount.toString()
      var stakeWei = web3.utils.toWei(stringStake, 'ether');

      //admin enable stake period
      await instance.addStakingPeriod(3)

      //admin add price input. (stable price, crownprice)
      crownPrice = 1.00;
      stableCoinPrice = 1.00;
      await instance.priceInput(crownPrice*100,stableCoinPrice*100);
      
      //user createStake 
      await instance.createStake(stakeWei,{from:accounts[1]})//.send({from:accounts[1]})
      await instance.createStake(stakeWei,{from:accounts[2]})
      
      //test balances
      const balance1 = await instance.balanceOf.call(accounts[1]);
      const balance2 = await instance.balanceOf.call(accounts[2]);
      const staking1 = await instance.stakeOf(accounts[1])
      const staking2 = await instance.stakeOf(accounts[2])
      //
      assert.equal(balance1.valueOf(), 0);
      assert.equal(balance2.valueOf(), 0);
      assert.equal(staking1.valueOf(), stakeWei);
      assert.equal(staking2.valueOf(), stakeWei);

    });
    
    it("user can removestake outside removal date but don't get the usdt yet, but still have reward", async () =>  {
      
      
      //instantiate the contract to be used 
      instance = await Crown.deployed();
      instance2 = await Usdt.deployed();
      
      await sleep(2500) //credit by win. thanks bro.
      //setTimeout(3000);
      //convert from eth to wei
      var stakeAmount = 100;
      var stringStake = stakeAmount.toString()
      var stakeWei = web3.utils.toWei(stringStake, 'ether');
    
      //test balances before remove the stake.
      var balance1 = await instance.balanceOf.call(accounts[1]);
      var balance2 = await instance.balanceOf.call(accounts[2]);
      var staking1 = await instance.stakeOf(accounts[1])
      var staking2 = await instance.stakeOf(accounts[2])
      var reward1 = await instance.rewardOf(accounts[1])
      var reward2 = await instance.rewardOf(accounts[2])
      var usdtBalance1 = await instance2.balanceOf(accounts[1])
      var usdtBalance2 = await instance2.balanceOf(accounts[2])
      //test
      assert.equal(balance1.valueOf(), 0);
      assert.equal(balance2.valueOf(), 0);
      assert.equal(staking1.valueOf(), stakeWei);
      assert.equal(staking2.valueOf(), stakeWei);
      assert.equal(reward1.valueOf(), 0) //cause admin didn't set the dividend yet.
      assert.equal(reward2.valueOf(), 0)
      assert.equal(usdtBalance1.valueOf(), 0) //haven't distribute dividend yet.
      assert.equal(usdtBalance2.valueOf(), 0)

      //admin add dividend ratio.
      await instance.inputDividend(1000)
      //test variable.
      var balance1 = await instance.balanceOf.call(accounts[1]);
      var balance2 = await instance.balanceOf.call(accounts[2]);
      var staking1 = await instance.stakeOf(accounts[1])
      var staking2 = await instance.stakeOf(accounts[2])
      var reward1 = await instance.rewardOf(accounts[1])
      var reward2 = await instance.rewardOf(accounts[2])
      var usdtBalance1 = await instance2.balanceOf(accounts[1])
      var usdtBalance2 = await instance2.balanceOf(accounts[2])
      //test
      assert.equal(balance1.valueOf(), 0);
      assert.equal(balance2.valueOf(), 0);
      assert.equal(staking1.valueOf(), stakeWei);
      assert.equal(staking2.valueOf(), stakeWei);
      assert.equal(reward1.valueOf(), stakeWei/10)
      assert.equal(reward2.valueOf(), stakeWei/10)
      assert.equal(usdtBalance1.valueOf(), 0)
      assert.equal(usdtBalance2.valueOf(), 0)


      //user removestake  
      await instance.removeStake(stakeWei,{from:accounts[1]}) //send({from:accounts[1]})
      await instance.removeStake(stakeWei,{from:accounts[2]})
      //test variable.
      var balance1 = await instance.balanceOf.call(accounts[1]);
      var balance2 = await instance.balanceOf.call(accounts[2]);
      var staking1 = await instance.stakeOf(accounts[1])
      var staking2 = await instance.stakeOf(accounts[2])
      var reward1_ = await instance.rewardOf(accounts[1])
      var reward2_ = await instance.rewardOf(accounts[2])
      var usdtBalance1 = await instance2.balanceOf(accounts[1])
      var usdtBalance2 = await instance2.balanceOf(accounts[2])
      //test
      assert.equal(balance1.valueOf(), stakeWei);
      assert.equal(balance2.valueOf(), stakeWei);
      assert.equal(staking1.valueOf(), 0);
      assert.equal(staking2.valueOf(), 0);
      assert.equal(reward1_.valueOf(), stakeWei/10)
      assert.equal(reward2_.valueOf(), stakeWei/10)
      
    });

    it("after admin distribute reward user has correct cwt, and usdt reward", async () => {

      //admin set the usdt's contract address.
      await instance.setStableCoin(instance2.address);
      staAddress = await instance.StaAddress.call();
      assert.equal(staAddress, instance2.address);
      decimalStableCoins = await instance.staDeci.call();

      //admin distribute reward
      await instance.distributeRewards()
      //test variable.
      var balance1 = await instance.balanceOf.call(accounts[1]);
      var balance2 = await instance.balanceOf.call(accounts[2]);
      var staking1 = await instance.stakeOf(accounts[1])
      var staking2 = await instance.stakeOf(accounts[2])
      var reward1 = await instance.rewardOf(accounts[1])
      var reward2 = await instance.rewardOf(accounts[2])
      var usdtBalance1 = await instance2.balanceOf(accounts[1])
      var usdtBalance2 = await instance2.balanceOf(accounts[2])
      //test
      var Amount = 100;
      var stringAmount = Amount.toString();
      var amountMWei = web3.utils.toWei(stringAmount, 'Mwei'); //Mwei = mwei = 10^6 wei
      var RewardToStableCoinMicroether1 = (((reward1_ * crownPrice * stableCoinPrice) / 1) * (10**decimalStableCoins)) / (10**18)
      var RewardToStableCoinMicroether2 = (((reward2_ * crownPrice * stableCoinPrice) / 1) * (10**decimalStableCoins)) / (10**18)
      assert.equal(balance1.valueOf(), stakeWei);
      assert.equal(balance2.valueOf(), stakeWei);
      assert.equal(staking1.valueOf(), 0);
      assert.equal(staking2.valueOf(), 0);
      assert.equal(reward1.valueOf(), 0)
      assert.equal(reward2.valueOf(), 0)
      assert.equal(usdtBalance1.valueOf(), RewardToStableCoinMicroether1) //***beware, this only works when the Crownreward = usdtReward in ether unit.
      assert.equal(usdtBalance2.valueOf(), RewardToStableCoinMicroether2)
      
    });

    it("after user withdrawReward, user has correct cwt, and usdt reward", async () => {
      //***withdraw reward*** 
      await instance.addStakingPeriod(2)
      //convert from eth to wei
      var stakeAmount = 100;
      var stringStake = stakeAmount.toString()
      var stakeWei = web3.utils.toWei(stringStake, 'ether');
      
      await instance.createStake(stakeWei,{from:accounts[1]});
      await instance.createStake(stakeWei,{from:accounts[2]});

      await sleep(2500)
  
      await instance.inputDividend(1000); 
      await instance.removeStake(stakeWei,{from:accounts[1]}) //send({from:accounts[1]})
      await instance.removeStake(stakeWei,{from:accounts[2]})

      await instance.withdrawReward({from:accounts[1]});
      await instance.withdrawReward({from:accounts[2]});
      //test 
      balance1 = await instance.balanceOf.call(accounts[1]);
      balance2 = await instance.balanceOf.call(accounts[2]);
      staking1 = await instance.stakeOf(accounts[1])
      staking2 = await instance.stakeOf(accounts[2])
      reward1 = await instance.rewardOf(accounts[1])
      reward2 = await instance.rewardOf(accounts[2])
      usdtBalance1 = await instance2.balanceOf(accounts[1])
      usdtBalance2 = await instance2.balanceOf(accounts[2]);
      //await getAllBalance(accounts[1],accounts[2],accounts[0], accounts[3]);
      //test after user withdrawReward func
      var Amount = 100;
      var stringAmount = Amount.toString();
      var amountMWei = web3.utils.toWei(stringAmount, 'Mwei'); //Mwei = mwei = 10^6 wei
      var RewardToStableCoinMicroether1 = (((reward1_ * crownPrice * stableCoinPrice) / 1) * (10**decimalStableCoins)) / (10**18)
      var RewardToStableCoinMicroether2 = (((reward2_ * crownPrice * stableCoinPrice) / 1) * (10**decimalStableCoins)) / (10**18)
      assert.equal(balance1.valueOf(), stakeWei);
      assert.equal(balance2.valueOf(), stakeWei);
      assert.equal(staking1.valueOf(), 0);
      assert.equal(staking2.valueOf(), 0);
      assert.equal(reward1.valueOf(), 0)
      assert.equal(reward2.valueOf(), 0)
      assert.equal(usdtBalance1.valueOf(), 2*RewardToStableCoinMicroether1) //***beware, this only works when the Crownreward = usdtReward in ether unit.
      assert.equal(usdtBalance2.valueOf(), 2*RewardToStableCoinMicroether2) // mul 2 because it's the second time, user already has the usdt from the first round.
    });

    it("user can not remove reward if admin has not set the new dividend ratio yet.", async () => {
      //***withdraw reward*** 
      await instance.addStakingPeriod(2)
      //convert from eth to wei
      var stakeAmount = 100;
      var stringStake = stakeAmount.toString()
      var stakeWei = web3.utils.toWei(stringStake, 'ether');
      
      await instance.createStake(stakeWei,{from:accounts[1]});
      await instance.createStake(stakeWei,{from:accounts[2]});

      await sleep(2500)
  
      await instance.removeStake(stakeWei,{from:accounts[1]}) //send({from:accounts[1]})
      await instance.removeStake(stakeWei,{from:accounts[2]})

    });
    //it("user get the reward after distribute reward or withdraw", async () =>  {


    });
