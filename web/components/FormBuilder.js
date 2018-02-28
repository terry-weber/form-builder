import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DropTarget, DragDropContext, DragSource } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'underscore';

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
    emitChange();

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
    render() {
        const { connectDragSource, isDragging } = this.props;
        return connectDragSource(
            <div style={{
                fontSize: 25,
                fontWeight: 'bold',
                cursor: 'move'
            }}>
                {this.props.name}
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
                order: dropOrder
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
            <div>
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
                border: '1px solid black'
            }}>
                {this.props.children}
            </div>
        );
    }
}

DropArea = DropTarget([ItemTypes.FORM_ELEMENT, ItemTypes.NEW_FIELD], elementDropTarget, collectDropTarget)(DropArea);

class Board extends Component {
    renderFormElement(element) {
        return (
            <DropArea key={element.order} order={element.order}>
                <FormElement name={element.name} order={element.order} _id={element._id} label={element.label}/>
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

        console.log(sortedElements)

        formElements.push(
            <DropArea order={this.props.formElements.length} key={this.props.formElements.length}>
                <div style={{height: "100px"}}></div>
            </DropArea>
        );

        return (
            <div>
                <div style={{width: "20%", float: 'left'}}>
                    {this.props.fields.map((item, index) => {
                        for(let i=0; i<this.props.formElements.length; i++) {
                            if(this.props.formElements[i]._id == item._id) {
                                return;
                            }
                        }
                        return (
                            <NewField _id={item._id} name={item.name} label={item.label} key={index}>
                                <div key={index}>{item.name}</div>
                            </NewField>
                        )
                    })}
                </div>
                <div style={{float: 'right', width: '80%'}}>
                    {formElements}
                </div>
            </div>
        );
    }
}

Board = DragDropContext(HTML5Backend)(Board);

export default class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            formElements: [],
            fields: []
        };
        this.unobserve = observe(this.handleChange.bind(this))
    }

    componentDidMount() {
        try {
            var fields = JSON.parse(localStorage.getItem('fields'));
        }
        catch(err) {}

        if(Object.prototype.toString.call(fields) !== '[object Array]') {
            fields = [];
            localStorage.setItem('fields', fields);
        }

        this.setState({fields: fields});
    }

    handleChange(formElements) {
        this.setState({formElements: formElements})
    }

    componentWillUnmount() {
        this.unobserve();
    }

    render() {
        return (
            <Board formElements={this.state.formElements} fields={this.state.fields}/>
        )
    }
}
