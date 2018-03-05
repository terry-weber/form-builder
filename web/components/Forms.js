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
            formFields: [],
            inputValues: []
        };

        this.setSchema = this.setSchema.bind(this);
        this.getSchema = this.getSchema.bind(this);
        this.setInputValue = this.setInputValue.bind(this);
        this.setInputValues = this.setInputValues.bind(this);
    }

    setSchema(callback) {
        let schema = this.getSchema();
        this.setState({formFields: schema.fields, title: schema.title}, callback);
    }

    getSchema() {
        try {
            var fields = JSON.parse(localStorage.getItem('fields'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(fields) !== '[object Array]') {
            throw "fields not defined";
        }

        try {
            var schemas = JSON.parse(localStorage.getItem('formSchemas'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(schemas) !== '[object Array]') {
            throw 'schemas not defined';
        }

        let schema = _.find(schemas, (item) => {
            return item._id == this.props.match.params.id;
        });

        if (schema == null) {
            throw 'schema not defined';
        }

        schema.fields = schema.fields.map((schemaItem) => {
            let field = _.find(fields, (fieldItem) => {
               return schemaItem._id == fieldItem._id;
            });

            return Object.assign(schemaItem, field);
        });

        schema.fields = _.sortBy(schema.fields, (item) => {
           return item.order;
        });

        return schema;
    }

    setInputValue(formIndex, value) {
        this.setState({
            inputValues: this.state.inputValues.map((item, valueIndex) => {
                if(formIndex == valueIndex) {
                    return Object.assign(item, {value: value});
                }
                return item;
            })
        });
    }

    setInputValues(inputValues) {
        this.setState({inputValues: inputValues});
    }

    render() {
        return (
           <Switch>
               <Route path='/forms/:id/create' render={routeParams => {
                   return (<Form
                       {...routeParams}
                       title={this.state.title}
                       setInputValue={this.setInputValue}
                       inputValues={this.state.inputValues}
                       setSchema={this.setSchema}
                       setInputValues={this.setInputValues}
                       formFields={this.state.formFields}
                       />
                   );
               }}/>
               <Route path='/forms/:id/edit/:formId' render={routeParams => {
                   return (<Form
                           {...routeParams}
                           title={this.state.title}
                           setInputValue={this.setInputValue}
                           inputValues={this.state.inputValues}
                           setSchema={this.setSchema}
                           setInputValues={this.setInputValues}
                           formFields={this.state.formFields}
                       />
                   );
               }}/>
               <Route exact path='/forms/:id'
                      render={routeParams => {
                          return (<FormTable
                              {...routeParams}
                              formFields={this.state.formFields}
                              title={this.state.title}
                              setSchema={this.setSchema}
                              />
                          );
                      }}/>
           </Switch>
        )
    }
};