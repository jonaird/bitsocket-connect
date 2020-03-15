const EventSource = require('eventsource');

var socket;


exports.close = function () {
    if (socket) {
        socket.close();
    }
}
exports.connect = function (query, processFunction) {
    const b64 = Buffer.from(JSON.stringify(query)).toString("base64")
    var processing = false;
    var lastEventId;
    var queue = [];


    async function drainQueue() {
        processing = true;
        let n = 0
        for (i = 0; i < queue.length; i++) {
            if (processFunction.constructor.name == 'AsyncFunction') {
                await processFunction(queue[i])
            } else {
                processFunction(queue[i]);
            }
            n++
        }
        while (n > 0) {
            queue.shift();
            n--
        }

        if (queue.length > 0) {
            drainQueue();
        } else {
            processing = false;
        }
    }

    function reopenSocket() {
        socket.close();
        openSocket(true);
    }

    function openSocket(useLastEventId) {
        if (useLastEventId && lastEventId) {
            socket = new EventSource('https://txo.bitsocket.network/s/' + b64, { headers: { "Last-Event-Id": lastEventId } })
        } else {
            socket = new EventSource('https://txo.bitsocket.network/s/' + b64)
        }
        socket.onmessage = function (e) {
            lastEventId = e.lastEventId;
            d = JSON.parse(e.data);
            if (d.type != 'open') {
                d.data.forEach(tx => {
                    queue.push(tx);
                });
            }
            if (!processing && queue.length > 0) {
                drainQueue();
            }
        }

    }
    openSocket();

    setInterval(() => {
        reopenSocket();
    }, 3600000);



}