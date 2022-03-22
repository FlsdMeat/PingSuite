import { useEffect, useState } from "react"
import {Line} from 'react-chartjs-2';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function CreateGraph({organization, condense,graphYAxis, graphType, rangeType, dateRange}){
    const [graphPoints, updateGraphPoints] = useState({})
    const [ready, GraphReady] = useState(false)

    useEffect(()=>{
        getGraphData()
    }, [organization, condense,graphYAxis, graphType, rangeType, dateRange])

    const getGraphData = async () => {
        if(rangeType === 'allDates'){
            await axios.get(`http://localhost:8080/api/pingResults/allDates/${graphType}_${graphYAxis}_${condense}_${organization}`)
                .then(async res=>{
                    if(res.data !== false){
                        updateGraphPoints(res.data)
                        console.log(res.data)
                        GraphReady(true)
                    }
            })
        } else {
            let dates = ''
            if(rangeType === 'selectDate'){
                let temp = dateRange.toString().split(' ')
                dates = `${temp[1]}_${temp[2]},_${temp[3]}`
            }
            await axios.get(`http://localhost:8080/api/pingResults/${rangeType}/${dates}/${graphType}_${graphYAxis}_${condense}_${organization}`)
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
        if (condense === 'avg'){
            text += ` Condensed by: Average;`
        } else if (condense === 'stddev'){
            text += ` Condensed by: Standard Deviation;`
        }
        return text
    }

    const titles = {
        'pingAvg': 'Average Ping',
        'pingStdDev': 'Standard Deveation',
        'pingLoss': 'Loss in %',
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