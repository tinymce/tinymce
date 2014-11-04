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
        { name: 'Detect Demo', module: 'ephox.snooker.demo.DetectDemo' },
        { name: 'Picker Demo', module: 'ephox.snooker.demo.PickerDemo' },
        { name: 'Picker Demo Rtl', module: 'ephox.snooker.demo.PickerDemoRtl' }
      ]);

      var consoleUI = Console.use();

      $(document).ready(function () {
        $('body').append(examples, consoleUI);
      });
    };
  }
);

