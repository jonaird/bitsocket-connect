const EventSource = require('eventsource');
const {sleep, Queue} = require('./utils.js');

var socket;
var lastEventId=null;
var latestTxMatch= null;


exports.close = function () {
    if (socket) {
        socket.close();
    }
    clearInterval();
    socket = null;
    latestTxMatch=null;
    var leid = lastEventId;
    lastEventId=null;
    
    return leid;
    
}

exports.getLatest= async function(){
    return new Promise(async resolve=>{
        if(socket&&latestTxMatch){
            resolve(latestTxMatch);
        } else if(socket&&!latestTxMatch){
            while(!latestTxMatch){
               await sleep(1000);
            }
            resolve(latestTxMatch);
        }else{
            resolve(null);
        }
    })
    
}

exports.connect = function (query, process, leid) {
    const b64 = Buffer.from(JSON.stringify(query)).toString("base64")
    var draining = false;

    var queue = new Queue();


    async function drainQueue() {
        draining = true;
        
        while(queue.getLength()>0){
            if (process.constructor.name == 'AsyncFunction') {
                var tx = queue.dequeue();
                await process(tx)
            } else {
                var tx = queue.dequeue();
                process(tx);
            }
        }
        draining = false;
    }

    function reopenSocket() {
        socket.close();
        openSocket(lastEventId);
    }

    function openSocket(leid) {
        if (leid) {
            socket = new EventSource('https://txo.bitsocket.network/s/' + b64, { headers: { "Last-Event-Id": leid } })
        }
        else {
            socket = new EventSource('https://txo.bitsocket.network/s/' + b64)
        }
        socket.onmessage = function (e) {
           
            lastEventId = e.lastEventId;
            d = JSON.parse(e.data);
            if (d.type != 'open') {
                d.data.forEach(tx => {
                    if(!latestTxMatch){
                        latestTxMatch=tx;
                    }else{
                        queue.enqueue(tx);
                    }
                    
                });
            }
            if (!draining) {
                drainQueue();
            }
        }

    }
    openSocket();

    setInterval(() => {
        reopenSocket();
    }, 3600000);



}