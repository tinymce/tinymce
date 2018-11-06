import { Arbitraries, GeneralSteps } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import TinyApis from 'ephox/mcagar/api/TinyApis';
import TinyDom from 'ephox/mcagar/api/TinyDom';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import TinyScenarios from 'ephox/mcagar/api/TinyScenarios';
import { UnitTest } from '@ephox/bedrock';
import { sAssertVersion } from '../../module/AssertVersion';

UnitTest.asynctest('Tutorial: Property Testing with TinyMCE', (success, failure) => {

  var sAssertion = (editor, body) => Step.sync(function () {
    var strongs = UiFinder.findAllIn(body, 'strong');
    Assertions.assertEq('There should be no strong tags', 0, strongs.length);
    var editorContent1 = editor.getContent();

    editor.setContent(editorContent1);
    var editorContent2 = editor.getContent();
    Assertions.assertEq('The content should be the same', editorContent1, editorContent2);
  });

  var sTestVersion = (version: string, major, minor) => {
    return TinyLoader.sSetupVersion(version, [], (editor) => {
      var apis = TinyApis(editor);
      var scenarios = TinyScenarios(editor);
      var body = TinyDom.fromDom(editor.getBody());

      return GeneralSteps.sequence([
        apis.sFocus,
        sAssertVersion(major, minor),
        scenarios.sAsyncProperty('tutorial spec', Arbitraries.content('inline', {
          inline: {
            tags: {
              strong: { weight: 0 },
              b: { weight: 0 }
            }
          }
        }).generator, sAssertion(editor, body), {
          scenario: { },
          property: {
            tests: 100
          }
        })
      ]);
    }, { });
  };

  Pipeline.async({}, [
    sTestVersion('4.5.x', 4, 5),
    sTestVersion('4.8.x', 4, 8),
    sTestVersion('5.0.x', 5, 0)
  ], () => success(), failure);
});

