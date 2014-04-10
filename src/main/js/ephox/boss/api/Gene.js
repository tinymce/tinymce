define(
  'ephox.boss.api.Gene',

  [
  ],

  function () {
    return function (id, name, children, css, attrs) {
      return {
        id: id,
        name: name,
        children: children,
        css: css !== undefined ? css : {},
        attrs: attrs !== undefined ? attrs : {}
      };
    };
  }
);
