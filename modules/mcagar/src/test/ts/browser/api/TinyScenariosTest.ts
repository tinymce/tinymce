import { Arbitraries, Assertions, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { console, navigator } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';
import { Node } from '@ephox/sugar';
import TinyApis from 'ephox/mcagar/api/TinyApis';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import TinyScenarios from 'ephox/mcagar/api/TinyScenarios';

const isPhantom = navigator.userAgent.indexOf('PhantomJS') > -1;

UnitTest.asynctest('TinyScenariosTest', (success, failure) => {

  const platform = PlatformDetection.detect();
  if (isPhantom) {
    // tslint:disable-next-line:no-console
    console.log('Skipping TinyScenariosTest as PhantomJS has dodgy selection/style implementation and returns false positives.');
    success();
    return;
  }
  if (platform.browser.isFirefox()) {
    // tslint:disable-next-line:no-console
    console.log('Skipping TinyScenariosTest as it triggers a tinymce bug in Firefox');
    success();
    return;
  }

  // An example test: ensure that when starting with a selection of text nodes, pressing bold twice
  // will at some point create a bold tag.
  const sAssertion = (editor) => Step.sync(() => {
    const body = editor.getBody();
    const boldInitial = body.querySelectorAll('strong').length;
    editor.execCommand('bold');
    const boldBefore = body.querySelectorAll('strong').length;
    editor.execCommand('bold');
    const boldAfter = body.querySelectorAll('strong').length;

    if (editor.selection.isCollapsed()) {
    } else {
      Assertions.assertEq('Two bold operations should create a <strong> tag at some point', true, boldInitial + boldBefore + boldAfter > 0);
    }
  });

  TinyLoader.setup((editor, loadSuccess, loadFailure) => {
    const apis = TinyApis(editor);
    const scenarios = TinyScenarios(editor);

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
            containers: (elem) => {
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
