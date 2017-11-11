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
    var newContent = contentState;
    newContent = Modifier.insertText(
      newContent,
      selectionState,
      ' '
    )
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
  // else {
  //     // Finding all blocks from [anchorKey, focusKey] inclusive.
  //     var anchorKey = selectionState.getAnchorKey();
  //     const focusKey = selectionState.getFocusKey();
  //     while (true) {
  //
  //       if (anchorKey === focusKey) break;
  //       anchorKey = getKeyAfter(anchorKey);
  //     }
  //
  //     // insert a space for caret location
  //     // const newContent = Modifier.insertText(
  //     //   contentStateWithEntity,
  //     //   mentionReplacedContent.getSelectionAfter(),
  //     //   ' ',
  //     // );
  // }
};

export default addInlineMath;
