import { ApproxStructure, Assertions, Mouse, StructAssert, TestStore, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, Css } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { View } from 'tinymce/core/api/ui/Ui';

describe('browser.tinymce.themes.silver.view.ViewTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      const logEvent = (name: string) => (_api: View.ViewInstanceApi) => {
        store.add(name);
      };

      editor.ui.registry.addView('myview1', {
        buttons: [
          {
            type: 'button',
            text: 'Button 1',
            onAction: store.adder('myview1:button1')
          },
          {
            type: 'button',
            text: 'Button 2',
            onAction: store.adder('myview1:button2'),
            buttonType: 'primary'
          }
        ],
        onShow: logEvent('myview1:show'),
        onHide: logEvent('myview1:hide')
      });

      editor.ui.registry.addView('myview2', {
        buttons: [
          {
            type: 'button',
            text: 'Button 1',
            onAction: store.adder('myview2:button1'),
            buttonType: 'secondary'
          },
          {
            type: 'button',
            text: 'Button 2',
            onAction: store.adder('myview2:button2'),
            buttonType: 'primary'
          }
        ],
        onShow: logEvent('myview2:show'),
        onHide: logEvent('myview2:hide')
      });
    }
  }, []);

  const clickViewButton = (editor: Editor, tooltip: string) => {
    const btn = UiFinder.findIn(TinyDom.container(editor), `.tox-view button[title='${tooltip}']`).getOrDie();
    Mouse.click(btn);
  };

  const toggleView = (name: string) => {
    const editor = hook.editor();
    editor.execCommand('ToggleView', false, name);
  };

  const queryToggleView = () => {
    const editor = hook.editor();
    return editor.queryCommandValue('ToggleView');
  };

  const assertMainViewHidden = () => {
    const editor = hook.editor();
    const editorContainer = UiFinder.findIn(TinyDom.container(editor), '.tox-editor-container').getOrDie();

    assert.equal('true', Attribute.get(editorContainer, 'aria-hidden'), 'Should be aria-hidden');
    assert.equal('none', Css.getRaw(editorContainer, 'display').getOrDie(), 'Should have display none');
  };

  const assertMainViewVisible = () => {
    const editor = hook.editor();
    const editorContainer = UiFinder.findIn(TinyDom.container(editor), '.tox-editor-container').getOrDie();

    assert.isFalse(Attribute.has(editorContainer, 'aria-hidden'), 'Should not have aria-hidden');
    assert.isTrue(Css.getRaw(editorContainer, 'display').isNone(), 'Should not have display none');
  };

  it('TINY-8964: Structure', () => {
    const editor = hook.editor();
    const viewWrap = UiFinder.findIn(TinyDom.container(editor), '.tox-view-wrap').getOrDie();

    Assertions.assertStructure('Checking structure', ApproxStructure.build((s, str, arr) => {
      const button = (title: string, classes: string[]) =>
        s.element('button', {
          classes: Arr.map(classes, (cls) => arr.has(cls)),
          attrs: { 'title': str.is(title), 'type': str.is('button'), 'tabindex': str.is('-1'), 'data-alloy-tabstop': str.is('true') },
          children: [ s.text(str.is(title)) ]
        });

      const view = (startButtons: StructAssert[], endButtons: StructAssert[]) =>
        s.element('div', {
          classes: [ arr.has('tox-view') ],
          attrs: { 'aria-hidden': str.is('true') },
          styles: { display: str.is('none') },
          children: [
            s.element('div', {
              classes: [ arr.has('tox-view__header') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-view__header-start') ],
                  attrs: { role: str.is('presentation') },
                  children: startButtons
                }),
                s.element('div', {
                  classes: [ arr.has('tox-view__header-end') ],
                  attrs: { role: str.is('presentation') },
                  children: endButtons
                })
              ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-view__pane') ]
            })
          ]
        });

      return s.element('div', {
        classes: [ arr.has('tox-view-wrap') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-view-wrap__slot-container') ],
            children: [
              view(
                [],
                [
                  button('Button 1', [ 'tox-button', 'tox-button--secondary' ]),
                  button('Button 2', [ 'tox-button' ])
                ]
              ),
              view(
                [],
                [
                  button('Button 1', [ 'tox-button', 'tox-button--secondary' ]),
                  button('Button 2', [ 'tox-button' ])
                ]
              )
            ]
          })
        ]
      });
    }), viewWrap);
  });

  it('TINY-8964: ToggleView command', () => {
    store.clear();

    assertMainViewVisible();
    assert.equal(queryToggleView(), '', 'Should be empty string if no view is toggled on');

    toggleView('myview1');
    assert.equal(queryToggleView(), 'myview1');
    assertMainViewHidden();

    toggleView('myview2');
    assert.equal(queryToggleView(), 'myview2');
    assertMainViewHidden();

    toggleView('myview2');
    assert.equal(queryToggleView(), '');
    assertMainViewVisible();

    store.assertEq('Should show/hide myview1 and myview2', [
      'myview1:show',
      'myview2:show',
      'myview1:hide',
      'myview2:hide'
    ]);
  });

  it('TINY-8964: Click on view buttons', () => {
    const editor = hook.editor();

    store.clear();

    toggleView('myview1');
    clickViewButton(editor, 'Button 1');
    clickViewButton(editor, 'Button 2');

    store.assertEq('Should get showView then onAction calls for button1 and button2', [
      'myview1:show',
      'myview1:button1',
      'myview1:button2'
    ]);
  });
});
