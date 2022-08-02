// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "hardhat/console.sol";

contract LoanContract {
    mapping(address => Loan) public borrowers;
    IERC20 token;
    uint public STABLECOIN_TO_ETHER_RATE;
    address public stableCoinHolder;


    event LoanRequest(address borrower, Loan loan);

    struct Loan {
        uint tokenAmount;
        uint interest;
        uint collateral;
        bool active;
    }

    constructor(uint _stable_to_eth_rate, address _tokenAddress){
        STABLECOIN_TO_ETHER_RATE = _stable_to_eth_rate;
        stableCoinHolder = msg.sender;
        token = IERC20(_tokenAddress);
    }

    function requestLoan(address borrower, uint tokenAmount) public payable {
        require(msg.value > 0, "please send valid value");
        Loan storage existLoan = borrowers[borrower];
        uint tokenInWei = tokenAmount * 1 ether;
        require(!existLoan.active, "Please payoff the loan you have with first before you can get another");
        require(msg.value >= tokenAmount / STABLECOIN_TO_ETHER_RATE, "Please your collateral did not meet the minimum requirement for the token amount you want to borrow");
        require(token.balanceOf(address(this)) > tokenInWei, "Insufficient amount of token");
        token.transfer(borrower, tokenInWei );
        uint interest = msg.value * 10 / 100;
        Loan memory newLoan = Loan(tokenAmount, interest, msg.value, true);
        borrowers[borrower] = newLoan;
        emit LoanRequest(borrower, newLoan);
    }

    function repayLoan(address borrower) public payable {
        Loan storage existLoan = borrowers[borrower];
        uint tokenInWei = existLoan.tokenAmount * 1 ether;
        require(existLoan.active, "Seems you have repaid this loan or it does not exist");
        require(token.balanceOf(borrower) >= tokenInWei, "Seems you don't Enough token to repay");
        uint netCollateral = existLoan.collateral - existLoan.interest;
        require(address(this).balance >= netCollateral, "Please we don't have enough funds to dispense please try later");
        token.transferFrom(msg.sender, address(this), tokenInWei);
        payable(borrower).transfer(netCollateral);
        existLoan.active = false;
        existLoan.collateral = 0;
        existLoan.interest = 0;
        existLoan.tokenAmount = 0;
    }

    function sendUserCollateral(address borrower) public payable admin{
        Loan storage existLoan = borrowers[borrower];
        uint amount = existLoan.collateral - existLoan.interest;
        require(address(this).balance >= amount, "Please we don't have enough funds to dispense please try later");
        payable(borrower).transfer(amount);
    }

    modifier admin(){
        require(msg.sender == stableCoinHolder, 'Only admin can access this method');
        _;
    }
}