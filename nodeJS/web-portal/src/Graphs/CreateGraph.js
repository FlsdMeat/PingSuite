import { useEffect, useState } from "react"
import {Line} from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import FullLineGraph from './LineGraphs/FullLineGraph.js'
Chart.register(...registerables);

export default function CreateGraph({organization,graphYAxis, graphType, graphDateRange}){
    const [graphPoints, updateGraphPoints] = useState({})
    const [ready, GraphReady] = useState(false)

    useEffect(()=>{
        getGraphData()
    }, [])

    const getGraphData = async () => {
        if(graphDateRange === 'allDates'){
            if(graphType === 'line'){
                let graphData = await FullLineGraph(graphYAxis, organization)
                updateGraphPoints(graphData)
                GraphReady(true)
            }
        }
    }

    const titles = {
        'pingAvg': 'Average Ping',
        'pingStdDev': 'Standard Deveation',
        'pingMax': 'Maximum Ping',
        'pingMin': 'Minimum Ping',
        'sTdown': 'SpeedTest.net Download',
        'sTup': 'SpeedTest.net Upload',
        'sTping': 'SpeedTest.net Ping'
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
                        text:`Date Range: ${dateRangeTitles[graphDateRange]}; Data condensed by ${xTitles[organization]}`,
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
                    text: `${titles[graphYAxis]} over ${dateRangeTitles[graphDateRange]}`
                },
            
            }
        }}
        />
        }
        
    </div>
    )
}