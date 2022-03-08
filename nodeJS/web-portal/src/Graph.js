import './main.css';
import {useEffect, useState} from 'react';
import {Line} from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
Chart.register(...registerables);

export default function App() {
  const [PingResults, updateResults] = useState([]);
  const [ready, GraphReady] = useState(false);

  useEffect( () =>{
    getData()
  }, [])

  const getData = async () =>{
    await axios.get('http://localhost:8080/api/pingResults').then(res=>{
        updateResults(res.data);
        console.log(res.data)
        GraphReady(true)
      })
  }

  const getDateLabels = () => {
    let dates = {}
    Object.keys(PingResults).forEach(device=>{
      Object.keys(PingResults[device]).forEach(date =>{
        if(!('DeviceName' === date)){
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
          date = PingResults[device][date]
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

  const getRandomColor = () =>{
    return [Math.random() * 256, Math.random() * 256, Math.random() * 256]
  }

  const getGraphData = (graphingObject,timeRange, timeZoom) => {
    timeZoom = "days" // over a single 'day', multiple 'days', single month, multiple months, single year, multiple years
    let findDates = getDateLabels();
    let labels = [], labelsObj = {},
        datasets = [];
    if (timeZoom === "days"){
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
    console.log(labelsObj)
    datasets = Object.keys(PingResults).map( (device, index) => {
      let tempDataObj = {}
      Object.keys(PingResults[device]).forEach( (date) => {
        let average = 0;
        if(date.substring(0, date.indexOf(',')) in labelsObj){
          Object.keys(PingResults[device][date]).forEach(time => {
            time = PingResults[device][date][time]
            if(graphingObject === 'sTdown' || graphingObject === 'sTup'){
              average += time[graphingObject] / 1000000
            } else {
              average += time[graphingObject]
            }
          })
          average = average / Object.keys(PingResults[device][date]).length
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
      let color = getRandomColor()
      return{
        id: index + 1,
        data:tempDataArr,
        label:PingResults[device]['DeviceName'],
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

  return (
    <div className="main-content">
      <nav>
        <button>Graph1</button>
        <button>Graph2</button>
        <button>Graph3</button>
        <button>Graph4</button>
      </nav>
      {ready && <Graph title={'Average Ping'} data={getGraphData('pingAvg')}/>}
      {ready && <Graph title={'Standard Dev'} data={getGraphData('pingStdDev')}/>}
      {ready && <Graph title={'Download'} data={getGraphData('sTdown')}/>}
      {ready && <Graph title={'Upload'} data={getGraphData('sTup')}/>}
    </div>
  );
}

function Graph({title, data}){
  console.log(data.datasets)
  return(
    <div className='GraphData'>
      <Line
        datasetIdKey='id'
        data={{
          labels:data.labels,
          datasets:data.datasets
        }}
        options={{
          fill:true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: title
            }
          }
        }}
      />
    </div>
  )
}