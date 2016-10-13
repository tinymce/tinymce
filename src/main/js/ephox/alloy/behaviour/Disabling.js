define(
  'ephox.alloy.behaviour.Disabling',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var behaviourName = 'disabling';

    var schema = FieldSchema.field(
      'focusing',
      'focusing',
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
            FieldSchema.defaulted('ariaDisabledAttr', 'aria-disabled')
          ])
        )
      ])
    );

    var doFocus = function (component, focusInfo) {
      // Focus.focus(component.element());
      // focusInfo.onFocus()(component);

    };

    // var exhibit = function (info, base) {
    //   if (info.focusing().isNone()) return DomModification.nu({});
    //   return DomModification.nu({
    //     attributes: {
    //       'tabindex': '-1'
    //     }
    //   });
    // };

    // var apis = function (info) {
    //   return {
    //     focus: Behaviour.tryActionOpt(behaviourName, info, 'focus', doFocus),
    //     blur: Behaviour.tryActionOpt(behaviourName, info, 'blur', doBlur),
    //     // Should be supported either way.
    //     isFocused: doIsFocused
    //   };
    // };

    // var handlers = function (info) {
    //   var focusing = info.focusing();
    //   return focusing.fold(function () {
    //     return { };
    //   }, function (focusInfo) {
    //     return Objects.wrap(
    //       SystemEvents.focus(),
    //       EventHandler.nu({
    //         run: function (component, simulatedEvent) {
    //           doFocus(component, focusInfo);
    //         }
    //       })
    //     );
    //   });
    // };

    return Behaviour.contract({
      name: Fun.constant(behaviourName),
      exhibit: exhibit,
      handlers: handlers,
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);

/*
var doDisable = function (labby, disableInfo) {
      Class.add(labby.element(), disableInfo.disableClass());
      updateAriaState(labby, disableInfo);
    };

    var doEnable = function (labby, disableInfo) {
      Class.remove(labby.element(), disableInfo.disableClass());
      updateAriaState(labby, disableInfo);
    };

    var doIsDisabled = function (labby, disableInfo) {
      return Class.has(labby.element(), disableInfo.disableClass());
    };

    var updateAriaState = function (labby, disableInfo) {
      var disabled = doIsDisabled(labby, disableInfo);
      Attr.set(
        labby.element(),
        disableInfo.aria().disableAttr(),
        disabled
      );
    };

    var doesExhibit = function (base, disableInfo) {
      return DomDefinition.modification({
        classes: disableInfo.disabled() ? [ disableInfo.disableClass() ] : [ ],
        attributes: Objects.wrapAll([
          { key: disableInfo.aria().disableAttr(), value: disableInfo.disabled() }
        ])
      });
    };

    var exhibit = function (info, base) {
      return info.disabling().fold(function () {
        return DomDefinition.modification({ });
      }, function (disableInfo) {
        return doesExhibit(base, disableInfo);
      });
    };

    var prop = Prop.asOptionGroup('disabling', 'disabling', [
      Prop.withDefault('disabled', 'disabled', false),
      Prop.strict('disableClass', 'disableClass'),
      Prop.asStrictGroup('aria', 'aria', [
        Prop.withDefault('aria-disabled-attr', 'disableAttr', 'aria-disabled')
      ])
    ], {});

    var apis = function (info) {
      return {
        enable: Behaviour.tryActionOpt('disabling', info, 'enable', doEnable),
        disable: Behaviour.tryActionOpt('disabling', info, 'disable', doDisable),
        isDisabled: info.disabling().isSome() ? Behaviour.tryActionOpt('disabling', info, 'isDisabled', doIsDisabled) : Fun.constant(false)
      };
    };

    var handlers = function (info) {
      return {
        'lab.execute': {
          abort: function (labby) {
            return labby.apis().isDisabled(labby);
          },
          label: 'disabling.execute'
        }
      };
    };

    return Behaviour.contract({
      name: Fun.constant('disabling'),
      exhibit: exhibit,
      apis: apis,
      handlers: handlers,
      prop: Fun.constant(prop)
    });
    */