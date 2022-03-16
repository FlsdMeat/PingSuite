import './main.css';
import {useEffect, useState} from 'react';
import CreateGraph from './Graphs/CreateGraph.js'

export default function App() {
  const [graphObject, updateGraphObject] = useState();
  const [graphYAxis, updateYAxis] = useState(`pingMax`);
  const [graphType, updateGraphType] = useState(`line`);
  const [orgData, updateOrgData] = useState(`stddev`);

  useEffect(()=>{
    updateGraphObject()
  }, [])

  const dataOptions = {
    'PingTest Average':'pingAvg',
    'PingTest Max':'pingMax',
    'PingTest Min':'pingMin',
    'PingTest Loss':'pingLoss',
    'PingTest Standard Deviation':'pingStdDev',
    'PingTest Mean':'pingMean',
    'SpeedTest Ping':'sTping',
    'SpeedTest Download':'sTmax',
    'SpeedTest Upload':'sTmin',
  }
  const graphTypes = {
    'Line Graph':'line',
    'Bar Graph':'bar'
  }
  const dataOrg = {
    'Average':'avg',
    'Standard Deviation':'stddev',
    'Mean':'mean'
  }

  return (
    <div className="main-content">
      <nav>
        <button>Graph1</button>
        <button>Graph2</button>
        <button>Graph3</button>
        <button>Graph4</button>
      </nav>
      <CreateGraph key={1} organization={orgData} graphYAxis={graphYAxis} graphType={graphType} graphDateRange={'allDates'}/>
    </div>
  );
}