const web3 = require("../utils/web3")
const { abi, contractAddress } = require("../artifacts/abi-ropsten-testnet-v2.json")
// const { abi, contractAddress } = require("../artifacts/abi-bkc-testnet-v2.json")
const customCommon = require("../utils/eth-common")
var Tx = require('ethereumjs-tx').Transaction;
const client = require('../db/connection')
const contractObj = new web3.eth.Contract(abi, contractAddress)
const { insertTransferTxToDB, getTokenBalance } = require('./token_controller');
const fetch = require('node-fetch');

const getDividendAmount = async (address) => {
    return new Promise(async(resolve, reject) => {
        try {
            var dividend = await contractObj.methods.dividendOf(address).call();
            resolve(web3.utils.fromWei(dividend, 'mwei'));
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getTokenPrice = async (symbol) => {
    return new Promise(async(resolve, reject) => {
        try {
            var tokenId;
            switch(symbol) {
                case "USDT":
                    tokenId = "tether"
                break;
                case "USDC":
                    tokenId = "usd-coin"
                break;
                default:
                    tokenId = "tether"
            }
            fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=thb&ids=${tokenId}&order=market_cap_desc&per_page=100&page=1&sparkline=false`)
            .then(res => res.json())
            .then(result => resolve(result[0].current_price))
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getTokenPriceInContract = async () => {
    return new Promise(async(resolve, reject) => {
        try {
            var crownPrice = await contractObj.methods.crownPriceIn100Unit().call();
            var stableCoinPrice = await contractObj.methods.stableCoinPriceIn100Unit().call();
            var tokenPrice = {
                crownPrice: crownPrice / 100,
                stableCoinPrice: stableCoinPrice / 100
            }
            resolve(tokenPrice);
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getCWTReward = async (address) => {
    return new Promise(async(resolve, reject) => {
        try {
            var rewardCWT = await contractObj.methods.rewardOf(address).call();
            resolve(web3.utils.fromWei(rewardCWT, 'ether'));
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getTotalStake = async () => {
    return new Promise(async(resolve, reject) => {
        try {
            var totalStake = await contractObj.methods.totalStakes().call();
            resolve(web3.utils.fromWei(totalStake, 'ether'));
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const convertUnixToDate = async (unixtime) => {
    return new Promise(async (resolve, reject) => {
        try {
            const milliseconds = unixtime * 1000
            const dateObject = new Date(milliseconds)
            const datetime = dateObject.toLocaleString()
            resolve(datetime)
        } catch (error) {
            reject(new Error(error.message))
        }
    }); 
}

const getStakeAmount = async (address) => {
    return new Promise(async(resolve, reject) => {
        try {
            var stakeAmount = await contractObj.methods.stakeOf(address).call({from: address});
            resolve(web3.utils.fromWei(stakeAmount, 'ether'));
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getStableCoinAddress = async () => {
    return new Promise(async(resolve, reject) => {
        try {
            var stableCoinAddress = await contractObj.methods.stableCoinAddress().call();
            resolve(stableCoinAddress);
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getAdmin = async () => {
    return new Promise(async(resolve, reject) => {
        try {
            var adminAddress = await contractObj.methods.owner().call();
            resolve(adminAddress);
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getDividendRate = async () => {
    return new Promise(async(resolve, reject) => {
        try {
            var dividendRate = await contractObj.methods.dividendRateIn100Unit().call();
            dividendRate = dividendRate / 100;
            resolve(dividendRate);
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getStakeStartDate = async () => {
    return new Promise(async(resolve, reject) => {
        try {
            var startDate = await contractObj.methods.startDate().call();
            var startDateTime = await convertUnixToDate(startDate);
            resolve(startDateTime);
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getStakeEndDate = async () => {
    return new Promise(async(resolve, reject) => {
        try {
            var endDate = await contractObj.methods.endDate().call();
            var endDateTime = await convertUnixToDate(endDate);
            resolve(endDateTime);
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const isStakeholder = async (address) => {
    return new Promise(async(resolve, reject) => {
        try {
            var isStakeholder = await contractObj.methods.isStakeholder(address).call();
            resolve(isStakeholder);
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const getStakeHistory = async (address) => {
    return new Promise(async(resolve, reject) => {
        try {
            var result = await contractObj.methods.getStakeHistory(address).call();
            var resultJson = [];
            for (let i = 0; i < result.length; i++) {
                var startDate = await convertUnixToDate(result[i].startDate)
                var endDate = await convertUnixToDate(result[i].endDate)     
                jsonData = {
                    stakeholder: result[i].stakeholder,
                    amount: web3.utils.fromWei(result[i].amount, "ether"),
                    startDate: startDate,
                    endDate: endDate
                }
                resultJson.push(jsonData)
            }
            resolve(resultJson);
        } catch (error) {
            reject(new Error(error.message))
        }
    });
}

const addStakeholder = async (address, privateKey) => {
    return new Promise(async(resolve, reject) => {
        var dataABI = await contractObj.methods.addStakeholder(address).encodeABI();
        var gasUsed = 5000000000
        var gasLimit = 3000000
        var etherAmount = 0 // Actually this value have to receive from parameter od method   

        var nonce = await web3.eth.getTransactionCount(address, "pending")
        var tx = new Tx({
            nonce: nonce,
            from: address,
            to: contractAddress,
            value: web3.utils.toHex(etherAmount),
            gasPrice: web3.utils.toHex(gasUsed),
            gasLimit: web3.utils.toHex(gasLimit),
            data: dataABI,
        }, { common: customCommon });

        await tx.sign(new Buffer.from(privateKey.substr(2), 'hex'));
        await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
            .on('transactionHash', function(hash){
                resolve(hash)
            })
            .on("error", function(error) {
                reject(new Error(error.message))
            })
    })
}

const setDividendRate = async (address, privateKey, dividendRate) => {
    return new Promise(async(resolve, reject) => {
        var admin = await getAdmin();
        if (address != admin) {
            reject(new Error("Only admin can set the dividend rate!"))
        } else {
            var dataABI = await contractObj.methods.setDividendRate(dividendRate).encodeABI();
            var gasUsed = 5000000000
            var gasLimit = 3000000
            var etherAmount = 0 
            var nonce = await web3.eth.getTransactionCount(address, "pending")
            var tx = new Tx({
                nonce: nonce, 
                from: address,
                to: contractAddress,
                value: web3.utils.toHex(etherAmount),
                gasPrice: web3.utils.toHex(gasUsed),
                gasLimit: web3.utils.toHex(gasLimit),
                data: dataABI,
            }, { common: customCommon });

            await tx.sign(new Buffer.from(privateKey.substr(2), 'hex'));
            await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
                .on('transactionHash', async function(hash){
                    resolve(hash)
                })
                .on("error", function(error) {
                    reject(new Error(error.message))
                })
        }
    })
}

const setStableCoinContract = async (address, privateKey, stableCoinAddress) => {
    return new Promise(async(resolve, reject) => {
        var admin = await getAdmin();
        if (address != admin) {
            reject(new Error("Only admin can set the dividend rate!"))
        } else {
            var dataABI = await contractObj.methods.setStableCoin(stableCoinAddress).encodeABI();
            var gasUsed = 5000000000
            var gasLimit = 3000000
            var etherAmount = 0 
            var nonce = await web3.eth.getTransactionCount(address, "pending")
            var tx = new Tx({
                nonce: nonce, 
                from: address,
                to: contractAddress,
                value: web3.utils.toHex(etherAmount),
                gasPrice: web3.utils.toHex(gasUsed),
                gasLimit: web3.utils.toHex(gasLimit),
                data: dataABI,
            }, { common: customCommon });

            await tx.sign(new Buffer.from(privateKey.substr(2), 'hex'));
            await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
                .on('transactionHash', async function(hash){
                    resolve(hash)
                })
                .on("error", function(error) {
                    reject(new Error(error.message))
                })
        }
    })
}

const distributeDividend = async (address, privateKey) => {
    return new Promise(async(resolve, reject) => {
        var admin = await getAdmin();
        if (address != admin) {
            reject(new Error("Only admin can distribute the dividend!"))
        } else {
            var dataABI = await contractObj.methods.distributeRewards().encodeABI();
            var gasUsed = 5000000000
            var gasLimit = 3000000
            var etherAmount = 0 
            var nonce = await web3.eth.getTransactionCount(address, "pending")
            var tx = new Tx({
                nonce: nonce, 
                from: address,
                to: contractAddress,
                value: web3.utils.toHex(etherAmount),
                gasPrice: web3.utils.toHex(gasUsed),
                gasLimit: web3.utils.toHex(gasLimit),
                data: dataABI,
            }, { common: customCommon });

            await tx.sign(new Buffer.from(privateKey.substr(2), 'hex'));
            await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
                .on('transactionHash', async function(hash){
                    resolve(hash)
                })
                .on("error", function(error) {
                    reject(new Error(error.message))
                })
        }
    })
}

const withdrawDividend = async (address, privateKey) => {
    return new Promise(async(resolve, reject) => {
        var dataABI = await contractObj.methods.withdrawReward(address).encodeABI();
        var gasUsed = 5000000000
        var gasLimit = 3000000
        var etherAmount = 0 
        var nonce = await web3.eth.getTransactionCount(address, "pending")
        var tx = new Tx({
            nonce: nonce, 
            from: address,
            to: contractAddress,
            value: web3.utils.toHex(etherAmount),
            gasPrice: web3.utils.toHex(gasUsed),
            gasLimit: web3.utils.toHex(gasLimit),
            data: dataABI,
        }, { common: customCommon });

        await tx.sign(new Buffer.from(privateKey.substr(2), 'hex'));
        await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
            .on('transactionHash', async function(hash){
                resolve(hash)
            })
            .on("error", function(error) {
                reject(new Error(error.message))
            })
    })
}

const setStakePeriod = async (address, privateKey, periodInDays) => {
    return new Promise(async(resolve, reject) => {
        var admin = await getAdmin();
        if (address != admin) {
            reject(new Error("Only admin can set the dividend rate!"))
        } else {
            var dataABI = await contractObj.methods.setStakingPeriod(periodInDays).encodeABI();
            var gasUsed = 5000000000
            var gasLimit = 3000000
            var etherAmount = 0 
            var nonce = await web3.eth.getTransactionCount(address, "pending")
            var tx = new Tx({
                nonce: nonce, 
                from: address,
                to: contractAddress,
                value: web3.utils.toHex(etherAmount),
                gasPrice: web3.utils.toHex(gasUsed),
                gasLimit: web3.utils.toHex(gasLimit),
                data: dataABI,
            }, { common: customCommon });

            await tx.sign(new Buffer.from(privateKey.substr(2), 'hex'));
            await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
                .on('transactionHash', async function(hash){
                    resolve(hash)
                })
                .on("error", function(error) {
                    reject(new Error(error.message))
                })
        }
    })
}

const setTokenPrice = async (address, privateKey, crownPrice, stableCoinPrice) => {
    return new Promise(async(resolve, reject) => {
        var admin = await getAdmin();
        if (address != admin) {
            reject(new Error("Only admin can set the dividend rate!"))
        } else {
            var dataABI = await contractObj.methods.priceFeeding(crownPrice, stableCoinPrice).encodeABI();
            var gasUsed = 5000000000
            var gasLimit = 3000000
            var etherAmount = 0 
            var nonce = await web3.eth.getTransactionCount(address, "pending")
            var tx = new Tx({
                nonce: nonce, 
                from: address,
                to: contractAddress,
                value: web3.utils.toHex(etherAmount),
                gasPrice: web3.utils.toHex(gasUsed),
                gasLimit: web3.utils.toHex(gasLimit),
                data: dataABI,
            }, { common: customCommon });

            await tx.sign(new Buffer.from(privateKey.substr(2), 'hex'));
            await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
                .on('transactionHash', async function(hash){
                    resolve(hash)
                })
                .on("error", function(error) {
                    reject(new Error(error.message))
                })
        }
    })
}

const addStake = async (address, privateKey, amount) => {
    return new Promise(async(resolve, reject) => {
        var tokenBalance = getTokenBalance(address);
        var startDate = await getStakeStartDate();
        var endDate = await getStakeEndDate();
        var currentDateTime = Math.floor(Date.now()/1000);
        if (tokenBalance < amount) {
            reject(new Error("Amount exceed current balance!"));
        } else if (currentDateTime < startDate || currentDateTime > endDate) {
            console.log(`Start: ${startDate}, End: ${endDate}, Current: ${currentDateTime}`)
            reject(new Error("Please stake token within the staking period!"))
        } else {
            var unitAmount = amount * Math.pow(10, 18)
            var dataABI = await contractObj.methods.addStake(address, unitAmount.toString()).encodeABI();
            var gasUsed = 5000000000
            var gasLimit = 3000000
            var etherAmount = 0 // Actually this value have to receive from parameter od method   
            var transactionType = "STAKE"
            var nonce = await web3.eth.getTransactionCount(address, "pending")
            var tx = new Tx({
                nonce: nonce, 
                from: address,
                to: contractAddress,
                value: web3.utils.toHex(etherAmount),
                gasPrice: web3.utils.toHex(gasUsed),
                gasLimit: web3.utils.toHex(gasLimit),
                data: dataABI,
            }, { common: customCommon });

            await tx.sign(new Buffer.from(privateKey.substr(2), 'hex'));
            await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
                .on('transactionHash', async function(hash){
                    let insertId = await insertTransferTxToDB(hash, address, contractAddress, amount, "pending", "CWT", transactionType);
                    console.log(insertId)
                    resolve(hash)
                })
                .on("error", function(error) {
                    reject(new Error(error.message))
                })
        }
    })
}

const removeStake = async (address, privateKey, amount) => {
    return new Promise(async(resolve, reject) => {
        var stakeAmount = await getStakeAmount(address)
        if (amount > stakeAmount) {
            reject(new Error("Amount exceed stake balance!"))
        } else {
            var unitAmount = amount * Math.pow(10, 18)
            var dataABI = await contractObj.methods.removeStake(address, unitAmount.toString()).encodeABI();
            var gasUsed = 5000000000
            var gasLimit = 500000
            var etherAmount = 0 // Actually this value have to receive from parameter od method   
            var transactionType = "REMOVE STAKE"
            var nonce = await web3.eth.getTransactionCount(address, "pending")
            var tx = new Tx({
                nonce: nonce, 
                from: address,
                to: contractAddress,
                value: web3.utils.toHex(etherAmount),
                gasPrice: web3.utils.toHex(gasUsed),
                gasLimit: web3.utils.toHex(gasLimit),
                data: dataABI,
            }, { common: customCommon });

            await tx.sign(new Buffer.from(privateKey.substr(2), 'hex'));
            await web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
                .on('transactionHash', async function(hash){
                    let insertId = await insertTransferTxToDB(hash, address, contractAddress, amount, "pending", "CWT", transactionType);
                    console.log(insertId)
                    resolve(hash)
                })
                .on("error", function(error) {
                    reject(new Error(error.message))
                })
        }
    })
}

(async () => {
    // console.log(contractObj.methods)
    // var result = await addStakeholder("0x47a541352221ea5E647e8f5Bdba6328A652DC07e", "0xc2570883a47d6359cee82ef765287044aecbdbcab60b827b80884a0e296e4eda");
    // console.log(result)
    // var totalStake = await getTotalStake();
    // console.log(web3.utils.fromWei(totalStake, 'ether'))
    // var tokenPriceTHB = await getTokenPrice("USDC");
    // console.log(tokenPriceTHB) 
    // var adminAddress = await getAdmin();
    // console.log(adminAddress)
    // var startDate = await getStakeStartDate();
    // console.log(startDate)
    // var endDate = await getStakeEndDate();
    // console.log(endDate)
    // var dividendRate = await getDividendRate();
    // console.log(dividendRate)
    // var rewardCWT = await getCWTReward("0xB23068c6412CBE7bd94db54A5176Cc23222B3356");
    // console.log(rewardCWT)
    // var stakeAmount = await getStakeAmount("0xB23068c6412CBE7bd94db54A5176Cc23222B3356");
    // console.log(stakeAmount)
    // var isStakehold = await isStakeholder("0xB23068c6412CBE7bd94db54A5176Cc23222B3356");
    // console.log(isStakehold)
    // var result = await addStakeholder("0x47a541352221ea5E647e8f5Bdba6328A652DC07e", "0xc2570883a47d6359cee82ef765287044aecbdbcab60b827b80884a0e296e4eda");
    // console.log(result)
    // var result = await addStake("0xB23068c6412CBE7bd94db54A5176Cc23222B3356", "0x6dd8da24d55c8774a642413b94c27380d6bcc6f382ded0068ea27ee93dd20bb6", 125);
    // console.log(result)
    // var result = await removeStake("0xB23068c6412CBE7bd94db54A5176Cc23222B3356", "0x6dd8da24d55c8774a642413b94c27380d6bcc6f382ded0068ea27ee93dd20bb6", 244);
    // console.log(result)
    // var result = await setStakePeriod("0xC3c2716690232C15891D4D03590b1DC2D2c418F7", "0x42c92c725c6e8cf1dd814b1e403dfa1545be01aa7adc44f87facf9609d1c7855", 5);
    // console.log(result)
    // var result = await setDividendRate("0xC3c2716690232C15891D4D03590b1DC2D2c418F7", "0x42c92c725c6e8cf1dd814b1e403dfa1545be01aa7adc44f87facf9609d1c7855", 400);
    // console.log(result)
    // var stableCoinAddress = await getStableCoinAddress();
    // console.log(stableCoinAddress)
    // var result = await setStableCoinContract("0xC3c2716690232C15891D4D03590b1DC2D2c418F7", "0x42c92c725c6e8cf1dd814b1e403dfa1545be01aa7adc44f87facf9609d1c7855", "0x0c745Fef6d7E42d6217918E36aDCB0CbE04fd3c7");
    // console.log(result)
    // var stableCoinAddress = await getStableCoinAddress();
    // console.log(stableCoinAddress)
    // var dividend = await getDividendAmount("0xB23068c6412CBE7bd94db54A5176Cc23222B3356")
    // console.log(dividend)
    // var dividendUSD = await web3.utils.fromWei(dividend, 'ether')
    // console.log(dividendUSD * tokenPriceTHB)
    // var result = await distributeDividend("0xC3c2716690232C15891D4D03590b1DC2D2c418F7", "0x42c92c725c6e8cf1dd814b1e403dfa1545be01aa7adc44f87facf9609d1c7855")
    // console.log(result)
    // var result = await withdrawDividend("0xC3c2716690232C15891D4D03590b1DC2D2c418F7", "0x42c92c725c6e8cf1dd814b1e403dfa1545be01aa7adc44f87facf9609d1c7855")
    // console.log(result)
    // var crownPrice = 0.73 * 100;
    // var stableCoinPrice = 1 * 100;
    // var result = await setTokenPrice("0xC3c2716690232C15891D4D03590b1DC2D2c418F7", "0x42c92c725c6e8cf1dd814b1e403dfa1545be01aa7adc44f87facf9609d1c7855", crownPrice, stableCoinPrice)
    // console.log(result)
    // var tokenPrice = await getTokenPriceInContract();
    // console.log(tokenPrice)
})();

module.exports = {
    getTotalStake,
    getStakeAmount,
    isStakeholder,
    getStakeHistory,
    addStakeholder,
    addStake,
    removeStake,
    getDividendRate,
    getStableCoinAddress,
    getCWTReward,
    getDividendAmount,
    getTokenPrice,
    setStakePeriod,
    distributeDividend,
    setStableCoinContract,
    setDividendRate,
    getStakeStartDate,
    getStakeEndDate,
    withdrawDividend
}
