pragma solidity ^0.8.0; //SPDX-License-Identifier: UNLICENSED
// totalsupply don't forget to mul 10^18
// web3
//Hook before_transfer
//event maximum parameter including index 
//import "./ABDKMathQuad.sol";
//crownstaking contract address = "0x23DD8eC754d4fDd7638E47b7c89Ae26e35e1039E"
interface abstractUSDT {
    function transfer(address receiver, uint256 numTokens) external returns (bool) ;
    function balanceOf(address tokenOwner) external view returns (uint) ;
        //balanceOf will return the current token balance of an account
        //, identified by its owner’s address.
    
}

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
    
    function decimal() external view returns (uint) ;
    
}

contract CrownToken is IERC20, IERC20Metadata {
    mapping(address => uint256) private balances;
    
    mapping(address => mapping (address => uint256)) private allowances;
    
    /**
    * @notice The stakes for each stakeholder.
    */
    mapping(address => uint256) internal stakes;
    
    /**
    * @notice The accumulated rewards for each stakeholder.
    */
    mapping(address => uint256) internal rewards;
    
    /**
    * @notice The accumulated rewards for each stakeholder IN USDT.
    */
    mapping(address => uint256) internal balancesUSDT;
    
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
    
    string private _name;
    string private _symbol;
    uint256 private _totalSupply;
    uint8 private decimals;
    address payable SuperOwner;
    address[] internal stakeholders; //to collect the stakeholders' address
    //ufixed public UsdtPrice; Fixed point types not implemented.
    //ufixed public CrownPrice; Fixed point types not implemented.
    uint256 UsdtPriceIn100Scale ;
    uint256 CrownPriceIn100Scale;
    
    constructor(string memory name_, string memory symbol_, uint256 totalSupply_ , uint8 decimals_) {
        _totalSupply = totalSupply_*(10**decimals_);
        balances[msg.sender] = _totalSupply;
        SuperOwner = payable(msg.sender) ;
        _name = name_ ;
        _symbol = symbol_;
        decimals = decimals_ ;
        //stakeholders = ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4","0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"];
    }
    

    function CrownPriceIn100Scale_() public view returns (uint256 ) {
        return CrownPriceIn100Scale;
    }
    
     function UsdtPriceIn100Scale_() public view returns (uint256 ) {
        return UsdtPriceIn100Scale;
    }
    
    function name() public view override returns (string memory) {
        return _name;
    }
    function symbol() public view override returns (string memory){
        return _symbol;
    }
    function decimal() public view override returns (uint) {
        return decimals;
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
    
    function balanceOfUSDT(address addressOfUSDT, address tokenOwner) public view returns(uint) {
    abstractUSDT myUSDT = abstractUSDT(addressOfUSDT);
    return myUSDT.balanceOf(tokenOwner);
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
    function transferFromContractStake( uint256 numStakes) internal returns (bool) { 
        require(numStakes <= stakes[msg.sender], "not enough stakes to be withdrawn");
        //sender = msg.sender;
        balances[address(this)] -= numStakes;
        balances[msg.sender] += numStakes;
        emit Transfer(address(this), msg.sender, numStakes);
        return true;
    }
    

    // transfer USDT reward from address.(this) to address using balancesUSDT whem distribute the reward.
    function transferFromContractUSDT(address addressOfUSDT,address receiver,uint256 numUSDT) internal onlyOwner returns (bool) { 
        require(numUSDT <= balanceOfUSDT(addressOfUSDT,address(this)), "not enough USDT in owner's balances");
        //sender = msg.sender;
        // balancesUSDT[address(this)] -= numUSDT; use the balanceofUSDT directly
        // balancesUSDT[msg.sender] += numUSDT; 
        transferUSDT(addressOfUSDT, receiver,numUSDT);
        emit Transfer(address(this), msg.sender, numUSDT); //don't forget to change the event to be USDT specific
        return true;
    }
    
    //call the USDT contract's transfer function.
    function transferUSDT(address addressOfUSDT, address receiver,uint256 numTokens) public validAddress(receiver) returns(bool) {
    abstractUSDT myUSDT = abstractUSDT(addressOfUSDT);
    myUSDT.transfer(receiver,numTokens);
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
    function addStakingPeriod (uint256 _days) public onlyOwner returns(bool){
        startDate = block.timestamp;
        endDate = startDate + (_days * 1 days);
        return true;
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
           if (_address == stakeholders[s]) return (true, s);
       }
       return (false, 0);
   }

   /**
    * @notice A method to add a stakeholder.
    * @param _stakeholder The stakeholder to add.
    */
    // Internal function cause it can only be called by createStake and removeStake function.
   function addStakeholder(address _stakeholder)
       internal
   {
       (bool _isStakeholder, ) = isStakeholder(_stakeholder);
       if(!_isStakeholder) stakeholders.push(_stakeholder);
   }

   /**
    * @notice A method to remove a stakeholder.
    * @param _stakeholder The stakeholder to remove.
    */
    // Internal function cause it can only be called by createStake and removeStake function.
   function removeStakeholder(address _stakeholder)
       internal
   {
       (bool _isStakeholder, uint256 s) = isStakeholder(_stakeholder);
       if(_isStakeholder){
           stakeholders[s] = stakeholders[stakeholders.length - 1];
           stakeholders.pop();
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
   {
       //uint256 stakeInWei = _stake*(10**18); //convert from ETH input from user to wei in the front end instead(javascript)
       require(_stake > 0, "Cannot stake 0");
       require(balances[msg.sender] >= _stake,"Not Enough Balances to stake " );
       //burn(msg.sender, _stake);
       //safeTransferFrom(msg.sender,address(this),_stake);//old
       transfer(address(this),_stake); //change from safeTransferFrom to normal transfer //need further investigate
       if(stakes[msg.sender] == 0) addStakeholder(msg.sender);
       stakes[msg.sender] += _stake;
       emit Staked(msg.sender, _stake);
       updateReward();
   }

   /**
    * @notice A method for a stakeholder to remove a stake.
    * @param _stake The size of the stake to be removed.
    */
   function removeStake(uint256 _stake) public
   {
       //uint256 stakeInWei = _stake*(10**18); //convert from ETH input from user to wei in the front end instead(javascript).
       require(stakes[msg.sender]>=_stake, "not enough staking to be removed");
       //safeTransferFrom(address(this),msg.sender,_stake); //old
       transferFromContractStake(_stake);
       stakes[msg.sender] -= _stake;
       updateReward();
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
   {
       //stakes[_stakeholder] *= (0.01);
       //return stakes[_stakeholder] * (0.01);
       uint256 calAmount;
       calAmount = stakes[_stakeholder]/100 ; //keep in mind that the system will store wei only.
       //uint256 calRewardsInETH = calAmount ; will convert this by web3.utils instead
       return calAmount;
   }

   /**
    * @notice A method to distribute rewards to all stakeholders.
    */
   
   function priceInput (uint256 _UsdtPriceIn100Scale, uint256 _CrownPriceIn100Scale) public onlyOwner{
       //ufixed UsdtPrice; //If announce the ufixed here not at the constructor will work? NNOOOO. 
       //Also, publicate this function doesn't work cause itwon't let you assign the ufixed variable.
       //ufixed CrownPrice;
       //instead, convert the decimal number from javascript to uint to use here**
       UsdtPriceIn100Scale = _UsdtPriceIn100Scale;
       CrownPriceIn100Scale = _CrownPriceIn100Scale;
   }
   
   //update reward of all users. no need for this cause createStake already 
   function updateReward () private onlyOwner{
        for (uint256 s = 0; s < stakeholders.length; s += 1){
           address stakeholder = stakeholders[s];
           uint256 reward = calculateReward(stakeholder);
           rewards[stakeholder] = reward; 
       }
       
   }
   
   function calculateRewardToUsdt(uint256 rewardAmount) private view returns (uint256){ //don't know why it has to be view
       require(CrownPriceIn100Scale >0 && UsdtPriceIn100Scale>0,"no price feeding");
       uint256 RewardToUsdtMicroether; //If 1 CWT = 0.1 usd, 1 usdt = 1 usd //  USDTtoCWT = USDtoCWT * USDTtoUSD 
       RewardToUsdtMicroether = ((rewardAmount * CrownPriceIn100Scale * UsdtPriceIn100Scale) / 10000)/(10**12); //convert from 100scale two times
       // don't forget to change convert reward in wei to ETH by javascript >> div(10**18)
       //usdt has 6 decimals
       return RewardToUsdtMicroether; //
   }
   
   
   
   /*notice //distribute reward in USDT
           //Admin needs USDT in contract address 
           //exchange rate between USDT and Crown //input both coin's price */
   function distributeRewards(address addressOfUSDT) public onlyOwner
   {
        for (uint256 s = 0; s < stakeholders.length; s += 1){
           address stakeholder = stakeholders[s];
           
        //   uint256 reward = calculateReward(stakeholder);
        //   rewards[stakeholder] = reward;  old code
           
           //new code
           uint256 reward = rewards[stakeholder];
           
           uint256 rewardUsdt = calculateRewardToUsdt(reward); 
           //balancesUSDT[stakeholder] = rewardUsdt; //keep track of usdt balances and being used from transferFromContractUSDT
           if(rewardUsdt > 0) transferFromContractUSDT(addressOfUSDT,stakeholder,rewardUsdt); // this func return wei so need web3 to call this and convert to ETH 
            
           
           //change to distribute dividend in USDT instead. don't use mint.
           rewards[stakeholder] = 0;
           //balancesUSDT[stakeholder] += rewardUsdt; no need cause we'll the balanceOfUSDT directly
           
           emit RewardPaid(stakeholder, reward); 
       }
       
    
   }

   /**
    * @notice A method to allow a stakeholder to withdraw his rewards. 
    *///
    /// Has to put addressOfUSDT in case that we change the dividend coin to another contract address.
   function withdrawReward(address addressOfUSDT ) public //
   {
       uint256 reward = rewards[msg.sender];
       
       uint256 rewardUsdt = calculateRewardToUsdt(reward); 
       
       if(rewardUsdt > 0) transferFromContractUSDT(addressOfUSDT,msg.sender,rewardUsdt); 
       
       rewards[msg.sender] = 0;
   }
}
