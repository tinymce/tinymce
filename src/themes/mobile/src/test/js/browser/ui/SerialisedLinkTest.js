asynctest(
  'Browser Test: .ui.SerialisedLinkTest',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'tinymce.themes.mobile.ui.IosRealm',
    'tinymce.themes.mobile.ui.LinkButton'
  ],

  function (Chain, Mouse, Pipeline, Step, UiFinder, Attachment, GuiSetup, Body, Element, Traverse, IosRealm, LinkButton) {
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


    var editor = {
      selection: {
        getStart: function () { return text.dom(); },
        getContent: function () { return ''; }
      }
    };

    realm.setToolbarGroups([
      {
        label: 'group1',
        items: [
          LinkButton.sketch(realm, editor)
        ]
      }
    ]);
    

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

    Pipeline.async({}, [
      GuiSetup.mAddStyles(doc, [
        '.tinymce-mobile-toolbar-button-link:before { content: "LINK"; background: black; color: white; }'
      ]),
      
      // sTriggerEvent
      Mouse.sClickOn(realm.element(), '.tinymce-mobile-toolbar-button-link'),
      
      function () { }
    ], function () { success(); }, failure);
  }
);
