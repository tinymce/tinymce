import { Fun } from '@ephox/katamari';

const formatChanged = 'formatChanged';
const orientationChanged = 'orientationChanged';
const dropupDismissed = 'dropupDismissed';

export default {
  formatChanged: Fun.constant(formatChanged),
  orientationChanged: Fun.constant(orientationChanged),
  dropupDismissed: Fun.constant(dropupDismissed)
};