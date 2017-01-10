define(
  'ephox.alloy.behaviour.receiving.ActiveReceiving',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.log.AlloyLogger',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj'
  ],

  function (SystemEvents, EventHandler, AlloyLogger, Objects, ValueSchema, Arr, Obj) {
    var chooseChannels = function (channels, message) {
      return message.universal() ? channels : Arr.filter(channels, function (ch) {
        return Arr.contains(message.channels(), ch);
      });
    };

    var events = function (receiveInfo) {
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
    };

    return {
      events: events
    };
  }
);