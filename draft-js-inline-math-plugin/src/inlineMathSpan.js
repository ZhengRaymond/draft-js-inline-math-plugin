import React, { Component } from 'react';
import { Entity, convertToRaw, SelectionState, EditorState, Modifier } from 'draft-js';
import Radium from 'radium';

class inlineMathSpan extends Component {
  constructor(props) {
    super(props);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.moveOutOf = this.moveOutOf.bind(this);
    // this.exitLeft = this.exitLeft.bind(this);
    this.decorate = this.decorate.bind(this);
  }

  onFocus() {
    console.log('onFocus')
    console.log(this.props.entityKey);
    const { setReadOnly } = this.props.getStore();
    setReadOnly(true);
  }

  // exitLeft(editorState, selectionState, setReadOnly, getEditorRef) {
  //   setReadOnly(false);
  //   const ref = getEditorRef();
  //   if (ref) {
  //     ref.refs.editor.focus();
  //   }
  //
  //   var offset = selectionState.getAnchorOffset() - 2;
  //   offset = offset * (offset > 0);
  //   const newSelection = selectionState.merge({
  //     anchorOffset: offset,
  //     focusOffset: offset
  //   })
  //
  //   return EditorState.forceSelection(editorState, newSelection);
  // }

  // deleteOutOf(direction, mathField) {
  //   this.decorate(
  //     [ this.onBlur,    [ ]                    ],
  //     [ this.moveOutOf, [direction, mathField] ]
  //   );
  // }

  // decorate receives tuples (arrays), tuple[0] = function, tuple[1] = args.
  // calls each function which returns a new editorState, then sets the final editorState.
  // this prevents race conditions
  decorate() {
    const { getEditorState, setEditorState } = this.props.getStore();

    var editorState = getEditorState();
    var selectionState = editorState.getSelection();
    var currentContent = editorState.getCurrentContent();

    var args = Array.prototype.slice.call(arguments, 1);
    editorState = arguments[0].call(this, editorState, selectionState, currentContent, ...args)

    setEditorState(editorState);
  }

  onBlur(editorState, selectionState, currentContent) {
    const { setReadOnly, getEditorRef } = this.props.getStore();
    setReadOnly(false);
    getEditorRef().refs.editor.focus();

    currentContent = currentContent.mergeEntityData(this.props.entityKey, { raw_math: this.mathfield.latex() });
    editorState = EditorState.push(editorState, currentContent, 'change-block-data');
    return editorState;
  }

  moveOutOf(editorState, selectionState, currentContent, direction, remove) {
    editorState = this.onBlur(editorState, selectionState, currentContent);
    if (direction === 1 || direction === -1) {
      /* re-focus main editor */

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
        return EditorState.push(newState, deleteContent, 'delete-character');
      }
      if (newContent) {
        return EditorState.push(newState, newContent, 'insert-characters');
      }
      return newState
    }
  }

  componentDidMount() {
    const element = document.getElementById(`${this.blockKey}_${this.props.entityKey}`);
    const mathfield = MQ.MathField(element, {
      handlers: {
        // edit: (mathfield) => console.log("edited", mathfield),
        // selectOutOf: (direction, mathField) => console.log("selectedOutOf", direction, mathField),
        enter: (mathfield) => this.decorate(this.moveOutOf, 1),
        moveOutOf: (direction, mathField) => this.decorate(this.moveOutOf, direction),
        deleteOutOf: (direction, mathField) => this.decorate(this.moveOutOf, -1, mathField)
      }
    });

    setInterval(() => {
      const editorState = this.props.getEditorState();
      const currentContent = editorState.getCurrentContent();
      const data = currentContent.getEntity(this.props.entityKey).getData();
      // console.log(this.props.entityKey, "prelatex:", mathfield.latex());
      // console.log(this.props.entityKey, data.raw_math);
      mathfield.latex(data.raw_math);
      this.mathfield = mathfield;
    }, 500);

    const editorState = this.props.getEditorState();
    const currentContent = editorState.getCurrentContent();
    const data = currentContent.getEntity(this.props.entityKey).getData();
    // console.log(this.props.entityKey, "prelatex:", mathfield.latex());
    // console.log(this.props.entityKey, data.raw_math);
    mathfield.latex(data.raw_math);
    this.mathfield = mathfield;
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
        onBlur={() => this.decorate(this.onBlur)}
      >
      </styledMathSpan>
    )
  }
}

export default Radium(inlineMathSpan);
