require('dotenv').config()
var express = require('express');
var router = express.Router();
const axios = require('axios').default;
var {request} = require('graphql-request');
var pairsModel=require('../models/pairs');

function splitdata(data)
{
    var temp=data.split('(');
    var result=temp[1].split(')');
    return result[0];
}
router.route("/addpaircontractandpackageHash").post(async function (req, res, next) {
    try {

		if(!req.body.ContractHash)
		{
			return res.status(400).json({
			success: false,
			message: "There is no contractHash specified in the req body.",
			});
		}
		if(!req.body.PackageHash)
		{
			return res.status(400).json({
			success: false,
			message: "There is no PackageHash specified in the req body.",
			});
		}
		var pairsresult=await pairsModel.findOne({id:"pair"});
		var temp = pairsresult.data;
		temp[req.body.PackageHash] = req.body.ContractHash;

		if(pairsresult==null)
		{
			var newpair = new pairsModel({
				data:temp
			});
	  
			await pairsModel.create(newpair);
		}
		else{
			pairsresult.data=temp;
			await pairsresult.save();
		}
		

		return res.status(200).json({
			success: true,
			message: "Pair's Contract and Package Hash are Succefully stored.",
		});
    
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
});

router.route("/startListener").post(async function (req, res, next) {
    try {

      if(!req.body.contractPackageHashes)
      {
        return res.status(400).json({
          success: false,
          message: "There is no contractPackageHash specified in the req body.",
        });
      }
   
      axios.post('http://localhost:3001/initiateListener', {
        contractPackageHashes: req.body.contractPackageHashes
      })
      .then(function (response) {
        console.log(response);
        return res.status(200).json({
            success: true,
            message: response.data.message,
            status: response.data.status
        });
    
      })
      .catch(function (error) {
        console.log(error);
      });

    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
});

router.route("/geteventsdata").post(async function (req, res, next) {
    try {

      if(!req.body.deployHash)
      {
        return res.status(400).json({
          success: false,
          message: "There is no deployHash specified in the req body.",
        });
      }
	  if(!req.body.timestamp)
      {
        return res.status(400).json({
          success: false,
          message: "There is no timestamp specified in the req body.",
        });
      }
	  if(!req.body.block_hash)
      {
        return res.status(400).json({
          success: false,
          message: "There is no blockHash specified in the req body.",
        });
      }
	  if(!req.body.eventname)
      {
        return res.status(400).json({
          success: false,
          message: "There is no eventname specified in the req body.",
        });
      }
	  if(!req.body.eventdata)
      {
        return res.status(400).json({
          success: false,
          message: "There is no eventdata specified in the req body.",
        });
      }
      
	let newData=req.body.eventdata;
	let deployHash=req.body.deployHash;
	let timestamp=req.body.timestamp;
	let block_hash=req.body.block_hash;
	let eventName=req.body.eventname;
	console.log("... Deployhash: ",  deployHash);
    console.log("... Timestamp: ", timestamp);
    console.log("... Block hash: ", block_hash);
	console.log("Event Data: ",newData);

    if(eventName =="pair_created")
    {
      	console.log(eventName+ " Event result: ");
      	console.log(newData[0][0].data + " = " + newData[0][1].data);
      	console.log(newData[1][0].data + " = " + newData[1][1].data);
      	console.log(newData[2][0].data + " = " + newData[2][1].data);
      	console.log(newData[3][0].data + " = " + newData[3][1].data);
      	console.log(newData[4][0].data + " = " + newData[4][1].data);
      	console.log(newData[5][0].data + " = " + newData[5][1].data);
                          
      	var allpairslength=parseInt(newData[0][1].data);
      	var pair=splitdata(newData[3][1].data);
      	var token0=splitdata(newData[4][1].data);
      	var token1=splitdata(newData[5][1].data);
                          
      	console.log("allpairslength: ", allpairslength);
      	console.log("pair splited: ", pair);
      	console.log("token0 splited: ", token0);
      	console.log("token1 splited: ", token1);
      
      	request(process.env.GRAPHQL,
      		`mutation handleNewPair( $token0: String!, $token1: String!, $pair: String!, $all_pairs_length: Int!, $timeStamp: String!, $blockHash: String!){
      		handleNewPair( token0: $token0, token1: $token1, pair: $pair, all_pairs_length: $all_pairs_length, timeStamp: $timeStamp, blockHash: $blockHash) {
      		result
      		}
                      
      		}`,
      		{token0:token0, token1:token1, pair: pair, all_pairs_length: allpairslength, timeStamp:timestamp.toString(), blockHash:block_hash})
      			.then(data => console.log(data))
      			.catch(error => console.error(error));
    }
    else if(eventName=="approve")
    {
      	console.log(eventName+ " Event result: ");
      	console.log(newData[0][0].data + " = " + newData[0][1].data);
      	console.log(newData[1][0].data + " = " + newData[1][1].data);
      	console.log(newData[2][0].data + " = " + newData[2][1].data);
      	console.log(newData[3][0].data + " = " + newData[3][1].data);
      	console.log(newData[4][0].data + " = " + newData[4][1].data);
    }
    else if(eventName=="erc20_transfer")
    {
      	console.log(eventName+ " Event result: ");
      	console.log(newData[0][0].data + " = " + newData[0][1].data);
      	console.log(newData[1][0].data + " = " + newData[1][1].data);
    
      	console.log(newData[2][0].data + " = " + newData[2][1].data);
      	console.log(newData[3][0].data + " = " + newData[3][1].data);
      	console.log(newData[4][0].data + " = " + newData[4][1].data);
                          
      	var flag=0;
      	var temp=(newData[3][1].data).split('(');
      	console.log("temp[0]: ",temp[0]);
      	if(temp[0] == "Key::Account(")
      	{
      		flag=1;
      	}
      	var from=splitdata(newData[2][1].data);
      	var to=splitdata(newData[3][1].data);
      	var value=parseInt(newData[4][1].data);
      
      	console.log("from: ", from);
      	console.log("to: ", to);
      	console.log("value: ",value);
                          
      	if(flag==0)
      	{
			var pairsresult=await pairsModel.findOne({id:"pair"});
			var to_contractHash=pairsresult.data[to];  
			if(to_contractHash==null)
			{
				console.log("contract hash did not find at this package hash.");
				return;
			}
      		request(process.env.GRAPHQL,
      			`mutation handleTransfer( $from: String!, $to: String!, $value: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
      			handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
      			result
      			}
                              
      			}`,
      			{from:from, to: to, value: value, pairAddress: to_contractHash, deployHash:deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
      			.then(data => console.log(data))
      			.catch(error => console.error(error));
      	}
                          
    }
    else if(eventName=="transfer")
    {
      	console.log(eventName+ " Event result: ");
      	console.log(newData[0][0].data + " = " + newData[0][1].data);
      	console.log(newData[1][0].data + " = " + newData[1][1].data);
      
      	console.log(newData[2][0].data + " = " + newData[2][1].data);
      	console.log(newData[3][0].data + " = " + newData[3][1].data);
      	console.log(newData[4][0].data + " = " + newData[4][1].data);
      	console.log(newData[5][0].data + " = " + newData[5][1].data);
      
      	var from=splitdata(newData[2][1].data);
      	var to=splitdata(newData[4][1].data);
      	var value=parseInt(newData[5][1].data);
      	var pair=splitdata(newData[3][1].data);
      
      	console.log("from: ", from);
      	console.log("to: ", to);
      	console.log("value: ",value);
      	console.log("pair: ", pair);
      
      	request(process.env.GRAPHQL,
      			`mutation handleTransfer( $from: String!, $to: String!, $value: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
      			handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
      			result
      			}
                          
      			}`,
      			{from:from, to: to, value: value, pairAddress: pair, deployHash:deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
      			.then(data => console.log(data))
      			.catch(error => console.error(error));
    }
    else if (eventName=="mint")
    {
      
      	console.log(eventName+ " Event result: ");
      	console.log(newData[0][0].data + " = " + newData[0][1].data);
      	console.log(newData[1][0].data + " = " + newData[1][1].data);
      	console.log(newData[2][0].data + " = " + newData[2][1].data);
      	console.log(newData[3][0].data + " = " + newData[3][1].data);
      	console.log(newData[4][0].data + " = " + newData[4][1].data);
      	console.log(newData[5][0].data + " = " + newData[5][1].data);
      
      	var amount0=parseInt(newData[0][1].data);
      	var amount1=parseInt(newData[1][1].data);
      	var pair=splitdata(newData[4][1].data);
      	var sender=splitdata(newData[5][1].data);
      
      	console.log("amount0: ", amount0);
      	console.log("amount1: ", amount1);
      	console.log("pair: ",pair);
      	console.log("sender: ", sender);
      
      		request(process.env.GRAPHQL,
      			`mutation handleMint( $amount0: Int!, $amount1: Int!, $sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
      			handleMint( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
      				result
      			}
                              
      			}`,
      			{amount0:amount0, amount1: amount1, sender: sender,logIndex:0, pairAddress: pair, deployHash:deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
      				.then(data => console.log(data))
      				.catch(error => console.error(error));
    }
    else if (eventName=="burn")
    {
      
      	console.log(eventName+ " Event result: ");
      	console.log(newData[0][0].data + " = " + newData[0][1].data);
      	console.log(newData[1][0].data + " = " + newData[1][1].data);
      	console.log(newData[2][0].data + " = " + newData[2][1].data);
      	console.log(newData[3][0].data + " = " + newData[3][1].data);
      	console.log(newData[4][0].data + " = " + newData[4][1].data);
      	console.log(newData[5][0].data + " = " + newData[5][1].data);
      	console.log(newData[6][0].data + " = " + newData[6][1].data);
                          
      	var amount0=parseInt(newData[0][1].data);
      	var amount1=parseInt(newData[1][1].data);
        var pair=splitdata(newData[4][1].data);
      	var sender=splitdata(newData[5][1].data);
      	var to=splitdata(newData[6][1].data);
      
      	console.log("amount0: ", amount0);
      	console.log("amount1: ", amount1);
      	console.log("pair: ",pair);
      	console.log("sender: ", sender);
      	console.log("to: ", to);
      
      		request(process.env.GRAPHQL,
      			`mutation handleBurn( $amount0: Int!, $amount1: Int!, $sender: String!,$logIndex: Int!,$to: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
      				handleBurn( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, to:$to, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
      				result
      				}
                              
      				}`,
      			    {amount0:amount0, amount1: amount1, sender: sender,logIndex:0, to:to,pairAddress: pair, deployHash:deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
      					.then(data => console.log(data))
      					.catch(error => console.error(error));
    }
    else if (eventName=="sync")
    {
      
      	console.log(eventName+ " Event result: ");
      	console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
      	console.log(newData[2][0].data + " = " + newData[2][1].data);
      	console.log(newData[3][0].data + " = " + newData[3][1].data);
      	console.log(newData[4][0].data + " = " + newData[4][1].data);
      
      	var reserve0=parseInt(newData[3][1].data);
      	var reserve1=parseInt(newData[4][1].data);
      	var pair=splitdata(newData[2][1].data);
      
      	console.log("reserve0: ", reserve0);
      	console.log("reserve1: ", reserve1);
      	console.log("pair: ",pair);
                          
      
      	    request(process.env.GRAPHQL,
      				`mutation handleSync( $reserve0: Int!, $reserve1: Int!, $pairAddress: String!){
      				handleSync( reserve0: $reserve0, reserve1: $reserve1, pairAddress: $pairAddress) {
      				result
      				}
                          
      				}`,
      				{reserve0:reserve0, reserve1: reserve1, pairAddress: pair})
      				    .then(data => console.log(data))
      				    .catch(error => console.error(error));
    }
    else if (eventName=="swap")
    {
      
      	console.log(eventName+ " Event result: ");
      	console.log(newData[0][0].data + " = " + newData[0][1].data);
      	console.log(newData[1][0].data + " = " + newData[1][1].data);
      	console.log(newData[2][0].data + " = " + newData[2][1].data);
      	console.log(newData[3][0].data + " = " + newData[3][1].data);
      	console.log(newData[4][0].data + " = " + newData[4][1].data);
      	console.log(newData[5][0].data + " = " + newData[5][1].data);
      	console.log(newData[6][0].data + " = " + newData[6][1].data);
      	console.log(newData[7][0].data + " = " + newData[7][1].data);
      	console.log(newData[8][0].data + " = " + newData[8][1].data);
      	console.log(newData[9][0].data + " = " + newData[9][1].data);
      
      	var amount0In=parseInt(newData[0][1].data);
      	var amount1In=parseInt(newData[1][1].data);
      	var amount0Out=parseInt(newData[2][1].data);
      	var amount1Out=parseInt(newData[3][1].data);
        var from=splitdata(newData[6][1].data);
      	var pair=splitdata(newData[7][1].data);
      	var sender=splitdata(newData[8][1].data);
      	var to=splitdata(newData[9][1].data);
      
      	console.log("amount0In: ", amount0In);
      	console.log("amount1In: ", amount1In);
      	console.log("amount0Out: ", amount0Out);
      	console.log("amount1Out: ", amount1Out);
        console.log("from: ",from);
      	console.log("pair: ",pair);
      	console.log("sender: ", sender);
      	console.log("to: ", to);
      
      		request(process.env.GRAPHQL,
      				`mutation handleSwap( $amount0In: Int!, $amount1In: Int!, $amount0Out: Int!, $amount1Out: Int!, $to: String!,$from: String!,$sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
      				handleSwap( amount0In: $amount0In, amount1In: $amount1In, amount0Out: $amount0Out, amount1Out: $amount1Out, to:$to, from:$from,sender: $sender,logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
      					result
      				}
                              
      				}`,
      				{amount0In:amount0In, amount1In: amount1In,amount0Out:amount0Out, amount1Out: amount1Out,to:to,from:from, sender: sender,logIndex:0,pairAddress: pair, deployHash:deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
      				.then(data => console.log(data))
      				.catch(error => console.error(error));
    }				
      
      return res.status(200).json({
        success: true,
        message: "Mutation called according to received event."
      });

    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
});

module.exports = router;
