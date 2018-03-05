import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import { DropTarget, DragDropContext, DragSource } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'underscore';
import uuid from './../util/uuid';

var ItemTypes = {
    FORM_ELEMENT: 'formElement',
    NEW_FIELD: 'newField'
};


let elements = [];

let observer = null;

function emitChange() {
    observer(elements);
}

function observe(o) {
    if (observer) {
        throw new Error('Multiple observers not implemented.')
    }

    observer = o;

    return () => {
        observer = null;
    }
}

const elementDropTarget = {
    drop(props) {
        return props;
    }
};

function collectDropTarget(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        item: monitor.getItem()
    };
}

const elementDragSource = {
    beginDrag(props, monitor, component) {
        return {order: props.order};
    },
    endDrag(props, moniter, component) {
        if(moniter.getDropResult() != null) {
            const id = props._id;
            const dragOrder = props.order;
            const dropOrder = moniter.getDropResult().order;

            for(var i=0; i<elements.length; i++) {
                //set order of dragged element to drop target order or 1 less if in the empty drop zone
                if(elements[i]._id == id) {
                    elements[i].order = dropOrder == elements.length ? dropOrder-1 : dropOrder;
                }
                //dragged element is moved up so decrement order of elements above initial position
                else if(elements[i].order > dragOrder && elements[i].order <= dropOrder && dragOrder < dropOrder) {
                    elements[i].order--;
                }
                //dragged element is moved down so increment order of elements below initial position
                else if(elements[i].order < dragOrder && elements[i].order>= dropOrder && dragOrder > dropOrder) {
                    elements[i].order++;
                }
            }

            emitChange();
        }

    }
};

function collectFormElement(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

class FormElement extends Component {
    removeElement(e) {
        let order = null;
        elements = _.reject(elements, (item) => {
            let found = false;
            if(item._id == this.props._id) {
                order = item.order;
                found = true;
            }
            return found;
        });

        console.log(elements)

        for(let i=0; i<elements.length; i++) {
            if(elements[i].order > order) {
                elements[i].order--;
            }
        }
        emitChange();
    }

    render() {
        const { connectDragSource, isDragging } = this.props;
        return connectDragSource(
            <div className="formBuilderInput">
                <label style={{cursor: "move"}}>{this.props.label} <span style={{display: this.props.required ? 'inline-block' : 'none'}}>*</span></label>
                <a style={{float: "right", color: "red", fontSize: "18px", fontWeight: "bold"}} href="javascript:void(0)" onClick={this.removeElement.bind(this)}>&times;</a>

                <div>
                    <input style={{cursor: "move"}} className="form-control" type="text" disabled placeholder={this.props.name}/>
                </div>
            </div>
        )

    }
}

FormElement = DragSource(ItemTypes.FORM_ELEMENT, elementDragSource, collectFormElement)(FormElement);

const newFieldDragSource = {
    beginDrag(props, monitor, component) {
        return props;
    },
    endDrag(props, moniter, component) {
        if(moniter.getDropResult() != null) {
            let dropOrder = moniter.getDropResult().order;
            for(let i=0; i<elements.length; i++) {
                //increment order of elements above drop position
                if(elements[i].order >= dropOrder) {
                    elements[i].order++;
                }
            }

            elements.push({
                name: props.name,
                _id:props._id,
                label: props.label,
                order: dropOrder,
                required: props.required
            });

            emitChange();
        }
    }
};

function collectNewField(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

class NewField extends Component {
    render() {
        const { connectDragSource } = this.props;
        return connectDragSource (
            <div className="addFieldDragElement">
                {this.props.children}
            </div>
        )
    }

}

NewField =  DragSource(ItemTypes.NEW_FIELD, newFieldDragSource, collectNewField)(NewField);

class DropArea extends Component {

    render() {
        const { connectDropTarget, isOver, item } = this.props;

        return connectDropTarget(
            <div style={{
                border: '1px 1px 1px 0px solid black'
            }}>
                {this.props.children}
            </div>
        );
    }
}

DropArea = DropTarget([ItemTypes.FORM_ELEMENT, ItemTypes.NEW_FIELD], elementDropTarget, collectDropTarget)(DropArea);

class FormBuilder extends Component {
    renderFormElement(element) {
        return (
            <DropArea key={element.order} order={element.order}>
                <FormElement
                    name={element.name}
                    order={element.order}
                    _id={element._id}
                    label={element.label}
                    required={element.required}
                />
            </DropArea>
        )
    }

    render() {
        const sortedElements = _.sortBy(this.props.formElements, (item) => {
            return item.order;
        });

        const formElements = [];
        for (let i = 0; i < sortedElements.length; i++) {
            formElements.push(this.renderFormElement(sortedElements[i]))
        }

        formElements.push(
            <DropArea order={this.props.formElements.length} key={this.props.formElements.length}>
                <div className="dropArea">drop fields here</div>
            </DropArea>
        );

        return (
            <div>
                <div style={{width: "20%", float: 'left', padding: '10px'}}>
                    <h4>Drag Fields To Add:</h4>
                    {this.props.fields.length ?
                        this.props.fields.map((item, index) => {
                            for(let i=0; i<this.props.formElements.length; i++) {
                                if(this.props.formElements[i]._id == item._id) {
                                    return;
                                }
                            }
                            return (
                                <NewField
                                    _id={item._id}
                                    name={item.name}
                                    label={item.label}
                                    key={index}
                                    required={item.required}
                                >
                                    <div key={index}>{item.name}</div>
                                </NewField>
                            )
                        }) :
                        <div>no fields defined. <Link to="/create-field">define a field</Link></div>
                    }
                </div>
                <div style={{float: 'right', width: '80%', paddingTop: "10px"}}>
                    <h4>Form Title:</h4>
                    <input placeholder="enter a form title" type="text" className="form-control" value={this.props.title} onChange={this.props.titleChange}/>
                    <hr/>
                    <h4>Form Layout:</h4>
                    {formElements}
                </div>
            </div>
        );
    }
}

FormBuilder = DragDropContext(HTML5Backend)(FormBuilder);

export default class FormBuilderWrapper extends Component {
    constructor(props) {
        super(props);

        this.state = {
            formElements: [],
            fields: [],
            title: '',
            error: false,
            nameRepeated: false,
            isEdit: false
        };
    }

    componentDidMount() {
        this.unobserve = observe(this.handleChange.bind(this));

        try {
            var fields = JSON.parse(localStorage.getItem('fields'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(fields) !== '[object Array]') {
            fields = [];
            localStorage.setItem('fields', JSON.stringify(fields));
        }

        this.setState({fields: fields});

        if(this.props.match.hasOwnProperty('params') && this.props.match.params.hasOwnProperty('id')) {
            this.setState({isEdit: true});
            const schemas = JSON.parse(localStorage.getItem('formSchemas'));
            const schema = _.find(schemas, (item) => {
                return item._id == decodeURIComponent(this.props.match.params.id);
            });

            console.log(schema);
            let formElements = [];

            for(let i=0; i<schema.fields.length; i++) {
                let field = _.find(fields, (item) => {
                    return item._id == schema.fields[i]['_id'];
                });

                console.log(field)
                field['order'] = schema.fields[i].order;
                formElements.push(field);
            }

            this.setState({
                title: schema.title,
                formElements: formElements
            });

            elements = formElements;
        }

    }

    handleChange(formElements) {
        this.setState({formElements: formElements});
    }

    titleChange(e) {
        this.setState({title: e.target.value});
    }

    saveLayout(e) {
        let hasRequiredField = false;
        for(let i=0; i<this.state.formElements.length; i++) {
            if(this.state.formElements[i].required) {
                hasRequiredField = true;
                break;
            }
        }

        if(this.state.title.trim() == '' || !hasRequiredField) {
            this.setState({error: true}, () => {
                setTimeout(() => {
                    this.setState({error: false})
                }, 3000);
            });
            return;
        }

        //get schemas from local storage
        try {
            var schemas = JSON.parse(localStorage.getItem('formSchemas'));
        }
        catch(err) {
            return;
        }

        console.log(schemas)

        if(Object.prototype.toString.call(schemas) === '[object Array]') {
            for(var i=0; i<schemas.length; i++) {
                if(this.state.title == schemas[i].title) {
                    this.setState({nameRepeated: true}, () => {
                        setTimeout(() => {
                            this.setState({nameRepeated: false})
                        }, 3000);
                    });
                    return;
                }
            }
        }
        else {
            schemas = [];
        }

        const schemaFields = this.state.formElements.map((item, index) => {
           return {
               order: item.order,
               _id: item._id
           }
        });

        let formSchema = {
            title: this.state.title,
            fields: schemaFields,
            _id: uuid()
        };

        schemas.push(formSchema);

        console.log(schemas)
        localStorage.setItem('formSchemas', JSON.stringify(schemas));
        console.log(this.props)
        this.props.setSchemas();
        this.props.history.push('/edit-forms');
    }

    updateLayout(e) {
        let hasRequiredField = false;
        for(let i=0; i<this.state.formElements.length; i++) {
            if(this.state.formElements[i].required) {
                hasRequiredField = true;
                break;
            }
        }

        if(this.state.title.trim() == '' || !hasRequiredField) {
            this.setState({error: true}, () => {
                setTimeout(() => {
                    this.setState({error: false})
                }, 3000);
            });
            return;
        }

        //get schemas from local storage
        try {
            var schemas = JSON.parse(localStorage.getItem('formSchemas'));
        }
        catch(err) {
            return;
        }

        if(Object.prototype.toString.call(schemas) === '[object Array]') {
            for(var i=0; i<schemas.length; i++) {
                if(this.state.title.toLowerCase().trim() == schemas[i].title && this.props.match.params.id != schemas[i]._id) {
                    this.setState({nameRepeated: true}, () => {
                        setTimeout(() => {
                            this.setState({nameRepeated: false})
                        }, 3000);
                    });
                    return;
                }
            }

            const schemaFields = this.state.formElements.map((item, index) => {
                return {
                    order: item.order,
                    _id: item._id
                }
            });

            let formSchema = {
                title: this.state.title,
                fields: schemaFields,
                _id: this.props.match.params.id
            };

            for(var i=0; i<schemas.length; i++) {
                if(schemas[i]['_id'] == this.props.match.params['id']) {
                    schemas[i] = formSchema;
                    break;
                }
            }
        }
        else {
            throw 'formSchemas not defined';
        }

        localStorage.setItem('formSchemas', JSON.stringify(schemas));
        this.props.setSchemas();
        this.props.history.push('/edit-forms');
    }

    componentWillUnmount() {
        elements = [];
        this.unobserve();
    }

    render() {
        return (
            <div>
                <div style={{overflow: "auto"}}>
                    <FormBuilder
                        formElements={this.state.formElements}
                        fields={this.state.fields}
                        title={this.state.title}
                        titleChange={this.titleChange.bind(this)}
                    />
                </div>
                <div style={{marginTop: "10px", marginLeft: "20%"}}>
                    <button className="btn btn-primary" onClick={this.state.isEdit ? this.updateLayout.bind(this) : this.saveLayout.bind(this)}>Save</button>
                    <div style={{color: "red", display: this.state.error ? 'block' : 'none'}}>form must have a title and at least one required field</div>
                    <div style={{color: "red", display: this.state.nameRepeated ? 'block' : 'none'}}>already a form layout with this title</div>
                </div>
            </div>
        )
    }
}
