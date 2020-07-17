# GitHub Actions Talk

This is a repository to investigate and demonstrate using github actions.

Target:
- check in code
- build and test
- publish artefact
- artefact is pulled into pm2.io runtime automatically



## Learnings

- Every yaml file in the .github/workflows is a separate workflow



This repository provides a web application that
- provides management of files and of file processing
- in an Aurecon styled react application

![](./images/ScreenShot.PNG)

## Features

- React application
- Hot reload of browser and back end application service
- Authentication Integration with Azure AD via passport-azure-ad
- Deployable as static site UI, application microservice and connector microservice
- End to end tests
- Data processing pipeline via real-value-lang

## Running the application

### Development 
In the project directory,
you can run `npm start` which will run the dev server which hot reload serves the front end content on port 3000.
You can also run `npm run watch` which wil run the hot reload dev back end server which provides the apis. 

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### Configuration

### Development
Start the react front end which hot reloads changes
```
npm start
```

Start the nodejs back end which hot reloads changes
```
npm run watch
```

### Deployment to Production

To deploy to the production environment create a git origin for the following.

Then run 
```
git push production master
```
This will push to the production server , check out the master branch and restart the process.

## About

### Running tests
`npm test`

### Building static site
`npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.



## Authentication

see the `src\server\authentication.js` file.

