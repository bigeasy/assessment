require('proof')(3, prove)

function prove (assert) {
    var Assessment = require('../..')
    new Assessment().sample(0)
    var time = 1
    var assessment = new Assessment({ intervals: [ 6000 ], clock: function () { return time ++ } })
    assert(assessment.calculate(),  { '6000': { average: null } }, 'null')
    assessment.sample(1)
    assessment.sample(2)
    assessment.sample(3)
    assert(assessment.calculate(), { '6000': { average: 2 } }, 'calculate')
    time = 6002
    assessment.sample(4)
    assert(assessment.calculate(), { '6000': { average: 3 } }, 'shift')
}
