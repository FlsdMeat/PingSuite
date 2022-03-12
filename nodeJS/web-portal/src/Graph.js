import './main.css';
import {useEffect, useState} from 'react';
import {Line} from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
Chart.register(...registerables);

export default function App() {
  const [graphData, updateGraphData] = useState({});
  const [graphType, updateGraphType] = useState(`pingAvg`);
  const [ready, GraphReady] = useState(false);

  const getRandomColor = () =>{
    return [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]
  }


  useEffect( () =>{
    getData()
  }, [])

  const getData = async () =>{
    await axios.get('http://localhost:8080/api/pingResults').then(res=>{
      if(res.data !== false){
        Object.keys(res.data).forEach(item=>{
          res.data[item]['color'] = getRandomColor()
        })
        updateGraphData(res.data);
        GraphReady(true)
      }
    })
  }

  const createGraph = () => {
    let graph = (<Graph key={1} graphData={graphData} graphType={graphType} dateRange={'none'}/>)
    console.log(graph)
    return [graph]
  }

  return (
    <div className="main-content">
      <nav>
        <button>Graph1</button>
        <button>Graph2</button>
        <button>Graph3</button>
        <button>Graph4</button>
      </nav>
      {ready && createGraph()}
    </div>
  );
}

async function Graph({graphData, graphType, dateRange}){
  const [GraphPoints, updateGraph] = useState({})
  useEffect(()=>{
    typeof()
    updateGraph(findGraphPoints(graphData, graphType, dateRange))
    console.log(GraphPoints)
  },[])
  const titles = {
    'pingAvg': 'Average Ping',
    'pingStdDev': 'Standard Deveation',
    'pingMax': 'Maximum Ping',
    'pingMin': 'Minimum Ping',
    'sTdown': 'SpeedTest.net Download',
    'sTup': 'SpeedTest.net Upload'
  }
  return(
    <div className='GraphData'>
      <Line
        datasetIdKey='id'
        data={{
          labels:GraphPoints.labels,
          datasets:GraphPoints.datasets
        }}
        options={{
          fill:true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: titles[graphType]
            }
          }
        }}
      />
    </div>
  )
}

async function findGraphPoints(graphData, graphType, dateRange){
  const getDateLabels = () => {
    let dates = {}
    Object.keys(graphData).forEach(device=>{
      Object.keys(graphData[device]).forEach(date =>{
        if(!('DeviceName' === date || 'color' === date)){
          let year = date.substring(date.lastIndexOf(' ') + 1)
          let month = date.substring(0, date.indexOf(' '))
          let day = date.substring(date.indexOf(' ') + 1, date.lastIndexOf(','))
          if(!(year in dates)){
            dates[year] = {}
          }
          if(!(month in dates[year])){
            dates[year][month] = {}
          }
          if(!(day in dates[year][month])){
            dates[year][month][day] = []
          }
          date = graphData[device][date]
          Object.keys(date).forEach(ping =>{
            
            dates[year][month][day].push([device, ping])
          })
        }
      })
    })
    return dates
  }

  const sortLabels = (arr) => {
    if (arr.length === 1){
      return arr
    }
    const middle = Math.floor(arr.length / 2) // get the middle item of the array rounded down
    const left = arr.slice(0, middle)         // items on the left side
    const right = arr.slice(middle)           // items on the right side
    return merge( sortLabels(left), sortLabels(right) )
  }
  function merge (left, right) {
    const monPrefix = {'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11}
    let result = []
    let leftIndex = 0
    let rightIndex = 0
    while (leftIndex < left.length && rightIndex < right.length) {
      let leftMonth = monPrefix[left[leftIndex].substring(0, 3)]
      let rightMonth = monPrefix[right[rightIndex].substring(0, 3)]
      let leftDate = parseInt(left[leftIndex].substring(4))
      let rightDate = parseInt(right[rightIndex].substring(4))
      if (leftMonth < rightMonth) {
        result.push(left[leftIndex])
        leftIndex++      
      } else if (leftMonth === rightMonth && leftDate < rightDate){
        result.push(left[leftIndex])
        leftIndex++
      } else {
        result.push(right[rightIndex])
        rightIndex++
      }
    }
    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex))
  }
  const getGraphData = () => {
    let timeZoom = "days" // over a single 'day', multiple 'days', single month, multiple months, single year, multiple years
    let findDates = getDateLabels();
    let labels = [], labelsObj = {},
        datasets = [];
    if (timeZoom === "days"){
      console.log(findDates)
      Object.keys(findDates).forEach(year =>{
        Object.keys(findDates[year]).forEach(month =>{
          Object.keys(findDates[year][month]).forEach(day =>{
            labels.push(`${month} ${day}`)
            labelsObj[`${month} ${day}`] = `${month} ${day}`
          })
        })
      })
    }
    labels = sortLabels(labels)
    console.log(labels)
    console.log(labelsObj)
    datasets = Object.keys(graphData).map( (device, index) => {
      let tempDataObj = {}
      Object.keys(graphData[device]).forEach( (date) => {
        let average = 0;
        if(date.substring(0, date.indexOf(',')) in labelsObj){
          Object.keys(graphData[device][date]).forEach(time => {
            time = graphData[device][date][time]
            if(graphType === 'sTdown' || graphType === 'sTup'){
              average += time[graphType] / 1000000
            } else {
              average += time[graphType]
            }
          })
          average = average / Object.keys(graphData[device][date]).length
          tempDataObj[date.substring(0, date.indexOf(','))] = average
        }
      })
      let tempDataArr = []
      labels.forEach(date => {
        if(!(date in tempDataObj)){
          tempDataArr.push(0)
        } else {
          tempDataArr.push(tempDataObj[date])
        }
      })
      let color = graphData[device]['color']
      return{
        id: index + 1,
        data:tempDataArr,
        label:graphData[device]['DeviceName'],
        backgroundColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
        borderColor:`rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
      }
    })
    let data = {
      labels:labels,
      datasets:datasets
    };
    return data;
  }
  return getGraphData()
}