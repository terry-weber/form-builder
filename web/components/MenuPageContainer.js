import React from 'react';
import {Link} from 'react-router-dom';

export default (props) => {
    return (
        <div style={{display: "flex"}}>
            <div style={{
                padding: "10px",
                width: "20%",
                background: "#f0f0f0"
            }}>
                Fields
                <ul>
                    <li><Link to={"/create-field"}>Create New Field</Link></li>
                    <li><Link to={"/edit-fields"}>Edit Fields</Link></li>
                </ul>
                Forms
                <ul>
                    <li><Link to={"/form-builder"}>Create New Form Layout</Link></li>
                    <li><Link to={"/"}>Edit Form Layouts</Link></li>
                    <li><Link to={"/"}>Created Forms</Link></li>
                </ul>
            </div>

            <div style={{padding: "10px", width: "80%"}}>
                {props.children}
            </div>
        </div>
    )
}