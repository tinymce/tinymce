define(
  'ephox.agar.demo.RunDemos',

  [
    'ephox.agar.demo.ApproxStructureDemo',
    'ephox.agar.demo.FocusDemos',
    'ephox.agar.demo.FormDemo',
    'ephox.agar.demo.GeneralStepsDemo',
    'ephox.agar.demo.HtmlAssertionDemo',
    'ephox.agar.demo.KeyboardDemo',
    'ephox.agar.demo.MouseDemo',
    'ephox.agar.demo.TestUtils'
  ],

  function (ApproxStructureDemo, FocusDemos, FormDemo, GeneralStepsDemo, HtmlAssertionDemo, KeyboardDemo, MouseDemo, TestUtils) {
    return function () {
      TestUtils();

      GeneralStepsDemo();
      FocusDemos();
      KeyboardDemo();
      MouseDemo();
      ApproxStructureDemo();
      HtmlAssertionDemo();
      FormDemo();
    };
  }
);