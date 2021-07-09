import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
import Token from './artifacts/contracts/Token.sol/Token.json'

// Update with the contract address logged out to the CLI when it was deployed 
const greeterAddress = "0xDB80B3722575bB75dE312c4A1619F2fa38D39F2f"
const tokenAddress = "0x69cC06eD0B1B3cC106934cf476a1f887C3324BC3"

function App() {
  // store greeting in local state
  const [greeting, setGreetingValue] = useState()
  const [isWaiting, setIsWaiting] = useState()
  const [txHash, setTxHash] = useState()
  const [userAccount, setUserAccount] = useState()
  const [amount, setAmount] = useState()
  const [balance, setBalance] = useState();

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function convertWeiToEther(amountWei) {
    return ethers.utils.formatEther(amountWei)
  } 

  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      console.log(account)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider)
      const balWei = await contract.balanceOf(account); 
      const balEthers = await convertWeiToEther(balWei)
      setBalance(balEthers.toString());
      console.log("Balance: ", balEthers.toString());
    }
  }

  async function sendToken() {
    setIsWaiting(true)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer)
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transaction = await contract.transfer(userAccount, amount);
      await transaction.wait();
      setTxHash(transaction.hash)
      setIsWaiting(false)
      getBalance()
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
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
  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        setGreetingValue(data)
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  // call the smart contract, send an update
  async function setGreeting() {
    setIsWaiting(true)
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log(provider)
      const signer = provider.getSigner()
      console.log(signer)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      setTxHash(transaction.hash)
      setIsWaiting(false)
      fetchGreeting()
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <p>Greeting Word: {greeting}</p>
          <button onClick={fetchGreeting}>Fetch Greeting</button><br/>
          <button onClick={setGreeting}>Set Greeting</button><br/>
          <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" />
        </div>
        <div>
          <p>Token Balance: {balance == 0 ? 0 : balance}</p>
          <button onClick={getBalance}>Get Balance</button><br/>
          <input onChange={e => setUserAccount(e.target.value)} placeholder="Reciever address" /><br/>
          <input onChange={e => setAmount(e.target.value)} placeholder="Amount" /><br/>
          <button onClick={sendToken}>Send Token</button>
        </div>
        <p>Transaction Hash: {isWaiting ? `Pending..` : `${txHash === undefined ? '' : txHash}`}</p>
      </header>
    </div>
  );
}

export default App;