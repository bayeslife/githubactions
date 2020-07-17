import { Model} from 'real-value-lang'
import ChannelFactory from 'real-value-channel-hypercore'
import { productionGenerator } from './producer' 

export function getSources(model){
    return {
        source_asset: model.from([]),
        source_target: model.from([]),
        source_production: model.from(productionGenerator())
    }
}

function main(){
    const channelFactory = ChannelFactory('/mnt/c/tmp/plog')
    const channel = channelFactory()

    const { Architecture } =  require('../application/application')

    const model = new Model()
        
    const sources = getSources(model)

    const architecture = Architecture()
            .setModel(model)
            .setSources(sources)
        
    architecture.stream_production.toChannel({channel})
        
    model.run()    
}
