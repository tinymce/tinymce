asynctest(
  'McagarTutorialTest',
 
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi'
  ],
 
  function (Pipeline, Step, TinyApis, TinyLoader, TinyUi) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
 
    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var ui = TinyUi(editor);
      var apis = TinyApis(editor);

      Pipeline.async({}, [
        ui.sClickOnToolbar('Clicking on button', 'button:contains("tutorial")'),
        apis.sAssertContent('<p>tutorial content</p>'),
        Step.wait(400),
        apis.sAssertSelection([ ], 0, [ ], 1),
        ui.sClickOnToolbar('Clicking on button to change to alternate', 'button:contains("tutorial")'),
        apis.sAssertContent('<p>alternate content</p>'),
        Step.wait(400),
        apis.sAssertSelection([ 0 ], 1, [ 0 ], 1),
        ui.sClickOnToolbar('Clicking on button to change to tutorial again', 'button:contains("tutorial")'),
        apis.sAssertContent('<p>tutorial content</p>'),
        Step.wait(400),
        apis.sAssertSelection([ ], 0, [ ], 1)
      ], onSuccess, onFailure);
 
    }, { 
      menubar: false,
      toolbar: 'tutorial-button',
      setup: function (ed) {
        ed.addButton('tutorial-button', {
          text: 'tutorial',
          icon: false,
          onclick: function () {
            var content = ed.getContent();
            ed.focus();
            if (content === '<p>tutorial content</p>') {
              ed.setContent('<p>alternate content</p>');
              var paragraph = ed.getBody().childNodes[0];
              ed.selection.setCursorLocation(paragraph, 1);
            } else {
              ed.setContent('<p>tutorial content</p>');
              var target = ed.getBody().childNodes[0];
              ed.selection.select(target);
            }
          }
        });
      }
    }, success, failure);
  }
);