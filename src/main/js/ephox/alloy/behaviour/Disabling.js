define(
  'ephox.alloy.behaviour.Disabling',

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
    var behaviourName = 'disabling';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        // TODO: Work out when we want to  call this. Only when it is has changed?
        FieldSchema.defaulted('disabled', false),
        FieldSchema.strict('disableClass'),
        FieldSchema.field(
          'aria',
          'aria',
          FieldPresence.strict(),
          ValueSchema.objOf([
            FieldSchema.defaulted('disableAttr', 'aria-disabled')
          ])
        )
      ])
    );

    var updateAriaState = function (component, disableInfo) {
      var disabled = doIsDisabled(component, disableInfo);
      Attr.set(
        component.element(),
        disableInfo.aria().disableAttr(),
        disabled
      );
    };

    var doEnable = function (component, disableInfo) {
      Class.remove(component.element(), disableInfo.disableClass());
      updateAriaState(component, disableInfo);
    };

    var doDisable = function (component, disableInfo) {
      Class.add(component.element(), disableInfo.disableClass());
      updateAriaState(component, disableInfo);
    };

    var doIsDisabled = function (component, disableInfo) {
      return Class.has(component.element(), disableInfo.disableClass());
    };

    var doesExhibit = function (base, disableInfo) {
      return DomModification.nu({
        classes: disableInfo.disabled() ? [ disableInfo.disableClass() ] : [ ],
        attributes: Objects.wrapAll([
          { key: disableInfo.aria().disableAttr(), value: disableInfo.disabled() }
        ])
      });
    };

    var exhibit = function (info, base) {
      return info.disabling().fold(function () {
        return DomModification.nu({ });
      }, function (disableInfo) {
        return doesExhibit(base, disableInfo);
      });
    };

    var apis = function (info) {
      return {
        enable: Behaviour.tryActionOpt(behaviourName, info, 'enable', doEnable),
        disable: Behaviour.tryActionOpt(behaviourName, info, 'disable', doDisable),
        // TODO: Find a way to stop other apis building on things that return.
        isDisabled: Behaviour.tryActionOpt(behaviourName, info, 'isDisabled', doIsDisabled)
      };
    };

    var handlers = function (info) {
      var disabling = info.disabling();
      return disabling.fold(function () {
        return { };
      }, function (disableInfo) {
        return Objects.wrap(
          SystemEvents.execute(),
          EventHandler.nu({
            abort: function (component, simulatedEvent) {
              return component.apis().isDisabled();
            }
          })
        );
      });
    };

    return Behaviour.contract({
      name: Fun.constant(behaviourName),
      exhibit: exhibit,
      handlers: handlers,
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);
