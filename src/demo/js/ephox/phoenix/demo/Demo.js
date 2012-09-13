define(
  'ephox.phoenix.demo.Demo',

  [
    'ephox.wrap.JQuery',
    'ephox.exhibition.Console',
    'ephox.exhibition.Examples'
  ],

  function ($, Console, Examples) {
    return function () {
      var examples = Examples.add([
        { name: 'Search and Highlight Demo', module: 'ephox.phoenix.demo.SearchDemo' }
      ]);

      var consoleUI = Console.use();

      $(document).ready(function () {
        $('body').append(examples, consoleUI);
      });
    };
  }
);

