import { Log, Mouse, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import TemplatePlugin from 'tinymce/plugins/template/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.template.SelectedContentTest', (success, failure) => {

  TemplatePlugin();
  SilverTheme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const dialogSelector = 'div.tox-dialog';
    const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Insert template"]';

    const docBody = Element.fromDom(document.body);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Template: Test selectedcontent replacement with default class', [
        tinyApis.sSetContent('Text'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<h1 class="selcontent">This will be replaced</h1>' }]),
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector), 100, 3000),
        tinyApis.sAssertContent('<h1 class="selcontent">Text</h1>')
      ]),

      Log.stepsAsStep('TBA', 'Template: Test selectedcontent replacement with custom class', [
        tinyApis.sSetContent('Text'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
        tinyApis.sSetSetting('template_selected_content_classes', 'customSelected'),
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<h1 class="customSelected">This will be replaced/h1>' }]),
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector), 100, 3000),
        tinyApis.sAssertContent('<h1 class="customSelected">Text</h1>')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'template',
    toolbar: 'template',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
