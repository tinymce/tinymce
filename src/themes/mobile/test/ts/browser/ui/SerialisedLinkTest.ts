import {
    ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse,
    Pipeline, Step, UiFinder
} from '@ephox/agar';
import { Attachment } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Body, Class, Element, Focus, Traverse } from '@ephox/sugar';

import IosRealm from 'tinymce/themes/mobile/ui/IosRealm';
import * as LinkButton from 'tinymce/themes/mobile/ui/LinkButton';

import GuiSetup from '../../module/test/GuiSetup';
import TestEditor from '../../module/test/ui/TestEditor';
import TestSelectors from '../../module/test/ui/TestSelectors';
import TestStyles from '../../module/test/ui/TestStyles';
import TestUi from '../../module/test/ui/TestUi';

UnitTest.asynctest('Browser Test: ui.SerialisedLinkTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const detection = PlatformDetection.detect();

  const realm = IosRealm(Fun.noop);
  // Make toolbar appear
  Class.add(realm.system().element(), 'tinymce-mobile-fullscreen-maximized');

  const body = Body.body();
  Attachment.attachSystem(body, realm.system());

  const doc = Traverse.owner(body);

  TestStyles.addStyles();

  const unload = function () {
    TestStyles.removeStyles();
    Attachment.detachSystem(realm.system());
  };

  const tEditor = TestEditor();

  realm.setToolbarGroups([
    {
      label: 'group1',
      items: [
        LinkButton.sketch(realm, tEditor.editor())
      ]
    }
  ]);

  const sAssertNavigation = function (label, prevEnabled, nextEnabled) {
    return Logger.t(
      label,
      Step.sync(function () {
        const active = Focus.active().getOrDie();
        // The buttons are next and previous siblings
        const prev = Traverse.parent(active).bind(Traverse.prevSibling).getOrDie('Could not find button to left');
        const next = Traverse.parent(active).bind(Traverse.nextSibling).getOrDie('Could not find button to right');

        const assertNavButton = function (buttonLabel, expected, button) {
          Assertions.assertStructure(
            'Checking ' + buttonLabel + ' button should be enabled = ' + expected,
            ApproxStructure.build(function (s, str, arr) {
              return s.element('span', {
                attr: {
                  role: str.is('button')
                },
                classes: [
                  (expected ? arr.not : arr.has)('tinymce-mobile-toolbar-navigation-disabled')
                ]
              });
            }),
            button
          );
        };

        assertNavButton('previous', prevEnabled, prev);
        assertNavButton('next', nextEnabled, next);
      })
    );
  };

  const sClickNavigation = function (selector) {
    return Chain.asStep({ }, [
      TestUi.cGetFocused,
      TestUi.cGetParent,
      TestUi.cGetParent,
      UiFinder.cFindIn(selector),
      Mouse.cClick
    ]);
  };

  const sClickPrev = sClickNavigation('.tinymce-mobile-icon-previous');
  const sClickNext = sClickNavigation('.tinymce-mobile-icon-next');

  const sAssertUrlFocused = GeneralSteps.sequence([
    FocusTools.sTryOnSelector('Focus should be on input with link URL', doc, 'input[placeholder="Type or paste URL"]'),
    sAssertNavigation('Checking initial navigation on text node', false, true)
  ]);

  const sAssertTextFocused = GeneralSteps.sequence([
    FocusTools.sTryOnSelector('Focus should be on input with link text', doc, 'input[placeholder="Link text"]'),
    sAssertNavigation('Checking navigation for link text', true, true)
  ]);

  const sAssertTitleFocused = GeneralSteps.sequence([
    FocusTools.sTryOnSelector('Focus should be on input with link title', doc, 'input[placeholder="Link title"]'),
    sAssertNavigation('Checking navigation for link title', true, true)
  ]);

  const sAssertTargetFocused = GeneralSteps.sequence([
    FocusTools.sTryOnSelector('Focus should be on input with link target', doc, 'input[placeholder="Link target"]'),
    sAssertNavigation('Checking navigation for link target', true, false)
  ]);

  const sTestNavigation = GeneralSteps.sequence([
    Keyboard.sKeydown(doc, Keys.tab(), { }),
    sAssertTextFocused,
    Keyboard.sKeydown(doc, Keys.tab(), { }),
    sAssertTitleFocused,
    Keyboard.sKeydown(doc, Keys.tab(), { }),
    sAssertTargetFocused,
    Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
    sAssertTitleFocused,
    Keyboard.sKeydown(doc, Keys.tab(), { shift: false }),
    sAssertTargetFocused,
    Keyboard.sKeydown(doc, Keys.tab(), { }),

    Step.wait(1000),
    Logger.t('Checking pressing tab at the end should not move focus', sAssertTargetFocused),

    sClickPrev,
    sAssertTitleFocused,
    sClickNext,
    sAssertTargetFocused,
    sClickPrev,
    sAssertTitleFocused,
    sClickPrev,
    sAssertTextFocused,
    sClickPrev,
    sAssertUrlFocused
  ]);

  const sClickLink = Mouse.sClickOn(realm.element(), TestSelectors.link());

  const sTestScenario = function (rawScenario) {
    const scenario = ValueSchema.asRawOrDie('Checking scenario', ValueSchema.objOf([
      FieldSchema.strict('label'),
      FieldSchema.defaulted('content', ''),
      FieldSchema.defaulted('node', Element.fromText('')),
      FieldSchema.strictObjOf('fields', [
        FieldSchema.option('url'),
        FieldSchema.option('text'),
        FieldSchema.option('title'),
        FieldSchema.option('target')
      ]),
      FieldSchema.strict('expected'),
      FieldSchema.defaulted('beforeExecute', Step.pass),
      FieldSchema.defaulted('mutations', Fun.constant(Step.pass))
    ]), rawScenario);

    return Logger.t(
      scenario.label,
      GeneralSteps.sequence([
        tEditor.sPrepareState(scenario.node.dom(), scenario.content),
        sClickLink,
        TestUi.sSetFieldOptValue(scenario.fields.url),
        sClickNext,
        sAssertTextFocused,
        TestUi.sSetFieldOptValue(scenario.fields.text),
        sClickNext,
        sAssertTitleFocused,
        TestUi.sSetFieldOptValue(scenario.fields.title),
        sClickNext,
        sAssertTargetFocused,
        TestUi.sSetFieldOptValue(scenario.fields.target),
        sClickPrev,
        sAssertTitleFocused,
        sClickPrev,
        sAssertTextFocused,
        sClickPrev,
        sAssertUrlFocused,
        scenario.beforeExecute,
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        tEditor.sAssertEq('Checking insert content', scenario.expected),
        scenario.mutations(scenario.node),
        tEditor.sClear

      ])
    );
  };

  Pipeline.async({}, detection.browser.isChrome() ? [
    GuiSetup.mAddStyles(doc, [
      '.tinymce-mobile-icon-link:before { content: "LINK"; background: black; color: white; }',
      // Speeds up tests.
      '.tinymce-mobile-serialised-dialog-chain { transition: left linear 0.000001s !important }'
    ]),

    TestStyles.sWaitForToolstrip(realm),

    tEditor.sPrepareState(Element.fromText('hi'), 'link-text'),

    sClickLink,
    FocusTools.sTryOnSelector('Focus should be on input with link URL', doc, 'input[placeholder="Type or paste URL"]'),
    sAssertNavigation('Checking initial navigation on text node', false, true),

    sTestNavigation,
    Step.sync(function () {
      realm.restoreToolbar();
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after just setting URL',
      fields: {
        url: 'http://fake-url'
      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'http://fake-url'
            },
            innerText: 'http://fake-url'
          }
        }
      ]
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after filling in URL and text',
      fields: {
        url: 'http://fake-url',
        text: 'LinkText'
      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'http://fake-url'
            },
            innerText: 'LinkText'
          }
        }
      ]
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after filling in URL and title (not text)',
      fields: {
        url: 'http://fake-url',
        title: 'Title'
      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'http://fake-url',
              title: 'Title'
            },
            innerText: 'http://fake-url'
          }
        }
      ]
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after filling in URL, text, and title',
      fields: {
        url: 'http://fake-url',
        text: 'LinkText',
        title: 'Title'
      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'http://fake-url',
              title: 'Title'
            },
            innerText: 'LinkText'
          }
        }
      ]
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after filling in URL, text, title, and target',
      fields: {
        url: 'http://fake-url',
        text: 'LinkText',
        title: 'Title',
        target: 'Target'
      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'http://fake-url',
              title: 'Title',
              target: 'Target'
            },
            innerText: 'LinkText'
          }
        }
      ]
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after filling in URL with initial text selection',
      content: 'Initial text selection',
      fields: {
        url: 'http://fake-url'
      },
      expected: [
        {
          method: 'insertContent',
          data: {
            tag: 'a',
            attributes: {
              href: 'http://fake-url'
            },
            innerText: 'Initial text selection'
          }
        }
      ]
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after filling in nothing with an existing link with url',
      node: Element.fromHtml('<a href="http://prepared-url">Prepared</a>'),
      fields: { },
      expected: [ ],
      mutations (node) {
        return Assertions.sAssertStructure('Checking mutated structure', ApproxStructure.build(function (s, str, arr) {
          return s.element('a', {
            attrs: {
              href: str.is('http://prepared-url')
            },
            html: str.is('Prepared')
          });
        }), node);
      }
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after filling in URL with an existing link with url (and text content did not match URL previously)',
      node: Element.fromHtml('<a href="http://prepared-url">Prepared</a>'),
      fields: {
        url: 'http://new-url'
      },
      expected: [ ],
      mutations (node) {
        return Assertions.sAssertStructure('Checking mutated structure', ApproxStructure.build(function (s, str, arr) {
          return s.element('a', {
            attrs: {
              href: str.is('http://new-url')
            },
            html: str.is('Prepared')
          });
        }), node);
      }
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after filling in URL with an existing link with url (and text content matched URL previously)',
      node: Element.fromHtml('<a href="http://prepared-url">http://prepared-url</a>'),
      fields: {
        url: 'http://new-url'
      },
      expected: [ ],
      mutations (node) {
        return Assertions.sAssertStructure('Checking mutated structure', ApproxStructure.build(function (s, str, arr) {
          return s.element('a', {
            attrs: {
              href: str.is('http://new-url')
            },
            html: str.is('http://new-url')
          });
        }), node);
      }
    }),

    sTestScenario({
      label: 'Testing hitting ENTER after filling in URL and text with an existing link with url',
      node: Element.fromHtml('<a href="http://prepared-url">any text</a>'),
      fields: {
        url: 'http://new-url',
        text: 'new-text'
      },
      expected: [ ],
      mutations (node) {
        return Assertions.sAssertStructure('Checking mutated structure', ApproxStructure.build(function (s, str, arr) {
          return s.element('a', {
            attrs: {
              href: str.is('http://new-url')
            },
            html: str.is('new-text')
          });
        }), node);
      }
    })
  ] : [], function () {
    unload(); success();
  }, failure);
});
