require('proof')(5, prove)

function prove (okay) {
    var Assessment = require('..')
    new Assessment().sample(0)
    var time = 1
    var assessment = new Assessment({
        empty: 0,
        intervals: [ 6000 ],
        Date: { now: function () { return time++ } }
    })
    okay(assessment.summarize(),  { '6000': { mean: 0, median: 0, min: 0, max: 0 } }, 'null')
    assessment.sample(1)
    assessment.sample(2)
    assessment.sample(3)
    okay(assessment.summarize(), { '6000': { mean: 2, median: 2, min: 1, max: 3 } }, 'summarize')
    time = 6002
    assessment.sample(4)
    okay(assessment.summarize(), { '6000': { mean: 3, median: 3, min: 2, max: 4 } }, 'shift')
    assessment.sample(1)
    okay(assessment.summarize(), {
        '6000': { mean: 2.6666666666666665, median: 3, min: 1, max: 4 }
    }, 'median add odd')
    time = 12003
    assessment.sample(4)
    assessment.sample(3)
    assessment.sample(2)
    assessment.sample(1)
    okay(assessment.summarize(), {
        '6000': { mean: 2.5, median: 2, min: 1, max: 4 }
    }, 'median remove even')
    time = 18004
    assessment.sample(0)
    assessment.sample(6)
    assessment.sample(5)
    assessment.sample(4)
    assessment.sample(3)
    assessment.sample(2)
    assessment.sample(1)
}
