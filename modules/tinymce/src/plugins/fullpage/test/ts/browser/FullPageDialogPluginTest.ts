import {
  ApproxStructure,
  Assertions,
  Chain,
  FocusTools,
  GeneralSteps,
  Keyboard,
  Keys,
  Logger,
  Pipeline,
  Step,
  UiFinder,
  Guard,
  Log,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyLoader } from '@ephox/mcagar';
import { Body, Element, Value } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/fullpage/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fullpage.FullPageDialogPluginTest', function (success, failure) {
  Plugin();
  Theme();

  const selectors = {
    titleInput : 'label.tox-label:contains(Title) + input.tox-textfield',
    keywordsInput : 'label.tox-label:contains(Keywords) + input.tox-textfield',
    descriptionInput : 'label.tox-label:contains(Description) + input.tox-textfield',
    robotsInput : 'label.tox-label:contains(Robots) + input.tox-textfield',
    authorInput : 'label.tox-label:contains(Author) + input.tox-textfield',
    encodingInput : 'label.tox-label:contains(Encoding) + input.tox-textfield',
  };

  const sInitialState = (editor) => Logger.t(
    'test inital data',
    GeneralSteps.sequence([
      sOpenDialog(editor),
      UiFinder.sWaitFor('Waiting for dialog to appear', Body.body(), '.tox-dialog-wrap'),
      Chain.asStep(Body.body(), [
        UiFinder.cFindIn('div.tox-dialog'),
        Chain.op((dialog) => {
          Assertions.assertStructure(
            'Full page properties should have this structure',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                classes: [ arr.has('tox-dialog') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-dialog__header') ],
                    children: [
                      s.element('div', {
                        html: str.is('Metadata and Document Properties')
                      }),
                      s.element('button', {
                        classes: [ arr.has('tox-button--icon'), arr.has('tox-button--naked') ],
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-dialog__content-js')],
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
                                        classes: [ arr.has('tox-textfield') ],
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
                                        classes: [ arr.has('tox-textfield') ],
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
                                        classes: [ arr.has('tox-textfield') ],
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
                                        classes: [ arr.has('tox-textfield') ],
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
                                        classes: [ arr.has('tox-textfield') ],
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
                                        classes: [ arr.has('tox-textfield') ],
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
              });
            }),
            dialog
          );
        })
      ]),
    ])
  );

  const sOpenDialog = (editor) => {
    return Logger.t('Open dialog', Step.sync(function () {
      editor.execCommand('mceFullPageProperties');
    }));
  };

  const cGetInput = (selector: string) => Chain.control(
    Chain.fromChains([
      Chain.inject(Body.body()),
      UiFinder.cFindIn(selector)
    ]),
    Guard.addLogging('Get input')
  );

  const sCheckInputValue = (Label, selector, expected) => {
    return Logger.t(Label,
      Chain.asStep({}, [
        cGetInput(selector),
        Chain.op((element) => {
          Assertions.assertEq(`The input value for ${Label} should be: `, expected, Value.get(element));
        })
      ]),
    );
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const doc = Element.fromDom(document);
    Pipeline.async({},
      Log.steps('TBA', 'FullPage: Test initial data, set new input values, open dialog, verify that the dialog data matches the input values', [

        sInitialState(editor),
        sCheckInputValue('Title', selectors.titleInput, 'Fullpage Dialog Test Title'),
        sCheckInputValue('Keywords', selectors.keywordsInput, ''),
        sCheckInputValue('Description', selectors.descriptionInput, ''),
        sCheckInputValue('Robots', selectors.robotsInput, ''),
        sCheckInputValue('Author', selectors.authorInput, ''),
        sCheckInputValue('Encoding', selectors.encodingInput, 'ISO-8859-1'),

        FocusTools.sTryOnSelector(
          'Focus should start on first input',
          doc,
          selectors.titleInput
        ),
        FocusTools.sSetActiveValue(doc, 'the nu title'),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sSetActiveValue(doc, 'the nu keywords'),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sSetActiveValue(doc, 'the nu description'),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sSetActiveValue(doc, 'the nu robots'),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sSetActiveValue(doc, 'the nu author'),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sSetActiveValue(doc, 'the nu encoding'),
        FocusTools.sIsOnSelector('last', doc, selectors.encodingInput),

        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sIsOnSelector('The cancel button should be focused', doc, 'button:contains("Cancel")'),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sIsOnSelector('The save button should be focused', doc, 'button:contains("Save")'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), 'div.tox-dialog'),

        sOpenDialog(editor),
        sCheckInputValue('Title', selectors.titleInput, 'the nu title'),
        sCheckInputValue('Keywords', selectors.keywordsInput, 'the nu keywords'),
        sCheckInputValue('Description', selectors.descriptionInput, 'the nu description'),
        sCheckInputValue('Robots', selectors.robotsInput, 'the nu robots'),
        sCheckInputValue('Author', selectors.authorInput, 'the nu author'),
        sCheckInputValue('Encoding', selectors.encodingInput, 'the nu encoding'),
    ]), onSuccess, onFailure);

  }, {
    plugins: 'fullpage',
    base_url: '/project/tinymce/js/tinymce',
    indent: false,
    theme: 'silver',
    fullpage_default_title: 'Fullpage Dialog Test Title',
    fullpage_default_langcode: 'en-US',
    fullpage_default_xml_pi: true,
    fullpage_default_text_color: 'blue',
    fullpage_default_font_family: '"Times New Roman", Georgia, Serif'
  }, success, failure);
});
