asynctest(
  'Tutorial: Property Testing with TinyMCE',
 
  [
    'ephox.agar.api.Arbitraries',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyScenarios'
  ],
 
  function (Arbitraries, Assertions, Pipeline, Step, UiFinder, TinyApis, TinyDom, TinyLoader, TinyScenarios) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var apis = TinyApis(editor);
      var scenarios = TinyScenarios(editor);

      var body = TinyDom.fromDom(editor.getBody());

      var sAssertion = Step.sync(function () {
        var strongs = UiFinder.findAllIn(body, 'strong');
        Assertions.assertEq('There should be no strong tags', 0, strongs.length);
        var editorContent1 = editor.getContent();

        editor.setContent(editorContent1);
        var editorContent2 = editor.getContent();
        Assertions.assertEq('The content should be the same', editorContent1, editorContent2);
      });
    
      Pipeline.async({}, [
        apis.sFocus,
        scenarios.sAsyncProperty('tutorial spec', Arbitraries.content('inline', {
          inline: {
            tags: {
              strong: { weight: 0 },
              b: { weight: 0 }
            }
          }
        }).generator, sAssertion, {
          scenario: { },
          property: {
            tests: 100
          }
        })
      ], onSuccess, onFailure);

    }, { }, success, failure);
  }
);