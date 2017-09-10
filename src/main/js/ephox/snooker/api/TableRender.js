define(
  'ephox.snooker.api.TableRender',

  [
    'ephox.snooker.operate.Render'
  ],

  function (Render) {
    return {
      render: Render.render
    };
  }
);
