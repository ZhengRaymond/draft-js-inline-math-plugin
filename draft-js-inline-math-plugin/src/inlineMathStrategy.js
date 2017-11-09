const inlineMathStrategy = (contentBlock, callback, contentState) => {
  console.log("A:")
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    console.log("scanning inline strategy")
    return (entityKey !== null && contentState.getEntity(entityKey).getType() === 'INLINE_MATH');
  }, callback);
};

export default inlineMathStrategy;
