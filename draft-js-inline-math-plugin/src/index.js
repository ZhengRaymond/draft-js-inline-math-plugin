import decorateComponentWithProps from 'decorate-component-with-props';
import { Map } from 'immutable';
import { convertToRaw, EditorState, Modifier } from 'draft-js';

import './inlineMath.css';


const createInlineMathPlugin = (config) => {


  const store = {
    getProps: undefined, // a function returning a list of all the props pass into the Editor
    setEditorState: undefined, // a function to update the EditorState
    getEditorState: undefined, // a function to get the current EditorState
    getReadOnly: undefined, // a function returning of the Editor is set to readOnly
    setReadOnly: undefined, // a function which allows to set the Editor to readOnly
    getEditorRef: undefined
  };

  return {
    initialize: ({ getProps, setEditorState, getEditorState, getReadOnly, setReadOnly, getEditorRef }) => {
      store.getProps = getProps;
      store.setEditorState = setEditorState;
      store.getEditorState = getEditorState;
      store.getReadOnly = getReadOnly;
      store.setReadOnly = setReadOnly;
      store.getEditorRef = getEditorRef;
  }
}

export default createInlineMathPlugin;
