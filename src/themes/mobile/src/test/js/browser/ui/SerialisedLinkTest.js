asynctest(
  'Browser Test: .ui.SerialisedLinkTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.log.AlloyLogger',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.TestStore',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.properties.TextContent',
    'ephox.sugar.api.search.Traverse',
    'global!navigator',
    'tinymce.themes.mobile.ui.IosRealm',
    'tinymce.themes.mobile.ui.LinkButton'
  ],

  function (
    ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Pipeline, Step, UiControls, UiFinder, Waiter, Attachment, AlloyLogger,
    GuiSetup, TestStore, FieldPresence, FieldSchema, ValueSchema, Cell, Fun, Result, Focus, Body, Element, Attr, Css, Html, TextContent, Traverse, navigator,
    IosRealm, LinkButton
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var realm = IosRealm();

    var body = Body.body();
    Attachment.attachSystem(body, realm.system());

    var doc = Traverse.owner(body);

    var styles = document.createElement('link');
    styles.setAttribute('rel', 'Stylesheet');
    styles.setAttribute('href', '/project/src/themes/mobile/src/main/css/mobile.css');
    styles.setAttribute('type', 'text/css');
    document.head.appendChild(styles);

    var unload = function () {
      document.head.removeChild(styles);
      Attachment.detachSystem(realm.system());
    };


    var store = TestStore();

    var editorState = {
      start: Cell(null),
      content: Cell('')
    };

    var editor = {
      selection: {
        getStart: editorState.start.get,
        getContent: editorState.content.get,
        select: Fun.noop
      },
      insertContent: function (data) {
        store.adder({ method: 'insertContent', data: data })();
      },
      dom: {
        createHTML: function (tag, attributes, innerText) {
          return { tag: tag, attributes: attributes, innerText: innerText };
        },
        encode: Fun.identity
      },
      focus: Fun.noop
    };

    realm.setToolbarGroups([
      {
        label: 'group1',
        items: [
          LinkButton.sketch(realm, editor)
        ]
      }
    ]);

    var sPrepareState = function (node, content) {
      return Step.sync(function () {
        editorState.start.set(node);
        editorState.content.set(content);
      });
    };

    var sAssertNavigation = function (label, prevEnabled, nextEnabled) {
      return Logger.t(
        label,
        Step.sync(function () {
          var active = Focus.active().getOrDie();
          // The buttons are next and previous siblings
          var prev = Traverse.parent(active).bind(Traverse.prevSibling).getOrDie('Could not find button to left');
          var next = Traverse.parent(active).bind(Traverse.nextSibling).getOrDie('Could not find button to right');

          var assertNavButton = function (buttonLabel, expected, button) {
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

    var cGetFocused = Chain.binder(function () {
      return Focus.active().fold(function () {
        return Result.error('Could not find focused element');
      }, Result.value);
    });

    var cGetParent = Chain.binder(function (elem) {
      return Traverse.parent(elem).fold(function () {
        return Result.error('Could not find parent of ' + AlloyLogger.element(elem));
      }, Result.value);
    });

    var sClickNavigation = function (selector) {
      return Chain.asStep({ }, [
        cGetFocused,
        cGetParent,
        cGetParent,
        UiFinder.cFindIn(selector),
        Mouse.cClick
      ]);
    };

    var sClickPrev = sClickNavigation('.tinymce-mobile-icon-previous');
    var sClickNext = sClickNavigation('.tinymce-mobile-icon-next');


    var sAssertUrlFocused = GeneralSteps.sequence([
      FocusTools.sTryOnSelector('Focus should be on input with link URL', doc, 'input[placeholder="Type or paste URL"]'),
      sAssertNavigation('Checking initial navigation on text node', false, true)
    ]);

    var sAssertTextFocused = GeneralSteps.sequence([
      FocusTools.sTryOnSelector('Focus should be on input with link text', doc, 'input[placeholder="Link text"]'),
      sAssertNavigation('Checking navigation for link text', true, true)
    ]);

    var sAssertTitleFocused = GeneralSteps.sequence([
      FocusTools.sTryOnSelector('Focus should be on input with link title', doc, 'input[placeholder="Link title"]'),
      sAssertNavigation('Checking navigation for link text', true, true)
    ]);

    var sAssertTargetFocused = GeneralSteps.sequence([
      FocusTools.sTryOnSelector('Focus should be on input with link target', doc, 'input[placeholder="Link target"]'),
      sAssertNavigation('Checking navigation for link target', true, false)
    ]);

    var sTestNavigation = GeneralSteps.sequence([
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

    var sClickLink = Mouse.sClickOn(realm.element(), '.tinymce-mobile-icon-link');

    var sSetFieldValue = function (value) {
      return Chain.asStep({ }, [
        cGetFocused,
        UiControls.cSetValue(value)
      ]);
    };

    var sSetFieldOptValue = function (optVal) {
      return optVal.fold(function () {
        return Step.pass;
      }, sSetFieldValue);
    };

    var sTestScenario = function (rawScenario) {
      var scenario = ValueSchema.asRawOrDie('Checking scenario', ValueSchema.objOf([
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
          sPrepareState(scenario.node.dom(), scenario.content),
          sClickLink,
          sSetFieldOptValue(scenario.fields.url),
          sClickNext,
          sAssertTextFocused,
          sSetFieldOptValue(scenario.fields.text),
          sClickNext,
          sAssertTitleFocused,
          sSetFieldOptValue(scenario.fields.title),
          sClickNext,
          sAssertTargetFocused,
          sSetFieldOptValue(scenario.fields.target),
          sClickPrev,
          sAssertTitleFocused,
          sClickPrev,
          sAssertTextFocused,
          sClickPrev,
          sAssertUrlFocused,
          scenario.beforeExecute,
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          store.sAssertEq('Checking insert content', scenario.expected),
          scenario.mutations(scenario.node),
          store.sClear

        ])
      );
    };

    Pipeline.async({}, [
      GuiSetup.mAddStyles(doc, [
        '.tinymce-mobile-icon-link:before { content: "LINK"; background: black; color: white; }',
        // Speeds up tests.
        '.tinymce-mobile-serialised-dialog-chain { transition: left linear 0.000001s !important }'
      ]),

      Waiter.sTryUntil(
        'Waiting until CSS has loaded',
        Chain.asStep(realm.element(), [
          UiFinder.cFindIn('.tinymce-mobile-toolstrip'),
          Chain.op(function (toolstrip) {
            if (navigator.userAgent.indexOf('PhantomJS') === -1) {
              Assertions.assertEq('Checking toolstrip is flex', 'flex', Css.get(toolstrip, 'display'));
            }
          })
        ]),
        100,
        8000
      ),

      sPrepareState(Element.fromText('hi'), 'link-text'),

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
        mutations: function (node) {
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
        mutations: function (node) {
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
        mutations: function (node) {
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
        mutations: function (node) {
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
    ], function () {
      unload(); success();
    }, failure);
  }
);
