import React, { Component } from 'react';
import { EditorState } from 'draft-js';

class inlineMathSpan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      text: ''
    }
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  // onChange(e) {
  //   console.log("asdf")
  //   console.log(e.target.value)
  //   this.setState({
  //     ...this.state, text: e.target.value
  //   })
  // }

  onFocus() {
    console.log("Focused via onFocus call")
    const { setReadOnly, getEditorState, setEditorState } = this.props.getStore();
    // setReadOnly(true);
    const editorState = getEditorState();
    const selectionState = editorState.getSelection();

    this.setState({
      editMode: true
    });
    setReadOnly(true);
  }

  onBlur(direction) {
    const { getEditorState, setEditorState, setReadOnly } = this.props.getStore();
    setReadOnly(false);

    this.setState({
      editMode: false
    });

    if (direction === 1) {
      console.log("A");
      const editorState = getEditorState();
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();

      const blockKey = selectionState.getAnchorKey()
      const block = contentState.getBlockForKey(blockKey)
      const offset = selectionState.getStartOffset() + 1;
      console.log("OFFSETS:", block.getText().length - 1, offset);
      if (block.getText().length - 1 === offset) {
        var newContent = contentState;
        newContent = Modifier.insertText(
          newContent,
          selectionState.merge({
            anchorOffset: offset,
            focusOffset: offset
          }),
          ' '
        )
        console.log("B");
        setEditorState(EditorState.push(EditorState.moveFocusToEnd(editorState), newContent, 'insert-characters'));
        console.log("C");
      }
    }
    else if (direction === -1) {
      console.log(getEditorState().getSelection().getAnchorOffset())
    }
  }

  componentDidMount() {
    // MQ.MathField(this.ele, {
    //   handlers: {
    //     edit: (mathfield) => console.log("edited", mathfield),
    //     enter: (mathfield) => console.log("entered", mathfield),
    //     moveOutOf: (direction, mathField) => {
    //       console.log("moved out of", direction, mathField)
    //       if (direction === -1) {
    //
    //       }
    //       else if (direction === 1) {
    //
    //       }
    //       this.onBlur(direction);
    //     },
    //     selectOutOf: (direction, mathField) => console.log("selectedOutOf", direction, mathField),
    //     deleteOutOf: (direction, mathField) => console.log("deleteOutOf", direction, mathField)
    //   }
    // });
  }

  render() {
    const editorState = this.props.getEditorState();
    const blockKey = editorState.getSelection().getAnchorKey();
    return (
      <span id={`${blockKey}_${this.props.entityKey}`}
        style={{
          color: "red",
          backgroundColor: "#eee"
        }}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        ref={(ele) => this.ele = ele}
        >
        {this.props.children}
      </span>
    )
  }
}

export default inlineMathSpan;
