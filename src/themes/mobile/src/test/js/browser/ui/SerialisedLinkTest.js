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
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.log.AlloyLogger',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.TestStore',
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
    'tinymce.themes.mobile.ui.IosRealm',
    'tinymce.themes.mobile.ui.LinkButton'
  ],

  function (
    ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Pipeline, Step, UiFinder, Waiter, Attachment, AlloyLogger, GuiSetup,
    TestStore, Cell, Fun, Result, Focus, Body, Element, Attr, Css, Html, TextContent, Traverse, IosRealm, LinkButton
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var realm = IosRealm();

    var body = Body.body();
    Attachment.attachSystem(body, realm.system());

    var doc = Traverse.owner(body);

    var text = Element.fromText('just-text');
    var link = Element.fromHtml('<a href="http://link">Link</a>');

    var styles = document.createElement('link');
    styles.setAttribute('rel', 'Stylesheet');
    styles.setAttribute('href', '/project/src/themes/mobile/src/main/css/mobile.css');
    styles.setAttribute('type', 'text/css');
    document.head.appendChild(styles);


    var store = TestStore();

    var editorState = {
      start: Cell(null),
      content: Cell('')
    };

    var editor = {
      selection: {
        getStart: editorState.start.get,
        getContent: editorState.content.get
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

    var root = realm.system().getByDom(realm.element()).getOrDie();

    var sTriggerEvent = function (event, selector, data) {
      return Chain.asStep({ }, [
        Chain.inject(realm.element()),
        UiFinder.cFindIn(selector),
        Chain.op(function (target) {
          root.getSystem().triggerEvent(event, target, data(target));
        })
      ]);
    };

    var sAssertNavigation = function (label, prevEnabled, nextEnabled) {
      return Logger.t(
        label,
        Step.sync(function () {
          var active = Focus.active().getOrDie();
          // The buttons are next and previous siblings
          var prev = Traverse.prevSibling(active).getOrDie('Could not find button to left');
          var next = Traverse.nextSibling(active).getOrDie('Could not find button to right');

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
        UiFinder.cFindIn(selector),
        Mouse.cClick
      ]);
    };

    var sClickPrev = sClickNavigation('.tinymce-mobile-toolbar-previous');
    var sClickNext = sClickNavigation('.tinymce-mobile-toolbar-next');


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

    Pipeline.async({}, [
      GuiSetup.mAddStyles(doc, [
        '.tinymce-mobile-toolbar-button-link:before { content: "LINK"; background: black; color: white; }'
      ]),

      Waiter.sTryUntil(
        'Waiting until CSS has loaded',
        Chain.asStep(realm.element(), [
          UiFinder.cFindIn('.tinymce-mobile-toolstrip'),
          Chain.op(function (toolstrip) {
            Assertions.assertEq('Checking toolstrip is flex', 'flex', Css.get(toolstrip, 'display'));
          })
        ]),
        100,
        8000
      ),

      sPrepareState(text, 'link-text'),

      // sTriggerEvent
      Mouse.sClickOn(realm.element(), '.tinymce-mobile-toolbar-button-link'),

      FocusTools.sTryOnSelector('Focus should be on input with link URL', doc, 'input[placeholder="Type or paste URL"]'),
      sAssertNavigation('Checking initial navigation on text node', false, true),

      sTestNavigation,
      function () { }
    ], function () { document.head.removeChild(styles); success(); }, failure);
  }
);
