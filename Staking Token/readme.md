Here is how you can run the program to test its API

1.install all required modules instances mentioned at the beginning of the code in the same path

2.In the terminal, RUN 
  node routesCompleteStaking.js
  
3.test the API request in Postman

Note:
  1.USDC is a proxy contract from Openzeppelin's ERC20 contract. It may have an issue when calling USDC.method.balanceOf().call(), ...transfer(), etc. because it'll call those ERC20 function via proxy. Need to discuss with Mon. Solved by Mon.

  2.Has vulnerability when admin doesn't assign the start date yet, user can still stake. Solved.
  
  3.What if user remove stake before they get reward or after the reward is distrubuted, will they get the reward. Because update reward is derived from the stakes[], If they remove stake, the reward will also be 0 too. Solved.
