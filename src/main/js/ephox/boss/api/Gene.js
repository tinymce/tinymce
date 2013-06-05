define(
  'ephox.boss.api.Gene',

  [
  ],

  function () {
    return function (id, name, children, css) {
      return {
        id: id,
        name: name,
        children: children,
        css: css !== undefined ? css : {}
      };
    };
  }
);
