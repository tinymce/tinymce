define(
  'ephox.alloy.behaviour.Toggling',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class'
  ],

  function (SystemEvents, Behaviour, EventHandler, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Fun, Attr, Class) {
    var doesExhibit = function (base, toggleInfo) {
      return DomModification.nu({
        classes: toggleInfo.selected() ? [ toggleInfo.toggleClass() ] : [ ],
        attributes: Objects.wrapAll([
          // INVESTIGATE: If is possible to start with expanded-attribute as well?
          { key: toggleInfo.aria().pressedAttr(), value: toggleInfo.selected() }
        ])
      });
    };

    var exhibit = function (info, base) {
      return info.toggling().fold(function () {
        return DomModification.nu({});
      }, function (toggleInfo) {
        return doesExhibit(base, toggleInfo);
      });
    };

    var updateAriaState = function (component, toggleInfo) {
      var pressed = Class.has(component.element(), toggleInfo.toggleClass());
      Attr.set(component.element(), toggleInfo.aria().pressedAttr(), pressed);
      toggleInfo.aria().expandedAttr().each(function (attr) {
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
        return Objects.wrap(
          SystemEvents.execute(),
          EventHandler.nu({
            run: function (component) {
              doToggle(component, toggleInfo);
            }
          })
        );
      });
    };

    var apis = function (info) {
      return {
        toggle: Behaviour.tryActionOpt('toggling', info, 'toggle', doToggle),
        select: Behaviour.tryActionOpt('toggling', info, 'select', doSelect),
        deselect: Behaviour.tryActionOpt('toggling', info, 'deselect', doDeselect),
        isSelected: Behaviour.tryActionOpt('toggling', info, 'isSelected', doIsSelected)
      };
    };

    var schema = FieldSchema.field(
      'toggling',
      'toggling',
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.defaulted('selected', false),
        FieldSchema.defaulted('toggleClass', 'selected'),
        FieldSchema.field(
          'aria',
          'aria',
          FieldPresence.defaulted({ 'aria-pressed-attr': 'aria-pressed' }),
          ValueSchema.objOf([
            FieldSchema.field('aria-presssed-attr', 'pressedAttr', FieldPresence.defaulted('aria-pressed'), ValueSchema.anyValue()),
            FieldSchema.field('aria-expanded-attr', 'expandedAttr', FieldPresence.asOption(), ValueSchema.anyValue())
          ])
        )
      ])
    );

    return Behaviour.contract({
      name: Fun.constant('toggling'),
      exhibit: exhibit,
      handlers: handlers,
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);