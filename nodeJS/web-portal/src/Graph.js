import './main.css';
import {useEffect, useState} from 'react';
import CreateGraph from './CreateGraph.js'
import DropDown from './Useful Items/DropDowns/DropDown.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"

export default function App() {
  const [graphObject, updateGraphObject] = useState();
  const [showGenerateGraph, updateGenGraph] = useState(false);
  const [clickToUpdate, updateClick] = useState(0);
  const [graphYAxis, updateYAxis] = useState(`pingAvg`);
  const [graphType, updateGraphType] = useState(`line`);
  const [dataOrg, updateDataOrg] = useState(`stddev`);
  const [rangeType,  updateRangeType] = useState(`allDates`);
  const [selectDate,  updateSelectDate] = useState('');
  const [dropDownObject, updateDropDown] = useState({'graphType':'Graph Selection', 'graphYAxis':'Statistic Selection','rangeType': 'Date Range Selection', 'dataOrg': 'Condensing Type'})

  useEffect(()=>{
    updateGraphObject(<CreateGraph key={1} organization={dataOrg} graphYAxis={graphYAxis} graphType={graphType} rangeType={rangeType} dateRange={selectDate}/>)
  }, [clickToUpdate])

  useEffect(()=>{
    if(clickToUpdate > 0){
      updateGenGraph(true)
    }
  }, [dropDownObject])

  const dataOptions = [{
    'PingTest Average':'pingAvg',
    'PingTest Max':'pingMax',
    'PingTest Min':'pingMin',
    'PingTest Loss':'pingLoss',
    'PingTest Standard Deviation':'pingStdDev',
    'PingTest Mean':'pingMean',
    'SpeedTest Ping':'sTping',
    'SpeedTest Download':'sTdown',
    'SpeedTest Upload':'sTup',
  },{
    'pingAvg':'PingTest Average',
    'pingMax':'PingTest Max',
    'pingMin':'PingTest Min',
    'pingLoss':'PingTest Loss',
    'pingStdDev':'PingTest Standard Deviation',
    'pingMean':'PingTest Mean',
    'sTping':'SpeedTest Ping',
    'sTdown':'SpeedTest Download',
    'sTup':'SpeedTest Upload',
  }]
  const graphTypes = [{
    'Line Graph':'line',
    'Bar Graph':'bar'
  },{
    'line':'Line Graph',
    'bar':'Bar Graph'
  }]
  const dataOrgTypes = [{
    'Average':'avg',
    'Standard Deviation':'stddev'
  }, {
    'avg':'Average',
    'stddev':'Standard Deviation'
  }]
  const rangeTypes = [{
    'All Dates': 'allDates',
    'Single Day':'selectDate',
    'Range of Dates':'dateRange'
  },{
    'allDates':'All Dates',
    'selectDate': 'Single Day',
    'dateRange': 'Range of Dates'
  }] 

  const dropDownUpdate = (dropDownLocal,item) => {
    switch (dropDownLocal){
      case 'graphType':
        updateGraphType(graphTypes[0][item])
        updateDropDown(dropDownObject => ({...dropDownObject, 'graphType': item}))
        break;
      case 'graphYAxis':
        updateYAxis(dataOptions[0][item])
        updateDropDown(dropDownObject => ({...dropDownObject, 'graphYAxis': item}))
        break;
      case 'rangeType':
        updateRangeType(rangeTypes[0][item])
        updateDropDown(dropDownObject => ({...dropDownObject, 'rangeType':item}))
        break;
      case 'dataOrg':
        updateDataOrg(dataOrgTypes[0][item])
        updateDropDown(dropDownObject => ({...dropDownObject, 'dataOrg':item}))
        if(rangeType === "allDates"){
          updateGenGraph(true)
        }
        break;
      default:
        break; 
    }
  }

  const getGraphOject = () => {
    updateGenGraph(false)
    updateClick(clickToUpdate + 1)
    updateGraphObject(<CreateGraph key={1} organization={dataOrg} graphYAxis={graphYAxis} graphType={graphType} rangeType={rangeType} dateRange={selectDate}/>)
  }

  const setSelectDate = (date) => {
    console.log(date)
    updateSelectDate(date)
    updateGenGraph(true)
  }

  return (
    <div className="main-content">
      <nav>
        <div>
          <DropDown dropDownType={'graphType'} dropDownIntial={dropDownObject['graphType']} buttonSelection={Object.keys(graphTypes[0])} stateUpdate={dropDownUpdate}/>
          <DropDown dropDownType={'graphYAxis'} dropDownIntial={dropDownObject['graphYAxis']} buttonSelection={Object.keys(dataOptions[0])} stateUpdate={dropDownUpdate}/>
          <DropDown dropDownType={'rangeType'} dropDownIntial={dropDownObject['rangeType']} buttonSelection={Object.keys(rangeTypes[0])} stateUpdate={dropDownUpdate}/>
          {rangeType !== 'selectDate' && <DropDown dropDownType={'dataOrg'} dropDownIntial={dropDownObject['dataOrg']} buttonSelection={Object.keys(dataOrgTypes[0])} stateUpdate={dropDownUpdate}/>}
          {rangeType === 'selectDate' && <DatePicker selected={selectDate} onChange={setSelectDate} />}
          {showGenerateGraph && <button onClick={()=>{getGraphOject()}}>Generate Graph</button>}
        </div>
      </nav>
      <div className='GraphContainer'>
        {graphObject}
      </div>
    </div>
  );
}