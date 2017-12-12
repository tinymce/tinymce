import AlloyEvents from '../../api/events/AlloyEvents';
import SystemEvents from '../../api/events/SystemEvents';
import AlloyLogger from '../../log/AlloyLogger';
import { ValueSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';

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

export default <any> {
  events: events
};