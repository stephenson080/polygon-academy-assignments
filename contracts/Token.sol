// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    uint256 private unitsOneEthCanBuy;
    address private tokenOwner;

    constructor(string memory name, string memory symbol, uint qtyForEth, uint mintQty) 
    ERC20(name, symbol) {
        tokenOwner = msg.sender;      
        unitsOneEthCanBuy = qtyForEth;
        // mint the tokens
        mintToken(mintQty);       
    }
    
    function mintToken(uint256 tokenQnty) public checkTokenOwner {
        _mint(tokenOwner, tokenQnty * 10**uint(decimals()));
    }

    receive() external payable {        
        // msg.value (in Wei) is the ether sent to the 
        // token contract
        // msg.sender is the account that sends the ether to the 
        // token contract
        // amount is the token bought by the sender
        uint amount = msg.value * unitsOneEthCanBuy;
        // ensure you have enough tokens to sell
        require(balanceOf(tokenOwner) >= amount, 
            "Not enough tokens");
        // transfer the token to the buyer
        _transfer(tokenOwner, msg.sender, amount);
        // emit an event to inform of the transfer        
        emit Transfer(tokenOwner, msg.sender, amount);
        
        // send the ether earned to the token owner
        payable(tokenOwner).transfer(msg.value);
    }

    function sendUserSomeToken(address to, uint amount, address admin) public payable {
        require(balanceOf(admin) >= amount, 
            "Not enough tokens");
        _transfer(admin, to, amount);
        emit Transfer(admin, to, amount);
    }

    function buyToken() public payable {
        uint amount = msg.value * unitsOneEthCanBuy;
        // ensure you have enough tokens to sell
        require(balanceOf(tokenOwner) >= amount, 
            "Not enough tokens");
        // transfer the token to the buyer
        _transfer(tokenOwner, msg.sender, amount);
        // emit an event to inform of the transfer        
        emit Transfer(tokenOwner, msg.sender, amount);
        
        // send the ether earned to the token owner
        payable(tokenOwner).transfer(msg.value);
    }

    function setUnitsOneEthCanBuy(uint qty) public checkTokenOwner {
        unitsOneEthCanBuy = qty;
    }
    
    function getSummary() public view returns(string memory, string memory, uint, uint ) {
        return (
            name(),
            symbol(),
            totalSupply(),
            unitsOneEthCanBuy
        );
    }

    function getBalance(address user) public view returns(uint){
        return balanceOf(user);
    }

    modifier checkTokenOwner(){
        require(msg.sender == tokenOwner, "Sorry you are not authorised to perform this operation");
        _;
    }
}