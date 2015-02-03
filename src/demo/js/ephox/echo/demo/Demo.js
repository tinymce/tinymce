define(
  'ephox.echo.demo.Demo',

  [
    'ephox.wrap.JQuery',
    'ephox.exhibition.Console',
    'ephox.exhibition.Examples'
  ],

  function ($, Console, Examples) {
    return function () {
      var examples = Examples.add([
        { name: 'Echo Demo', module: 'ephox.echo.demo.EchoDemo' }
      ]);

      var consoleUI = Console.use();

      $(document).ready(function () {
        $('body').append(examples, consoleUI);
      });
    };
  }
);

