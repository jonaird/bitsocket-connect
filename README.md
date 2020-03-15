# bitsocket-connect
 A plug and play [Bitsocket](https://bitsocket.network/#/) connection for Nodejs.
 
## Install

`npm i --save bitsocket-connect`

## Usage

bitsocket-connect includes 2 functions to interface with Bitsocket, connect and close:

### connect(query, process)

query: A [TXO](https://medium.com/@_unwriter/txo-2-0-fee049bc6795) query used to filter new transactions.   
process: A function that is called individually on each incoming transaction from Bitsocket and is passed the transaction as a parameter. Can be synchronous or async but if it is async be sure to return a promise that resolves when done processing the transaction to ensure all transactions are processed in the correct order.

example:
```
const bitsocket = require('bitsocket-connect');
const query = { "v": 3, "q": { "find": {} } };

bitsocket.connect(query, function(tx){
 console.log(tx)
 });
```

## Reliability

Since websockets can sometimes be unreliable, bitsocket-connect automatically reopens the websocket every hour and uses Last-Event-Id to ensure that no transactions are lost. 

Have fun!


