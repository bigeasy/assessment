var RBTree = require('bintrees').RBTree

function compare (a, b) {
    return a.value - b.value || a.index - b.index
}

function Window (interval, options) {
    this.index = 0
    this.interval = interval
    this.count = 0
    this.Date = options.Date || Date
    this.empty = ('empty' in options) ? options.empty : null
    this.tree = new RBTree(compare)
    this.sum = 0
    this.head = { head: true, value: null }
    this.head.next = this.head.previous = this.head
}

Window.prototype.sample = function (value) {
    this.count++
    this.sum += value
    var node = {
        when: this.Date.now(),
        value: value,
        index: this.index++,
        next: this.head.next,
        previous: this.head
    }
    node.previous.next = node
    node.next.previous = node
    this.tree.insert(node)
    var node
    while (node.when - this.head.previous.when > this.interval)  {
        node = this.head.previous
        this.head.previous = node.previous
        this.head.previous.next = this.head
        this.count--
        this.sum -= node.value
        this.tree.remove(node)
    }
}


Window.prototype.summarize = function () {
    if (this.count == 0) {
        return {
            mean: this.empty,
            min: this.empty,
            max: this.empty
        }
    } else {
        return {
            mean: this.sum / this.count,
            min: this.tree.min().value,
            max: this.tree.max().value
        }
    }
}

function Assessment (options) {
    options || (options = {})
    this.windows = (options.intervals || [ 60000 ]).map(function (interval) {
        return new Window(interval, options)
    })

}

Assessment.prototype.sample = function (value) {
    var windows = this.windows
    for (var i = 0, I = windows.length; i < I; i++) {
        windows[i].sample(value)
    }
}

Assessment.prototype.summarize = function () {
    var intervals = {}
    for (var i = 0, I = this.windows.length; i < I; i++) {
        intervals[this.windows[i].interval] = this.windows[i].summarize()
    }
    return intervals
}

module.exports = Assessment
