import React from 'react'
import { Switch, Route } from 'react-router-dom'
import FieldsList from './FieldsList';
import CreateField from './CreateField';

export default () => (
    <Switch>
        <Route exact path='/edit-fields' component={FieldsList}/>
        <Route path='/edit-fields/:id' component={CreateField}/>
    </Switch>
);