require('proof')(3, prove)

function prove (assert) {
    var Assessment = require('../..')
    new Assessment().sample(0)
    var time = 1
    var assessment = new Assessment({
        empty: 0,
        intervals: [ 6000 ],
        Date: { now: function () { return time++ } }
    })
    assert(assessment.summarize(),  { '6000': { mean: 0, min: 0, max: 0 } }, 'null')
    assessment.sample(1)
    assessment.sample(2)
    assessment.sample(3)
    assert(assessment.summarize(), { '6000': { mean: 2, min: 1, max: 3 } }, 'summarize')
    time = 6002
    assessment.sample(4)
    assert(assessment.summarize(), { '6000': { mean: 3, min: 2, max: 4 } }, 'shift')
}
