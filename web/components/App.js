import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch,  HashRouter} from "react-router-dom";
import CreateField from './CreateField';
import MenuPageContainer from './MenuPageContainer';
import EditFields from './EditFields';
import FormBuilder from './FormBuilder';
import EditForms from './EditForms';
import Forms from './Forms'

var Home = () => {
    return (
        <div>
            <h1>Form Builder</h1>
            <ol>
                <li>Define Fields</li>
                <li>Define Form Layout</li>
                <li>Create Forms</li>
            </ol>
        </div>
    )
};

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            formSchemas: []
        };

        this.setSchemas = this.setSchemas.bind(this);
    }

    setSchemas() {
        try {
            var schemas = JSON.parse(localStorage.getItem('formSchemas'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(schemas) !== '[object Array]') {
            schemas  = [];
            localStorage.setItem('formSchemas', JSON.stringify(schemas));
        }

        this.setState({formSchemas: schemas});
    }

    componentDidMount() {
        this.setSchemas();
    }

    render() {
        return (
            <HashRouter>
                <MenuPageContainer formSchemas={this.state.formSchemas}>
                    <Route path={'/'} component={Home} exact/>
                    <Route path={'/create-field'} component={CreateField}/>
                    <Route path={'/edit-fields'} component={EditFields}/>
                    <Route path={'/form-builder'} render={routeProps => <FormBuilder setSchemas={this.setSchemas} {...routeProps}/>}/>
                    <Route path={'/edit-forms'} render={routeProps => <EditForms setSchemas={this.setSchemas} {...routeProps}/>}/>
                    <Route path={'/forms/:id'} component={Forms}/>
                </MenuPageContainer>
            </HashRouter>
        )
    }
};