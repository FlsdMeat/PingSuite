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
  const [dataCondense, updateDataCondense] = useState(`stddev`);
  const [organization, updateOrganization] = useState(`building`);
  const [rangeType,  updateRangeType] = useState(`allDates`);
  const [selectDate,  updateSelectDate] = useState('');
  const [date2, allowDate2] = useState(false)
  const [selectDate2,  updateSelectDate2] = useState('');
  const [dropDownObject, updateDropDown] = useState({'graphType':'Graph Selection', 'graphYAxis':'Statistic Selection','rangeType': 'Date Range Selection', 'dataCondense': 'Condensing Type', 'organization': 'Organize data by'})

  useEffect(()=>{
    updateGraphObject(<CreateGraph key={1} organization={organization} condense={dataCondense} graphYAxis={graphYAxis} graphType={graphType} rangeType={rangeType} dateRange={selectDate}/>)
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
    'SpeedTest Ping':'sTping',
    'SpeedTest Download':'sTdown',
    'SpeedTest Upload':'sTup',
  },{
    'pingAvg':'PingTest Average',
    'pingMax':'PingTest Max',
    'pingMin':'PingTest Min',
    'pingLoss':'PingTest Loss',
    'pingStdDev':'PingTest Standard Deviation',
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
  const dataCondenseTypes = [{
    'Average':'avg',
    'Standard Deviation':'stddev',
    'Trimmed Average':'trimAvg'
  }, {
    'avg':'Average',
    'stddev':'Standard Deviation',
    'trimAvg':'Trimmed Average'
  }]
  const organizationTypes = [{
    'Building':'building',
    'Device':'device'
  }, {
    'building':'Building',
    'device':'Device'
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
      case 'dataCondense':
        updateDataCondense(dataCondenseTypes[0][item])
        updateDropDown(dropDownObject => ({...dropDownObject, 'dataCondense':item}))
        if(rangeType === "allDates"){
          updateGenGraph(true)
        }
        break;
      case 'organization':
        updateOrganization(organizationTypes[0][item])
        updateDropDown(dropDownObject => ({...dropDownObject, 'organization':item}))
        break;
      default:
        break; 
    }
  }

  const getGraphOject = () => {
    updateGenGraph(false)
    updateClick(clickToUpdate + 1)
    if(rangeType === 'allDates'){
      updateGraphObject(<CreateGraph key={1} organization={organization} condense={dataCondense} graphYAxis={graphYAxis} graphType={graphType} rangeType={rangeType}/>)
    }
    if (rangeType === 'selectDate'){
      updateGraphObject(<CreateGraph key={1} organization={organization} condense={dataCondense} graphYAxis={graphYAxis} graphType={graphType} rangeType={rangeType} dateRange={selectDate}/>)
    }
    if (rangeType === 'dateRange'){
      updateGraphObject(<CreateGraph key={1} organization={organization} condense={dataCondense} graphYAxis={graphYAxis} graphType={graphType} rangeType={rangeType} dateRange={selectDate + '+' + selectDate2}/>)
    }
  }

  return (
    <div className="main-content">
      <nav>
        <div>
          <DropDown dropDownType={'graphType'} disabled={[false, true]} dropDownIntial={dropDownObject['graphType']} buttonSelection={Object.keys(graphTypes[0])} stateUpdate={dropDownUpdate}/>
          <DropDown dropDownType={'graphYAxis'} dropDownIntial={dropDownObject['graphYAxis']} buttonSelection={Object.keys(dataOptions[0])} stateUpdate={dropDownUpdate}/>
          <DropDown dropDownType={'organization'} dropDownIntial={dropDownObject['organization']} buttonSelection={Object.keys(organizationTypes[0])} stateUpdate={dropDownUpdate}/>
          <DropDown dropDownType={'rangeType'} dropDownIntial={dropDownObject['rangeType']} buttonSelection={Object.keys(rangeTypes[0])} stateUpdate={dropDownUpdate}/>
          {rangeType === 'allDates' && <DropDown dropDownType={'dataCondense'} dropDownIntial={dropDownObject['dataCondense']} buttonSelection={Object.keys(dataCondenseTypes[0])} stateUpdate={dropDownUpdate}/>}
          {rangeType === 'selectDate' && <div className='usefulItems-datePicker-container'><DatePicker selected={selectDate} onChange={date=>{
            updateSelectDate(date)
            allowDate2(true)
          }} /></div>} 
          {rangeType === 'dateRange' && <div className='usefulItems-datePicker-container'><DatePicker selected={selectDate} onChange={date=>{
            updateSelectDate(date)
            if(date2 === false){
              allowDate2(true)
            } else {
              updateGenGraph(true)
            }
          }} /> </div>}
          {date2 && <div className='usefulItems-datePicker-container'><DatePicker selected={selectDate2} onChange={date=>{
            updateSelectDate2(date)
            updateGenGraph(true)
          }} /> </div>}
          {showGenerateGraph && <button onClick={()=>{getGraphOject()}}>Generate Graph</button>}
        </div>
      </nav>
      <div className='GraphContainer'>
        {graphObject}
      </div>
    </div>
  );
}