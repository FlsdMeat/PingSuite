import { useEffect, useState } from "react"
import {Line} from 'react-chartjs-2';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import FullLineGraph from './LineGraphs/FullLineGraph.js'
Chart.register(...registerables);

export default function CreateGraph({organization,graphYAxis, graphType, rangeType, dateRange}){
    const [graphPoints, updateGraphPoints] = useState({})
    const [ready, GraphReady] = useState(false)

    useEffect(()=>{
        getGraphData()
    }, [organization,graphYAxis, graphType, rangeType, dateRange])

    const getGraphData = async () => {
        if(rangeType === 'allDates'){
            await axios.get(`http://localhost:8080/api/pingResults/allDates/${graphType}_${graphYAxis}_${organization}`)
                .then(async res=>{
                    if(res.data !== false){
                        updateGraphPoints(res.data)
                        console.log(res.data)
                        GraphReady(true)
                    }
            })
        } else {
            await axios.get(`http://localhost:8080/api/pingResults/${rangeType}/${dateRange}/${graphType}_${graphYAxis}_${organization}`)
                .then(async res=>{
                    if(res.data !== false){
                        updateGraphPoints(res.data)
                        console.log(res.data)
                        GraphReady(true)
                    }
            })
        }
    }

    const getXAxisText = () =>{
        let text = ""
        if(rangeType === 'allDates'){
            text = `Date Range: All Dates;`
        } else if (rangeType === 'singleDate'){
            text = `Date Range: Single Day [ ${dateRange.replaceAll('_', ' ')} ];`
        } else if (rangeType === 'dateRange'){
            text = `Date Range: ${dateRange.replaceAll('_', ' ').replace('?', ' to ')};`
        }
        if (organization === 'avg'){
            text += ` Condensed by: Average;`
        } else if (organization === 'stddev'){
            text += ` Condensed by: Standard Deviation;`
        }
        return text
    }

    const titles = {
        'pingAvg': 'Average Ping',
        'pingStdDev': 'Standard Deveation',
        'pingMax': 'Maximum Ping',
        'pingMin': 'Minimum Ping',
        'sTdown': 'SpeedTest Download',
        'sTup': 'SpeedTest Upload',
        'sTping': 'SpeedTest Ping'
    }
    const xTitles = {
        'stddev':'Standard Deviation',
        'avg':'Average'
    }
    const dateRangeTitles = {
        'allDates':'All Dates'
    }

    const legendHoverEvent = (e, legendItem, legend) =>{
        console.log('HHOVVVERING and', legendItem)
    }

    return(
    <div className='GraphData'>
        {ready && 
        <Line
        datasetIdKey='id'
        data={{
            labels:graphPoints.labels,
            datasets:graphPoints.datasets
        }}
        options={{
            fill:true,  
            scales: {
                yAxes:{
                    grid:{
                        color: 'hsl(215, 8%, 43%)'
                    },
                    ticks: {
                        color: "white"
                    }
                },
                xAxes:{
                    title:{
                        display:true,
                        text:getXAxisText,
                        color:'white'
                    },
                    grid:{
                        color: 'hsl(215, 8%, 43%)'
                    },
                    ticks: {
                        color: "white"
                    }
                }
            },          
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        // This more specific font property overrides the global property
                        color:'white'
                    },
                    onHover: legendHoverEvent
                },
                title: {
                    display: true,
                    color:'white',
                    text: `${titles[graphYAxis]} over ${dateRangeTitles[rangeType]}`
                },
            
            }
        }}
        />
        }
        
    </div>
    )
}