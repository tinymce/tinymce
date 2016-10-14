define(
  'ephox.alloy.behaviour.Receiving',

  [
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
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (SystemEvents, Behaviour, EventHandler, DomModification, AlloyLogger, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Fun, Result) {
    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var schema = FieldSchema.field(
      'receiving',
      'receiving',
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.field('channels', 'channels', FieldPresence.strict(), ValueSchema.setOf(
          // Allow any keys.
          Result.value,
          ValueSchema.objOf([
            FieldSchema.strict('onReceive'),
            FieldSchema.field('schema', 'schema', FieldPresence.defaulted(ValueSchema.anyValue()), ValueSchema.anyValue())
          ])
        ))
      ])
    );

    var chooseChannels = function (channels, message) {
      return message.universal() ? channels : Arr.filter(channels, function (ch) {
        return Arr.contains(message.channels(), ch);
      });
    };

    var handlers = function (info) {
      return info.receiving().fold(function () {
        return {};
      }, function (receiveInfo) {
        return Objects.wrap(
          SystemEvents.receive(),
          EventHandler.nu({
            run: function (component, message) {
              var channelMap = receiveInfo.channels();
              var channels = Obj.keys(channelMap);

              var targetChannels = chooseChannels(channels, message);
              Arr.each(targetChannels, function (ch) {
                var channelInfo = channelMap[ch]();
                var channelSchema = channelInfo.schema();
                var data = ValueSchema.asStructOrDie(
                  'channel[' + ch + '] data\nReceiver: ' + AlloyLogger.element(component.element()),
                  channelSchema, message.data()
                );
                channelInfo.onReceive()(component, data);
              });
            }
          })
        );
      });
    };

    return Behaviour.contract({
      name: Fun.constant('receiving'),
      exhibit: exhibit,
      handlers: handlers,
      apis: Fun.constant({ }),

      // Additional API
      schema: Fun.constant(schema)

    });
  }
);