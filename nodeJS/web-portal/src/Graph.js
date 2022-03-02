import './main.css';
import Chart from "canvasjs"

export default function App() {
  return (
    <div className="main-content">
      <nav>
        <span>Graph1</span>
        <span>Graph2</span>
        <span>Graph3</span>
        <span>Graph4</span>
      </nav>
      <Graph/>
    </div>
  );
}
 
function Graph(){
	const generateDataPoints = (noOfDps) => {
		let xVal = 1, yVal = 100;
		let dps = [];
		for(let i = 0; i < noOfDps; i++) {
			yVal = yVal +  Math.round(5 + Math.random() *(-5-5));
			dps.push({x: xVal,y: yVal});	
			xVal++;
		}
		return dps;
	}
  const options = {
    theme: "light2", // "light1", "dark1", "dark2"
    animationEnabled: true,
    zoomEnabled: true,
    title: {
      text: "Try Zooming and Panning"
    },
    data: [{
      type: "area",
      dataPoints: generateDataPoints(500)
    }]
  }
	
	return (
		<div>
			<Chart options = {options} 
				/* onRef={ref => this.chart = ref} */
			/>
		</div>
	)
}
 
module.exports = App;                              