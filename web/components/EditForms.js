import React from 'react';
import { Switch, Route } from 'react-router-dom';
import SchemasList from "./SchemasList";
import FormBuilder from "./FormBuilder";

export default (props) => (
    <Switch>
        <Route exact path='/edit-forms' component={SchemasList}/>
        <Route path='/edit-forms/:id' render={routeProps => <FormBuilder {...routeProps} setSchemas={props.setSchemas}/>}/>
    </Switch>
);