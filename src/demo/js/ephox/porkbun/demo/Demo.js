define(
  'ephox.porkbun.demo.Demo',

  [
    'ephox.wrap.JQuery',
    'ephox.porkbun.demo.Outlaw',
//    'ephox.porkbun.demo.Horse',
    'ephox.porkbun.demo.Saloon',
    'ephox.porkbun.demo.Sheriff'
  ],

  function ($, Outlaw, Saloon, Sheriff) {
    return function () {
      $(document).ready(function() {

//        var moose = Horse.create();
        var saloon = Saloon.create();

        var fred = Outlaw.create("Fred");
        var barney = Outlaw.create("Barney");

        fred.addAction("Shoot Barney", function() {
          fred.shoot(barney);
        });

        barney.addAction("Shoot Fred", function() {
          barney.shoot(fred);
        });

        saloon.enter(fred);
        saloon.enter(barney);

        var chuck = Sheriff.create();
        chuck.watch(saloon);

        $('body').append(chuck.getElement());
        $('body').append(saloon.getElement());
      });
    };
  }
);
