import { Arbitraries } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import TinyApis from 'ephox/mcagar/api/TinyApis';
import TinyDom from 'ephox/mcagar/api/TinyDom';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import TinyScenarios from 'ephox/mcagar/api/TinyScenarios';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Tutorial: Property Testing with TinyMCE', function() {
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
});

