function Window (interval, clock) {
    this.clock = clock
    this.interval = interval
    this.count = 0
    this.sum = 0
    this.head = { head: true, value: null }
    this.head.next = this.head.previous = this.head
}

Window.prototype.sample = function (value) {
    this.count++
    this.sum += value
    var node = {
        when: this.clock(),
        value: value,
        next: this.head.next,
        previous: this.head
    }
    node.previous.next = node
    node.next.previous = node
    var node
    while (node.when - this.head.previous.when > this.interval)  {
        node = this.head.previous
        this.head.previous = node.previous
        this.head.previous.next = this.head
        this.count--
        this.sum -= node.value
    }
}


Window.prototype.calculate = function () {
    return { average: this.count == 0 ? null : this.sum / this.count }
}

function Assessment (options) {
    options || (options = {})
    options.intervals || (options.intervals = [ 60000 ])
    options.clock || (options.clock = function () { return Date.now() })
    this.windows = options.intervals.map(function (interval) {
        return new Window(interval, options.clock)
    })

}

Assessment.prototype.sample = function (value) {
    var windows = this.windows
    for (var i = 0, I = windows.length; i < I; i++) {
        windows[i].sample(value)
    }
}

Assessment.prototype.calculate = function () {
    var intervals = {}
    this.windows.forEach(function (window) {
        intervals[window.interval] = window.calculate()
    })
    return intervals
}

module.exports = Assessment
