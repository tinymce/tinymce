import { Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.ContextFormAsSubtoolbarTest', () => {
  Arr.each([ true, false ], (inline) => {
    context(inline ? 'inline' : 'non-inline', () => {
      const store = TestStore();
      const hook = TinyHooks.bddSetupLight<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        inline,
        setup: (ed: Editor) => {
          ed.ui.registry.addContextForm('alt-button', {
            type: 'contextform',
            launch: {
              type: 'contextformbutton',
              text: 'Alt',
              tooltip: 'Alt'
            },
            label: 'Alt',
            commands: [
              {
                type: 'contextformbutton',
                align: 'start',
                icon: 'chevron-left',
                tooltip: 'back',
                onAction: (formApi) => {
                  formApi.back();
                }
              },
              {
                type: 'contextformtogglebutton',
                align: 'start',
                text: 'Decorative',
                onAction: (formApi, buttonApi) => {
                  buttonApi.setActive(!buttonApi.isActive());
                  formApi.setInputEnabled(!formApi.isInputEnabled());
                }
              },
              {
                type: 'contextformbutton',
                align: 'end',
                icon: 'check',
                onAction: (formApi, _buttonApi) => {
                  formApi.back();
                  ed.focus();
                  store.add(ed.selection.getNode().nodeName);
                }
              }
            ]
          });

          ed.ui.registry.addContextForm('slider', {
            type: 'contextsliderform',
            launch: {
              type: 'contextformbutton',
              text: 'Brightness',
              tooltip: 'Brightness'
            },
            min: Fun.constant(-100),
            max: Fun.constant(100),
            initValue: Fun.constant(0),
            label: 'Brightness',
            commands: [
              {
                type: 'contextformbutton',
                align: 'start',
                icon: 'chevron-left',
                tooltip: 'back',
                onAction: (formApi) => {
                  formApi.back();
                }
              },
              {
                type: 'contextformbutton',
                primary: true,
                text: 'Apply',
                onAction: (formApi) => {
                  formApi.back();
                  ed.focus();
                }
              },
              {
                type: 'contextformbutton',
                text: 'Reset',
                onAction: (formApi) => {
                  formApi.setValue(50);
                }
              }
            ]
          });

          ed.ui.registry.addContextForm('size', {
            type: 'contextsizeinputform',
            launch: {
              type: 'contextformbutton',
              text: 'Size',
              tooltip: 'Size'
            },
            initValue: () => ({ width: '400', height: '300' }),
            label: 'Size',
            commands: [
              {
                type: 'contextformbutton',
                align: 'start',
                icon: 'chevron-left',
                tooltip: 'back',
                onAction: (formApi) => {
                  formApi.back();
                }
              },
              {
                type: 'contextformbutton',
                text: 'Reset',
                onAction: (formApi) => {
                  formApi.setValue({ width: '400', height: '300' });
                }
              }
            ]
          });

          ed.ui.registry.addContextToolbar('contexttoolbar1', {
            predicate: (node) => node.nodeName === 'IMG' || node.nodeName === 'SPAN',
            items: 'alt-button slider size',
            position: 'node',
            scope: 'node'
          });
        }
      }, []);

      const pGetToolbarButtonnByMceName = async (editor: Editor, dataMceName: string): Promise<SugarElement<HTMLButtonElement>> =>
        await TinyUiActions.pWaitForUi(editor, `.tox-toolbar button[data-mce-name="${dataMceName}"]`) as SugarElement<HTMLButtonElement>;

      const pClickToolbarButtonByMceName = async (editor: Editor, dataMceName: string): Promise<void> => (await (pGetToolbarButtonnByMceName(editor, dataMceName))).dom.click();

      const pGetToolbarButtonnByAriaName = async (editor: Editor, dataAriaName: string): Promise<SugarElement<HTMLButtonElement>> =>
        await TinyUiActions.pWaitForUi(editor, `.tox-toolbar button[aria-label="${dataAriaName}"]`) as SugarElement<HTMLButtonElement>;

      const pClickToolbarButtonByAriaName = async (editor: Editor, dataAriaName: string): Promise<void> => (await (pGetToolbarButtonnByAriaName(editor, dataAriaName))).dom.click();

      const testButtonBack = async (dataMceName: string) => {
        const editor = hook.editor();
        editor.setContent('<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="50" height="25"><span>some span</span></p>');
        editor.focus();

        TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
        Mouse.trueClickOn(TinyDom.body(editor), 'img');

        await TinyUiActions.pWaitForUi(editor, `.tox-toolbar button[data-mce-name="${dataMceName}"]`);

        await pClickToolbarButtonByMceName(editor, dataMceName);
        await pClickToolbarButtonByAriaName(editor, 'back');
        // this is needed because in case of fail the toolbar needs time to disapear
        await Waiter.pWait(50);

        await UiFinder.pWaitFor('toolbar should still be present', SugarBody.body(), `.tox-toolbar button[data-mce-name="${dataMceName}"]`);
      };

      it(`TINY-12118: pressing back from a context toolbar should show the previous toolbar (alt-button: ${inline ? 'inline' : 'not-inline'})`, async () => await testButtonBack('alt-button'));

      it(`TINY-12118: pressing back from a context toolbar should show the previous toolbar (slider: ${inline ? 'inline' : 'not-inline'})`, async () => await testButtonBack('slider'));

      it(`TINY-12118: pressing back from a context toolbar should show the previous toolbar (size: ${inline ? 'inline' : 'not-inline'})`, async () => await testButtonBack('size'));
    });
  });
});
