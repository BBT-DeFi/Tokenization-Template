Here is how you can run the program to test its API

1.install all required modules instances mentioned at the beginning of the code in the same path

2.In the terminal, RUN 
  node routesCompleteStaking.js
  
3.test the API request in Postman

Note:
1.USDC is a proxy contract from Openzeppelin's ERC20 contract. It may have an issue when calling USDC.method.balanceOf().call() because it'll call those ERC20 function via proxy. Need to discuss with Mon.
