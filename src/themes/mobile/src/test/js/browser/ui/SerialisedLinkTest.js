asynctest(
  'Browser Test: .ui.SerialisedLinkTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.TestStore',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.properties.TextContent',
    'ephox.sugar.api.search.Traverse',
    'tinymce.themes.mobile.ui.IosRealm',
    'tinymce.themes.mobile.ui.LinkButton'
  ],

  function (
    ApproxStructure, Assertions, Chain, Mouse, Pipeline, Step, UiFinder, Attachment, GuiSetup, TestStore, Cell, Fun, Focus, Body, Element, Attr, Html, TextContent,
    Traverse, IosRealm, LinkButton
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
      return Step.sync(function () {
        var active = Focus.active().getOrDie();
        // The buttons are next and previous siblings
        var prev = Traverse.prevSibling(active).getOrDie('Could not find button to left');
        var next = Traverse.nextSibling(active).getOrDie('Could not find button to right');
        Assertions.assertStructure(
          'Checking previous button should be enabled = ' + prevEnabled,
          ApproxStructure.build(function (s, str, arr) {
            return s.element('span', {
              attr: {
                role: str.is('button')
              },
              classes: [
                (prevEnabled ? arr.not : arr.has)('tinymce-mobile-toolbar-navigation-disabled')
              ]
            });
          }),
          prev
        );
      });
    };

    Pipeline.async({}, [
      GuiSetup.mAddStyles(doc, [
        '.tinymce-mobile-toolbar-button-link:before { content: "LINK"; background: black; color: white; }'
      ]),

      sPrepareState(text, 'link-text'),

      
      
      // sTriggerEvent
      Mouse.sClickOn(realm.element(), '.tinymce-mobile-toolbar-button-link'),
      sAssertNavigation('Checking initial navigation on text node', false, true),
      
      function () { }
    ], function () { doucment.head.removeChild(styles); success(); }, failure);
  }
);
