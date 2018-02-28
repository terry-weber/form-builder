import React from 'react';
import {apiRoot} from './../config';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

var products = [{
    id: 1,
    name: "Product1",
    price: 120
}, {
    id: 2,
    name: "Product2",
    price: 80
}];

export default class Table extends React.Component {
    render() {
        return (
            <BootstrapTable data={products}>
                <TableHeaderColumn isKey dataField='id'>Product ID</TableHeaderColumn>
                <TableHeaderColumn dataField='name'>Name</TableHeaderColumn>
                <TableHeaderColumn dataField='price'>Price</TableHeaderColumn>
            </BootstrapTable>
        )
    }
}