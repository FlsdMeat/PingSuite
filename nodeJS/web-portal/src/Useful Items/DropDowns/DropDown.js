import { useState } from "react"
import "./dropdown01.css"
export default function DropDown({dropDownType, dropDownIntial, buttonSelection, stateUpdate}){
    //buttonSelection will have the text being used
    //stateUpdate will be the parent functions useState object, and when a button is clicked it will update that state
    const [displayDrop, updateDropDownDisplay] = useState("none")

    const getSelection = () => {
        let buttons = buttonSelection.map((item,index)=>{
            return <button key={index} className="usefulItems_dropdown01_item" onClick={()=>{stateUpdate(dropDownType,item); updateDropDownDisplay("none")}}>{item}</button>
        })
        return buttons
    }
    return (
        <div className="usefulItems_dropdown01">
            <button className="usefulItems_dropdown01_initialTitle" onMouseOver={()=>{updateDropDownDisplay("flex")}}>{dropDownIntial}</button>
            <div className="usefulItems_dropdown01_dropdown" style={{display:displayDrop}} onMouseLeave={()=>{updateDropDownDisplay("none")}}>
                {getSelection()}
            </div>
        </div>
    )
}