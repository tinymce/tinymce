import { GeneralSteps, Log, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.core.SubmitTest', (success, failure) => {
  Plugin();
  Theme();

  const customEmbed =
  '<div style="left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 56.338%; max-width: 650px;">' +
  '<iframe src="https://www.youtube.com/embed/IcgmSRJHu_8"' +
  ' width="560" height="314" allowfullscreen="allowfullscreen" data-mce-fragment="1">' +
  '</iframe></div>';

  const sTestResolvedEmbedContentSubmit = (ui: TinyUi, editor: Editor, apis: TinyApis, url: string, expected: string) =>
    Logger.t(`Assert content ${expected}`, GeneralSteps.sequence([
      Utils.sOpenDialog(ui),
      Utils.sSetFormItemNoEvent(ui, url),
      ui.sClickOnUi('click save button', Utils.selectors.saveButton),
      Utils.sAssertEditorContent(apis, editor, expected)
    ]));

  const sTestManualEmbedContentSubmit = (ui: TinyUi, editor: Editor, apis: TinyApis, embed: string, expected: string) =>
    Logger.t(`Assert content ${expected}`, GeneralSteps.sequence([
      Utils.sOpenDialog(ui),
      Utils.sPasteTextareaValue(ui, embed),
      ui.sClickOnUi('click save button', Utils.selectors.saveButton),
      Utils.sAssertEditorContent(apis, editor, expected)
    ]));

  const sTestEmbedUnchangedAfterOpenCloseDialog = (ui: TinyUi, editor: Editor, apis: TinyApis, expected: string) =>
    GeneralSteps.sequence([
      Utils.sOpenDialog(ui),
      ui.sClickOnUi('click save button', Utils.selectors.saveButton),
      Utils.sAssertEditorContent(apis, editor, expected)
    ]);

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);
    const apis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep(
        'TBA',
        'Media: Open dialog, set url, submit dialog and assert content. ' +
        'Change setting and assert changed content', [
          sTestResolvedEmbedContentSubmit(ui, editor, apis, 'https://www.youtube.com/watch?v=IcgmSRJHu_8',
            '<p><span id="fake">https://www.youtube.com/watch?v=IcgmSRJHu_8</span></p>'),
          apis.sSetContent(''),
          apis.sDeleteSetting('media_url_resolver'),
          sTestResolvedEmbedContentSubmit(ui, editor, apis, 'https://www.youtube.com/watch?v=IcgmSRJHu_8',
            '<p><iframe src="https://www.youtube.com/embed/IcgmSRJHu_8" width="560" height="314" ' +
            'allowfullscreen="allowfullscreen"></iframe></p>'),
          apis.sSetContent('')
        ]
      ),
      Log.stepsAsStep('TBA', 'Media: Open dialog, set embed content, submit dialog and assert content.', [
        sTestManualEmbedContentSubmit(ui, editor, apis, customEmbed, customEmbed),
        apis.sDeleteSetting('media_url_resolver'),
        sTestEmbedUnchangedAfterOpenCloseDialog(ui, editor, apis, customEmbed),
        apis.sSetContent('')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: [ 'media' ],
    toolbar: 'media',
    theme: 'silver',
    media_url_resolver(data, resolve) {
      Delay.setTimeout(function () {
        resolve({
          html: '<span id="fake">' + data.url + '</span>'
        });
      }, 500);
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
