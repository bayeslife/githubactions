let debug = require('debug')('app')
const fs = require('fs')
const path = require('path')
const appData = require('../../package.json')
let Busboy = require('busboy')
const {process: runProcess} = require('./process')


const withUserRole = async (req, res, next) => {
    // console.log(req)
    // const userId = _.get(req, 'user.upn')
    // const projectId = _.get(req, 'params.project')
    // const userRole = await getUserRole(userId, projectId)
    // _.set(req, 'locals.userRole', userRole)
    next()
}
  

module.exports.setup = function (app, config) {
    debug('Setup')

    function isLoggedIn(req,res,next){
        if(req.user)
            next()
        else
            res.status(401).send("User Not Logged In");
    }

    const healthy = (req, res) => {
        debug('GET /')
        res.send({
            name: appData.name,
            environment: config.env,
            version: appData.version
        })
    }
    
  
    /**
     * @swagger
     * 
     * /:
     *  get:
     *      description: Invoked by Kubernetes to validate the application is running
     *      responses:
     *       200:
     *        description: The application is running
     */
    app.get('/', healthy)

    /**
     * @swagger
     *
     * /health:
     *   get:
     *     description: Get health for the application
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Get Health
     */
    app.get('/health', healthy)


    /**
     * @swagger
     *  
     * /job:
     *   post:
     *     description: Run a job
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Get Health
     */
    app.post('/api/jobs/:currentWeek', isLoggedIn, (req, res) => {
        debug(`POST jobs/${req.params.currentWeek}`)
        const currentWeek =req.params.currentWeek

        let outdir = path.join(config.directory, `out${currentWeek}`)
        !fs.existsSync(outdir) && fs.mkdirSync(outdir)

        let logPath = path.join(config.directory, `out${currentWeek}`, 'log.txt')
        debug(logPath)
        let wstream = fs.createWriteStream(logPath)
        res.send({
            currentWeek
        })

        process.on('uncaughtException', function(err) {
            console.log('Caught exception: ' + err);
            wstream.write(err.toString())
            config.channel.enqueue(err.toString())
          });
        
        runProcess({
            directory: `${config.directory}/`,
            environment: 'prod',
            currentWeek
        },(x)=>{
            if(typeof x === 'object'){
                let cnt = JSON.stringify(x,null,' ')
                debug(cnt)
                wstream.write(cnt)
                config.channel.enqueue(cnt)
            }else {
                debug(x)
                wstream.write(`${x}\n`)
                config.channel.enqueue(x)
            }  
        })
    })

     /**
     * @swagger
     *  
     * /publish:
     *   post:
     *     description: Postprocess Job
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Success
     */
    app.post('/api/publish/:currentWeek', isLoggedIn, (req, res) => {
        debug(`POST /publish/${req.params.currentWeek}`)
        const currentWeek =req.params.currentWeek

        let outdir = path.join(config.directory, `out${currentWeek}`)
        !fs.existsSync(outdir) && fs.mkdirSync(outdir)

        let powerbidir = path.join(config.directory, `out`)
        !fs.existsSync(powerbidir) && fs.mkdirSync(powerbidir)

        let filesout = fs.readdirSync(outdir)
        filesout.forEach((file)=>{
            if(file.indexOf('.csv')>=0){
                let srcpath = path.join(outdir,file)
                let destpath = path.join(powerbidir,file)
                fs.createReadStream(srcpath).pipe(fs.createWriteStream(destpath)).on('close',()=>{
                    let msg = `Copied ${file}`
                    console.log(msg)
                    config.channel.enqueue(msg)
                })
            }
        })
        res.send({})
    })

    /**
     * @swagger
     *  
     * /api/files/:currentWeek:
     *   get:
     *     description: Get files for a reporting week
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Array of file details
     */
    app.get('/api/files/:currentWeek', isLoggedIn, (req, res, next) => {
        debug(`GET ${req.url}`)

        debug(req.user)
        console.log(req.session)
        const currentWeek =req.params.currentWeek

        let outdir = path.join(config.directory, `out${currentWeek}`)
        !fs.existsSync(outdir) && fs.mkdirSync(outdir)

        let srcdir = path.join(config.directory, `source${currentWeek}`)
        !fs.existsSync(srcdir) && fs.mkdirSync(srcdir)

        let files = []

        let filessrc = fs.readdirSync(srcdir)
        let filesout = fs.readdirSync(outdir)

        filessrc.forEach((file)=>{
            files.push({name: file,type: "source", url: `/data/source${currentWeek}/${file}`})
        })
        filesout.forEach((file)=>{
            if(file.indexOf('.csv')>=0){
                files.push({name: file,type: "out",url: `/data/out${currentWeek}/${file}`})
            }
        })
        res.send(files) 
    })

    /**
     * @swagger
     *  
     * /api/data/:
     *   post:
     *     description: Download reporting week files
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Get Health
     */
    app.get('/api/data/*', isLoggedIn, async (req, res, next) => {
        debug(`GET ${req.url}`)
        const file = req.path.substring(9)
        const filepath = path.join(config.directory, file)
        debug(`FilePath ${filepath}`)
        debug(`Req query ${JSON.stringify(req.query)}`)
        if(filepath && fs.existsSync(filepath)){
            if(Object.keys(req.query).length===0){
                res.setHeader('Content-disposition', `attachment; filename=${path.basename(filepath)}`);
                res.set('Content-Type', 'text/csv');
                fs.createReadStream(filepath)
                    .pipe(res).on('close', () => {
                        console.log('Stream Read')
                    })
            }                                                                                                                                                  
        } else {
            res.send(`No such file ${filepath}`) 
        }
    })

    /**
     * @swagger
     *  
     * /api/data/*:
     *   delete:
     *     description:  
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: The file was successfully deleted
     */
    app.delete('/api/data/*', isLoggedIn, (req, res, next) => {
        debug(`DELETE ${req.url}`)
        const file = req.path.substring(9)
        const filepath = path.join(config.directory, file)
        debug(`FilePath ${filepath}`)
        debug(`Req query ${JSON.stringify(req.query)}`)
        if(filepath && fs.existsSync(filepath)){
            fs.unlink(filepath, () => debug('File Removed'))
            res.status(200).send([])
        } else {
            res.send(`No such file ${filepath}`) 
        }
    })

    /**
     * @swagger
     *  
     * /api/source/:currentWeek:
     *   post:
     *     description: Upload a source file
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: The file was uploaded
     */
    app.post('/api/source/:currentWeek', isLoggedIn, async (req, res, next) => {                                                                                                                                                           
        debug('Upload')                                                                                                                                                                                             
        var busboy = new Busboy({ headers: req.headers })                                                                                                                                                           
        let currentWeek = req.params.currentWeek                                                                                                                                                                          
        let saveTo = null                                                                                                                                                                                                                                                                                                                                                             
        let uploadFilename = "file.csv"               

        let dir = path.join(config.directory, `source${currentWeek}`)
        !fs.existsSync(dir) && fs.mkdirSync(dir)
        
        busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
            uploadFilename = filename
            saveTo = path.join(config.directory, `source${currentWeek}`, filename)                                                                                                                                                                   
            debug('Uploading: ' + saveTo)
            file.pipe(fs.createWriteStream(saveTo),{flags: 'w'}).on('close',()=>{
                debug(`File Saved ${saveTo}`)
            })
        })                                                                                                                                                                                                          
        busboy.on('finish', async () => {
            debug('finish')
            try {       
                //res.sendStatus(200).send({})                                                                                                                                                                                            
                res.writeHead(200, { 'Connection': 'close' })                                                                                                                                                       
                res.end(JSON.stringify({}))                                                                                                                                                                                           
            } catch (err) {
                debug(err)                                                                                                                                                                                          
                res.sendStatus(400).send(err.code)
            }
        })
        return req.pipe(busboy)
    })
    
}
