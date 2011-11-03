define(
  'ephox.porkbun.demo.Demo',

  [
    'ephox.wrap.JQuery',
    'ephox.porkbun.demo.Outlaw',
    'ephox.porkbun.demo.Saloon',
    'ephox.porkbun.demo.Sheriff'
  ],

  function ($, Outlaw, Saloon, Sheriff) {
    return function () {
      $(document).ready(function () {

        var saloon = Saloon.create();

        var sheriff = Sheriff.create();

        sheriff.watch(saloon);

        var fred = Outlaw.create("Fred");
        var barney = Outlaw.create("Barney");

        fred.addAction("Shoot Barney", function () {
          fred.shoot(barney);
        });

        barney.addAction("Shoot Fred", function () {
          barney.shoot(fred);
        });

        fred.enter(saloon);
        barney.enter(saloon);

        $('body').append(sheriff.getElement());
        $('body').append(saloon.getElement());
      });
    };
  }
);
