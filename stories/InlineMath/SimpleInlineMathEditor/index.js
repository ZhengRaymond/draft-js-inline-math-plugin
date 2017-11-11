import React, { Component } from 'react';
import { convertToRaw } from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';
import createInlineMathPlugin from 'draft-js-inline-math-plugin';

const inlineMathPlugin = createInlineMathPlugin();
const plugins = [inlineMathPlugin];
const text = `$\infty`;

export default class SimpleInlineMathEditor extends Component {
    state = {
      editorState: createEditorStateWithText(text),
      readOnly: false
    };

    onChange = (editorState) => {
      this.setState({
        ...this.state,
        editorState,
      });
    };

    focus = () => {
      this.editor.focus();
    };

    render() {
      return (
        <div onClick={this.focus}>
          <button onClick={() => console.log(convertToRaw(this.state.editorState.getCurrentContent()))}>Show Raw</button>
          <button onClick={() => console.log(this.state.editorState.getSelection().getAnchorKey())}>ShowSelectionAnchorKey</button>
          <button onClick={() => console.log(this.state.editorState.getSelection().getAnchorOffset())}>ShowSelectionAnchorOffset</button>
          <div style={{ height: "5px" }}/>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => { this.editor = element; }}
            readOnly={this.state.readOnly}
          />
        </div>
      );
    }
}
