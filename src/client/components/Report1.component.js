import React  from 'react';

import { autorun }  from 'mobx'
import { RVGaugeControl } from 'real-value-react-gauge-component'
import { LineChart } from 'real-value-react-line-chart'
import { LabelStyle} from './style'
import {CrossFilterControls} from 'real-value-react-cross-filter'
import { Table } from '@aurecon/design'
import { observer} from 'mobx-react'

const LineChartView = observer(({ architecture }) => {
  if(architecture.state.productionLineChart.length){}///why is this necessary
  return <LineChart data={architecture.state.productionLineChart} />
})

const CumProdView = observer(({ architecture }) => {
  return <div>{architecture.state.cumulativeProduction}</div>
})

const CrossFilterView = observer(({ architecture }) => {
  if(architecture.state.productionCache.length){}///why is this necessary
  return <CrossFilterControls data={architecture.state.productionCache} dimensions={architecture.xdimensions}/>
})

const TableView = observer(({ architecture }) => {
  //if(architecture.state.productionCache.length){}///why is this necessary
  return <Table  
            isPaged={false}
            rows={architecture.state.productionCache}
            headers={[{ name: 'Asset', key: 'asset' },{ name: 'Production', key: 'production' }]} 
  />
})


export const Report1 = (props) => {

    const { architecture } = props

    let disposer = null
    const subscribe = (callback)=>{
        disposer = autorun(()=>{
          callback(architecture.state.production)
        })
      }
    const unsubscribe = ()=>{
        if(disposer) disposer()
    }

    return (<div className='row'>
                <div className='column' style={{ width: '70%', float: 'left' }}>
                    <div>
                        <table width="100%" border="1">
                        <tbody>
                        <tr>
                              <td colSpan="2"><h1>Current State</h1></td>
                        </tr>  
                        <tr>
                            <td width="25%"><label style={{ ...LabelStyle }}>Cumulative Production:</label><CumProdView architecture={architecture}/></td>
                            <td width="75%"><RVGaugeControl name="Production" initial="1" subscribe={subscribe} unsubscribe={unsubscribe} control={architecture.controlProducer} /></td>
                        </tr>
                        <tr>
                              <td colSpan="2"><h1>Historical State</h1> <CrossFilterView architecture={architecture}/></td>
                        </tr>
                        <tr>
                              <td><LineChartView architecture={architecture}/></td>
                              <td><TableView architecture={architecture}/></td>
                        </tr>
                        </tbody>
                        </table>
                </div>
            </div>
        </div>)
}