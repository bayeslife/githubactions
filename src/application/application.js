import Debug from 'debug'
import { observable}  from 'mobx'
import  crossfilter2 from 'crossfilter2'

let debug=Debug('app')

export function Architecture(){

    const architecture = {

        setModel: (model)=>{
            architecture.model = model
            return architecture
        },

        setSources: ({ source_target, source_production, source_asset})=>{
            debug('Setup stream production')
            architecture.stream_asset= source_asset.filter(x=>x).map(x=>x)
            architecture.stream_production= source_production.filter(x=>x).map(x=>x)
            architecture.stream_target= source_target.filter(x=>x).map(x=>x)
            return architecture
        },

        setStreams: (streams)=>{
            debug('Dependency injects data streams')
            architecture.stream_asset = streams.stream_asset
            architecture.stream_production = streams.stream_production
            architecture.stream_target = streams.stream_target
            return architecture
        },

        produceDisplay: ()=>{
            architecture.displayStream = architecture.stream_production
                //.join(stream_target)
                //.join(stream_asset)
                .map(x=>x)
                .tap(x=>{
                    architecture.actions.incrementProduction(x)
                })
            return architecture
        },

        produceViewState:()=>{
            debug('Setup view state')
            architecture.xfilter = crossfilter2([])
            let assetDimension = architecture.xfilter.dimension(function(d) { return d.asset })
            let assetGroup = assetDimension.group()
            architecture.xdimensions =[
                {
                    dimension: assetDimension,
                    group: assetGroup,
                    select: (value)=> {
                        value ? assetDimension.filter(value) : assetDimension.filterAll()
                        architecture.actions.update()
                    }
            }]
            
            architecture.state = observable.object({
                production: 0,
                cumulativeProduction: 0,
                productionCache: [],
                productionLineChart: []
            })
        
            let productionCount =0
            architecture.actions = {
                update(){
                    architecture.state.productionCache = architecture.xfilter.allFiltered()
                    architecture.state.productionLineChart = architecture.xfilter.allFiltered().map(p=>({name: p.index, value: p.production }))
                },
                incrementProduction(production){
                    productionCount++
                    architecture.xfilter.remove((i)=>i.index<(productionCount-100))//only keep last n production values
                    let entry ={index: productionCount,...production}//indexable xfilter entry
                    debug(entry)
                    architecture.xfilter.add([entry])
        
                    architecture.state.cumulativeProduction = architecture.state.cumulativeProduction + production.production
                    architecture.state.production = production.production
                    architecture.actions.update()
                }
            }
        
            return architecture
        },
        
        produceControl:()=>{
            debug('Setup control stream')
            let { stream: controlStream, producer: controlProducer } = architecture.model.fromCallback()
            architecture.controlStream = controlStream
            architecture.producer = controlProducer
            return architecture
        },
    }

    return architecture
}







