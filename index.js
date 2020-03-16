const EventSource = require('eventsource');
const {sleep, SelfDrainingQueue} = require('./utils.js');

var socket;
var lastEventId=null;
var latestTxMatch= null;
var interval;


exports.close = function () {
    if (socket) {
        socket.close();
    }
    if(interval){
        clearInterval(interval);
        interval=null;
    }
    
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
    var queue = new SelfDrainingQueue(process);

    

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
        }

    }
    
    openSocket(leid);

    interval = setInterval(() => {
        reopenSocket();
    }, 3600000);



}