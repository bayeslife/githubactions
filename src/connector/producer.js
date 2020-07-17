import Debug from 'debug'
const debug = Debug('production')

export async function* productionGenerator(){
    let cnt=0
    while(true){
        cnt++
        await new Promise((resolve)=>setTimeout(resolve,5000))
        let production = { production: parseInt(Math.random()*10), asset: `Truck${cnt%5}`}
        debug(production)
        yield production
    }
}
