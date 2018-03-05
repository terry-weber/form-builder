import React from 'react';
import NumericInput from 'react-numeric-input';
import Datetime from 'react-datetime';
import './../../node_modules/react-datetime/css/react-datetime.css';
import moment from 'moment';
import _ from 'underscore';

export default class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {requiredError: false};

        this.submitForm = this.submitForm.bind(this);

        //workaround for react-datetime event handlers not receiving event object
        this.datetimeChangeFunctions = {};
        this.datetimeBlurFunctions = {};

    }

    componentDidMount() {
    }

    submitForm(e) {
        console.log(this.props.inputValues);

        for(let i=0; i<this.props.inputValues.length; i++) {
            if(this.props.inputValues[i].value.toString().trim() == '' && this.props.inputValues[i].required) {
                this.setState({requiredError: true}, () => {
                    setTimeout(()=>{this.setState({requiredError: false})}, 3000);
                });

                return;
            }
        }

        try {
            var forms = JSON.parse(localStorage.getItem('forms'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(forms) !== '[object Object]') {
            forms = {};
        }

        if(this.props.match.params.hasOwnProperty('formId')) {
            for(let i=0; i<forms[this.props.match.params.id].length; i++) {
                if(forms[this.props.match.params.id][i]._id == this.props.match.params.formId) {
                    forms[this.props.match.params.id].splice(i, 1);
                    break;
                }
            }
        }

        if(forms.hasOwnProperty(this.props.match.params.id)) {
            forms[this.props.match.params.id].push(this.props.inputValues);
        }
        else {
            forms[this.props.match.params.id] = [this.props.inputValues];
        }

        localStorage.setItem('forms', JSON.stringify(forms));

        this.props.history.push('/forms/'+this.props.match.params.id);
    }

    render() {

        const inputs = this.props.inputValues.map((item, index) => {
            //string dataType
            var input = <input className="form-control" type="text" onChange={(e)=>this.props.setInputValue(index, e.target.value)} value={item.value}/>;
            //text dataType
            if(item.dataType == "text") {
                input = <input className="form-control" type="text-area" onChange={(e)=>this.props.setInputValue(index, e.target.value)} value={item.value}/>;
            }
            //integer dataType
            else if(item.dataType == "integer") {
                input  = <NumericInput value={item.value} className="form-control" parse={parseInt} onChange={(valueAsNumber, valueAsString, input) => {this.props.setInputValue(index, valueAsNumber)}}/>;
            }
            //datetime dataType
            else if(item.dataType == "datetime") {
                //create change function with id as key
                this.datetimeChangeFunctions[item._id] = (momentObject) => {
                    if(Object.prototype.toString.call(momentObject) == '[object String]') {
                        this.props.setInputValue(index, momentObject);
                    }
                    else {
                        this.props.setInputValue(index, momentObject.format('YYYY-MM-DD HH:mm:ss'))
                    }
                };

                //create blur function with id as key
                this.datetimeBlurFunctions[item._id] = (momentObject) => {
                    //set fields to blank if not moment object
                    if(Object.prototype.toString.call(momentObject) == '[object String]') {
                        this.props.setInputValue(index, '');
                    }
                };

                input = (
                    <Datetime
                        onBlur={this.datetimeBlurFunctions[item._id].bind(this)}
                        onChange={this.datetimeChangeFunctions[item._id].bind(this)}
                        dateFormat={'YYYY-MM-DD'}
                        timeFormat={'HH:mm:ss'}
                        value={item.value}
                    />
                );
            }
            //boolean datatype
            else if(item.dataType == "boolean") {
                input = <input
                    type="checkbox"
                    className="checkbox"
                    onChange={(e)=>this.props.setInputValue(index,e.target.checked)}
                    checked={item.value}
                />;
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