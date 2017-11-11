import decorateComponentWithProps from 'decorate-component-with-props';
import { Map } from 'immutable';
import { convertToRaw, EditorState, Modifier, getDefaultKeyBinding } from 'draft-js';

import Math from './Math';
import inlineMathStrategy from './inlineMathStrategy';
import inlineMathSpan from './inlineMathSpan';
import addInlineMath from './modifiers/addInlineMath';
import './inlineMath.css';

const MATH = '$';

const createInlineMathPlugin = (config) => {

  // const blockRendererFn = (contentBlock, { getEditorState }) => {
  //   const block_type = contentBlock.getType();
  //   if (block_type === 'atomic') {
  //     const contentState = getEditorState().getCurrentContent();
  //     const entity = block.getEntityAt(0);
  //     if (!entity) return null;
  //     const entity_type = contentState.getEntity(entity).getType();
  //     // if (entity_type === 'INLINE_MATH') {
  //     //   return {
  //     //     component: Math,
  //     //     editable: false,
  //     //   };
  //     // }
  //     return null;
  //   }
  //
  //   return null;
  // };

  const keyBindingFn = (e, { getEditorState, setEditorState, setReadOnly }) => {
    const editorState = getEditorState();
    const selectionState = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    if (e.key === MATH) {

      // Caret:
      if (selectionState.isCollapsed()) {
        const current_block = editorState.getCurrentContent().getBlockForKey(selectionState.getStartKey());
        const selection_location = selectionState.getStartOffset();
        const previous_letter = current_block.getText()[selection_location - 1];
        if (previous_letter === '\\') {
          return `add-escape-char_${MATH}`;
        }
      }

      // Normal insert math:
      return 'add-inline-math';
    }
    if (e.key === 'Backspace') {
      // const currentContent = editorState.getCurrentContent();
      // const blockKey = selectionState.getAnchorKey();
      // const block = currentContent.getBlockForKey(blockKey);
      //
      // var selection_location = selectionState.getAnchorOffset();
      // const entityKey = block.getEntityAt(selection_location - 2);
      // console.log("A")
      // if (entityKey && currentContent.getEntity(entityKey).getType() === 'INLINE_MATH') {
      //   console.log("B")
      //   const entityElement = document.getElementById(`${blockKey}_${entityKey}`)
      //   console.log(MQ(entityElement).latex(), MQ(entityElement).latex().length)
      //   if (!MQ(entityElement).latex().length === 0) {
      //     console.log("C")
      onLeftArrow(e, { getEditorState, setEditorState, setReadOnly });
      const entityElement = afterEntity(editorState, selectionState, currentContent);
      if (entityElement) {
        return 'handled'
      }
    }
    return getDefaultKeyBinding(e);
  }

  const afterEntity = (editorState, selectionState, currentContent) => {
    const blockKey = selectionState.getAnchorKey();
    const block = currentContent.getBlockForKey(blockKey);

    var selection_location = selectionState.getAnchorOffset() - 2;
    if (selection_location < -1) {
      return;
    }
    const entityKey = block.getEntityAt(selection_location);
    if (entityKey && currentContent.getEntity(entityKey).getType() === 'INLINE_MATH') {
      return document.getElementById(`${blockKey}_${entityKey}`);
    }
    return null;
  }

  const handleKeyCommand = (command) => {
    const { getEditorState, setEditorState, setReadOnly } = store;
    const parsed = command.split('_');
    if (parsed[0] === 'add-inline-math') {
      addInlineMath({ getEditorState, setEditorState, setReadOnly });
      return 'handled';
    }
    if (parsed[0] === 'add-escape-char') {
      const editorState = getEditorState();
      const selectionState = editorState.getSelection();
      const selection_location = selectionState.getStartOffset();
      const updatedSelection = selectionState.merge({
        anchorOffset: selection_location - 1,
        focusOffset: selection_location
      });
      const contentState = Modifier.replaceText(
        editorState.getCurrentContent(),
        updatedSelection,
        parsed[1],
      )
      setEditorState(EditorState.push(editorState, contentState, 'delete-character'));
      return 'handled'
    }
    return 'not-handled';
  }

  const onTopArrow = (e, { getEditorState, setEditorState, setReadOnly }) => {

  }

  const onRightArrow = (e, { getEditorState, setEditorState, setReadOnly }) => {
    console.log("KEY:", e.key)
    const editorState = getEditorState();
    const selectionState = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const blockKey = selectionState.getAnchorKey();
    const block = currentContent.getBlockForKey(blockKey);

    var selection_location = selectionState.getAnchorOffset();
    const entityKey = block.getEntityAt(selection_location + 1);
    if (entityKey && currentContent.getEntity(entityKey).getType() === 'INLINE_MATH') {
      const entityElement = document.getElementById(`${blockKey}_${entityKey}`)
      MQ(entityElement).focus();
      MQ(entityElement).moveToLeftEnd();
    }
  }

  const onDownArrow = (e, { getEditorState, setEditorState, setReadOnly }) => {
    const editorState = store.getEditorState();
    const selectionState = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();

    const blockKey = selectionState.getAnchorKey();
    const block = currentContent.getBlockForKey(blockKey);
    console.log(`blockKey=${blockKey}`)

    // const editorState = store.getEditorState();
    // const currentContent = editorState.getCurrentContent();
    // const selectionAfter = currentContent.getSelectionAfter();
    //
    // // console.log(selectionAfter.getAnchorOffset());
    // const blockKey = selectionAfter.getAnchorKey();
    // const block = currentContent.getBlockForKey(blockKey);
    // const offset = selectionAfter.getAnchorOffset();
    // console.log(`offset=${offset}`);
    // const entityKey = block.getEntityAt(offset);
    // console.log(`entityKey=${entityKey}`);
    // if (entityKey && currentContent.getEntity(entityKey).getType() === 'INLINE_MATH') {
    //   const entityElement = document.getElementById(`${blockKey}_${entityKey}`)
    //   MQ(entityElement).focus();
    //   MQ(entityElement).moveToLeftEnd();
    // }
  }

  const onLeftArrow = (e, { getEditorState, setEditorState, setReadOnly }) => {
    const editorState = getEditorState();
    const selectionState = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const entityElement = afterEntity(editorState, selectionState, currentContent);
    if (entityElement) {
      MQ(entityElement).focus();
      MQ(entityElement).moveToRightEnd();
    }
  }

  const store = {
    getProps: undefined, // a function returning a list of all the props pass into the Editor
    setEditorState: undefined, // a function to update the EditorState
    getEditorState: undefined, // a function to get the current EditorState
    getReadOnly: undefined, // a function returning of the Editor is set to readOnly
    setReadOnly: undefined, // a function which allows to set the Editor to readOnly
    getEditorRef: undefined
  };

  // var mathFields = {};
  var fieldStash = [];

  // const addField = (id, entityKey) => {
  //   mathfields[id] = entityKey;
  // }

  const stashField = (id, entityKey, mathData) => {
    fieldStash.push({
      id,
      entityKey,
      mathData
    });
  }

  const popField = () => {
    return fieldStash.shift();
  }

  const decorators = [
    {
      strategy: inlineMathStrategy,
      component: inlineMathSpan,
      props: {
        // addField,
        stashField,
        popField,
        getStore: () => store,
      }
    }
  ];

  return {
    initialize: ({ getProps, setEditorState, getEditorState, getReadOnly, setReadOnly, getEditorRef }) => {
      store.getProps = getProps;
      store.setEditorState = setEditorState;
      store.getEditorState = getEditorState;
      store.getReadOnly = getReadOnly;
      store.setReadOnly = setReadOnly;
      store.getEditorRef = getEditorRef;
    },
    decorators,
    // blockRendererFn,
    keyBindingFn,
    onTopArrow,
    onRightArrow,
    onDownArrow,
    onLeftArrow,
    // handleReturn,
    handleKeyCommand,
    // onEscape,
  }
}

export default createInlineMathPlugin;
