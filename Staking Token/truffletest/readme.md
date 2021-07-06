Bug found:

1.If user remove stake before admin set the dividend, their reward will be zero.
  
  solved by either one of these two options:
  
    Done 1.require that dividendIn100Scale has changed once. create new variable of tracking the change of dividend >> dividendChange ==true when inputDividend.
    
    Unused 2.require that dividendIn100Scale >= 0. But this has a flaw that sometimes, dividend can be 0 too.
    
2. admin can not inputdividend percent =0 
    
  solved by taking the requirement out.
  
3.//to reset the dividend change >> 

  admin must put the dividend ratio every payment round, otherwise users can not remove their stake.
        
        added dividendChange = false; every time admin distribute reward
  
  admin can remove users' stakes by distributeReward.
        
        



Test cases (feel free to add if you have any new test case.

-1.user can’t stake in staking period and remove stake before removal date.

-1.1.user can’t  withdraw or distribute before withdrawal date.

-2.users can’t access the only owner function

-3.Distribute allowances, users will get the correct amount of reward

-4.after input dividend percent, rewards of all users must change.

-5.before distributeReward and withdraw reward, the priceinput and dividend must be there.

***6.what if user stake when the admin hasn’t assigned the dividend rate yet. >> error, can’t stake >> solve by not requiring calculateReward “admin hasn’t add dividend yet” 

-7.distribute reward doesn't distribute to the second stakeholder >> solved on 1 July by using the boolean mapping "isStaking" to collect which stakeholders are active but not pop out the stakeholder in the array. Beware, adding "isStaking" change its relative function so you have to change other function too.

-8.before transfer need to check the validity of the destination address.

9.remember to change staking period to days in production.*** Later when deploy

-10.addstake needs to use transferFrom because the user’s balances have to change, not the admin balances.

-11.calculateRewardToStableCoin uses stake, so when distributing the reward, it retrieve 0. Solution is to set reward = rewards[stakeholder] and dividend = dividends[stakeholder] to collect the previous state of reward and dividend (not re-calculate it because it will reset the reward to 0);
By not recalculate but use the 

-12.change calculateReward and calculateRewardStableCoin func to internal to be used by other function only.

-13. In web3 msg.sender has to be admin, but the interface will lure the user that they are the sender (actually they’re not). refer to steps below
    1. When User send API, admin send transaction using web3 >> “data” : contract.methods.approve(address(this), stakeAmount); 
        1. The problem is admin is the msg.sender but we need the msg.sender to be user who approve. At the same time, admin has to be msg.sender to pay the gas fee.

-14. Multi transfer has overflow.

-15.every time you setDividendrate, reward and dividend must change accordingly.

-16.when user remove stake, they don’t get the dividend because the stakeholder array got pop out >> solved by adding “isStaking ” boolean to track which users are active.

***17.(same as No.6) When user remove stake before the dividend was set (this problem will occur in 3rd yr.) >> solved by using bool dividendChange to track and not letting user withdraw before dividend is set (need more discussion)
 
-18. User with enough amount of cwt can stake instead of the owner himself
-18.2 user with enough staking can remove stake instead of the owner himself.

-19.when distributingReward() >> “ERC20: transfer amount exceeds balance” but didn’t occur when withdrawReward()

***21.Beware when the admin set dividend ()

	1.web3 must pass 400 to solidity not 4 because that will be 0.04%
	2.if admin pass 4.94932 to web3
	3. ...
  
-22.check if the reward >0 before removeStake in the distributeReward() and withdrawReward() 

Note: three types of editing 
1.//new one
2.//old one.
3.consider



