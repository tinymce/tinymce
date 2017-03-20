define(
  'ephox.alloy.test.GuiSetup',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.test.TestStore',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'global!document'
  ],

  function (Assertions, Pipeline, Step, Attachment, Gui, TestStore, Merger, Insert, Remove, DomEvent, Element, Html, document) {
    var setup = function (createComponent, f, success, failure) {
      var store = TestStore();

      var gui = Gui.create();

      var doc = Element.fromDom(document);
      var body = Element.fromDom(document.body);

      Attachment.attachSystem(body, gui);

      var component = createComponent(store, doc, body);
      gui.add(component);

      Pipeline.async({}, f(doc, body, gui, component, store), function () {
        Attachment.detachSystem(gui);
        success();
      }, failure);
    };

    var mSetupKeyLogger = function (body) {
      return Step.stateful(function (_, next, die) {
        var onKeydown = DomEvent.bind(body, 'keydown', function (event) {
          newState.log.push('keydown.to.body: ' + event.raw().which);
        });

        var log = [ ];
        var newState = {
          log: log,
          onKeydown: onKeydown
        };
        next(newState);
      });
    };

    var mTeardownKeyLogger = function (body, expected) {
      return Step.stateful(function (state, next, die) {
        Assertions.assertEq('Checking key log outside context (on teardown)', expected, state.log);
        state.onKeydown.unbind();
        next({});
      });
    };

    var mAddStyles = function (doc, styles) {
      return Step.stateful(function (value, next, die) {
        var style = Element.fromTag('style');
        var head = Element.fromDom(doc.dom().head);
        Insert.append(head, style);
        Html.set(style, styles.join('\n'));

        next(Merger.deepMerge(value, {
          style: style
        }));
      });
    };

    var mRemoveStyles = Step.stateful(function (value, next, die) {
      Remove.remove(value.style);
      next(value);
    });

    return {
      setup: setup,
      mSetupKeyLogger: mSetupKeyLogger,
      mTeardownKeyLogger: mTeardownKeyLogger,

      mAddStyles: mAddStyles,
      mRemoveStyles: mRemoveStyles
    };
  }
);