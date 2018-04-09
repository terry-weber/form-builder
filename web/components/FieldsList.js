import React from 'react';
import {Link} from 'react-router-dom';

export default class FieldsList extends React.Component {

    constructor() {
        super();

        this.state = {
            fields: []
        };
    }
    componentDidMount() {
        try {
            var fields = JSON.parse(localStorage.getItem('fields'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(fields) !== '[object Array]') {
            fields = [];
            localStorage.setItem('fields', JSON.stringify(fields));
        }

        this.setState({fields: fields});
    }

    render() {
        return (
            <div>
                <h4>Defined Fields</h4>
                <ul>
                    {this.state.fields.length ?
                        this.state.fields.map((item, index) => {
                            return <li key={index}><Link to={'/edit-fields/' + encodeURIComponent(item._id)}>{item.name}</Link></li>
                        })
                        :
                        <div>no fields defined. <Link to="/create-field">define a field</Link></div>
                    }
                </ul>
            </div>
        )
    }
}