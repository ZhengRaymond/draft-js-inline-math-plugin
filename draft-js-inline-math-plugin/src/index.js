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

  const keyBindingFn = (e, { getEditorState }) => {
    if (e.key === MATH) {
      const editorState = getEditorState();
      const selectionState = editorState.getSelection();

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
    return getDefaultKeyBinding(e);
  }

  const handleKeyCommand = (command) => {
    const { getEditorState, setEditorState } = store;
    const parsed = command.split('_');
    if (parsed[0] === 'add-inline-math') {
      addInlineMath({ getEditorState, setEditorState });
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

  const onRightArrow = (e, { getEditorState, setEditorState, setReadOnly }) => {
    // const editorState = getEditorState();
    // const selectionState = editorState.getSelection();
    // console.log(selectionState.getAnchorOffset());
    // const currentContent = editorState.getCurrentContent();
    // const blockKey = selectionState.getAnchorKey();
    // const block = currentContent.getBlockForKey(blockKey);
    //
    // var selection_location = selectionState.getAnchorOffset();
    // const currentKey = block.getEntityAt(selection_location);
    // const nextKey = block.getEntityAt(selection_location + 1);
    // if (!currentKey && nextKey && currentContent.getEntity(nextKey).getType() === 'INLINE_MATH') {
    //   console.log('forcing...');
    //   setReadOnly(true);
    //   const entityElement = document.getElementById(`${blockKey}_${nextKey}`)
    //   console.log(entityElement)
    //   const mathfield = MQ.MathField(entityElement)
    //   mathfield.moveToLeftEnd();
    //   mathfield.focus();
    // }
  }

  const store = {
    getProps: undefined, // a function returning a list of all the props pass into the Editor
    setEditorState: undefined, // a function to update the EditorState
    getEditorState: undefined, // a function to get the current EditorState
    getReadOnly: undefined, // a function returning of the Editor is set to readOnly
    setReadOnly: undefined, // a function which allows to set the Editor to readOnly
    getEditorRef: undefined
  };

  const decorators = [
    {
      strategy: inlineMathStrategy,
      component: inlineMathSpan,
      props: {
        // store
        getStore: () => store
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
    onRightArrow,
    // onLeftArrow: handleArrow,
    // handleReturn,
    handleKeyCommand,
    // onEscape,
  }
}

export default createInlineMathPlugin;
