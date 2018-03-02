import React from 'react';
import {Link} from 'react-router-dom';

export default class SchemasList extends React.Component {
    constructor() {
        super();

        this.state = {
            formSchemas: []
        };
    }

    componentDidMount() {
        try {
            var schemas = JSON.parse(localStorage.getItem('formSchemas'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(schemas) !== '[object Array]') {
            schemas = [];
            localStorage.setItem('formSchemas', JSON.stringify(schemas));
        }

        this.setState({formSchemas: schemas});

    }

    render() {
        return(
            <ul>
                {this.state.formSchemas.length ?
                    this.state.formSchemas.map((item, index) => {
                        return <li key={index}><Link to={'/edit-forms/' + encodeURIComponent(item._id)}>{item.title}</Link></li>
                    })
                    :
                    <div>no form layouts defined. <Link to="/create-form">define a form layout</Link></div>
                }
            </ul>
        )
    }
}