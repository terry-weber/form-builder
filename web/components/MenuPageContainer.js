import React from 'react';
import {Link} from 'react-router-dom';

export default class MenuPageContainer extends React.Component{
    render() {
        return (
            <div style={{display: "flex"}}>
                <div className="sideMenu">
                    Fields
                    <ul>
                        <li><Link to={"/create-field"}>Create New Field</Link></li>
                        <li><Link to={"/edit-fields"}>Edit Fields</Link></li>
                    </ul>
                    Forms
                    <ul>
                        <li><Link to={"/form-builder"}>Create New Form Layout</Link></li>
                        <li><Link to={"/edit-forms"}>Edit Form Layouts</Link></li>
                        <li>
                            Created Forms
                            <ul>
                                {
                                    this.props.formSchemas.length ?
                                        this.props.formSchemas.map((item, index) => {
                                            return <li><Link to={"/forms/" + item._id}>{item.title}</Link></li>
                                        })
                                        :
                                        <li>none</li>
                                }
                            </ul>
                        </li>
                    </ul>
                </div>

                <div style={{padding: "10px", width: "80%"}}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}