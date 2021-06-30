pragma solidity ^0.8.0 ; //SPDX-License-Identifier: UNLICENSED

// interface abstractStableCoin {
//     function transfer(address receiver, uint256 numTokens) external returns (bool) ;
//     function balanceOf(address tokenOwner) external view returns (uint) ;
//         //balanceOf will return the current token balance of an account
//         //, identified by its owner’s address.
    
// }
//USDC contractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
interface IERC20 {
    
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);
    
    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);
    
    function approve(address spender, uint256 amount) external returns (bool);
    
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Approval(address indexed tokenOwner, address indexed spender,
        uint tokens);
    event Approval(address indexed to, uint256 AddedOrSubtractedAmount, uint256 newallowances);
    event Transfer(address indexed from, address indexed to,
        uint tokens);
    event Transfer(address indexed from, address indexed to, address indexed requester,
        uint256 tokens);
    event TransferOwnership(address indexed from, address indexed to);
}

interface IERC20Metadata is IERC20 {
    
    function name() external view returns (string memory);
    
    function symbol() external view returns (string memory);
    
    function decimals() external view returns (uint) ;
    
}

contract CrownToken is IERC20, IERC20Metadata {
    mapping(address => uint256) public balances;
    
    mapping(address => mapping (address => uint256)) public allowances;
    
    /*
    @notice The stakes for each stakeholder.
    */
    mapping(address => uint256) public stakes;
    
    /*
    * @notice The accumulated rewards for each stakeholder.
    */
    mapping(address => uint256) public rewards;
    
    //for tracking if the users are staking or not.
    mapping(address => bool) public isStaking;
    
    
    /*
    * @notice The accumulated rewards for each stakeholder IN USDT.
    */
    // mapping(address => uint256) private balancesUSDT;
    
    modifier onlyOwner() {
        require(msg.sender == SuperOwner, "You're not authorized");
        _;
    }
    modifier validAddress(address receiver){    
        require(receiver == address(receiver),"Invalid address");
        require(receiver != address(0));
        _;
    }
    // modifier validAddressList(address[] memory receiverList){    
    //     for (uint256 i = 0; i < receiverList.length; i++) {
    //     require(receiverList[i] == address(receiverList[i]),"Invalid address");
    //     require(receiverList[i] != address(0));
    //     }
    //     _;
    // }
    
    
    event Mint(address indexed to, uint256 amount, uint256 newtotalsupply);
    event Burn (address indexed from, uint256 amount, uint newtotalsupply);
    event Staked(address indexed stakeFrom, uint256 amount);
    event removeStaked(address indexed removeStakedFrom, uint256 amount);
    event RewardPaid(address indexed paidRewardTo, uint256 amount);
    
    string public _name;
    string public _symbol;
    uint256 public _totalSupply;
    uint8 public _decimals;
    address payable SuperOwner;
    address[] internal stakeholders; //to collect the stakeholders' address
    //ufixed public UsdtPrice; Fixed point types not implemented.
    //ufixed public CrownPrice; Fixed point types not implemented.
    uint256 stableCoinPriceIn100Scale ;
    uint256 CrownPriceIn100Scale;
    uint256 startDate;
    uint256 endDate;
    uint decimalStableCoins;
    address stableCoinAddress;
    string staSyms;
    address tester;
    uint256 dividendPercentIn100Scale;
    
    constructor(string memory name_, string memory symbol_, uint256 totalSupply_ , uint8 decimals_) {
        _totalSupply = totalSupply_*(10**decimals_);
        balances[msg.sender] = _totalSupply;
        SuperOwner = payable(msg.sender) ;
        _name = name_ ;
        _symbol = symbol_;
        _decimals = decimals_ ;
        //stakeholders = ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4","0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"];
    }
    
    function CrownPriceIn100Scale_() public view returns (uint256 ) {
        return CrownPriceIn100Scale;
    }

    function stableCoinPriceIn100Scale_() public view returns (uint256 ) {
        return stableCoinPriceIn100Scale;
    }
    
    function name() public view override returns (string memory) {
        return _name;
    }
    function symbol() public view override returns (string memory){
        return _symbol;
    }
    function decimals() public view override returns (uint) {
        return _decimals;
    }
    
    //set the dividend coin's contract and information for other function to retrieve the data.
    //If not set here, the default address will be address(0)
    function setStableCoin(address addressOfStableCoin) public validAddress(addressOfStableCoin) onlyOwner returns (bool){
        
        //set interface for CALL the contract 
        //note that this will use CALL method which msg.sender is the caller contract, not the users themselves.
        IERC20Metadata myStableCoin = IERC20Metadata(addressOfStableCoin);
        
        //get stable coin's decimal.
        decimalStableCoins = myStableCoin.decimals();
        //staSyms = myStableCoin.symbol();
        //myStableCoin.transfer(receiver,numTokens); //this function works means that we may call decimals wrong.
        /*found out that "The transaction has been reverted to the initial state.-
        (continue)Note: The called function should be payable if you send value and the value you send should be less than your current balance.-
        (continue)Debug the transaction to get more information." comes from calling stable coin contract's decimals wrong. */
        //solution is to call the right name of the stable coin function or variable and also have to set the right name for IERC20Metadata and variable declaration at constructor.
        
        //set the contract address so other functions can use.
        stableCoinAddress = addressOfStableCoin; // so now, we don't have to put the stable coin address everytime we call function. 
        return true;
    }
    
    // //get msg.sender
    // function msg() public returns(address){
    //     tester = msg.sender;
    //     return tester;
    // }
    
    //get stablecoin contract address variable.
    function StaAddress() external view returns(address){
        return stableCoinAddress;
    }
    
    //get stablecoin's decimals variable.
    function staDeci() external view returns(uint){
        return decimalStableCoins;
    }
    
    function totalSupply() public view override returns (uint256){ //return totalsupply in ETH unit
        //uint256 _totalSupplyInETH = _totalSupply /(10**18);
        return _totalSupply; 
        //This function will return the number of all tokens allocated 
        //by this contract regardless of owner.
    }
    
    function balanceOf(address tokenOwner) public view override returns (uint) {
        return balances[tokenOwner];
        //balanceOf will return the current token balance of an account
        //, identified by its owner’s address.
    }
    
    //to call the users' stable coins balances.
    function balanceOfStableCoin(address tokenOwner) public view returns(uint) {
    require(stableCoinAddress != address(0), "not specified stable coin's contract yet");
    IERC20 myStableCoin = IERC20(stableCoinAddress);
    return myStableCoin.balanceOf(tokenOwner);
    }
    
    //use for CWT transferring.
    function transfer(address receiver, uint256 numTokens) public validAddress(receiver) override returns (bool) {
        require(numTokens <= balances[msg.sender],"Insufficient balance");
        //_beforeTokenTransfer(msg.sender, receiver, numTokens);
        balances[msg.sender] -= numTokens;
        balances[receiver]   += numTokens ;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
        //delegate's token in their balances will be separated from their quota
        //the transfer function is used to move numTokens amount of tokens from the owner’s balance 
        //to that of another user, or receiver. The transferring owner is msg.sender 
        //i.e. the one executing the function, which implies that only the owner of the tokens can transfer them to others.
    }
    
    function transferOwnership(address oldOwner, address newOwner) public onlyOwner validAddress(newOwner) {
        SuperOwner = payable(newOwner);
        emit TransferOwnership(oldOwner,SuperOwner) ;
        
    }   
    
    function approve(address delegate,uint256 numTokens) public validAddress(delegate) override returns (bool) {
        //require(msg.sender == SuperOwner , "Don't have permission");
        require(numTokens <= balances[msg.sender], "not enough token to approve");
        //require(allowed[SuperOwner][delegate] <= balances[SuperOwner] );
        allowances[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        
        return true;
        //delegate is like marketmaker who doesn't own the coin but have the quota to approve token from superowner to buyer
        //What approve does is to allow an owner i.e. msg.sender to approve a delegate 
        //account, possibly the marketplace itself, to withdraw tokens from his account 
        //and to transfer them to other accounts.
    }
    
    function allowance(address owner, address delegate) public validAddress(delegate) view override returns (uint256) {
        return allowances[owner][delegate]; 
        //This function returns the current approved number of 
        //tokens by an owner to a specific delegate, as set in the approve function.
    }
    
    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) { 
        require(numTokens <= balances[owner], "Owner doesn't have enough balances");
        require(numTokens <= allowances[owner][msg.sender], "Not Enough allowances to transfer");
        allowances[owner][msg.sender] -= numTokens;
        balances[owner] -= numTokens;
        balances[buyer] += numTokens;
        emit Transfer(owner, buyer, msg.sender, numTokens);
        return true;
    }
    
    // //has security issue so I comment this out.
    // function safeTransferFrom(address sender, address receiver, uint256 numTokens) public returns (bool) { 
    //     require(numTokens <= balances[sender], "SuperOwner doesn't have enough balances");
    //     //sender = msg.sender;
    //     balances[msg.sender] -= numTokens;
    //     balances[receiver] += numTokens;
    //     emit Transfer(msg.sender, receiver, numTokens);
    //     return true;
    // }
    
    // transfer CWT from address.(this) to address when Unstaking.
    function transferFromContractStake(address toAddress,uint256 numStakes) internal returns (bool) { 
        require(numStakes <= stakes[toAddress], "not enough stakes to be withdrawn");
        //sender = msg.sender;
        balances[address(this)] -= numStakes;
        balances[toAddress] += numStakes;
        emit Transfer(address(this), toAddress, numStakes);
        return true;
    }
    
    
    // transfer USDT reward from address.(this) to address using balancesUSDT whem distribute the reward.
    function transferFromContractStableCoin(address receiver,uint256 numStableCoin) internal returns (bool) { 
        require(stableCoinAddress != address(0),"not specified stable coin's contract address yet (transferFromContractStableCoin error)");
        require(numStableCoin <= balanceOfStableCoin(address(this)), "not enough stable coin in owner's balances");
        //sender = msg.sender;
        // balancesUSDT[address(this)] -= numUSDT; use the balanceofUSDT directly
        // balancesUSDT[msg.sender] += numUSDT; 
        transferStableCoin(receiver,numStableCoin);
        emit Transfer(address(this), msg.sender, numStableCoin); //don't forget to change the event to be USDT specific
        return true;
    }
    
    //call the USDT contract's transfer function.
    function transferStableCoin(address receiver,uint256 numTokens) public validAddress(receiver) returns(bool) {
        require(stableCoinAddress != address(0),"not specified stable coin's contract address yet(transferStableCoin error)");
        IERC20 myStableCoin = IERC20(stableCoinAddress);
        myStableCoin.transfer(receiver,numTokens);
    return true;
    }
    
    //call stable coin contract's function.
    function approveStableCoin(address addressOfStableCoin, address receiver,uint256 numTokens) public validAddress(receiver) returns(bool) {
    IERC20 myStableCoin = IERC20(addressOfStableCoin);
    myStableCoin.approve(receiver,numTokens);
    return true;
    }
    
    //multiple transfer the CWT token.
    function multiTransfer(address[] memory receivers, uint256[] memory amounts) public {
        for (uint256 i = 0; i < receivers.length; i++) {
            require(receivers[i]==address(receivers[i]));
            transfer(receivers[i], amounts[i]);
        }// use this, it works ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4","0xAb8483F64d9C6d1EcF9b849Ae677dD[3315835cb2"]
    }
    
    //the same as approve but increasing amount.
    function increaseAllowances(address delegate, uint256 addedTokens) public onlyOwner validAddress(delegate) {
        //uint256 newAllowances = allowances[msg.sender][delegate] + addedTokens;
        //allowances[msg.sender][delegate] = newAllowances;
        approve(delegate,allowances[msg.sender][delegate] + addedTokens);
        emit Approval(delegate, addedTokens, allowances[msg.sender][delegate]);
    }
    
    //the same as approve but to decrease allowances.
    function decreaseAllowances(address delegate, uint256 subtractedTokens) public onlyOwner validAddress(delegate) {
        //newAllowances = allowances[msg.sender][delegate] + addedTokens;
        //allowances[msg.sender][delegate] = newAllowances
        approve(delegate,allowances[msg.sender][delegate] - subtractedTokens);
        emit Approval(delegate,subtractedTokens, allowances[msg.sender][delegate]);
    }
    
    function mint(address account, uint256 amount) private onlyOwner{
        require(amount > 0);
        //require (account == SuperOwner);
        //require(msg.sender == SuperOwner, 'Unauthorized') ;
        balances[account] += amount;
        _totalSupply += amount;
        emit Mint(SuperOwner, amount, _totalSupply);
    }
  
    function burn(address account, uint256 amount ) private onlyOwner{
        require (amount > 0);
        //require (msg.sender == SuperOwner, 'Unauthorized' ) ;
        balances[account] -= amount;
        _totalSupply -= amount; 
        emit Burn(msg.sender, amount, _totalSupply);
    }  

    
//------------------------------------------------------------------------------------------------
//-------------------------------- staking part ---------------------------------------------
//------------------------------------------------------------------------------------------------
    
    /* method for admin to add the start and end date of staking. 
    */
    function addStakingPeriod (uint256 _sec) public onlyOwner returns(bool){
        startDate = block.timestamp;
        endDate = startDate + (_sec /**1 days*/); //
        return true;
    }
    
    /* Admin inputs dividend in percent >> 8% >> input = 8 */
    function inputDividend(uint256 _dividendPercentIn100Scale) public onlyOwner returns(uint256){
        require(_dividendPercentIn100Scale > 0, "can't assign dividend <=0");  
        dividendPercentIn100Scale = _dividendPercentIn100Scale;
        for (uint256 s; s< stakeholders.length ; s+=1){
               address stakeholder = stakeholders[s];
               updateReward(stakeholder);
        }
        return dividendPercentIn100Scale;
    }
    
    /**
    * @notice A method to check if an address is a stakeholder.
    * @param _address The address to verify.
    * @return bool, uint256 Whether the address is a stakeholder,
    * and if so its position in the stakeholders array.
    */
   function isStakeholder(address _address)
       public
       view
       returns(bool, uint256)
   {
       for (uint256 s = 0; s < stakeholders.length; s += 1){
           if (_address == stakeholders[s] && isStaking[_address] ==true){
               return (true, s);
           } 
       }
       return (false, 0);
   }

   /**
    * @notice A method to add a stakeholder.
    * @param _stakeholder The stakeholder to add.
    */
    // Internal function cause it can only be called by createStake and removeStake function.
   function addStakeholder(address _stakeholder) internal
   {
       bool _isStaking = isStaking[_stakeholder];
       if(!_isStaking) {
           stakeholders.push(_stakeholder);
           isStaking[_stakeholder] = true;
       }
   }

   /**
    * @notice A method to remove a stakeholder.
    * @param _stakeholder The stakeholder to remove.
    */
    // Internal function cause it can only be called by createStake and removeStake function.
   function removeStakeholder(address _stakeholder)
       internal
   {
       bool _isStaking = isStaking[_stakeholder];
       if(_isStaking){
           isStaking[_stakeholder] = false;
       }
   }
   
   /**
    * @notice A method to retrieve the stake for a stakeholder.
    * @param _stakeholder The stakeholder to retrieve the stake for.
    * @return uint256 The amount of wei staked.
    */
   function stakeOf(address _stakeholder)
       public
       view
       returns(uint256)
   {
       return stakes[_stakeholder];
   }

   /**
    * @notice A method to the aggregated stakes from all stakeholders.
    * @return uint256 The aggregated stakes from all stakeholders.
    */
   function totalStakes()
       public
       view
       returns(uint256)
   {
       uint256 _totalStakes = 0;
       for (uint256 s = 0; s < stakeholders.length; s += 1){
           _totalStakes += (stakes[stakeholders[s]]);
       }
       return _totalStakes;
   }
   
   /**
    * @notice A method for a stakeholder to create a stake.
    * @param _stake The size of the stake to be created.
    */
   function createStake(uint256 _stake) public //should add addStakeholder function within.
   {   require(block.timestamp >= startDate && startDate >0 && block.timestamp <= endDate /*can not restake to get more reward*/, "please stake in the staking period.");
       //uint256 stakeInWei = _stake*(10**18); //convert from ETH input from user to wei in the front end instead(javascript)
       require(_stake > 0, "Cannot stake 0");
       require(balances[msg.sender] >= _stake,"Not Enough Balances to stake " );
       //burn(msg.sender, _stake);
       //safeTransferFrom(msg.sender,address(this),_stake);//old
       transfer(address(this),_stake); //change from safeTransferFrom to normal transfer //need further investigate
       if(stakes[msg.sender] == 0) addStakeholder(msg.sender);
       stakes[msg.sender] += _stake;
       emit Staked(msg.sender, _stake);
       updateReward(msg.sender);
   }

   /**
    * @notice A method for a stakeholder to remove a stake.
    * @param _stake The size of the stake to be removed.
    */
   function removeStake(uint256 _stake) public
   {   require(block.timestamp >= endDate && startDate >0 , "please wait until the stake removal date.");
       //uint256 stakeInWei = _stake*(10**18); //convert from ETH input from user to wei in the front end instead(javascript).
       require(stakes[msg.sender]>=_stake, "not enough staking to be removed");
       //safeTransferFrom(address(this),msg.sender,_stake); //old
       transferFromContractStake(msg.sender,_stake); 
       stakes[msg.sender] -= _stake;
       //updateReward(); //Don't updatereward cause we need to still keep the reward even if users remove their stake.
       if(stakes[msg.sender] == 0) removeStakeholder(msg.sender);
       emit removeStaked(msg.sender,_stake);
       //mint(msg.sender, _stake);
   }
   
   /**
    * @notice A method to allow a stakeholder to check his rewards.
    * @param _stakeholder The stakeholder to check rewards for.
    */
   function rewardOf(address _stakeholder) public view returns(uint256)
   {
       //uint256 rewardInETH = rewards[_stakeholder]/(10**18); use web3 instead.
       return rewards[_stakeholder];
   }

   /**
    * @notice A method to the aggregated rewards from all stakeholders.
    * @return uint256 The aggregated rewards from all stakeholders.
    */
   function totalRewards() public view returns(uint256)
   {
       uint256 _totalRewards = 0;
       for (uint256 s = 0; s < stakeholders.length; s += 1){
           _totalRewards += rewards[stakeholders[s]];
       }
       //uint256 _totalRewardsInETH = _totalRewards/(10**18) ; use web3.utils instead
       return _totalRewards;
   }
   
   /**
    * @notice A simple method that calculates the rewards for each stakeholder.
    * @param _stakeholder The stakeholder to calculate rewards for.
    */
   function calculateReward(address _stakeholder) public view returns(uint256)
   {   require(dividendPercentIn100Scale > 0, "admin hasn't assigned the dividendRatio yet.");    
       //stakes[_stakeholder] *= (0.01);
       //return stakes[_stakeholder] * (0.01);
       
       //has to put in the percent unit, for example dividend 8.00 % >> input =800
       uint256 calAmount = stakes[_stakeholder] * dividendPercentIn100Scale /100 /100 ; //divide 10000 because the first 100 is percent, 
       //the second is to decrease from 100 scale from the input.
       //keep in mind that the system will store wei only.
       //uint256 calRewardsInETH = calAmount ; will convert this by web3.utils instead
       return calAmount;
   }

   /**
    * @notice A method to distribute rewards to all stakeholders.
    */
   
   function priceInput (uint256 _stableCoinPriceIn100Scale, uint256 _CrownPriceIn100Scale) public onlyOwner{
       require(_stableCoinPriceIn100Scale>0 && _CrownPriceIn100Scale >0 , "price must be more than 0");
       //ufixed UsdtPrice; //If announce the ufixed here not at the constructor will work? NNOOOO. 
       //Also, publicate this function doesn't work cause itwon't let you assign the ufixed variable.
       //ufixed CrownPrice;
       //instead, convert the decimal number from javascript to uint to use here**
       stableCoinPriceIn100Scale = _stableCoinPriceIn100Scale;
       CrownPriceIn100Scale = _CrownPriceIn100Scale;
       for (uint256 s; s< stakeholders.length ; s+=1){
               address stakeholder = stakeholders[s];
               updateReward(stakeholder);
        }
   }
   
   //update reward of all users. no need for this cause createStake already 
   //*** can update only that one for saving gas.***
   function updateReward (address _staker) private{
       //require(dividendPercentIn100Scale>0 , "admin hasn't set the dividendPercent yet.");
       //address stakeholder = msg.sender; //only update the msg.sender's rewards.
       uint256 reward = calculateReward(_staker);
       rewards[_staker] = reward; 
       
       
   }
   
   function calculateRewardToStableCoin(uint256 rewardAmount) private view returns (uint256){ //don't know why it has to be view
       require(CrownPriceIn100Scale >0 && stableCoinPriceIn100Scale>0,"no price feeding");
       uint256 RewardToStableCoinMicroether; //If 1 CWT = 0.1 usd, 1 usdt = 1 usd //  USDTtoCWT = USDtoCWT * USDTtoUSD 
       RewardToStableCoinMicroether =((rewardAmount * CrownPriceIn100Scale * stableCoinPriceIn100Scale) / 10000) * (10**decimalStableCoins) / (10**18) ; //convert from 100scale two times
       // don't forget to change convert reward in wei to ETH by javascript >> div(10**18)
       //usdt has 6 decimals
       return RewardToStableCoinMicroether; //
   }
   
   
   
   /*notice //distribute reward in USDT
           //Admin needs USDT in contract address 
           //exchange rate between USDT and Crown //input both coin's price */
   function distributeRewards() public onlyOwner
   {    require(block.timestamp >= endDate  && startDate >0, "please wait until the reward removal date.");
        require(stableCoinAddress != address(0),"not specified stable coin's contract yet(distributeRewards error)");
        for (uint256 s = 0; s < stakeholders.length; s += 1){
           address stakeholder = stakeholders[s];
           
           
           uint256 reward = rewards[stakeholder];
            //check if that user has a reward.
           if (reward >0){
               uint256 rewardStableCoin = calculateRewardToStableCoin(reward); 
               transferFromContractStableCoin(stakeholder,rewardStableCoin); // this func return wei so need web3 to call this and convert to ETH 
               
           //change to distribute dividend in USDT instead. don't use mint.
           //rewards[stakeholder] = 0; 
           //balancesUSDT[stakeholder] += rewardUsdt; no need cause we'll the balanceOfUSDT directly
           
           //This is to reset the stake to their users' balances 
           transferFromContractStake(stakeholder,stakes[stakeholder]);
           uint256 stake = stakes[stakeholder];
           
           //remove stake from the mapping. 
           stakes[stakeholder] -= stake ; //reset the stakes after the stakes and rewards are paid back.
           
           //remove rewards from the mapping.
           rewards[stakeholder] -= reward;
           
           //mark stakeholder as inactive
           if(stakes[stakeholder] == 0) {
           removeStakeholder(stakeholder);
           
           emit removeStaked(stakeholder,stake);
           
           emit RewardPaid(stakeholder, reward);
           }
           }
        }
    
    }
   
   
   /**
    * @notice A method to allow a stakeholder to withdraw his rewards. 
    *///
    /// Has to put addressOfUSDT in case that we change the dividend coin to another contract address.
   function withdrawReward() public //
   {   require(rewards[msg.sender] > 0,"You don't have the reward to withdraw.");
       require(block.timestamp >= endDate  && startDate >0, "please wait until the reward removal date.");
       require(stableCoinAddress != address(0), "not specified stable coin's contract by admin yet (withdrawReward error)");    
       uint256 reward = rewards[msg.sender];
       
       uint256 rewardStableCoin = calculateRewardToStableCoin(reward); 
       
       if(rewardStableCoin > 0) transferFromContractStableCoin(msg.sender,rewardStableCoin); 
       
       rewards[msg.sender] = 0;
       
       //This is to reset the stake to their users' balances 
       removeStake(stakes[msg.sender]);
       //transferFromContractStake(stakes[msg.sender]); 
       //and have to start staking over again in the next allowed period.
   }
}
   
