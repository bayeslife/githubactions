import { describe } from 'riteway'
import Debug from 'debug'
import {Model}  from 'real-value-lang'
import { autorun} from 'mobx'
import {Architecture} from '../src/application/application'
let debug = Debug('test')

function provisionSystem(model,citec,corvus,wenco){

  return Architecture()
    .setModel(model)
    .setSources({source_production: citec, source_target: corvus, source_asset: wenco})
    .produceControl()
    .produceViewState()
    .produceDisplay()
}

describe('Scenarios', async (assert) => { 
  let scenarios = [
    {
      given:{
        description: '2 production events',
        citec: [{production: 1,measure: 'stockpile1',asset: 'Truck1',time: 0},{production: 1,measure: 'stockpile1',asset: 'Track2',time: 1}],
        corvus: [],
        wenco: [],
      },
      expect: {
        cumulativeProduction: 2,
        productionCacheLength: 2
      }
    },
    {
      given:{
        description: '2 target events',
        citec: [],
        corvus: [{target: 100,measure: 'stockpile1',time: 0},{target: 100,measure: 'stockpile2',time: 1}],
        wenco: [],
      },
      expect: {
        cumulativeProduction: 0,
        productionCacheLength: 0
      }
    },
    {
      given:{
        description: '2 asset events',
        citec: [],
        corvus: [],
        wenco: [{status: 'on',asset: 'digger-1', time: 0},{status: 'off',asset: 'digger-1', time: 1}],
      },
      expect: {
        cumulativeProduction: 0,
        productionCacheLength: 0
      }
    }
  ]
  for(let i=0;i<scenarios.length;i++) {
      let scenario = scenarios[i]
      let model = Model()
      //Test Data Source Streams
      let citec = model.from(scenario.given.citec)
      let corvus = model.from(scenario.given.corvus)
      let wenco = model.from(scenario.given.wenco)

      //Under test
      let architecture = provisionSystem(model,citec,corvus,wenco) 
      
      let cumulativeProduction = 0
      let productionCacheLength = 0
      autorun(()=>{
        cumulativeProduction = architecture.state.cumulativeProduction
        productionCacheLength = architecture.state.productionCache.length
      })
      
      model.run(()=>{
        debug('Done and verify')
        assert({
          given: scenario.given.description,
          should: 'update display state correctly',
          actual: `${cumulativeProduction} ${productionCacheLength}`, 
          expected: `${scenario.expect.cumulativeProduction} ${scenario.expect.productionCacheLength}`
        })
      })
  }
})
