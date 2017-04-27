asynctest(
  'Browser Test: ios.IosRealmTest',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.WindowSelection',
    'global!Math',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.IosRealm'
  ],

  function (
    Assertions, Mouse, Pipeline, Step, Replacing, GuiFactory, Attachment, GuiSetup, Fun, Merger, Option, Insert, Remove, DomEvent, Body, Element, Attr, Css,
    Html, Traverse, WindowSelection, Math, Styles, IosRealm
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var realm = IosRealm();

    var unload = function () {
      Remove.remove(iframe);
      Attachment.detachSystem(realm.system());
    };



    var iframe = Element.fromTag('iframe');
    Css.set(iframe, 'height', '400px');
    var onload = DomEvent.bind(iframe, 'load', function () {
      var head = Element.fromDom(iframe.dom().contentWindow.document.head);
      var body = Element.fromDom(iframe.dom().contentWindow.document.body);
      Attachment.attachSystem(body, realm.system());

      Css.set(body, 'margin', '0px');

      var css = Element.fromTag('link');
      Attr.setAll(css, {
        href: '/project/src/themes/mobile/src/main/css/mobile.css',
        rel: 'Stylesheet',
        type: 'text/css'
      });
      Insert.append(head, css);
      onload.unbind();


      var editor = Element.fromTag('iframe');
      Attr.set(editor, 'src', '/project/src/themes/mobile/src/test/html/editor.html');
      Replacing.append(
        realm.system().getByDom(Element.fromDom(
          realm.element().dom().querySelector('.tinymce-mobile-editor-socket'))
        ).getOrDie(),
        GuiFactory.external({
          element: editor
        })
      );

      realm.init({
        editor: {
          getFrame: function () {
            return editor;
          },
          onDomChanged: function () {
            return { unbind: Fun.noop };
          }
        },
        container: realm.element(),
        socket: Element.fromDom(realm.element().dom().querySelector('.tinymce-mobile-editor-socket')),
        toolstrip: Element.fromDom(realm.element().dom().querySelector('.tinymce-mobile-toolstrip')),
        toolbar: Element.fromDom(realm.element().dom().querySelector('.tinymce-mobile-toolbar')),
        alloy: realm.system()
      });
    });

    Insert.append(Body.body(), iframe);

    var mShowKeyboard = function (selector, index) {
      var keyboardHeight = 200;
      return Step.stateful(function (value, next, die) {
        var pageBody = iframe.dom().contentWindow.document.body;
        var editorBody = pageBody.querySelector('iframe').contentWindow.document.body;
        var target = Option.from(editorBody.querySelectorAll(selector)[index]).map(Element.fromDom).getOrDie('no index ' + index + ' for selector: ' + selector);
        WindowSelection.setExact(editorBody.ownerDocument.defaultView, target, 0, target, 0);
        pageBody.querySelector('.tinymce-mobile-editor-socket').scrollTop = target.dom().getBoundingClientRect().top - 100 - keyboardHeight;
        pageBody.style.setProperty('margin-bottom', '2000px');
        pageBody.ownerDocument.defaultView.scrollTo(0, keyboardHeight);

        var newValue = Merger.deepMerge(
          value,
          {
            target: target,
            targetTop: target.dom().getBoundingClientRect().top
          }
        );
        console.log('newValue', newValue);
        next(newValue);
      });
    };

    Pipeline.async({}, [
      Step.wait(1000),
      Mouse.sClickOn(realm.element(), '[role="button"]'),
      Step.wait(1000),
      Step.sync(function () {
        // iframe.dom().contentWindow.document.querySelector('.tinymce-mobile-editor-socket').scrollTop = 200;
      }),
      Step.wait(1000),
      mShowKeyboard('p', 13),
      Step.sync(function () {
        var toolstrip = iframe.dom().contentWindow.document.querySelector('.tinymce-mobile-toolstrip');
        Assertions.assertEq('Checking that the toolstrip is off screen when window moves', true, toolstrip.getBoundingClientRect().top < 0);
      }),
      Step.wait(3000),
      Step.sync(function () {
        var toolstrip = iframe.dom().contentWindow.document.querySelector('.tinymce-mobile-toolstrip');
        Assertions.assertEq('Checking that the toolstrip is at top of screen after scroll recognised', 0, toolstrip.getBoundingClientRect().top);
      }),
      Step.stateful(function (value, next, die) {
        var oldTop = value.targetTop;
        var newTop = value.target.dom().getBoundingClientRect().top;
        Assertions.assertEq('Checking top values are approximately equal after scrolling', true, Math.abs(newTop - oldTop) < 10);
        next(value);
      })
    ], function () { unload(); success(); }, failure);

  }
);
