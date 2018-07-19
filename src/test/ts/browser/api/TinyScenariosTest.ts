import { Arbitraries } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import TinyApis from 'ephox/mcagar/api/TinyApis';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import TinyScenarios from 'ephox/mcagar/api/TinyScenarios';
import { Node } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';
import { PlatformDetection } from '@ephox/sand';

UnitTest.asynctest('TinyScenariosTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  const platform = PlatformDetection.detect();
  if (platform.browser.isFirefox()) {
    console.log("Skipping TinyScenariosTest as it triggers a tinymce bug in Firefox")
    success();
    return;
  }

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var apis = TinyApis(editor);
    var scenarios = TinyScenarios(editor);

    // An example test: ensure that when starting with a selection of text nodes, pressing bold twice
    // will at some point create a bold tag.
    var sAssertion = Step.sync(function () {
      var body = editor.getBody();
      var boldInitial = body.querySelectorAll('strong').length;
      editor.execCommand('bold');
      var boldBefore = body.querySelectorAll('strong').length;
      editor.execCommand('bold');
      var boldAfter = body.querySelectorAll('strong').length;

      if (editor.selection.isCollapsed()) {
      } else {
        Assertions.assertEq('Two bold operations should create a <strong> tag at some point', true, boldInitial + boldBefore + boldAfter > 0); 
      }
    });
  
    Pipeline.async({}, [
      apis.sFocus,
      scenarios.sAsyncProperty('Test', Arbitraries.content('inline', { }).generator, sAssertion, {
        property: {
          tests: 100
          // Rename to seed.
          // rngState: '8cce615fb3d2a47809'
        },
        scenario: {
          exclusions: {
            containers: function (elem) {
              return !Node.isText(elem);
            }
          }
        }
      })
    ], onSuccess, onFailure);

  }, { }, success, failure);
});

