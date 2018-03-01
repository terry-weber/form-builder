import React from 'react';
import { Switch, Route } from 'react-router-dom';
import SchemasList from "./SchemasList";
import FormBuilder from "./FormBuilder";

export default () => (
    <Switch>
        <Route exact path='/edit-forms' component={SchemasList}/>
        <Route path='/edit-forms/:id' component={FormBuilder}/>
    </Switch>
);