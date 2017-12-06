export function focusMathField(getEditorState, setEditorState, setReadOnly, entityKey, direction) {
  console.log("focusing math field");
  if (direction === 1) {

  }
  else if (direction === -1) {
    setReadOnly(true);
    const editorState = getEditorState();
    const selectionState = editorState.getSelection();
    const blockKey = selectionState.getAnchorKey();

    setTimeout(() => {
      const entityElement = document.getElementById(`${blockKey}_${entityKey}`);
      const mathfield = MQ(entityElement);
      mathfield.focus();
    }, 5);
  }
}
