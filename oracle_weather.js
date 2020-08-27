const Web3 = require("web3");
const rpcUrl = "wss://ropsten.infura.io/ws/v3/0235d2e3ae2b4919853b6383db54453a";
const web3 = new Web3(new Web3.providers.WebsocketProvider(rpcUrl));
const privateKey = "0x721e88bbeacab8286d96922f189199279ef68a0743220de1c075520f9ac28a18"; // Private Key to sign transactions with.
const account = web3.eth.accounts.privateKeyToAccount(privateKey); // account associated with private key
const fetch = require('node-fetch'); //To fetch APIs
const signedTxs = [];

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
		"constant": false,
		"inputs": [
			{
				"name": "_number",
				"type": "uint256"
			}
		],
		"name": "setEventNumber",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "number",
				"type": "uint256"
			}
		],
		"name": "Set",
		"type": "event"
	}
]

/* Contract */
const contractAddress = "0xA0DC23532B5534349F43eCE1E5D35c4d26F14677";
const sampleContract = new web3.eth.Contract(abi, contractAddress);

/* OpenWeatherMap API */
const API_key = "1bce01f3b4289f87ba2ccc2682742bc6";
const location = "Tokyo,jp"
const OpenWeatherMap = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&units=metric&appid=" + API_key;

async function main() {
	let weatherReq = await fetch(OpenWeatherMap);
	let weatherInfo = await weatherReq.json();
	let temperature = await (weatherInfo.main.temp);

	await sendTx(sampleContract.methods.setEventNumber(123));
	
	sampleContract.methods.getNumber().call({from: account.address}, function (err, res) {
		console.log('@@ getNumber');
		console.log(`@@ err: ${err}`);
		console.log(`@@ res: ${res}`)
	});

	console.log("@@ temperature: ", temperature);
}

async function sendTx(txObject) {
  const txTo = contractAddress;
  const txData = txObject.encodeABI();
  const txFrom = account.address;
  const txKey = account.privateKey;
	const gasPrice = (5*(10**9));
	const gasLimit = await txObject.estimateGas();
	
  const tx = {
    from : txFrom,
    to : txTo,
    data : txData,
    gas : gasLimit, gasPrice
  };

	const signedTx = await web3.eth.accounts.signTransaction(tx, txKey);
	
  signedTxs.push(signedTx.rawTransaction)

	web3.eth.sendSignedTransaction(signedTx.rawTransaction, {from: account})
	.on('receipt', function(receipt) {
		console.log('@@ receipt:');
		console.dir(receipt);
	})
	.on('error', console.error);
}

sampleContract.events.Set({}, function(err, event) {
	console.log(`@@ err: ${err}`);
	console.log('@@ event:');
	console.dir(event);
}).on("data", function (event) {
	let data = event.returnValues;
	console.log('--- watching "Set" event! ---');
	console.log(data);
	// main();
}).on("error", console.error);

main();