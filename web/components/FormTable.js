import React from 'react';
import {Link} from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import _ from 'underscore';

export default class FormTable extends React.Component {
    constructor() {
        super();

        this.state = {
            forms: []
        };

        this.getForms = this.getForms.bind(this);
    }

    gotoCreate() {
        this.props.history.push('/forms/'+this.props.match.params.id+'/create');
    }

    componentDidMount() {
        this.props.setSchema(this.getForms);
    }

    componentDidUpdate(prevProps) {
        if(this.props.match.params.id != prevProps.match.params.id) {
            this.props.setSchema(this.getForms);
        }
    }

    getForms() {
        try {
            var forms = JSON.parse(localStorage.getItem('forms'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(forms) === '[object Object]' && forms[this.props.match.params.id] != null) {
            //fill in fields as blank if fields were added to layout after form creation
            let formResult = forms[this.props.match.params.id].map((item, index) => {
                for(let i=0; i<this.props.formFields.length; i++) {
                    if(item.hasOwnProperty(this.props.formFields[i]._id)) {
                        continue;
                    }
                    item[this.props.formFields[i]._id] = '';
                }

                item['_id'] = index;

                return item;
            });

            this.setState({forms: formResult});
        }
        else {
            this.setState({forms: []});
        }
    }

    formatEdit(cell, row) {
        return <Link to={"/forms/"+this.props.match.params.id+"/edit/" + row._id}>edit</Link>
    }

    render() {
        const sortedFormFields = _.sortBy(this.props.formFields, (item) => {
            return item.order;
        });

        return (
            <div>
                <div><button className="btn btn-primary" onClick={this.gotoCreate.bind(this)}>Create New</button></div>
                <h2>{this.props.title}</h2>
                <hr/>
                <BootstrapTable data={this.state.forms}>
                    <TableHeaderColumn isKey dataField='_id' hidden/>
                    <TableHeaderColumn width='60px' dataField={null} dataFormat={this.formatEdit.bind(this)} >Edit</TableHeaderColumn>
                    {
                        sortedFormFields.map((item, index) => {
                            return <TableHeaderColumn key={index} dataField={item._id}>{item.label}</TableHeaderColumn>
                        })
                    }
                </BootstrapTable>
            </div>
        )
    }
}