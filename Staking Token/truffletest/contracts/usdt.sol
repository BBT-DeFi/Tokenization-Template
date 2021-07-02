pragma solidity ^0.8.6; //SPDX-License-Identifier: UNLICENSED

// import {SafeMath, MathLib} from "./Library_file.sol"; // Solang 0.8 doesn't require SafeMath
interface IERC20 {
    
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);
    
    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);
    
    function approve(address spender, uint256 amount) external returns (bool);
    
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    function getdecimals() external view returns (uint) ;
    event Approval(address indexed tokenOwner, address indexed spender,
        uint tokens);
    event Transfer(address indexed from, address indexed to,
        uint tokens);
    event Transfer(address indexed from, address indexed to, address requester,
        uint256 tokens);
}
//contract ERC20 is IERC20 {
//}

contract USDT is IERC20 {
    event TransferOwnership(address indexed from, address indexed to);
    event Mint(address indexed to, uint256 amount, uint256 newtotalsupply);
    event Burn (address indexed from, uint256 amount, uint newtotalsupply);
    constructor(uint256 total, uint8 _decimals) {
        _totalSupply = total*(10**_decimals);
        balances[msg.sender] = _totalSupply;
        SuperOwner = payable(msg.sender) ;
        name = "USD Tether";
        symbol = "USDT";
        decimals = _decimals;
    }
    modifier onlyOwner() {
        require(msg.sender == SuperOwner, "You're not authorized");
        _;
    }
    modifier validAddress(address receiver){    
        require(receiver == address(receiver),"Invalid address");
        require(receiver != address(0));
        _;
    }
    
    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) allowed;
    
    uint256 _totalSupply;
    address SuperOwner; 
    string public name;                   
    uint8 public decimals;               
    string public symbol;  

    function totalSupply() public view override returns (uint256){
        return _totalSupply;
        //This function will return the number of all tokens allocated 
        //by this contract regardless of owner.
    }
    
    function balanceOf(address tokenOwnerr) public view override returns (uint) {
        return balances[tokenOwnerr];
        //balanceOf will return the current token balance of an account
        //, identified by its owner’s address.
    }
    function getdecimals() public view override returns (uint) {
        return decimals;
    }
    function transfer(address receiver, uint256 numTokens) public validAddress(receiver) override returns (bool) {
        require(numTokens <= balances[msg.sender],"Insufficient balance");
        balances[msg.sender] -= numTokens;
        balances[receiver]   += numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;        
        //delegate's token in their balances will be separated from their quota
        //the transfer function is used to move numTokens amount of tokens from the owner’s balance 
        //to that of another user, or receiver. The transferring owner is msg.sender 
        //i.e. the one executing the function, which implies that only the owner of the tokens can transfer them to others.
    }
    
    function transferOwnership(address oldOwner, address newOwner) public onlyOwner validAddress(newOwner) {
        SuperOwner = newOwner;
        emit TransferOwnership(oldOwner,SuperOwner) ;
        
    }   
    function approve(address delegate, uint256 numTokens) public onlyOwner validAddress(delegate) override returns (bool) {
        //require(msg.sender == SuperOwner , "Don't have permission");
        require(numTokens <= balances[SuperOwner], "not enough token to approve");
        //require(allowed[SuperOwner][delegate] <= balances[SuperOwner] );
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
        //delegate is like marketmaker who doesn't own the coin but have the quota to approve token from superowner to buyer
        //What approve does is to allow an owner i.e. msg.sender to approve a delegate 
        //account, possibly the marketplace itself, to withdraw tokens from his account 
        //and to transfer them to other accounts.
    }
    
    function allowance(address _SuperOwner, address delegate) public view override returns (uint256) {
        return allowed[_SuperOwner][delegate]; 
        //This function returns the current approved number of 
        //tokens by an owner to a specific delegate, as set in the approve function.
    }
    
    function transferFrom(address _SuperOwner, address buyer, uint256 numTokens) public override returns (bool) { 
        require(numTokens <= balances[_SuperOwner]);
        require(numTokens <= allowed[_SuperOwner][msg.sender]);
        allowed[_SuperOwner][msg.sender] -= allowed[_SuperOwner][msg.sender];
        balances[_SuperOwner] -= balances[_SuperOwner];
        balances[buyer] += balances[buyer];
        emit Transfer(_SuperOwner, buyer, msg.sender, numTokens);
        return true;
    }
    
    function mint(/*address account,*/ uint256 amount) public onlyOwner {
        require(amount > 0);
        //require (account == SuperOwner);
        //require(msg.sender == SuperOwner, 'Unauthorized') ;
        balances[msg.sender] += balances[msg.sender];
        _totalSupply +=_totalSupply;
        emit Mint(SuperOwner, amount, _totalSupply);
    }
  
    function burn(/*address account,*/ uint256 amount ) public onlyOwner {
        require (amount > 0);
        //require (msg.sender == SuperOwner, 'Unauthorized' ) ;
        balances[msg.sender] -= balances[msg.sender];
        _totalSupply -= _totalSupply; 
        emit Burn(msg.sender, amount, _totalSupply);
    }  

}
