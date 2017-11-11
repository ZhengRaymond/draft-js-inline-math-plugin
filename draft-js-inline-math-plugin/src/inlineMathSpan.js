import React, { Component } from 'react';
import { convertToRaw, SelectionState, EditorState } from 'draft-js';
import Radium from 'radium';

class inlineMathSpan extends Component {
  constructor(props) {
    super(props);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.state = {
      active: false,
      count: 0
    };
    setInterval(() => {
      console.log(this.state.count);
      this.setState({...this.state, count: this.state.count + 1});
    }, 1000);
  }

  onFocus() {
    console.log('onFocus')
    const { setReadOnly } = this.props.getStore();
    setReadOnly(true);
    this.setState({ active: true });
  }

  onBlur(direction) {
    console.log(`onBlur(${direction})`)
    const { getEditorState, setEditorState, setReadOnly, getEditorRef } = this.props.getStore();
    setReadOnly(false);

    if (direction === 1 || direction === -1) {
      getEditorRef().refs.editor.focus();
      const editorState = getEditorState();
      const selectionState = editorState.getSelection();
      const currentContent = editorState.getCurrentContent();
      var block = currentContent.getBlockForKey(this.blockKey);
      var offset = 0;
      var blockKey = selectionState.getAnchorKey();
      if (block) {
        const len = block.getText().length;
        for (var i = 0; i < len; i++) {
          if (block.getEntityAt(i) === this.props.entityKey) {
            blockKey = block.getKey();
            offset = i;
            break;
          }
        }
      }
      else {
        block = currentContent.getFirstBlock();
        while (block) {
          let len = block.getText().length;
          for (var i = 0; i < len; i++) {
            if (block.getEntityAt(i) === this.props.entityKey) {
              blockKey = block.getKey();
              offset = i;
              break;
            }
          }
          block = currentContent.getBlockAfter(block.getKey());
        }
      }
      this.blockKey = blockKey;

      // left --> direction = -1 --> offset = getAnchorOffset
      // right --> direction = 1 --> offset = getAnchorOffset + 2
      offset = offset + 2 * (direction === 1);
      const newSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: offset,
        focusOffset: offset
      });
      const newState = EditorState.forceSelection(editorState, newSelection);
      setEditorState(newState);
    }

    this.setState({ active: false })
  }

  componentDidMount() {
    this.mathfield = MQ.MathField(this.ele, {
      handlers: {
        edit: (mathfield) => console.log("edited", mathfield),
        enter: (mathfield) => this.onBlur(1),
        moveOutOf: (direction, mathField) => this.onBlur(direction),
        selectOutOf: (direction, mathField) => console.log("selectedOutOf", direction, mathField),
        deleteOutOf: (direction, mathField) => this.onBlur(direction),
      }
    });
    this.mathfield.data = this.data;
    // setInterval(() => console.log(this.data, this.mathfield.data), 1000);


  }

  render() {
    const editorState = this.props.getEditorState();
    const blockKey = editorState.getSelection().getAnchorKey();
    this.blockKey = blockKey;
    return (
      <styledMathSpan
        id={`${blockKey}_${this.props.entityKey}`}
        style={{
          // backgroundColor: this.state.active ? "#dedede" : "#efefef",
          backgroundColor: this.state.active ? "red" : "#efefef",
          border: "none",
          boxShadow: "none",
          transition: "0.25s ease",
          ":hover": {
            backgroundColor: "#dedede",
            transition: "0.25s ease"
          }
        }}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        ref={(ele) => this.ele = ele}
      />
    )
  }
}

export default Radium(inlineMathSpan);
