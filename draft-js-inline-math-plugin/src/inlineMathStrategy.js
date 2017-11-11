const inlineMathStrategy = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (entityKey !== null && contentState.getEntity(entityKey).getType() === 'INLINE_MATH');
  }, callback);
};

export default inlineMathStrategy;
