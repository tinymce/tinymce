asynctest(
  'TinyLoaderTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi'
  ],
 
  function (Assertions, Logger, Pipeline, Step, TinyLoader, TinyUi) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var clickedOn = false;

    var sAssertState = function (expected, label) {
      return Step.sync(function () {
        Assertions.assertEq(label, expected, clickedOn);
      });
    };
 
    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var ui = TinyUi(editor);

      Pipeline.async({}, [
        sAssertState(false, 'Expected clickedOn to be false, because'),
        Logger.t(
          'Trying to click on custom button.\nNote, if the button could not be found, it is likely that the setup function has not triggered\n',
          ui.sClickOnToolbar('Click on the test-button to trigger its action', 'button:contains("test-button")')
        ),
        sAssertState(true, 'Expected clickedOn to be true, because the button action sets it to be.')

      ], function () { onSuccess(); }, onFailure);

    }, {
      setup: function (ed) {
        ed.addButton('test-button', {
          text: 'test-button',
          icon: false,
          onclick: function () {
            clickedOn = true;
          }
        });
      },
      toolbar: [
        'test-button'
      ]
    }, success, failure);
  }
);