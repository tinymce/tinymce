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
        

        var chuck = Sheriff.create();
//        var moose = Horse.create();
        var saloon = Saloon.create();

        var fred = Outlaw.create();
        var barney = Outlaw.create();

        saloon.enter(fred);
        saloon.enter(barney);

        $('body').append(saloon.getElement());
        $('body').append(chuck.getElement());

        
      });
    };
  }
);
