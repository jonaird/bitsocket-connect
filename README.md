# bitsocket-connect
 A plug and play [Bitsocket](https://bitsocket.network/#/) connection for Nodejs and browser.
 
## Install

`npm i --save bitsocket-connect`

in the browser include the following script tag in your document header:

`<script type="text/javascript" src='https://x.bitfs.network/58e08db775da80c45f82ec4c28204aa228140c32c2d1aaa8b5911e5b8d57f9f5.out.0.3'/>`

## Usage

bitsocket-connect includes 3 functions to interface with Bitsocket; connect, getLatest, and close:

### connect(query, process, (optional) lastEventId)

**query**: A [TXO](https://medium.com/@_unwriter/txo-2-0-fee049bc6795) query used to filter new transactions.   
**process**: A function that is called individually on each incoming transaction from Bitsocket and is passed the transaction as a parameter. Can be synchronous or async but if it is async be sure to return a promise that resolves when done processing the transaction to ensure all transactions are processed in the correct order.   
**lastEventId**: Use the Last-Event-Id from close() to reopen a Bitsocket from where you left off.

example:
```
const bitsocket = require('bitsocket-connect');
const query = { "v": 3, "q": { "find": {} } };

bitsocket.connect(query, function(tx){
 console.log(tx)
 });
```


### close()
Closes the Bitsocket and returns the Last-Event-Id in case you would like to reopen the socket or null if there is none.

### getLatest()
An async function that gets the latest transaction matching your query that was received by the Bitcoin network **before** opening the Bitsocket. This can either be a confirmed or unconfirmed transaction.   

example:   
`bitsocket.getLatest().then(latest=>console.log(latest));`

## Reliability

Since websockets can sometimes be unreliable, bitsocket-connect automatically reopens the websocket every hour and uses Last-Event-Id to ensure that no transactions are lost. If your Bitsocket is not open, it returns null.

Have fun!


