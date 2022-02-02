import { ApproxStructure, Assertions, Mouse, StructAssert, UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import PromisePolyfill from 'tinymce/core/api/util/Promise';
import Theme from 'tinymce/themes/silver/Theme';

import { extractOnlyOne } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.buttons.GroupToolbarButtonTest', () => {
  before(() => {
    Theme();
  });

  const defaultToolbarGroupSettings = {
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

  const pTestWithEditor = async (settings: Record<string, any>, pDoTest: () => Promise<void>) => {
    const editor = await McEditor.pFromSettings<Editor>({
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      toolbar_mode: 'floating',
      ...settings
    });
    await UiFinder.pWaitForVisible('Waiting for menubar', SugarBody.body(), '.tox-menubar');
    await pDoTest();
    McEditor.remove(editor);
  };

  const testToolbarGroup = (settings: Record<string, any>, buttonSelector: string, toolbarSelector: string, expectedStruct: StructAssert) => () =>
    pTestWithEditor(settings, async () => {
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
    defaultToolbarGroupSettings,
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
      ...defaultToolbarGroupSettings,
      toolbar: 'formatting | underline',
      toolbar_mode: 'wrap'
    }, () => {
      UiFinder.notExists(SugarBody.body(), 'button[title="Formatting"]');
      UiFinder.exists(SugarBody.body(), 'button[title="Underline"]');
      return PromisePolyfill.resolve();
    })
  );
});
