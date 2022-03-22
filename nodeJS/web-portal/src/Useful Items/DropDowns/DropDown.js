import { useState } from "react"
import "./dropdown01.css"
export default function DropDown({dropDownType, disabled, dropDownIntial, buttonSelection, stateUpdate}){
    //buttonSelection will have the text being used
    //stateUpdate will be the parent functions useState object, and when a button is clicked it will update that state
    const [displayDrop, updateDropDownDisplay] = useState("none")

    const getSelection = () => {
        let buttons = buttonSelection.map((item,index)=>{
            if(disabled !== undefined && disabled[index] === true){
                return <button key={index} disabled="true" className="usefulItems_dropdown01_item" onClick={()=>{stateUpdate(dropDownType,item); updateDropDownDisplay("none")}}>{item}</button>
            }
            return <button key={index} className="usefulItems_dropdown01_item" onClick={()=>{stateUpdate(dropDownType,item); updateDropDownDisplay("none")}}>{item}</button>
        })
        return buttons
    }
    return (
        <div className="usefulItems_dropdown01"  onMouseLeave={()=>{updateDropDownDisplay("none")}}>
            <button className="usefulItems_dropdown01_initialTitle" onMouseOver={()=>{updateDropDownDisplay("flex")}}>{dropDownIntial}</button>
            <div className="usefulItems_dropdown01_dropdown" style={{display:displayDrop}}>
                {getSelection()}
            </div>
        </div>
    )
}