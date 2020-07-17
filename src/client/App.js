import React from 'react';
import { Router } from "react-router";
import { Switch, Route } from "react-router-dom";
import history from "./components/history";
import { Layout, Report1, Process1, Home } from './components'
import { Model} from 'real-value-lang'
import { Architecture} from '../application/application'
import { channelProduction, channelAsset, channelTarget} from './components/channel'
import './App.css';

let model = Model()

const citec = model.fromChannel({channel:channelProduction})
const corvus = model.fromChannel({channel:channelAsset})
const wenco = model.fromChannel({channel:channelTarget})

let architecture = Architecture()
  .setModel(model)
  .setStreams({stream_target: corvus, stream_production: citec, stream_asset: wenco})
  .produceViewState()
  .produceControl()
  .produceDisplay()

model.run()

function App() {
  
  return (
      <Router history={history}>  
        <Layout>
          <Switch>
              <Route path="/process/:jobId">
                <Process1/>
              </Route>
              <Route path="/reports/:reportId" >
                <Report1 architecture={architecture}/> 
              </Route>
              <Route path="/" >
                <Home/>
              </Route>
          </Switch>
      </Layout>
    </Router>
  );
}

export default App;
