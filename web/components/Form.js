import React from 'react';
import NumericInput from 'react-numeric-input';
import Datetime from 'react-datetime';
import './../../node_modules/react-datetime/css/react-datetime.css';
import moment from 'moment';
import _ from 'underscore';

export default class Form extends React.Component {
    constructor(props) {
        super(props);

        let schema = props.getSchema();

        let obj = {};
        for(let i=0; i<schema.fields.length; i++) {
            obj[schema.fields[i]._id] = '';
        }

        obj['requiredError'] = false;

        this.state = obj;

        this.changeState = this.changeState.bind(this);
        this.changeStateInteger= this.changeStateInteger.bind(this);
        this.submitForm = this.submitForm.bind(this);

        //workaround for react datetime event handlers not receiving event object
        this.datetimeChangeFunctions = {};
        this.datetimeBlurFunctions = {};

    }

    componentDidMount() {
    }

    changeState(e) {
        var obj = {};
        obj[e.target.id] = e.target.value;
        this.setState(obj);
    }

    changeStateInteger(valueAsNumber, valueAsString, input) {
        var obj = {};
        obj[input.id] = valueAsNumber;
        this.setState(obj);
    }

    submitForm(e) {
        let result = {};
        for(let key in this.state) {
            if(key == 'requiredError') {
                continue;
            }

            let field = _.find(this.props.fields, (item) => {
                return item._id == key;
            });

            let value = this.state[key];
            if(field.dataType == 'datetime' && Object.prototype.toString.call(value) != '[object String]') {
                value = value.format();
            }

            console.log(value)
            console.log(Object.prototype.toString.call(value))

            if(Object.prototype.toString.call(value) != '[object Number]' && value.trim() == '' && field.required) {
                this.setState({requiredError: true}, () => {
                    setTimeout(()=>{this.setState({requiredError: false})}, 3000);
                });

                return;
            }

            result[key] = value;
        }

        console.log(result)

        try {
            var forms = JSON.parse(localStorage.getItem('forms'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(forms) !== '[object Object]') {
            forms = {};
        }

        if(forms[this.props.match.params.id] == null) {
            forms[this.props.match.params.id] = [];
        }

        forms[this.props.match.params.id].push(result);
        localStorage.setItem('forms', JSON.stringify(forms));
        this.props.history.push('/forms/'+this.props.match.params.id);
    }

    render() {
        const sortedFields = _.sortBy(this.props.formFields, (item) => {
            return item.order;
        });

        const inputs = sortedFields.map((schemaItem, index) => {
            //get field info from schema id
            var item = _.find(this.props.fields, (field) => {
                return schemaItem._id == field._id;
            });

            //string dataType
            var input = <input className="form-control" type="text" id={item._id} onChange={this.changeState} value={this.state[item._id]}/>;
            //text dataType
            if(item.dataType == "text") {
                input = <input className="form-control" id={item._id} type="text-area" onChange={this.changeState} value={this.state[item._id]}/>;
            }
            //integer dataType
            else if(item.dataType == "integer") {
                input  = <NumericInput value={this.state[item._id]} className="form-control" id={item._id} parse={parseInt} onChange={this.changeStateInteger} value={this.state[item._id]}/>;
            }
            //datetime dataType
            else if(item.dataType == "datetime") {
                //create change function with id as key
                this.datetimeChangeFunctions[item._id] = (momentObject) => {
                    var obj = {};
                    obj[item._id] = momentObject;
                    this.setState(obj);
                };

                //create blur function with id as key
                this.datetimeBlurFunctions[item._id] = (momentObject) => {
                    //set fields to blank if not moment object
                    if(Object.prototype.toString.call(momentObject) == '[object String]') {
                        var obj = {};
                        obj[item._id] = '';
                        this.setState(obj);
                    }
                };

                input = (
                    <Datetime
                        onBlur={this.datetimeBlurFunctions[item._id].bind(this)}
                        onChange={this.datetimeChangeFunctions[item._id].bind(this)}
                        value={this.state[item._id]}
                    />
                );
            }
            //boolean datatype
            else if(item.dataType == "boolean") {
                input = <input type="checkbox" id={item._id} className="checkbox" onChange={this.changeState} value={this.state[item._id]}/>;
            }

            let asterisk = '';
            if(item.required) {
                asterisk = '*';
            }

            return (
                <div className="row">
                    <div className="col-sm-12">
                        <label>{item.label} {asterisk}</label>
                        {input}
                    </div>
                </div>
            )
        });

        return (
            <div>
                <h2>{this.props.title}</h2>
                <hr/>
                {inputs}
                <div className="row">
                    <div className="col-sm-12">
                        <button className="btn btn-primary" style={{marginTop: "10px"}} onClick={this.submitForm}>Submit</button>
                    </div>
                </div>
                <div style={{display: this.state.requiredError ? 'block' : 'none', color: 'red'}}>missing required field</div>
            </div>
        )
    }
}