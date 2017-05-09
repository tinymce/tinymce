define(
  'tinymce.themes.mobile.touch.view.TapToEditButton',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Transitioning',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.TouchMenu',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Future',
    'global!setTimeout',
    'tinymce.themes.mobile.touch.view.TapToEditMenuParts'
  ],

  function (Behaviour, Representing, Toggling, Transitioning, SystemEvents, TouchMenu, Objects, Future, setTimeout, TapToEditMenuParts) {
    var sketch = function (spec) {
      var gotoView = function (comp) {
        if (Representing.getValue(comp) === false) {
          Representing.setValue(comp, true);
          spec.onView();
        }
      };

      var gotoEdit = function (comp) {
        if (Representing.getValue(comp) === false) {
          Representing.setValue(comp, true);
          spec.onEdit();
        }
      };

      return TouchMenu.sketch({
        dom: spec.dom,
        components: [
          TouchMenu.parts().sink()
        ].concat(spec.components),
   
        fetch: function () {
          return Future.pure([
            { type: 'item', data: { value: 'edit', text: 'Edit' } }
          ]);
        },
        onExecute: function (comp, menuComp, item, data) {
          Transitioning.jumpTo(comp, data.value);
          // updateState(comp, data.value);
        },

        onHoverOn: function (comp) {
          Transitioning.jumpTo(comp, 'view');
          var icon = spec.memIcon.get(comp);
          Toggling.on(icon);
        },
        onHoverOff: function (comp) {
          Transitioning.jumpTo(comp, 'icon');
          var icon = spec.memIcon.get(comp);
          Toggling.off(icon);
        },

        onTap: function (comp) {
          Transitioning.jumpTo(comp, 'view');
          setTimeout(function () {
            gotoView(comp);
          }, 300);
        },

        toggleClass: 'selected',

        menuTransition: {
          property: 'transform',
          transitionClass: 'longpress-menu-transitioning'
        },

        onClosed: function (comp) {
          Transitioning.getState(comp).each(function (mode) {
            if (mode === 'edit') gotoEdit(comp);
            else if (mode === 'view') gotoView(comp);
          });
        },

        touchmenuBehaviours: Behaviour.derive([
          Transitioning.config({
            destinationAttr: 'data-mode-destination',
            stateAttr: 'data-mode',
            initialState: 'icon',
            routes: Transitioning.createTristate('icon', 'view', 'edit', { })
          }),
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: false
            },
            resetOnDom: true
          })
        ]),

        eventOrder: Objects.wrapAll([
          {
            key: SystemEvents.attachedToDom(),
            value: [ Representing.name(), Transitioning.name() ]
          }
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
