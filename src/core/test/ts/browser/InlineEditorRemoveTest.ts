import { Assertions, GeneralSteps, Pipeline, Logger, Step } from '@ephox/agar';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import ViewBlock from '../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.InlineEditorRemoveTest', (success, failure) =>  {
  const viewBlock = ViewBlock();

  Theme();

  const sCreateInlineEditors = function (html) {
    return Step.async(function (done) {
      viewBlock.update(html);

      EditorManager.init({
        selector: '.tinymce',
        inline: true,
        skin_url: '/project/js/tinymce/skins/lightgray'
      }).then(function () {
        done();
      });
    });
  };

  const sRemoveEditors = Step.sync(function () {
    EditorManager.remove();
  });

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('Removing inline editor should remove all data-mce-bogus tags', GeneralSteps.sequence([
      sCreateInlineEditors('<div class="tinymce"></div>'),
      Step.sync(function () {
        EditorManager.get(0).getBody().innerHTML = '<p data-mce-bogus="all">b</p><p data-mce-bogus="1">b</p>';
      }),
      sRemoveEditors,
      Step.sync(function () {
        const bogusEl = viewBlock.get().querySelector('[data-mce-bogus]');
        Assertions.assertEq('Should not be any data-mce-bogus tags present', false, !!bogusEl);
      }),
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
