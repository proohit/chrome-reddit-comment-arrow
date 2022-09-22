export const getAllComments = () =>
  [...document.querySelectorAll(".Comment")].map(
    (comment) => comment.parentNode
  );

export const getAllTopLevelComments = () => {
  const allComments = getAllComments();
  return allComments.filter((comment) => {
    const rawPadding = comment.style.paddingLeft;
    const padding = Number(rawPadding.replace("px", ""));
    return padding <= 16;
  });
};
