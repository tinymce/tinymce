define(
  'ephox.boss.api.TextGene',

  [
  ],

  function () {
    return function (id, text) {
      return {
        id: id,
        name: 'TEXT_GENE',
        text: text,
        children: [],
        css: {},
        attrs: {}
      };
    };
  }
);
