import { useEffect, useState } from "react"
import {Line, Bar} from 'react-chartjs-2';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function CreateGraph({organization, condense,graphYAxis, graphType, rangeType, dateRange}){
    const [graphPoints, updateGraphPoints] = useState({})
    const [ready, GraphReady] = useState(false)
    let dates = ''
    let realGraphType = graphType
    if(graphType === 'bar'){
        graphType = 'line'
    }
    if(rangeType === 'selectDate'){
        let temp = dateRange.toString().split(' ')
        dates = `${temp[1]}?${temp[2]},?${temp[3]}`
        console.log(dates)
    }
    if(rangeType === 'dateRange'){
        try {
            let temp = dateRange.toString().split('+')
            let date1 = temp[0].split(' ')
            let date2 = temp[1].split(' ')
            dates = `${date1[1]}?${date1[2]},?${date1[3]}+${date2[1]}?${date2[2]},?${date2[3]}`
        } catch (error) {
            
        }
    }
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
            await axios.get(`http://localhost:8080/api/pingResults/${rangeType}/${graphType}_${graphYAxis}_${organization}_${dates}`)
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
        try {
            let text = ""
            if(rangeType === 'allDates'){
                text = `Date Range: All Dates;`
            } else if (rangeType === 'selectDate'){
                text = `Date Range: Single Day [ ${dates.replaceAll('?', ' ')} ]; Represented by Hour`
            } else if (rangeType === 'dateRange'){
                let date1 = graphPoints.labels[Object.keys(graphPoints.labels)[0]]
                let date2 = graphPoints.labels[Object.keys(graphPoints.labels)[Object.keys(graphPoints.labels).length - 1]]
                text = `Date Range: ${date1} to ${date2};`
            }
            if(rangeType === 'allDates'){
                if (condense === 'avg'){
                    text += ` Condensed by: Average;`
                } else if (condense === 'stddev'){
                    text += ` Condensed by: Standard Deviation;`
                }
            }
            return text
        } catch (error) {
            console.log(error)
            return "error"
        }
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

    const getTitle = () =>{
        try {
            if(rangeType === 'allDates'){
                return `${titles[graphYAxis]} over All Dates`
            } else if (rangeType === 'selectDate'){
                return `${titles[graphYAxis]} on ${dates.replaceAll('?', ' ')}`
            } else if (rangeType === 'dateRange'){
                let date1 = graphPoints.labels[Object.keys(graphPoints.labels)[0]]
                let date2 = graphPoints.labels[Object.keys(graphPoints.labels)[Object.keys(graphPoints.labels).length - 1]]
                return `${titles[graphYAxis]} from  ${date1} to ${date2};`
            }
        } catch (error) {
            console.log(error)
            return "error"
        }
    }
    const barGraph = (<Bar
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
                    text:getTitle
                },
            
            }
        }}
        />)
    const LineGraph = (
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
                        text:getTitle
                    },
                
                }
            }}
            />
    )
    const getGraph = () => {
        if(realGraphType === 'bar'){
            return barGraph
        }
        return LineGraph
    }
    return(
        <div className='GraphData'>
            {ready && getGraph()}
        </div>
    )
}