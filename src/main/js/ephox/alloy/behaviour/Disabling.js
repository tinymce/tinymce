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
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Node'
  ],

  function (SystemEvents, Behaviour, EventHandler, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Fun, Attr, Class, Node) {
    var behaviourName = 'disabling';

    var nativeDisabled = [
      'input',
      'button',
      'textarea'
    ];

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        // TODO: Work out when we want to  call this. Only when it is has changed?
        FieldSchema.defaulted('disabled', false),
        FieldSchema.option('disableClass')
      ])
    );

    var hasNative = function (component) {
      return Arr.contains(nativeDisabled, Node.name(component.element()));
    };

    var nativeIsDisabled = function (component) {
      return Attr.has(component.element(), 'disabled');
    };

    var nativeDisable = function (component) {
      Attr.set(component.element(), 'disabled', 'disabled');
    };

    var nativeEnable = function (component) {
      Attr.remove(component.element(), 'disabled');
    };

    var ariaIsDisabled = function (component) {
      return Attr.get(component.element(), 'aria-disabled') === 'true';
    };

    var ariaDisable = function (component) {
      Attr.set(component.element(), 'aria-disabled', 'true');
    };

    var ariaEnable = function (component) {
      Attr.set(component.element(), 'aria-disabled', 'false');
    };

    var doDisable = function (component, disableInfo) {
      disableInfo.disableClass().each(function (disableClass) {
        Class.add(component.element(), disableClass);
      });
      var disable = hasNative(component) ? nativeDisable : ariaDisable;
      disable(component);
    };

    var doEnable = function (component, disableInfo) {
      disableInfo.disableClass().each(function (disableClass) {
        Class.remove(component.element(), disableClass);
      });
      var enable = hasNative(component) ? nativeEnable : ariaEnable;
      enable(component);
    };

    var doIsDisabled = function (component) {
      return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
    };

    var doesExhibit = function (base, disableInfo) {

      return DomModification.nu({
        classes: disableInfo.disabled() ? disableInfo.disableClass().map(Arr.pure).getOr([ ]) : [ ]
      });
    };

    var exhibit = function (info, base) {
      // Does not know the DOM element yet, so make it an event.
      return info.disabling().fold(function () {
        return DomModification.nu({ });
      }, function (disableInfo) {
        return doesExhibit(base, disableInfo);
      });
    };

    var apis = function (info) {
      return Behaviour.activeApis(
        behaviourName,
        info,
        {
          enable: doEnable,
          disable: doDisable,
          isDisabled: doIsDisabled
        },
        {
          isDisabled: doIsDisabled
        }
      );
    };

    var handlers = function (info) {
      var disabling = info.disabling();
      return disabling.fold(function () {
        return { };
      }, function (disableInfo) {
        return Objects.wrapAll([
          {
            key: SystemEvents.execute(),
            value: EventHandler.nu({
              abort: function (component, simulatedEvent) {
                return doIsDisabled(component, disableInfo);
              }
            })
          },
          {
            key: SystemEvents.systemInit(),
            value: EventHandler.nu({
              run: function (component) {
                debugger;
                if (disableInfo.disabled()) doDisable(component, disableInfo);
              }
            })
          }
        ]);
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
