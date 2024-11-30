import React, { useState } from "react";
import '../styles/CustomSelect.css';

function CustomSelect({ title, values, onChange, className = "", style = "" }) {

    const [isOpen, setOpen] = useState(false);
    const [pickedText, setPickedText] = useState("");

    function handleSelect(e) {
        setPickedText(e.target.textContent);
        setOpen(false);
        onChange(e);
    }

    return (<div className={className + ' custom-select'} style={style}>
        <button type="button" className={className} onClick={() => { setOpen(!isOpen); }}>{pickedText === "" ? title : pickedText}</button>
        <div className={className + ' list-select'} style={{ visibility: isOpen ? "visible" : "collapse" }}>
            {values.map(value => <button type="button" onClick={handleSelect} key={value} name={"dietType"} value={value.toString().toLowerCase()}>{value}</button>)}
        </div>
    </div>)
}

export default CustomSelect;