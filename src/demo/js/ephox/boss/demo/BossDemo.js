define(
  'ephox.boss.demo.BossDemo',

  [
    'ephox.boss.api.BasicPage',
    'ephox.syrup.api.Element'
  ],

  function (BasicPage, Element) {
    return function () {

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      var boss = BasicPage();
      boss.connect(ephoxUi);
    };
  }
);
