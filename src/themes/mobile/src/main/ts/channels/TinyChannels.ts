import { Fun } from '@ephox/katamari';

var formatChanged = 'formatChanged';
var orientationChanged = 'orientationChanged';
var dropupDismissed = 'dropupDismissed';

export default <any> {
  formatChanged: Fun.constant(formatChanged),
  orientationChanged: Fun.constant(orientationChanged),
  dropupDismissed: Fun.constant(dropupDismissed)
};