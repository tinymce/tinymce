define(
  'tinymce.themes.mobile.touch.view.TapToEditButton',

  [
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.ui.TouchMenu',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Singleton',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class',
    'global!setTimeout',
    'tinymce.themes.mobile.touch.view.TapToEditMenuParts'
  ],

  function (AdhocBehaviour, Behaviour, AlloyEvents, TouchMenu, Future, Singleton, Attr, Class, setTimeout, TapToEditMenuParts) {
    var sketch = function (spec) {
      var state = Singleton.value();

      var gotoView = function (comp) {
        if (state.isSet()) spec.onView();
        state.clear();
      };

      var gotoEdit = function (comp) {
        if (state.isSet()) spec.onEdit();
        state.clear();
      };

      var updateIcon = function (comp, value) {
        var icon = spec.memIcon.get(comp);
        Attr.set(icon.element(), 'data-mode', value);
      };

      var updateState = function (comp, value) {
        updateIcon(comp, value);
        state.set(value);
      };

      var clearState = function (comp) {
        var icon = spec.memIcon.get(comp);
        Attr.remove(icon.element(), 'data-mode');
        state.clear();
      };

      return TouchMenu.sketch({
        dom: spec.dom,
        components: [
          TouchMenu.parts().sink()
        ].concat(spec.components),
   
        fetch: function () {
          return Future.pure([
            { type: 'item', data: { value: 'Edit', text: 'Edit' } }
          ]);
        },
        onExecute: function (comp, menuComp, item, data) {
          updateState(comp, data.value);
        },

        onHoverOn: function (comp) {
          Class.add(comp.element(), 'hovered');
          updateState(comp, 'View');
        },
        onHoverOff: function (comp) {
          Class.remove(comp.element(), 'hovered');
          clearState(comp);
        },

        onTap: function () {
          setTimeout(function () {
            gotoView();
          }, 300);
        },

        toggleClass: 'selected',

        transition: {
          property: 'transform',
          transitionClass: 'longpress-menu-transitioning'
        },

        onClosed: function (comp) {
          state.on(function (s) {
            if (s === 'Edit') gotoEdit(comp);
            else if (s === 'View') gotoView(comp);
          })
        },

        customBehaviours: [
          AdhocBehaviour.events('initial-state', AlloyEvents.derive([
            AlloyEvents.runOnAttached(function (comp, se) {
              clearState(comp);
            })
          ]))
        ],

        touchmenuBehaviours: Behaviour.derive([
          AdhocBehaviour.config('initial-state')
        ]),

        parts: {
          sink: {
            dom: {
              classes: [ 'tap-button-sink' ]
            }
          },
          view: TapToEditMenuParts.view({ }),
          menu: TapToEditMenuParts.menu({ })
        }
      });
    };

    return {
      sketch: sketch
    };
  }
);
