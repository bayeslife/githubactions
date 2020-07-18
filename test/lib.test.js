import { describe } from 'riteway'

const debug = require('debug')('test')

describe('Some Test', async (assert) => {
  
  assert({
    given: 'something',
    should: 'be successful',
    actual: true,
    expected: true
  })

})

