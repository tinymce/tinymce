import { Future } from '@ephox/katamari';
import { LazyValue } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import DomEvent from '../events/DomEvent';
import { clearTimeout, setTimeout } from '@ephox/dom-globals';

var w = function (fType, element, eventType, timeout) {
  return fType(function (callback) {
    var listener = DomEvent.bind(element, eventType, function (event) {
      clearTimeout(time);
      listener.unbind();
      callback(Result.value(event));
    });

    var time = setTimeout(function () {
      listener.unbind();
      callback(Result.error('Event ' + eventType + ' did not fire within ' + timeout + 'ms'));
    }, timeout);
  });
};

var cWaitFor = function (element, eventType, timeout) {
  return w(LazyValue.nu, element, eventType, timeout);
};

var waitFor = function (element, eventType, timeout) {
  return w(Future.nu, element, eventType, timeout);
};

export default <any> {
  cWaitFor: cWaitFor,
  waitFor: waitFor
};