import { Log, Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import TemplatePlugin from 'tinymce/plugins/template/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.template.DatesTest', (success, failure) => {

  TemplatePlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const docBody = Element.fromDom(document.body);
    const dialogSelector = 'div.tox-dialog';
    const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Insert template"]';

    const sDeleteSetting = (key) => {
      return Logger.t('Deleting Setting ' + key, Step.sync(() => {
        delete editor.settings[key];
      }));
    };

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Template: Test cdate in snippet with default class', [
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<p class="cdate">x</p>' }]),
        tinyApis.sSetSetting('template_cdate_format', 'fake date'),
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
        tinyApis.sAssertContent('<p class="cdate">fake date</p>'),
        tinyApis.sSetContent('')
      ]),

      Log.stepsAsStep('TBA', 'Template: Test cdate in snippet with custom class', [
        tinyApis.sSetSetting('template_cdate_classes', 'customCdateClass'),
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<p class="customCdateClass">x</p>' }]),
        tinyApis.sSetSetting('template_cdate_format', 'fake date'),
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
        tinyApis.sAssertContent('<p class="customCdateClass">fake date</p>'),
        sDeleteSetting('template_cdate_classes'),
        sDeleteSetting('templates'),
        sDeleteSetting('template_cdate_format'),
        tinyApis.sSetContent('')
      ]),

      Log.stepsAsStep('TBA', 'Template: Test mdate updates with each serialization', [
        tinyApis.sSetSetting(
          'templates',
          [{ title: 'a', description: 'b', content: '<div class="mceTmpl"><p class="mdate"></p><p class="cdate"></p></div>' }]
        ),
        tinyApis.sSetSetting('template_mdate_format', 'fake modified date'),
        tinyApis.sSetSetting('template_cdate_format', 'fake created date'),
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
        tinyApis.sAssertContent('<div class="mceTmpl"><p class="mdate">fake modified date</p><p class="cdate">fake created date</p></div>'),
        tinyApis.sSetSetting('template_mdate_format', 'changed modified date'),
        tinyApis.sAssertContent('<div class="mceTmpl"><p class="mdate">changed modified date</p><p class="cdate">fake created date</p></div>'),
        sDeleteSetting('templates'),
        sDeleteSetting('template_mdate_format'),
        sDeleteSetting('template_cdate_template'),
        tinyApis.sSetContent('')
      ]),

      Log.stepsAsStep('TBA', 'Template: Test mdate updates with each serialization with custom class', [
        tinyApis.sSetSetting('template_mdate_classes', 'modified'),
        tinyApis.sSetSetting(
          'templates',
          [{ title: 'a', description: 'b', content: '<div class="mceTmpl"><p class="modified"></p><p class="cdate"></p></div>' }]
        ),
        tinyApis.sSetSetting('template_mdate_format', 'fake modified date'),
        tinyApis.sSetSetting('template_cdate_format', 'fake created date'),
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
        tinyApis.sAssertContent('<div class="mceTmpl"><p class="modified">fake modified date</p><p class="cdate">fake created date</p></div>'),
        tinyApis.sSetSetting('template_mdate_format', 'changed modified date'),
        tinyApis.sAssertContent('<div class="mceTmpl"><p class="modified">changed modified date</p><p class="cdate">fake created date</p></div>'),
        sDeleteSetting('template_mdate_classes'),
        sDeleteSetting('templates'),
        sDeleteSetting('template_mdate_format'),
        sDeleteSetting('template_cdate_template')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'template',
    toolbar: 'template',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
