define(
  'ephox.boss.api.CommentGene',

  [
  ],

  function () {
    return function (id, text) {
      return {
        id: id,
        name: 'COMMENT_GENE',
        text: text,
        children: [],
        css: {},
        attrs: {}
      };
    };
  }
);
