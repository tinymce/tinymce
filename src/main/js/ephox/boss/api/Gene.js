

export default <any> function (id, name, children, css, attrs) {
  return {
    id: id,
    name: name,
    children: children,
    css: css !== undefined ? css : {},
    attrs: attrs !== undefined ? attrs : {}
  };
};