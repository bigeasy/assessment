var RBTree = require('bintrees').RBTree
var logger = require('prolific').createLogger('bigeasy.assessment')

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
    this.median = null
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
    if (this.count == 1) {
        this.median = node
    } else {
        var odd = this.count % 2 == 0 // before addition
        var distance = compare(node, this.median)
        try {
            if (odd && distance < 0) {
                this.median = this.tree.findIter(this.median).prev()
            } else if (!odd && distance > 0) {
                this.median = this.tree.findIter(this.median).next()
            }
        } catch (e) {
            var median = this.median ? {
                when: this.median.when,
                value: this.median.value,
                index: this.median.index
            } : null
            logger.error('window.median', {
                median: median,
                node: {
                    when: node.when,
                    value: node.value,
                    index: node.index
                },
                count: this.count,
                index: this.index
            })
            throw e
        }
    }
    var node
    while (node.when - this.head.previous.when > this.interval)  {
        node = this.head.previous
        var odd = this.count % 2 == 1
        var distance = compare(node, this.median)
        if (odd && distance >= 0) {
            this.median = this.tree.findIter(this.median).prev()
        } else if (!odd && distance <= 0) {
            this.median = this.tree.findIter(this.median).next()
        }
        this.head.previous = node.previous
        this.head.previous.next = this.head
        this.count--
        this.sum -= node.value
        this.tree.remove(node)
        if (this.tree.find(this.median) == null) {
            var median = this.median ? {
                when: this.median.when,
                value: this.median.value,
                index: this.median.index
            } : null
            logger.error('window.remove', {
                median: median,
                node: {
                    when: node.when,
                    value: node.value,
                    index: node.index
                },
                count: this.count,
                index: this.index
            })
        }
    }
}


Window.prototype.summarize = function () {
    if (this.count == 0) {
        return {
            mean: this.empty,
            median: this.empty,
            min: this.empty,
            max: this.empty
        }
    } else {
        return {
            mean: this.sum / this.count,
            median: this.median.value,
            min: this.tree.min().value,
            max: this.tree.max().value
        }
    }
}

function Assessment (options) {
    logger.info('construct')
    options || (options = {})
    this.options = options || options || {}
    this.options.intervals = options.intervals || [ 60000 ]
    this.initialize()
}

Assessment.prototype.initialize = function () {
    var options = this.options
    this.windows = this.options.intervals.map(function (interval) {
        return new Window(interval, options)
    })
}

Assessment.prototype.sample = function (value) {
    try {
        var windows = this.windows
        for (var i = 0, I = windows.length; i < I; i++) {
            windows[i].sample(value)
        }
    } catch (e) {
        logger.error('assessment.sample', { stack: e.stack })
        this.initialize()
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
