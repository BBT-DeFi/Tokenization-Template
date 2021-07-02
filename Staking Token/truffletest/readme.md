bug found:
1.If user remove stake before admin set the dividend, their reward will be zero.
  
  solved by either one of these two options:
  
    Done 1.require that dividendIn100Scale has changed once. create new variable of tracking the change of dividend.
    
    Unused 2.require that dividendIn100Scale >= 0. But this has a flaw that sometimes, dividend can be 0 too.



Test cases (feel free to add if you have any new test case.

1.user can’t stake in staking period and remove stake before removal date.

1.1.user can’t  withdraw or distribute before withdrawal date.

2.users can’t access the only owner function

3.Distribute allowances, users will get the correct amount of reward

4.after input dividend percent, rewards of all users must change.

5.before distributeReward and withdraw reward, the priceinput and dividend must be there.

6.what if user stake when the admin hasn’t. Assign the dividend rate yet. >> error, can’t stake >> solve by not requiring calculateReward “admin hasn’t add dividend yet”

7.


