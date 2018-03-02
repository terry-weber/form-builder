import React from 'react';
import { Switch, Route } from 'react-router-dom';
import FormTable from './FormTable';
import Form from './Form';
import _ from 'underscore';

export default class extends React.Component {

    constructor() {
        super();
        this.state = {
            fields: [],
            title: '',
            formFields: []
        };

        this.setProps = this.setProps.bind(this);
        this.setSchema = this.setSchema.bind(this);
        this.getSchema = this.getSchema.bind(this);
    }

    setProps() {
        try {
            var fields = JSON.parse(localStorage.getItem('fields'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(fields) !== '[object Array]') {
            throw "fields not defined";
        }

        this.setState({
            fields: fields
        }, this.setSchema);
    }

    setSchema() {
        let schema = this.getSchema();
        this.setState({formFields: schema.fields, title: schema.title});
    }

    getSchema() {
        try {
            var schemas = JSON.parse(localStorage.getItem('formSchemas'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(schemas) !== '[object Array]') {
            throw 'schema not defined';
        }

        let schema = _.find(schemas, (item) => {
            return item._id == this.props.match.params.id;
        });

        if (schema == null) {
            throw 'schema not defined';
        }

        return schema;
    }

    componentDidMount() {
        this.setProps();
    }


    componentDidUpdate(prevProps, prevState) {
        if(this.props.match.params.id != prevProps.match.params.id) {
            this.setSchema();
        }
    }

    render() {
        return (
           <Switch>
               <Route path='/forms/:id/create' render={routeParams => {
                   return (<Form
                       {...routeParams}
                       fields={this.state.fields}
                       formFields={this.state.formFields}
                       title={this.state.title}
                       getSchema={this.getSchema}
                       />
                   );
               }}/>
               <Route exact path='/forms/:id'
                      render={routeParams => {
                          return (<FormTable
                              {...routeParams}
                              fields={this.state.fields}
                              formFields={this.state.formFields}
                              title={this.state.title}
                              />
                          );
                      }}/>
           </Switch>
        )
    }
};