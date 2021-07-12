import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
//import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
//import Token from './artifacts/contracts/Token.sol/Token.json'
import {Token} from "./config.js"
import { stableCoin } from './config.js';
import Web3 from 'web3';
//import Token from "./TodoList.js";

// Update with the contract address logged out to the CLI when it was deployed 
//const greeterAddress = "0xDB80B3722575bB75dE312c4A1619F2fa38D39F2f"
const tokenAddress = "0xe4611F15B52b5A1071530394f8BE4d676e7E8D90"//"0x82e76Cc0D9eBB342876a484F013DAebd3aEC6321";
const stableAd = "0x7B6a6535A0126862fbcFBe2D91c7D302333f1f64";
function App() {
  // store greeting in local state
  const [greeting, setGreetingValue] = useState()
  const [isWaiting, setIsWaiting] = useState()
  const [txHash, setTxHash] = useState()
  const [userAccount, setUserAccount] = useState()
  const [amount, setAmount] = useState()
  const [balance, setBalance] = useState();
  const [stake,setStaking] = useState();
  const [period,setPeriod] = useState();
  const [dividend,setDividend] = useState();
  const [dividendRatio,setDividendRatio] = useState();
  const [reward,setReward] = useState();
  const [StableAddress,setStableAddress] = useState();
  const [stableCoinPrice,setStableCoinPrice] = useState();
  const [crownPrice,setCrownPrice] =useState();
  const [totalStakes,setTotalStakes] = useState();
  const [balanceStable,setBalanceStable] = useState();



  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function convertWeiToEther(amountWei) {
    return ethers.utils.formatEther(amountWei)
  } 

  async function convertWeiToMicroEther(amountWei){
    var stringMicroEther =  amountWei.toString();
    return Web3.utils.fromWei(stringMicroEther, 'mwei');
  }

  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log(account)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token, provider)
      const balWei = await contract.balanceOf(account); 
      const balEthers = await convertWeiToEther(balWei)
      setBalance(balEthers.toString());
      console.log("Balance: ", balEthers.toString());
    }
  }

  async function balanceOfStableCoin() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log(account)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(stableAd, stableCoin, provider)
      const balWei = await contract.balanceOf(account); 
      const balMicroEther = await convertWeiToMicroEther(balWei)
      setBalanceStable(balMicroEther.toString());
      console.log("Balance stable coin: ", balMicroEther.toString());
    }
  }

  async function getTotalStakes() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log(account)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token, provider)
      const balWei = await contract.totalStakes(); 
      const balEthers = await convertWeiToEther(balWei)
      setTotalStakes(balEthers.toString());
      console.log("total stakes: ", balEthers.toString());
    }
  }

  async function sendToken() {
    try{
      setIsWaiting(true)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = new ethers.Contract(tokenAddress, Token, signer);
      var amountWei = amount*(10**18)
      var weiString = amountWei.toString();
      //need to pass amount in string to smartcontract. otherwise, error. 
      const transaction = await contract.transfer(userAccount, weiString);
      await transaction.wait();
      setTxHash(transaction.hash)
      setIsWaiting(false)
      getBalance()
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
    }
    }
    catch(err){
      console.log(err);
    }
  }

  async function sendStable() {
    try{
      setIsWaiting(true)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = new ethers.Contract(stableAd, stableCoin, signer);
      var amountWei = amount*(10**6)
      var weiString = amountWei.toString();
      //need to pass amount in string to smartcontract. otherwise, error. 
      const transaction = await contract.transfer(userAccount, weiString);
      await transaction.wait();
      setTxHash(transaction.hash)
      setIsWaiting(false)
      getBalance()//change to getBalanceStableCoin when you're free.
      console.log(`${amount} stableCoin is successfully sent to ${userAccount}`);
    }
    }
    catch(err) {
      console.log(err)
    }
  }

   
  async function getStake() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log(account)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token, provider)
      const stakeWei = await contract.stakeOf(account); 
      const stakeEthers = await convertWeiToEther(stakeWei)
      setStaking(stakeEthers.toString());
      console.log("stake: ", stakeEthers.toString());
    }
  }

  async function dividendOf() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log(account)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token, provider)
      const dividendMicro = await contract.dividendOf(account); 
      const dividendEthers = await convertWeiToMicroEther(dividendMicro)
      setDividend(dividendEthers.toString());
      console.log("dividend: ", dividendEthers.toString());
    }
  }

  async function rewardOf() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log(account)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token, provider)
      const stakeWei = await contract.rewardOf(account); 
      const stakeEthers = await convertWeiToEther(stakeWei)
      setReward(stakeEthers.toString());
      console.log("reward : ", stakeEthers.toString());
    }
  }
  

  async function _setStakingPeriod() {
    setIsWaiting(true)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = new ethers.Contract(tokenAddress, Token, signer);
      const transaction = await contract.setStakingPeriod(period);
      await transaction.wait();
      setTxHash(transaction.hash)
      setIsWaiting(false)
      console.log(`${period} minutes of staking period has been set`);
    }
  }
  
  
  async function setDividendRate() {
    try{
      setIsWaiting(true)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = new ethers.Contract(tokenAddress, Token, signer);
      var amount100 = dividendRatio*100;
      var amount100String = amount100.toString();
      const transaction = await contract.setDividendRate(amount100String);
      await transaction.wait();
      setTxHash(transaction.hash)
      setIsWaiting(false)
      console.log(`new dividend rate = ${dividendRatio} `);
    }
    }
    catch(err) {
      console.log(err)
    } 
  };

  async function priceFeeding() {
    try{
      setIsWaiting(true)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = new ethers.Contract(tokenAddress, Token, signer);
      var staPrice100 =  stableCoinPrice*100;
      var staPrice100String = staPrice100.toString();
      var crownPrice100 =  crownPrice*100;
      var crownPrice100String = crownPrice100.toString(); 
      const transaction = await contract.priceFeeding(staPrice100String,crownPrice100String);
      await transaction.wait();
      setTxHash(transaction.hash)
      setIsWaiting(false)
      console.log(`new stableCoinPrice  = ${stableCoinPrice} `);
      console.log(`new crownPrice  = ${crownPrice} `);
    }
    }
    catch(err) {
      console.log(err)
    } 
  };
  
  // async function setStableCoin() {
  //   setIsWaiting(true)
  //   if (typeof window.ethereum !== 'undefined') {
  //     await requestAccount()
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     console.log(signer)
  //     const contract = new ethers.Contract(tokenAddress, Token, signer);
  //     const transaction = await contract.setStableCoin(userAccount); //don't forget to change it later
  //     await transaction.wait();
  //     setTxHash(transaction.hash)
  //     setIsWaiting(false)
  //     console.log(`stable coin address = ${userAccount} `);
  //   }
  // }

  async function setStableCoin() {
    setIsWaiting(true)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = new ethers.Contract(tokenAddress, Token, signer);
      const transaction = await contract.setStableCoin(StableAddress);
      await transaction.wait();
      setTxHash(transaction.hash)
      setIsWaiting(false)
      console.log(` stable Coins address is successfully set to ${StableAddress}`);
    }
  }

  async function createStake() {
    setIsWaiting(true)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = new ethers.Contract(tokenAddress, Token, signer);
      var amountWei = amount*(10**18);
      var weiString = amountWei.toString();
      const transaction = await contract.addStake(userAccount,weiString);
      await transaction.wait();
      setTxHash(transaction.hash)
      setIsWaiting(false)
      console.log(`${amount} CWT has been staked.`);
    }
  }
  
  async function removeStake() {
    setIsWaiting(true)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = new ethers.Contract(tokenAddress, Token, signer);
      var amountWei = amount*(10**18)
      var weiString = amountWei.toString();
      const transaction = await contract.removeStake(userAccount,weiString);
      await transaction.wait();
      setTxHash(transaction.hash)
      setIsWaiting(false)
      console.log(`${stake} CWT stakes has been removed.`);
    }
  }

  
  async function distributeRewards() {
    try{
      setIsWaiting(true)
      if (typeof window.ethereum !== 'undefined') {
        await requestAccount()
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log(signer)
        const contract = new ethers.Contract(tokenAddress, Token, signer);
        const transaction = await contract.distributeRewards();
        await transaction.wait();
        setTxHash(transaction.hash)
        setIsWaiting(false)
        console.log("rewards have been distributed");
      }
    } catch(err) {
      console.log(err)
    }
  };
  


  
  async function withdrawReward() {
    try{
      setIsWaiting(true)
      if (typeof window.ethereum !== 'undefined') {
        await requestAccount()
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log(signer)
        const contract = new ethers.Contract(tokenAddress, Token, signer);
        const transaction = await contract.withdrawReward(userAccount);
        await transaction.wait();
        setTxHash(transaction.hash)
        setIsWaiting(false)
        console.log("rewards have been withdrawn");
      }
    } catch(err) {
      console.log(err)
    }
  }
  

  


  // async function getEtherscanLink(hash) {
  //   let networkId = window.ethereum.networkVersion
  //   let url = ""
  //   switch (networkId) {
  //     case 1:
  //       url = `https://etherscan.io/tx/${hash}`
  //       break;
  //     case 3:
  //       url = `https://ropsten.etherscan.io/tx/${hash}`
  //       break;
  //     case 42:
  //       url = `https://kovan.etherscan.io/tx/${hash}`
  //       break;
  //     case 4:
  //       url = `https://rinkeby.etherscan.io/tx/${hash}`
  //       break;
  //     case 5:
  //       url = `https://goerli.etherscan.io/tx/${hash}`
  //       break;
  //   }
  //   console.log(url)
  //   return url
  // }

  // call the smart contract, read the current greeting value
  // async function fetchGreeting() {
  //   if (typeof window.ethereum !== 'undefined') {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum)
  //     const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
  //     try {
  //       const data = await contract.greet()
  //       setGreetingValue(data)
  //       console.log('data: ', data)
  //     } catch (err) {
  //       console.log("Error: ", err)
  //     }
  //   }    
  // }

  // call the smart contract, send an update
  // async function setGreeting() {
  //   setIsWaiting(true)
  //   if (!greeting) return
  //   if (typeof window.ethereum !== 'undefined') {
  //     await requestAccount()
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     console.log(provider)
  //     const signer = provider.getSigner()
  //     console.log(signer)
  //     const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
  //     const transaction = await contract.setGreeting(greeting)
  //     await transaction.wait()
  //     setTxHash(transaction.hash)
  //     setIsWaiting(false)
  //     fetchGreeting()
  //   }
  // }

  return (
    <div className="App">
      <header className="App-header">
        
        <div>
          <p>CWT Token Balance: {balance == 0 ? 0 : balance} CWT</p>
          <p>Staking Balances: {stake == 0 ? 0 : stake} CWT</p>
          <p>dividend Balances: {dividend == 0 ? 0 : dividend} USDT</p>
          <p>reward Balances: {reward == 0 ? 0 : reward} CWT</p>
          <p>totalStakes: {totalStakes == 0 ? 0 : totalStakes} CWT</p>
          <p>balances stable coin: {balanceStable == 0 ? 0 : balanceStable} USDT</p>
          
          <button onClick={getBalance}>Get Balance</button><br/>
          <button onClick={getStake}>Get Stakes</button><br/>
          <button onClick={dividendOf}>Get dividend </button><br/>
          <button onClick={rewardOf}>Get reward </button><br/>
          <button onClick={getTotalStakes}>Get total stakes </button><br/>
          <button onClick={balanceOfStableCoin}>Get balance stable coin </button><br/>

          <input onChange={e => setUserAccount(e.target.value)} placeholder="Reciever address" /><br/>
          <input onChange={e => setAmount(e.target.value)} placeholder="Amount" /><br/>
          <button onClick={sendToken}>Send Token</button><br/> 

          
          <input onChange={e => setUserAccount(e.target.value)} placeholder="Reciever address" /><br/>
          <input onChange={e => setAmount(e.target.value)} placeholder="Amount" /><br/>
          <button onClick={sendStable}>Send stable coin</button><br/> 

          <input onChange={e => setPeriod(e.target.value)} placeholder="minutes" /><br/>
          <button onClick={_setStakingPeriod}>set staking period</button><br/>

          
          <input onChange={e => setStableAddress(e.target.value)} placeholder=" stable coin's address" /><br/>
          <button onClick={setStableCoin}>set stable coin address</button><br/>
          
          <input onChange={e => setDividendRatio(e.target.value)} placeholder="% new dividend rate %" /><br/>
          <button onClick={setDividendRate}>set new dividend rate in %</button><br/>
          
          
          <input onChange={e => setStableCoinPrice(e.target.value)} placeholder=" input new stableCoinPrice" /><br/>
          <input onChange={e => setCrownPrice(e.target.value)} placeholder=" input new CrownPrice" /><br/>
          <button onClick={priceFeeding}>set new coins' prices</button><br/>

          <input onChange={e => setUserAccount(e.target.value)} placeholder="stake holder address" /><br/>
          <input onChange={e => setAmount(e.target.value)} placeholder="Stake Amount" /><br/>
          <button onClick={createStake}>Add Stake</button><br/>
          
          <input onChange={e => setUserAccount(e.target.value)} placeholder="stake holder address" /><br/>
          <input onChange={e => setStaking(e.target.value)} placeholder="Stake Amount" /><br/>
          <button onClick={removeStake}>Remove Stake</button><br/>

          <button onClick={distributeRewards}>distributeRewards</button><br/>

          <input onChange={e => setUserAccount(e.target.value)} placeholder="stake holder address" require/><br/>
          <button onClick={withdrawReward}>withdrawReward</button><br/>
          
          

        </div>
        <p>Transaction Hash: {isWaiting ? `Pending..` : `${txHash === undefined ? '' : txHash}`}</p>
      </header>
    </div>
  );
}

export default App;


/*  */

// import './App.css';
// import Web3 from 'web3';
// import React, { Component } from 'react'
// import {TODO_LIST_ABI,TODO_LIST_ADDRESS} from "./config.js"
// import TodoList from "./TodoList.js";
// class App extends Component {
//   componentWillMount(){
//     this.loadBlockchainData()
//   }
//   async loadBlockchainData(){
//     const web3 = new Web3(Web3.givenProvider || "http://localhost:7545")
//     const network = await web3.eth.net.getNetworkType()
//     const accounts = await web3.eth.getAccounts()
//     console.log("account", accounts[0]);
//     console.log("network",network );
//     this.setState({account : accounts[0]});
//     const todoList = new web3.eth.Contract(TODO_LIST_ABI,TODO_LIST_ADDRESS);
//     this.setState({todoList});
//     console.log(todoList);
//     const balances = await todoList.methods.balanceOf(accounts[0]).call()
//     this.setState({balances});
//     this.setState({loading: false});
//     const dividendRateIn100Unit = await todoList.methods.dividendRateIn100Unit.call()
//     this.setState({dividendRateIn100Unit})
//     //const address = await web3.defaultAccount
//   }

//   constructor(props) {
//     super(props)
//     this.state = { account: '',
//     balances: 0,
//     loading :true,
//     dividendRateIn100Unit:400
//     }
//     this.createTask = this.createTask.bind(this);
//   }

//   createTask(content) {
//     this.setState({ loading: true })
//     this.state.todoList.methods.setDividendRate(content).send({ from: this.state.account })
//     .once('receipt', (receipt) => {
//       this.setState({ loading: false })
//   })
//   }

//   render() {
//     return (
//       <div>
//         <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
//       <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="https://github.com/dappuniversity/eth-todo-list/blob/master/src/index.html" target="_blank">link to Dapp's github </a>
//       <ul className="navbar-nav px-3">
//         <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
//           <small><a className="nav-link" href="#"><span id="account"></span></a></small>
//         </li>
//       </ul>
//     </nav>
//     <div className="container-fluid">
//       <div className="row">
//         <main role="main" className="col-lg-12 d-flex justify-content-center">
//           {this.state.loading 
//           ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div> 
//           : <TodoList dividendRateIn100Unit ={this.state.dividendRateIn100Unit} createTask={this.createTask} />
//           }
//           </main>
//       </div>
//     </div>
//       </div>
//     );
//   }
// }

// export default App;

        
