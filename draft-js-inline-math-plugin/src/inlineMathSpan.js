import React, { Component } from 'react';
import { convertToRaw, SelectionState, EditorState, Modifier } from 'draft-js';
import Radium from 'radium';

class inlineMathSpan extends Component {
  constructor(props) {
    super(props);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.exitLeft = this.exitLeft.bind(this);
    this.state = {
      active: false,
      count: 0
    };
    console.log(props);
    // setInterval(() => {
    //   console.log(this.state.count);
    //   this.setState({...this.state, count: this.state.count + 1});
    // }, 1000);
  }

  onFocus() {
    console.log('onFocus')
    const { setReadOnly } = this.props.getStore();
    setReadOnly(true);
    this.setState({ active: true });
  }

  componentWillUnmount() {
    console.log("unmounting")
  }

  exitLeft(editorState, selectionState, setReadOnly, getEditorRef) {
    setReadOnly(false);
    const ref = getEditorRef();
    if (ref) {
      ref.refs.editor.focus();
    }

    var offset = selectionState.getAnchorOffset() - 2;
    offset = offset * (offset > 0);
    const newSelection = selectionState.merge({
      anchorOffset: offset,
      focusOffset: offset
    })

    return EditorState.forceSelection(editorState, newSelection);
  }

  deleteOutOf(direction, mathField) {
    // const { getEditorState, setEditorState, setReadOnly, getEditorRef } = this.props.getStore();
    // if (mathField.latex().length === 0) {
    //   const editorState = getEditorState();
    //   const selectionState = editorState.getSelection();
    //   const currentContent = editorState.getCurrentContent();
    //   console.log("OFFSET0", selectionState.getAnchorOffset());
    //   var newState = this.exitLeft(editorState, selectionState, setReadOnly, getEditorRef)
    //
    //   const offset = selectionState.getAnchorOffset();
    //   console.log("OFFSET1", offset);
    //   var newContent = Modifier.applyEntity(
    //     currentContent,
    //     selectionState.merge({
    //       anchorOffset: offset - 1,
    //       focusOffset: offset
    //     }),
    //     null
    //   );
    //   // const newSelection = selectionState.merge({
    //   //   anchorOffset: offset,
    //   //   focusOffset: offset
    //   // })
    //   // console.log("OFFSET", offset);
    //
    //   // newState = EditorState.forceSelection(newState, newSelection);
    //
    //   console.log("OFFSET2", offset);
    //   setEditorState(EditorState.push(newState, newContent, 'delete-character'));
    //   console.log("OFFSET3", offset);
    // }
    // else {
      // this.onBlur(direction, true);
    // }
    this.onBlur(direction, mathField);
  }

  onBlur(direction, remove) {
    console.log(`onBlur(${direction})`)
    const { getEditorState, setEditorState, setReadOnly, getEditorRef } = this.props.getStore();
    setReadOnly(false);

    if (direction === 1 || direction === -1) {
      /* re-focus main editor */
      getEditorRef().refs.editor.focus();

      const editorState = getEditorState();
      const selectionState = editorState.getSelection();
      var currentContent = editorState.getCurrentContent();

      /* find blockKey, entityKey, and offset */
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

      //^^^ offset = beginning of entity
      offset = offset + 1;
      //vvv offset = entity

      // if moving forward and at end, insert space to let user exit mathfield.
      if (direction === 1 && offset === block.getText().length) {
        var newContent = Modifier.insertText(
          currentContent,
          selectionState.merge({
            anchorOffset: offset,
            focusOffset: offset
          }),
          ' '
        )
      }

      // if deleting out of empty mathfield, delete the field
      if (remove && direction === -1 && remove.latex().length === 0) {
        var deleteContent = Modifier.replaceText(
          currentContent,
          selectionState.merge({
            anchorOffset: offset - 2,
            focusOffset: offset + 1
          }),
          ''
        );
      }

      // Move selectionState to location right before entity.
      // offset = beginning of entity if left/direction = -1
      // offset = end of entity if right/direction = 1
      offset = offset + direction;
      if (direction === -1 && offset > 0) {
        offset -= 1;
      }
      const newSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: offset,
        focusOffset: offset
      });
      const newState = EditorState.forceSelection(editorState, newSelection);

      // setEditorState to correct value
      if (deleteContent) {
        setEditorState(EditorState.push(newState, deleteContent, 'delete-character'));
      }
      else if (newContent) {
        setEditorState(EditorState.push(newState, newContent, 'insert-characters'));
      }
      else {
        setEditorState(newState);
      }
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
        deleteOutOf: (direction, mathField) => this.deleteOutOf(direction, mathField),
      }
    });
    this.mathfield.data = this.data;
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
