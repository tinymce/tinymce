define(
  'ephox.alloy.keying.SpecialType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Keys, KeyingType, KeyMatch, KeyRules, FieldSchema, Fun, Option) {
    var schema = [
      FieldSchema.defaulted('onSpace', Option.none),
      FieldSchema.defaulted('onEnter', Option.none),
      FieldSchema.defaulted('onShiftEnter', Option.none),
      FieldSchema.defaulted('onLeft', Option.none),
      FieldSchema.defaulted('onRight', Option.none),
      FieldSchema.defaulted('onUp', Option.none),
      FieldSchema.defaulted('onDown', Option.none),
      FieldSchema.defaulted('onEscape', Option.none),
      FieldSchema.option('focusIn')
    ];
    
    var getRules = function (component, simulatedEvent, executeInfo) {
      return [
        KeyRules.rule( KeyMatch.inSet(Keys.SPACE()), executeInfo.onSpace()),
        KeyRules.rule(
          KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet( Keys.ENTER()) ]), executeInfo.onEnter()
        ),
        KeyRules.rule(
          KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet( Keys.ENTER()) ]), executeInfo.onShiftEnter()
        ),
        KeyRules.rule( KeyMatch.inSet(Keys.UP()), executeInfo.onUp()),
        KeyRules.rule( KeyMatch.inSet(Keys.DOWN()), executeInfo.onDown()),
        KeyRules.rule( KeyMatch.inSet(Keys.LEFT()), executeInfo.onLeft()),
        KeyRules.rule( KeyMatch.inSet(Keys.RIGHT()), executeInfo.onRight()),
        KeyRules.rule( KeyMatch.inSet(Keys.SPACE()), executeInfo.onSpace()),
        KeyRules.rule( KeyMatch.inSet(Keys.ESCAPE()), executeInfo.onEscape())
      ];
    };

    var focusIn = function (component, executeInfo) {
      // menuInfo.focusManager().fold(function () {
      //   SelectorFind.descendant(component.element(), menuInfo.selector()).each(function (first) {
      //     debugger;
      //     component.getSystem().triggerFocus(first, component.element());
      //   });  
      // }, function (manager) {
      //   SelectorFind.descendant(component.element(), menuInfo.selector()).each(function (first) {
      //     // This is bypassing highlight which is accidentally good. Will need to get all of this
      //     // behaviour consistent. The reason it is accidentally good is because when implementing
      //     // the typeahead, I don't want the first preview one to update the input field ... although
      //     // I sort of do.\
      //     manager.set(component, first);
      //   });  
      // });

      
      return executeInfo.focusIn().bind(function (f) {
        return f(component, executeInfo);
      });
    };

    var getEvents = Fun.constant({ });
    var getApis = Fun.constant({ });

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);