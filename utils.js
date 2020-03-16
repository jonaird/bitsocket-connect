var Queue = function(){
    this._storage = [];
};

Queue.prototype.enqueue = function(data) {
    this._storage.push(data);
};

Queue.prototype.dequeue = function(){
    var item = this._storage[0];
    this._storage.shift();
    return item;
};
Queue.prototype.getLength = function(){
    return this._storage.length;
};

exports.Queue= Queue;
exports.sleep = async function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

