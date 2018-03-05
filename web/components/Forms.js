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

        this.setProps = this.setProps.bind(this);
        this.setSchema = this.setSchema.bind(this);
        this.getSchema = this.getSchema.bind(this);
        this.initializeInputValues = this.initializeInputValues.bind(this);
        this.setInputValue = this.setInputValue.bind(this);
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
        this.setState({formFields: schema.fields, title: schema.title}, this.initializeInputValues);
    }

    getSchema() {
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
            let field = _.find(this.state.fields, (fieldItem) => {
               return schemaItem._id == fieldItem._id;
            });

            return Object.assign(schemaItem, field);
        });

        schema.fields = _.sortBy(schema.fields, (item) => {
           return item.order;
        });

        return schema;
    }

    initializeInputValues() {
        if(this.props.match.hasOwnProperty('formId')) {
            try {
                var forms = JSON.parse(localStorage.getItem('forms'));
            }
            catch(err) {}

            if(Object.prototype.toString.call(schemas) !== '[object Object]') {
                throw 'form not defined';
            }

            this.setState({inputValues: forms[this.props.match.params.id]});
        }
        else {
            this.setState({
                inputValues: this.state.formFields.map((item, index) => {
                    if (item.dataType == 'boolean') {
                        return Object.assign(item, {value: false});
                    }
                    return Object.assign(item, {value: ''});
                })
            });
        }
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
                       title={this.state.title}
                       setInputValue={this.setInputValue}
                       inputValues={this.state.inputValues}
                       />
                   );
               }}/>
               <Route exact path='/forms/:id'
                      render={routeParams => {
                          return (<FormTable
                              {...routeParams}
                              formFields={this.state.formFields}
                              title={this.state.title}
                              />
                          );
                      }}/>
           </Switch>
        )
    }
};