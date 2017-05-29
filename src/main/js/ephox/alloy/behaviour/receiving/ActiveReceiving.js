define(
  'ephox.alloy.behaviour.receiving.ActiveReceiving',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.log.AlloyLogger',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj'
  ],

  function (AlloyEvents, SystemEvents, AlloyLogger, ValueSchema, Arr, Obj) {
    var chooseChannels = function (channels, message) {
      return message.universal() ? channels : Arr.filter(channels, function (ch) {
        return Arr.contains(message.channels(), ch);
      });
    };

    var events = function (receiveConfig/*, receiveState */) {
      return AlloyEvents.derive([
        AlloyEvents.run(SystemEvents.receive(), function (component, message) {
          var channelMap = receiveConfig.channels();
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
        })
      ]);
    };

    return {
      events: events
    };
  }
);