define(
  'ephox.alloy.demo.Demo',

  [
    'ephox.wrap.JQuery',
    'ephox.exhibition.Console',
    'ephox.exhibition.Examples'
  ],

  function ($, Console, Examples) {
    return function () {
      var examples = Examples.add([
        { name: 'Alloy Demo', module: 'ephox.alloy.demo.AlloyDemo' }
      ]);

      var consoleUI = Console.use();

      $(document).ready(function () {
        $('body').append(examples, consoleUI);
      });
    };
  }
);

