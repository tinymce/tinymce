import { Pipeline, Step, RawAssertions, Logger, GeneralSteps, UiFinder } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import { EditorSettings } from 'tinymce/core/api/SettingsTypes';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Body } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.core.fmt.BlockFormatsTest', (success, failure) => {
  Theme();

  const sRunTinyWithSettings = (settings: EditorSettings, getSteps: (tinyApis: any, editor: Editor) => any[]) => Step.async((next, die) => {
    TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      Pipeline.async({}, getSteps(tinyApis, editor), onSuccess, onFailure);
    }, settings, next, die);
  });

  Pipeline.async({ }, [
    Logger.t(
      'Testing that the selection is still collapsed after a formatting operation',
      sRunTinyWithSettings({
        base_url: '/project/tinymce/js/tinymce',
      }, (tinyApis: any, editor: Editor) => [
        Logger.t('apply heading format at the end of paragraph should not expand selection', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          Step.sync(() => editor.formatter.apply('h1')),
          Step.sync(() => RawAssertions.assertEq('should still have a collapsed rng', true, editor.selection.isCollapsed()))
        ])),
        Logger.t('apply alignright format at the end of paragraph should not expand selection', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          Step.sync(() => editor.formatter.apply('alignright')),
          Step.sync(() => RawAssertions.assertEq('should still have a collapsed rng', true, editor.selection.isCollapsed()))
        ])),
        Logger.t('Using default style formats config, the Block formatting dropdown should show the correct format selection', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          UiFinder.sWaitFor('default setting - Check that formatter displays Paragraph', Body.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Paragraph")'),
          Step.sync(() => editor.formatter.apply('h1')),
          UiFinder.sWaitFor('default setting - Check that formatter displays Heading 1', Body.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Heading 1")'),
        ]))
      ])
    ),

    Logger.t(
      ' when a user has defined style_formats, Applying formatting should update the dropdown to show the correct content formatting',
      sRunTinyWithSettings({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'styleselect',
        style_formats: [
          { title: 'Paragraph', block: 'p'},
          { title: 'Heading 1', block: 'h1'},
          { title: 'Heading 2', block: 'h2'},
          { title: 'Heading 3', block: 'h3'},
          { title: 'Heading 4', block: 'h4'},
          { title: 'Heading 5', block: 'h5'},
          { title: 'Heading 6', block: 'h6'},
          { title: 'Div', block: 'div'},
          { title: 'Pre', block: 'pre'}
        ]
      }, (tinyApis: any, editor: Editor) => [
        Logger.t('Using default style formats config, the Block formatting dropdown should show the correct format selection ', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          UiFinder.sWaitFor('Check that formatter displays Paragraph', Body.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Paragraph")'),
          Step.sync(() => editor.formatter.apply('h1')),
          UiFinder.sWaitFor('Check that formatter displays Heading 1', Body.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Heading 1")'),
          Step.sync(() => editor.formatter.apply('pre')),
          UiFinder.sWaitFor('Check that formatter displays Pre', Body.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Pre")'),
          Step.sync(() => editor.formatter.apply('p')),
          UiFinder.sWaitFor('Check that formatter displays Paragraph', Body.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Paragraph")'),
        ]))
      ])
    ),

  ], success, failure);
});
