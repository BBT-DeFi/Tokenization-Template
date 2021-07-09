require("@nomiclabs/hardhat-web3");

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);

    console.log(web3.utils.fromWei(balance, "ether"), "KUB");
  });

task("BAD", "This task is broken", async () => {
  setTimeout(() => {
    throw new Error(
      "This tasks' action returned a promise that resolved before I was thrown"
    );
  }, 1000);
});

task("delayed-hello", "Prints 'Hello, World!' after a second", async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Hello, World!");
      resolve();
    }, 1000);
  });
});

task("hello", "Prints 'Hello' multiple times")
  .addOptionalParam(
    "times",
    "The number of times to print 'Hello'",
    1,
    types.int
  )
  .setAction(async ({ times }) => {
    for (let i = 0; i < times; i++) {
      console.log("Hello");
    }
  });

task("hello-world", "Prints a hello world message").setAction(async () => {
  await run("print", { message: "Hello, World!" });
  await run("broadcast", { text1: "TEST1", text2: "TEST2" });
});

subtask("print", "Prints a message")
  .addParam("message", "The message to print")
  .setAction(async (taskArgs) => {
    console.log(taskArgs.message);
  });

subtask("broadcast", "Broadcast message")
  .addParam("text1", "The message to print")
  .setAction(async (taskArgs) => {
    console.log(taskArgs.text1, taskArgs.text2);
  });

module.exports = {};
