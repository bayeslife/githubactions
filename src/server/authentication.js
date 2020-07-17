let debug = require('debug')('app')

const session = require('express-session');
const memoryStore = require('memorystore')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

function setup(app,appConfig) {

var config = { 
    creds: {
        returnURL: `${appConfig.backendUrl}/auth/login/callback`, // Use environment variable AD_RETURN_URL to override.
        identityMetadata: 'https://login.microsoftonline.com/aurecongroup.onmicrosoft.com/.well-known/openid-configuration', // For using Microsoft you should never need to change this.
        
        clientID: '114b5ab0-596c-4603-94f7-99b9089b3d4c', //'f1484636-f3d8-4cd0-9e5d-fa74195aa859',
        clientSecret: 'U5defgTXj=KB8LCV7:8mPoLWu]cPuaf=', //'7]Kc8op1/BZgf=g:3qi]en/g:XLYJ?.0', // if you are doing code or id_token code
        //clientID: '5f865a97-6522-4a2d-bdab-9bc5e7a8cbf1',
        //clientSecret: '?p[:@+R}-a5[=__r->', // if you are doing code or id_token code
        
        skipUserProfile: true, // for AzureAD should be set to true.
        responseType: 'id_token code', // for login only flows use id_token. For accessing resources use `id_token code`
        responseMode: 'form_post', // For login only flows we should have token passed back to us in a POST
        //scope: ['profile'] // additional scopes you may wish to pass
    }
    }

    //These are necessary to parse the response from Azure AD which contains the id token
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    
    app.use(session({
        store: new memoryStore({
            checkPeriod: 3600000 // prune expired entries every 1h
        }),
        secret: 'xsd6fs7df8s1asd56',
        resave: true,
        saveUninitialized: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        debug(`Serialize: ${user}`)
        done(null, user.upn ? user.upn : user._json.email);
    });

    passport.deserializeUser(function (email, done) {
        debug(`DeSerialize: ${email}`)  
        done(null, email)
    })

    passport.use(new OIDCStrategy({
        redirectUrl: config.creds.returnURL,
        allowHttpForRedirectUrl: true,
        clientID: config.creds.clientID,
        clientSecret: config.creds.clientSecret,
        identityMetadata: config.creds.identityMetadata,
        skipUserProfile: config.creds.skipUserProfile,
        responseType: config.creds.responseType,
        responseMode: config.creds.responseMode,
        scope: config.creds.scope
        },function (iss, sub, profile, accessToken, refreshToken, done) {
            console.log(profile)
            const upn = profile.upn ? profile.upn : profile._json.email
            return done(null, profile);
        }
    ))

    const isLoggedIn = passport.authenticate('azuread-openidconnect', { session: true, resourceURL: 'https://graph.microsoft.com' })

    //////Below are the routes on the back end which provide for establishment of a session.
    
    app.get('/auth/login',
            (req, res,next)=>{
                debug('User logging in')
                //trackEvent(EVENT.LOGIN_FAILURE, req.user.upn)
                next()
            },
            isLoggedIn )

    /**
     * @swagger
     *
     * /login:
     *   get:
     *     description: Handles open id connect jwt token
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Handle login
     */
    app.post('/auth/login/callback', isLoggedIn, function (req, res,next) {        
        // Identify the user for analytics
        //identifyUser(req.user.upn, { email: req.user.upn, ip: _.get(req, 'user._json.ipaddr') })
        //req.user.photo = _.get(req, 'user.name.givenName').charAt(0) + _.get(req, 'user.name.familyName').charAt(0)
        debug(req.user)
        res.redirect(appConfig.frontendUrl);
    })

    /**
     * @swagger
     *
     * /logout:
     *   get:
     *     description: Handles logout
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Handle logout
     */
    app.get('/logout', function (req, res) {
        req.logout();
        debug(`logout ${req.user}`)
        res.redirect('/auth/login');
    });
  }

  module.exports = {
      setup
  }