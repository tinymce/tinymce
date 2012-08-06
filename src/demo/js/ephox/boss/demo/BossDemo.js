define(
  'ephox.boss.demo.BossDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.boss.api.BasicPage',
    'ephox.sugar.api.Element'
  ],

  function ($, Boss, Element) {
    return function () {

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      var boss = Boss();
      boss.connect(ephoxUi);
    };
  }
);
