define(
  'ephox.alloy.behaviour.Toggling',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.log.AlloyLogger',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class'
  ],

  function (EventRoot, SystemEvents, Behaviour, EventHandler, DomModification, AlloyLogger, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Fun, Attr, Class) {
     var schema = Behaviour.schema('toggling', [
      FieldSchema.defaulted('selected', false),
      FieldSchema.defaulted('toggleClass', 'selected'),
      FieldSchema.defaulted('toggleOnExecute', true),

      FieldSchema.defaultedObjOf('aria', { }, [
        FieldSchema.defaulted('aria-pressed-attr', 'aria-pressed'),
        // TODO: Do this based on presence of aria-haspopup ?
        FieldSchema.option('aria-expanded-attr')
      ])
    ]);

    var doesExhibit = function (base, toggleInfo) {
      return DomModification.nu({ });
    };

    var exhibit = function (info, base) {
      return info.toggling().fold(function () {
        return DomModification.nu({});
      }, function (toggleInfo) {
        return doesExhibit(base, toggleInfo);
      });
    };

    var pressedAttributes = {
      'menuitemcheckbox': 'aria-checked'
    };

    var getAriaAttribute = function (component, toggleInfo) {
      var role = Attr.get(component.element(), 'role');
      return Objects.readOptFrom(pressedAttributes, role).getOrThunk(toggleInfo.aria()['aria-pressed-attr']);
    };

    var updateAriaState = function (component, toggleInfo) {
      var pressed = Class.has(component.element(), toggleInfo.toggleClass());

      var attr = getAriaAttribute(component, toggleInfo);

      Attr.set(component.element(), attr, pressed);
      toggleInfo.aria()['aria-expanded-attr']().each(function (attr) {
        Attr.set(component.element(), attr, pressed);
      });
    };

    var doToggle = function (component, toggleInfo) {
      Class.toggle(component.element(), toggleInfo.toggleClass());
      updateAriaState(component, toggleInfo);
    };

    var doSelect = function (component, toggleInfo) {
      Class.add(component.element(), toggleInfo.toggleClass());
      updateAriaState(component, toggleInfo);
    };

    var doDeselect = function (component, toggleInfo) {
      Class.remove(component.element(), toggleInfo.toggleClass());
      updateAriaState(component, toggleInfo);
    };

    var doIsSelected = function (component, toggleInfo) {
      return Class.has(component.element(), toggleInfo.toggleClass());
    };

    var handlers = function (info) {
      return info.toggling().fold(function () {
        return { };
      }, function (toggleInfo) {

      //   var role = Attr.get(component.element(), 'role');
      // var attr = Objects.readOptFrom(pressedAttributes, role).getOrThunk(toggleInfo.aria().pressedAttr);
        var execute = {
          key: SystemEvents.execute(),
          value: EventHandler.nu({
            run: function (component) {
              doToggle(component, toggleInfo);
            }
          })
        };

        var load = {
          key: SystemEvents.systemInit(),
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              if (EventRoot.isSource(component, simulatedEvent)) {
                var attr = getAriaAttribute(component, toggleInfo);

                // Only overwrite if it doesn't have a current value.
                if (! Attr.has(component.element(), attr)) {
                  var api = toggleInfo.selected() ? doSelect : doDeselect;
                  api(component, toggleInfo);
                }
              }
            }
          })
        };

        return Objects.wrapAll(
          Arr.flatten([
            toggleInfo.toggleOnExecute() ? [ execute ] : [ ],
            [ load ]
          ])
        );
      });
    };

    var apis = function (info) {
      return Behaviour.activeApis(
        'toggling',
        info,
        {
          toggle: doToggle,
          select: doSelect,
          deselect: doDeselect,
          isSelected: doIsSelected
        }
      );
    };

    return Behaviour.contract({
      name: Fun.constant('toggling'),
      exhibit: exhibit,
      handlers: handlers,
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);