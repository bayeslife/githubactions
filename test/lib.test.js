import { describe } from 'riteway'

const debug = require('debug')('test')

import {Architecture} from '../src/application/application'

let architecture = Architecture().produceViewState({})

describe('State Tests', async (assert) => {
  
  architecture.actions.incrementProduction({production: 100})
  architecture.actions.incrementProduction({production: 10})

  assert({
    given: 'some production',
    should: 'the cumulative production should be correct',
    actual: `${architecture.state.cumulativeProduction} ${architecture.xfilter.allFiltered().length}`,
    expected: '110 2'
  })

})

