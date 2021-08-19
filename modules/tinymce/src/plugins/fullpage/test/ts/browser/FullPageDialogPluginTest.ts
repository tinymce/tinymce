import { ApproxStructure, Assertions, FocusTools, Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarDocument, Value } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/fullpage/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.fullpage.FullPageDialogPluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'fullpage',
    base_url: '/project/tinymce/js/tinymce',
    indent: false,
    fullpage_default_title: 'Fullpage Dialog Test Title',
    fullpage_default_langcode: 'en-US',
    fullpage_default_xml_pi: true,
    fullpage_default_text_color: 'blue',
    fullpage_default_font_family: '"Times New Roman", Georgia, Serif'
  }, [ Plugin, Theme ]);

  const selectors = {
    titleInput: 'label.tox-label:contains(Title) + input.tox-textfield',
    keywordsInput: 'label.tox-label:contains(Keywords) + input.tox-textfield',
    descriptionInput: 'label.tox-label:contains(Description) + input.tox-textfield',
    robotsInput: 'label.tox-label:contains(Robots) + input.tox-textfield',
    authorInput: 'label.tox-label:contains(Author) + input.tox-textfield',
    encodingInput: 'label.tox-label:contains(Encoding) + input.tox-textfield'
  };

  const pInitialState = async (editor: Editor) => {
    openDialog(editor);
    await UiFinder.pWaitFor('Waiting for dialog to appear', SugarBody.body(), '.tox-dialog-wrap');
    const dialog = UiFinder.findIn(SugarBody.body(), 'div.tox-dialog').getOrDie();
    Assertions.assertStructure(
      'Full page properties should have this structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-dialog') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-dialog__header') ],
            children: [
              s.element('div', {
                html: str.is('Metadata and Document Properties')
              }),
              s.element('button', {
                classes: [ arr.has('tox-button--icon'), arr.has('tox-button--naked') ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-dialog__content-js') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-dialog__body') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-dialog__body-content') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-form') ],
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-form__group') ],
                            children: [
                              s.element('label', {
                                classes: [ arr.has('tox-label') ],
                                html: str.is('Title')
                              }),
                              s.element('input', {
                                classes: [ arr.has('tox-textfield') ]
                              })
                            ]
                          }),
                          s.element('div', {
                            classes: [ arr.has('tox-form__group') ],
                            children: [
                              s.element('label', {
                                classes: [ arr.has('tox-label') ],
                                html: str.is('Keywords')
                              }),
                              s.element('input', {
                                classes: [ arr.has('tox-textfield') ]
                              })
                            ]
                          }),
                          s.element('div', {
                            classes: [ arr.has('tox-form__group') ],
                            children: [
                              s.element('label', {
                                classes: [ arr.has('tox-label') ],
                                html: str.is('Description')
                              }),
                              s.element('input', {
                                classes: [ arr.has('tox-textfield') ]
                              })
                            ]
                          }),
                          s.element('div', {
                            classes: [ arr.has('tox-form__group') ],
                            children: [
                              s.element('label', {
                                classes: [ arr.has('tox-label') ],
                                html: str.is('Robots')
                              }),
                              s.element('input', {
                                classes: [ arr.has('tox-textfield') ]
                              })
                            ]
                          }),
                          s.element('div', {
                            classes: [ arr.has('tox-form__group') ],
                            children: [
                              s.element('label', {
                                classes: [ arr.has('tox-label') ],
                                html: str.is('Author')
                              }),
                              s.element('input', {
                                classes: [ arr.has('tox-textfield') ]
                              })
                            ]
                          }),
                          s.element('div', {
                            classes: [ arr.has('tox-form__group') ],
                            children: [
                              s.element('label', {
                                classes: [ arr.has('tox-label') ],
                                html: str.is('Encoding')
                              }),
                              s.element('input', {
                                classes: [ arr.has('tox-textfield') ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-dialog__footer') ]
          })
        ]
      })),
      dialog
    );
  };

  const openDialog = (editor: Editor) => {
    editor.execCommand('mceFullPageProperties');
  };

  const getInput = (selector: string) =>
    UiFinder.findIn(SugarBody.body(), selector).getOrDie();

  const checkInputValue = (label: string, selector: string, expected: string) => {
    const input = getInput(selector);
    assert.equal(Value.get(input), expected, `The input value for ${label} should be: ${expected}`);
  };

  it('TBA: Test initial data, set new input values, open dialog, verify that the dialog data matches the input values', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    await pInitialState(editor);
    checkInputValue('Title', selectors.titleInput, 'Fullpage Dialog Test Title');
    checkInputValue('Keywords', selectors.keywordsInput, '');
    checkInputValue('Description', selectors.descriptionInput, '');
    checkInputValue('Robots', selectors.robotsInput, '');
    checkInputValue('Author', selectors.authorInput, '');
    checkInputValue('Encoding', selectors.encodingInput, 'ISO-8859-1');

    await FocusTools.pTryOnSelector(
      'Focus should start on first input',
      doc,
      selectors.titleInput
    );
    FocusTools.setActiveValue(doc, 'the nu title');
    TinyUiActions.keydown(editor, Keys.tab());
    FocusTools.setActiveValue(doc, 'the nu keywords');
    TinyUiActions.keydown(editor, Keys.tab());
    FocusTools.setActiveValue(doc, 'the nu description');
    TinyUiActions.keydown(editor, Keys.tab());
    FocusTools.setActiveValue(doc, 'the nu robots');
    TinyUiActions.keydown(editor, Keys.tab());
    FocusTools.setActiveValue(doc, 'the nu author');
    TinyUiActions.keydown(editor, Keys.tab());
    FocusTools.setActiveValue(doc, 'the nu encoding');
    FocusTools.isOnSelector('last', doc, selectors.encodingInput);

    TinyUiActions.keydown(editor, Keys.tab());
    FocusTools.isOnSelector('The cancel button should be focused', doc, 'button:contains("Cancel")');
    TinyUiActions.keydown(editor, Keys.tab());
    FocusTools.isOnSelector('The save button should be focused', doc, 'button:contains("Save")');
    TinyUiActions.keydown(editor, Keys.enter());
    UiFinder.notExists(SugarBody.body(), 'div.tox-dialog');

    openDialog(editor);
    checkInputValue('Title', selectors.titleInput, 'the nu title');
    checkInputValue('Keywords', selectors.keywordsInput, 'the nu keywords');
    checkInputValue('Description', selectors.descriptionInput, 'the nu description');
    checkInputValue('Robots', selectors.robotsInput, 'the nu robots');
    checkInputValue('Author', selectors.authorInput, 'the nu author');
    checkInputValue('Encoding', selectors.encodingInput, 'the nu encoding');
  });
});
