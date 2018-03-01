import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch,  HashRouter} from "react-router-dom";
import Table from './Table';
import CreateField from './CreateField';
import MenuPageContainer from './MenuPageContainer';
import EditFields from './EditFields';
import FormBuilder from './FormBuilder';
import EditForms from './EditForms';

var Home = () => {
    return (
        <h1>edit</h1>
    )
};

const App = () => (
    <HashRouter>
        <MenuPageContainer>
            <Route path={'/'} component={Home} exact/>
            <Route path={'/create-field'} component={CreateField}/>
            <Route path={'/edit-fields'} component={EditFields}/>
            <Route path={'/form-builder'} component={FormBuilder}/>
            <Route path={'/edit-forms'} component={EditForms}/>
        </MenuPageContainer>
    </HashRouter>
);

export default App;