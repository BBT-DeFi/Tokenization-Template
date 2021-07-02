const Crown = artifacts.require("CrownToken");
const Usdt  = artifacts.require("USDT");
var instance; 
var instance2;
// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
// async function demo() {
//   console.log('Taking a break...');
//   await sleep(4000);
//   console.log("four seconds later");
// }
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
      var stakeMWei = web3.utils.toWei(stringStake, 'Mwei');

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

      //convert from eth to Mwei
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
      await instance.addStakingPeriod(30)//.send({from:accounts[1]})

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
    
    it("user can removestake outside removal date but don't get the usdt yet", async () =>  {
      
      
      //instantiate the contract to be used 
      instance = await Crown.deployed();
      instance2 = await Usdt.deployed();
      await instance.addStakingPeriod(2)
      
      await sleep(2500) //credit by win. thanks bro.
      //setTimeout(3000);
      //convert from eth to wei
      var stakeAmount = 100;
      var stringStake = stakeAmount.toString()
      var stakeWei = web3.utils.toWei(stringStake, 'ether');

      //admin enable stake period
      

      //user removestake 
      await instance.removeStake(stakeWei,{from:accounts[1]})//.send({from:accounts[1]})
      await instance.removeStake(stakeWei,{from:accounts[2]})
      
      //test balances
      const balance1 = await instance.balanceOf.call(accounts[1]);
      const balance2 = await instance.balanceOf.call(accounts[2]);
      const staking1 = await instance.stakeOf(accounts[1])
      const staking2 = await instance.stakeOf(accounts[2])

      //usdt balances
      var usdtBalance1 = await instance2.balanceOf(accounts[1])
      var usdtBalance2 = await instance2.balanceOf(accounts[2])
      
      //
      assert.equal(balance1.valueOf(), stakeWei);
      assert.equal(balance2.valueOf(), stakeWei);
      assert.equal(staking1.valueOf(), 0);
      assert.equal(staking2.valueOf(), 0);
      assert.equal(usdtBalance1.valueOf(), 0)
      assert.equal(usdtBalance2.valueOf(), 0)
    });
    


    });
