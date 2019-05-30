import { Event } from '@ephox/porkbun';
import { Events } from '@ephox/porkbun';
import { Css } from '@ephox/sugar';
import { Location } from '@ephox/sugar';

var both = function (element) {
  var mutate = function (x, y) {
    var location = Location.absolute(element);
    Css.setAll(element, {
      left: (location.left() + x) + 'px',
      top: (location.top() + y) + 'px'
    });
    events.trigger.relocate(x, y);
  };

  var events = Events.create({
    'relocate': Event(['x', 'y'])
  });

  return {
    mutate: mutate,
    events: events.registry
  };
};

export default <any> {
  both: both
};