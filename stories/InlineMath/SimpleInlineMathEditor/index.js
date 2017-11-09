import React, { Component } from 'react';
import { convertToRaw } from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';
import createInlineMathPlugin from 'draft-js-inline-math-plugin';

// import editorStyles from './editorStyles.css';

const inlineMathPlugin = createInlineMathPlugin();
const plugins = [inlineMathPlugin];
const text = `$\infty`;

export default class SimpleInlineMathEditor extends Component {
    constructor(props) {
      super(props);
      this.state = {
        editorState: createEditorStateWithText(text),
      }
      this.onChange = (editorState) => this.setState({ editorState });
      this.focus = () => this.editor.focus();
    }

    componentDidMount() {
      this.editor.focus();
    }

    render() {
      return (
        <div onClick={this.focus}>
          <button onClick={() => console.log(convertToRaw(this.state.editorState.getCurrentContent()))}>Show Raw</button>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => { this.editor = element; }}
          />
        </div>
      );
    }
}
