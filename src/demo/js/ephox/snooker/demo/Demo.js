define(
  'ephox.snooker.demo.Demo',

  [
    'ephox.wrap.JQuery',
    'ephox.exhibition.Console',
    'ephox.exhibition.Examples'
  ],

  function ($, Console, Examples) {
    return function () {
      var examples = Examples.add([
        { name: 'Snooker Demo', module: 'ephox.snooker.demo.SnookerDemo' }
      ]);

      var consoleUI = Console.use();

      $(document).ready(function () {
        $('body').append(examples, consoleUI);
      });
    };
  }
);

