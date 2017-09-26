define(
  'ephox.boss.demo.BossDemo',

  [
    'ephox.boss.api.BasicPage',
    'ephox.sugar.api.node.Element'
  ],

  function (BasicPage, Element) {
    return function () {

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      var boss = BasicPage();
      boss.connect(ephoxUi);
    };
  }
);
