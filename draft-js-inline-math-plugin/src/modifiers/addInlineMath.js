import { Modifier, EditorState } from 'draft-js';

const addInlineMath = ({ getEditorState, setEditorState }) => {
  const editorState = getEditorState();
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();

  // nice and simple. Insert a new Math entity
  if (selectionState.isCollapsed()) {
    const raw_math = '123';
    // insert a math entity
    const contentStateWithEntity = editorState.getCurrentContent().createEntity(
      'INLINE_MATH', 'IMMUTABLE', { raw_math }
    );

    const entityKey = contentState.getLastCreatedEntityKey();

    const newContent = Modifier.insertText(
      contentState,
      selectionState,
      '\t',
      undefined,
      entityKey
    )

    setEditorState(EditorState.push(editorState, newContent, 'apply-entity'));
  }
  // convert everything in between into math entities, then shift selection to end of last entity.
  else {
      // Finding all blocks from [anchorKey, focusKey] inclusive.
      var anchorKey = selectionState.getAnchorKey();
      const focusKey = selectionState.getFocusKey();
      while (true) {

        if (anchorKey === focusKey) break;
        anchorKey = getKeyAfter(anchorKey);
      }

      // insert a space for caret location
      // const newContent = Modifier.insertText(
      //   contentStateWithEntity,
      //   mentionReplacedContent.getSelectionAfter(),
      //   ' ',
      // );
  }
};

export default addInlineMath;
