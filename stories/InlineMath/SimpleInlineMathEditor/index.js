import React, { Component } from 'react';
import { convertToRaw } from 'draft-js';
import Editor, { createEditorStateWithText } from 'draft-js-plugins-editor';
import createInlineMathPlugin from 'draft-js-inline-math-plugin';

// import editorStyles from './editorStyles.css';

const inlineMathPlugin = createInlineMathPlugin();
const plugins = [inlineMathPlugin];
const text = `$\infty`;

export default class SimpleInlineMathEditor extends Component {
    // constructor(props) {
    //   super(props);
    //   this.state = {
    //     editorState: createEditorStateWithText(text),
    //   }
    //   this.onChange = (editorState) => this.setState({ editorState });
    //   this.focus = () => this.editor.focus();
    // }
    //
    // componentDidMount() {
    //   this.editor.focus();
    // }
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
      // setInterval(() => {
      //   this.setState({
      //     ...this.state,
      //     readOnly: !this.state.readOnly
      //   })
      // }, 5000)
    };

    render() {
      return (
        <div onClick={this.focus}>
          <input onKeyDown={(e) => console.log(e.key)}/>
          <span id="rayzheng">ax^2+bx+c, \sum</span>
          <button onClick={() => console.log(convertToRaw(this.state.editorState.getCurrentContent()))}>Show Raw</button>
          <button onClick={() => console.log(this.state.editorState.getSelection().getAnchorKey())}>ShowSelectionAnchorKey</button>
          <button onClick={() => console.log(this.state.editorState.getSelection().getAnchorOffset())}>ShowSelectionAnchorOffset</button>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            // onLeftArrow={this.onRight}
            onRightArrow={undefined}
            plugins={plugins}
            ref={(element) => { this.editor = element; }}
            readOnly={this.state.readOnly}
          />
        </div>
      );
    }
}
