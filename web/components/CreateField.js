import React from 'react';
import _ from 'underscore';
import uuid from './../util/uuid';

export default class CreateField extends React.Component {

    constructor() {
        super();

        this.state = {
            dataType: 'string',
            name: '',
            label: '',
            required: false,
            error: false,
            nameUsed: false,
            labelUsed: false,
            isEdit: false
        };
    }

    componentDidMount() {
        //if editing a field, pull data from local storage
        if(this.props.match.hasOwnProperty('params') && this.props.match.params.hasOwnProperty('id')) {
            this.setState({isEdit: true});

            const fields = JSON.parse(localStorage.getItem('fields'));
            const field = _.find(fields, (item) => {
                return item._id == decodeURIComponent(this.props.match.params.id);
            });
            this.setState(field);
        }
    }

    dataTypeChange(e) {
        this.setState({dataType: e.target.value});
    }

    nameChange(e) {
        this.setState({name: e.target.value});
    }

    labelChange(e) {
        this.setState({label: e.target.value});
    }

    requiredChange(e) {
        this.setState({required: e.target.checked});
    }

    submitField(e) {
        if(this.state.name == '' || this.state.label == '') {
            this.setState({error: true});
            setTimeout(() => {this.setState({error: false})}, 3000)
            return;
        }

        const newField = {
            dataType: this.state.dataType,
            name: this.state.name,
            label: this.state.label,
            required: this.state.required,
            _id: uuid()
        };

        try {
            var fields = JSON.parse(localStorage.getItem('fields'));
        }
        catch(err) {
            console.log(err)
        }

        if(Object.prototype.toString.call(fields) === '[object Array]') {
            for(var i=0; i<fields.length; i++) {
                if(fields[i]['name'] == newField.name) {
                    this.setState({nameUsed: true});
                    setTimeout(() => {
                        this.setState({nameUsed: false});
                    }, 3000);
                    return;
                }

                if(fields[i]['label'] == newField.label) {
                    this.setState({labelUsed: true});
                    setTimeout(() => {
                        this.setState({labelUsed: false});
                    }, 3000);
                    return;
                }
            }
        }
        else {
            fields = [];
        }

        fields.push(newField);

        localStorage.setItem('fields', JSON.stringify(fields));

        this.props.history.push('/edit-fields')
    }

    updateField(e) {
        if(this.state.name.trim() == '' || this.state.label.trim() == '') {
            this.setState({error: true});
            setTimeout(() => {this.setState({error: false})}, 3000)
            return;
        }

        const updateFields = {
            name: this.state.name,
            label: this.state.label,
            required: this.state.required
        };

        try {
            var fields = JSON.parse(localStorage.getItem('fields'));
        }
        catch(err) {
            return;
        }

        if(Object.prototype.toString.call(fields) === '[object Array]') {
            if(Object.prototype.toString.call(fields) === '[object Array]') {
                for(var i=0; i<fields.length; i++) {
                    if(fields[i]['name'].toLowerCase().trim() == updateFields.name.toLowerCase().trim() && fields[i]['_id'] != this.props.match.params.id) {
                        this.setState({nameUsed: true});
                        setTimeout(() => {
                            this.setState({nameUsed: false});
                        }, 3000);
                        return;
                    }

                    if(fields[i]['label'].toLowerCase().trim() == updateFields.label.toLowerCase().trim() && fields[i]['_id'] != this.props.match.params.id) {
                        this.setState({labelUsed: true});
                        setTimeout(() => {
                            this.setState({labelUsed: false});
                        }, 3000);
                        return;
                    }
                }
            }

            for(var i=0; i<fields.length; i++) {
                if(fields[i]['_id'] == this.props.match.params['id']) {
                    fields[i] = Object.assign(fields[i], updateFields);
                    break;
                }
            }
        }
        else {
            throw 'fields not defined';
        }

        localStorage.setItem('fields', JSON.stringify(fields));

        this.props.history.push('/edit-fields');
    }


    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-4 col-sm-12">
                        <label>Data type</label>
                        <select disabled={this.state.isEdit} className="form-control" onChange={this.dataTypeChange.bind(this)}>
                            <option>string</option>
                            <option>text</option>
                            <option>integer</option>
                            <option>datetime</option>
                            <option>boolean</option>
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 col-sm-12">
                        <label>Field Name</label>
                        <input type="text" className="form-control" value={this.state.name} onChange={this.nameChange.bind(this)}/>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 col-sm-12">
                        <label>Field Label</label>
                        <input type="text" className="form-control" value={this.state.label} onChange={this.labelChange.bind(this)}/>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 col-sm-12">
                        <label>Is Required</label>
                        <input className="checkbox" type="checkbox" checked={this.state.required} onChange={this.requiredChange.bind(this)}/>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 col-sm-12">
                        <button
                            style={{marginTop: "10px"}}
                            className="btn btn-primary"
                            onClick={this.state.isEdit ? this.updateField.bind(this) : this.submitField.bind(this)}
                        >
                            Submit
                        </button>
                    </div>
                </div>

                <div className="row" style={{display: this.state.error ? 'block' : 'none'}}>
                    <div className="col-md-4 col-sm-12">
                        <span style={{color:"red"}}>Name and Label are required</span>
                    </div>
                </div>

                <div className="row" style={{display: this.state.nameUsed ? 'block' : 'none'}}>
                    <div className="col-md-4 col-sm-12">
                        <span style={{color:"red"}}>Name already used</span>
                    </div>
                </div>

                <div className="row" style={{display: this.state.labelUsed ? 'block' : 'none'}}>
                    <div className="col-md-4 col-sm-12">
                        <span style={{color:"red"}}>Label already used</span>
                    </div>
                </div>
            </div>
        )
    }
}