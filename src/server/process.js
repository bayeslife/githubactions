let debug = require('debug')('app')
const fs = require('fs')
const path = require('path')

function process(options,log){
    debug(options)
    log('Processing')
    const filepath = path.join(options.directory,`out${options.currentWeek}`,`file.csv`)
    log(filepath)
    // let stream = fs.createWriteStream(filepath)
    // stream.write("test")
    // stream.end()
}

module.exports = {
    process
}