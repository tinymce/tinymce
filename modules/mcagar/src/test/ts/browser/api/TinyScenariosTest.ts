import { Arbitraries, Assertions, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { SugarNode } from '@ephox/sugar';

import { Editor } from 'ephox/mcagar/alien/EditorTypes';
import { TinyApis } from 'ephox/mcagar/api/pipeline/TinyApis';
import * as TinyLoader from 'ephox/mcagar/api/pipeline/TinyLoader';
import { TinyScenarios } from 'ephox/mcagar/api/pipeline/TinyScenarios';

UnitTest.asynctest('TinyScenariosTest', (success, failure) => {

  const platform = PlatformDetection.detect();
  if (platform.browser.isFirefox()) {
    // eslint-disable-next-line no-console
    console.log('Skipping TinyScenariosTest as it triggers a tinymce bug in Firefox');
    success();
    return;
  }

  // An example test: ensure that when starting with a selection of text nodes, pressing bold twice
  // will at some point create a bold tag.
  const sAssertion = (editor: Editor) => Step.sync(() => {
    const body = editor.getBody();
    const boldInitial = body.querySelectorAll('strong').length;
    editor.execCommand('bold');
    const boldBefore = body.querySelectorAll('strong').length;
    editor.execCommand('bold');
    const boldAfter = body.querySelectorAll('strong').length;

    if (!editor.selection.isCollapsed()) {
      Assertions.assertEq('Two bold operations should create a <strong> tag at some point', true, boldInitial + boldBefore + boldAfter > 0);
    }
  });

  TinyLoader.setup((editor, loadSuccess, loadFailure) => {
    const apis = TinyApis(editor);
    const scenarios = TinyScenarios(editor);

    Pipeline.async({}, [
      apis.sFocus(),
      scenarios.sAsyncProperty('Test', Arbitraries.content('inline', {}), sAssertion(editor), {
        property: {
          numRuns: 100
          // Rename to seed.
          // rngState: '8cce615fb3d2a47809'
        },
        scenario: {
          exclusions: {
            containers: (elem) => !SugarNode.isText(elem)
          }
        }
      })
    ], loadSuccess, loadFailure);

  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
