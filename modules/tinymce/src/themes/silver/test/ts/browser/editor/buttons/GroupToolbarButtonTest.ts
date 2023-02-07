import { ApproxStructure, Assertions, Mouse, StructAssert, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';

import { extractOnlyOne } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.buttons.GroupToolbarButtonTest', () => {

  const defaultToolbarGroupOptions = {
    toolbar: 'formatting',
    toolbar_groups: {
      formatting: {
        icon: 'more-drawer',
        tooltip: 'Formatting',
        items: 'bold | italic'
      }
    }
  };

  const defaultToolbarGroupStruct = ApproxStructure.build((s, str, arr) => s.element('div', {
    classes: [ arr.has('tox-toolbar__overflow') ],
    children: [
      s.element('div', {
        classes: [ arr.has('tox-toolbar__group') ],
        children: [
          s.element('button', {
            attrs: { title: str.is('Bold') }
          })
        ]
      }),
      s.element('div', {
        classes: [ arr.has('tox-toolbar__group') ],
        children: [
          s.element('button', {
            attrs: { title: str.is('Italic') }
          })
        ]
      })
    ]
  }));

  const pTestWithEditor = async (options: RawEditorOptions, pDoTest: () => Promise<void>) => {
    const editor = await McEditor.pFromSettings<Editor>({
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      toolbar_mode: 'floating',
      ...options
    });
    await UiFinder.pWaitForVisible('Waiting for menubar', SugarBody.body(), '.tox-menubar');
    await pDoTest();
    McEditor.remove(editor);
  };

  const testToolbarGroup = (options: RawEditorOptions, buttonSelector: string, toolbarSelector: string, expectedStruct: StructAssert) => () =>
    pTestWithEditor(options, async () => {
      Mouse.clickOn(SugarBody.body(), buttonSelector);
      await UiFinder.pWaitForVisible('Wait for toolbar to appear', SugarBody.body(), toolbarSelector);
      const toolbarGroup = extractOnlyOne(SugarBody.body(), toolbarSelector);
      Assertions.assertStructure(
        'Checking structure of the toolbar group',
        expectedStruct,
        toolbarGroup
      );
    });

  it('TINY-4229: Register floating group toolbar button via editor settings', testToolbarGroup(
    defaultToolbarGroupOptions,
    'button[title="Formatting"]',
    '.tox-toolbar__overflow',
    defaultToolbarGroupStruct
  ));

  it('TINY-4229: Register floating group toolbar button via editor API', testToolbarGroup(
    {
      toolbar: 'alignment',
      setup: (editor) => {
        editor.ui.registry.addGroupToolbarButton('alignment', {
          icon: 'align-left',
          tooltip: 'Alignment',
          items: [
            { name: 'Alignment', items: [ 'alignleft', 'aligncenter', 'alignright' ] }
          ]
        });
      }
    },
    'button[title="Alignment"]',
    '.tox-toolbar__overflow',
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-toolbar__overflow') ],
      children: [
        s.element('div', {
          classes: [ arr.has('tox-toolbar__group') ],
          children: [
            s.element('button', {
              attrs: { title: str.is('Align left') }
            }),
            s.element('button', {
              attrs: { title: str.is('Align center') }
            }),
            s.element('button', {
              attrs: { title: str.is('Align right') }
            })
          ]
        })
      ]
    }))
  ));

  it('TINY-4616: Group toolbars are ignored when using wrap toolbar mode', () =>
    pTestWithEditor({
      ...defaultToolbarGroupOptions,
      toolbar: 'formatting | underline',
      toolbar_mode: 'wrap'
    }, () => {
      UiFinder.notExists(SugarBody.body(), 'button[title="Formatting"]');
      UiFinder.exists(SugarBody.body(), 'button[title="Underline"]');
      return Promise.resolve();
    })
  );

  it('TINY-9496: onSetup function should run when defining custom group toolbar button', () => {
    let hasSetupBeenCalled = false;
    pTestWithEditor({
      ...defaultToolbarGroupOptions,
      toolbar: 'test',
      setup: (editor: Editor) => {
        editor.ui.registry.addGroupToolbarButton('test', {
          text: 'test',
          items: 'alignleft aligncenter alignright',
          onSetup: () => {
            hasSetupBeenCalled = true;
            return Fun.noop;
          }
        });
      }
    }, () => {
      assert.isTrue(hasSetupBeenCalled);
      return Promise.resolve();
    });
  });

});
