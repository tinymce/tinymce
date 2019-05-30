import { Arbitraries, Assertions, GeneralSteps, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { console } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';
import { Node } from '@ephox/sugar';
import TinyApis from 'ephox/mcagar/api/TinyApis';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import TinyScenarios from 'ephox/mcagar/api/TinyScenarios';

UnitTest.asynctest('TinyScenariosTest', (success, failure) => {

  const platform = PlatformDetection.detect();
  if (platform.browser.isFirefox()) {
    console.log("Skipping TinyScenariosTest as it triggers a tinymce bug in Firefox")
    success();
    return;
  }

  // An example test: ensure that when starting with a selection of text nodes, pressing bold twice
  // will at some point create a bold tag.
  var sAssertion = (editor) => Step.sync(() => {
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

  TinyLoader.setup((editor, loadSuccess, loadFailure) => {
    var apis = TinyApis(editor);
    var scenarios = TinyScenarios(editor);

    Pipeline.async({}, [
      apis.sFocus,
      scenarios.sAsyncProperty('Test', Arbitraries.content('inline', {}).generator, sAssertion(editor), {
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
      }),
    ], loadSuccess, loadFailure);

  }, {
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});

