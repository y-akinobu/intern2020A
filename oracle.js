const Web3 = require("web3");
const rpcUrl = "https://ropsten.infura.io/v3/0235d2e3ae2b4919853b6383db54453a"; //The url which links you to the ethereum network - Ropsten in this case.
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
const privateKey = "0x721e88bbeacab8286d96922f189199279ef68a0743220de1c075520f9ac28a18"; //Private Key to sign transactions with.
const account = web3.eth.accounts.privateKeyToAccount(privateKey); //account associated with private key
const fetch = require('node-fetch'); //To fetch APIs
const signedTxs = [];
let nonce;

//contract abi - the below is for the sample contract.
const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "setNumber",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getNumber",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "number",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0x7147B5b40dE493c024CE9c327832e0cFc2f67D4B";
const sampleContract = new web3.eth.Contract(abi, contractAddress);


//Example Oracle sets number from the api below - gas price on mainnet.
async function main() {

  let gasReq = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
  let gasInfo = await gasReq.json();
  let gasAvg = await (gasInfo.average);

  //sets input for setNumber function as gasAvg.
	//Makes this into an object of the sendTx function (below) and triggers that function.
  await sendTx(sampleContract.methods.setNumber(gasAvg));

	//print average gas price in console
	console.log("Avg gas price",gasAvg);
}

//function sending the transaction from our configured wallet (the private key we provided)
async function sendTx(txObject) {
  const txTo = contractAddress;
  const txData = txObject.encodeABI(); //txObject was set in main funtion
  const txFrom = account.address;
  const txKey = account.privateKey;
  const gasPrice = (5*(10**9)); //5 gwei gas price
  const gasLimit = await txObject.estimateGas(); //estimated gas cost of trnsaction

  const tx = {
    from : txFrom,
    to : txTo,
    nonce : nonce,
    data : txData,
    gas : gasLimit, gasPrice
  };

  //sign the transaction
  const signedTx = await web3.eth.accounts.signTransaction(tx, txKey);
  nonce++;

  // push transaction - dont wait for confirmations just wait till broadcasted
  signedTxs.push(signedTx.rawTransaction)

	//send transaction
  web3.eth.sendSignedTransaction(signedTx.rawTransaction, {from:account});
}

main();
