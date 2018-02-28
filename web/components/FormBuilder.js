import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DropTarget, DragDropContext, DragSource } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'underscore';

var ItemTypes = {
    FORM_ELEMENT: 'formElement',
    NEW_FIELD: 'newField'
};


let elements = [
    {name: 'word 0', order: 0, id: 0},
    {name: 'word 1', order: 1, id: 1},
    {name: 'word 2', order: 2, id: 2}
];

let observer = null;

function emitChange() {
    observer(elements)
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
        const node = ReactDOM.findDOMNode(component).getBoundingClientRect();
        const width = node.width;
        const height = node.height;
        return {order: props.order, width: width, height: height};
    },
    endDrag(props, moniter, component) {
        if(moniter.getDropResult() != null) {
            const id = props.id;
            const dragOrder = props.order;
            const dropOrder = moniter.getDropResult().order;

            console.log(dragOrder)
            console.log(dropOrder)

            for(var i=0; i<elements.length; i++) {
                //set order of dragged element to drop target order or 1 less if in the empty drop zone
                if(elements[i].id == id) {
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

NewField =  DragSource(ItemTypes.NEW_FIELD, elementDragSource, collectFormElement)(NewField);

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
    renderSquare(element) {
        return (
            <DropArea key={element.order} order={element.order}>
                <FormElement name={element.name} order={element.order} id={element.id}/>
            </DropArea>
        )
    }

    render() {
        const sortedElements = _.sortBy(this.props.elements, (item) => {
            console.log(item);
            return item.order;
        });

        console.log(sortedElements);

        const squares = [];
        for (let i = 0; i < sortedElements.length; i++) {
            squares.push(this.renderSquare(sortedElements[i]))
        }


        squares.push(
            <DropArea order={this.props.elements.length} key={this.props.elements.length}>
                <div style={{height: "100px"}}></div>
            </DropArea>
        );


        console.log(squares);

        console.log(this.props.elements);

        return (
            <div>
                <div style={{width: "20%", float: 'left'}}>
                    {this.props.fields.map((item, index) => {
                        return (
                            <NewField>
                                <div key={index}>{item.name}</div>
                            </NewField>
                        )
                    })}
                </div>
                <div style={{float: 'right', width: '80%'}}>
                    {squares}
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
          elements: elements,
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

    handleChange(newElements) {
        this.setState({elements: newElements})
    }

    componentWillUnmount() {
        this.unobserve()
    }

    render() {
        return (
            <Board elements={this.state.elements} fields={this.state.fields}/>
        )
    }
}
