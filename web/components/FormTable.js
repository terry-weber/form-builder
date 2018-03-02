import React from 'react';
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
        this.getForms();
    }

    componentDidUpdate(prevProps) {
        if(this.props.match.params.id != prevProps.match.params.id) {
            console.log('dkfjkdfjk')
            this.getForms();
        }
    }

    getForms() {
        try {
            var forms = JSON.parse(localStorage.getItem('forms'));
        }
        catch(err) {}

        console.log(forms)

        if(Object.prototype.toString.call(forms) === '[object Object]' && forms[this.props.match.params.id] != null) {
            console.log(forms[this.props.match.params.id])
            this.setState({forms: forms[this.props.match.params.id]})
        }
        else {
            this.setState({forms: []});
        }
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
                    <TableHeaderColumn isKey dataField='id' hidden/>
                    {
                        sortedFormFields.map((item, index) => {
                            let field = _.find(this.props.fields, (field) => {
                               return item._id ==  field._id;
                            });
                            return <TableHeaderColumn key={index} dataField={field._id}>{field.label}</TableHeaderColumn>
                        })
                    }
                </BootstrapTable>
            </div>
        )
    }
}