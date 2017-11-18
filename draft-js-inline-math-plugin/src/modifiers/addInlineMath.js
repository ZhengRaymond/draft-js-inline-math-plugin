import { Modifier, EditorState } from 'draft-js';
import { focusMathField } from '../util';

const addInlineMath = ({ getEditorState, setEditorState, setReadOnly }) => {
  const editorState = getEditorState();
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();

  // nice and simple. Insert a new Math entity
  if (selectionState.isCollapsed()) {
    const raw_math = '';
    // insert a math entity
    const contentStateWithEntity = editorState.getCurrentContent().createEntity(
      'INLINE_MATH', 'IMMUTABLE', { raw_math }
    );

    const entityKey = contentState.getLastCreatedEntityKey();
    const offset = selectionState.getAnchorOffset();
    // const block = contentState.getBlockForKey(selectionState.getAnchorKey());
    // const entityKey2 = block.getEntityAt(offset - 2);
    // var extraPadding = '';
    // if (entityKey2 && contentState.getEntity(entityKey2).getType() === 'INLINE_MATH') {
    //   extraPadding = ' ';
    // }
    var newContent = contentState;
    newContent = Modifier.insertText(
      newContent,
      selectionState,
      ' '
    );
    newContent = Modifier.insertText(
      newContent,
      selectionState.merge({
        anchorOffset: offset + 1,
        focusOffset: offset + 1,
      }),
      ' ',
      undefined,
      entityKey
    )
    newContent = Modifier.insertText(
      newContent,
      selectionState.merge({
        anchorOffset: offset + 2,
        focusOffset: offset + 2
      }),
      ' '
    )

    const newSelection = selectionState.merge({
      anchorOffset: offset,
      focusOffset: offset,
    });
    const newEditorState = EditorState.forceSelection(editorState, newSelection);

    setEditorState(EditorState.push(newEditorState, newContent, 'insert-characters'));

    focusMathField(getEditorState, setEditorState, setReadOnly, entityKey, -1);
  }
  // convert everything in between into math entities, then shift selection to end of last entity.
  else {
    // Finding all blocks from [anchorKey, focusKey] inclusive.
    // while (true) {
    //   ...
    //   anchorKey = getKeyAfter(anchorKey);
    //   if (anchorKey === focusKey) break;
    // }

    const anchorKey = selectionState.getAnchorKey();
    const focusKey = selectionState.getFocusKey();
    if (anchorKey !== focusKey) return;

    const block = contentState.getBlockForKey(anchorKey);
    const blockText = block.getText();
    const anchorOffset = selectionState.getAnchorOffset();
    const focusOffset = selectionState.getFocusOffset();
    console.log(`anchorOffset=${anchorOffset}, focusOffset=${focusOffset}`)
    const raw_math = blockText.substring(anchorOffset, focusOffset);
    // insert a math entity
    console.log("raw_math:", raw_math)
    const contentStateWithEntity = editorState.getCurrentContent().createEntity(
      'INLINE_MATH', 'IMMUTABLE', { raw_math }
    );

    const entityKey = contentState.getLastCreatedEntityKey();
    const offset = selectionState.getAnchorOffset();

    var newContent = contentState;
    newContent = Modifier.replaceText(
      newContent,
      selectionState,
      ' ',
      undefined,
      entityKey
    );

    newContent = Modifier.insertText(
      newContent,
      selectionState.merge({
        anchorOffset: anchorOffset,
        focusOffset: anchorOffset,
      }),
      ' '
    )
    newContent = Modifier.insertText(
      newContent,
      selectionState.merge({
        anchorOffset: focusOffset,
        focusOffset: focusOffset
      }),
      ' '
    )

    const newSelection = selectionState.merge({
      anchorOffset: focusOffset,
      focusOffset: focusOffset,
    });
    const newEditorState = EditorState.forceSelection(editorState, newSelection);

    setEditorState(EditorState.push(newEditorState, newContent, 'delete-character'));

    // focusMathField(getEditorState, setEditorState, setReadOnly, entityKey, -1);
  }
};

export default addInlineMath;
