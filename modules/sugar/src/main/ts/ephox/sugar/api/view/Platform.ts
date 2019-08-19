import { window } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

interface ChoiceOption<T> {
  predicate: () => boolean;
  value: () => T;
}

const platform = PlatformDetection.detect();
const isTouch: () => boolean = platform.deviceType.isTouch;
const isAndroid: () => boolean = platform.deviceType.isAndroid;

// TODO: Work out what these values are supposed to be.
const MINIMUM_LARGE_WIDTH = 620;
const MINIMUM_LARGE_HEIGHT = 700;

// window.screen.width and window.screen.height do not change with the orientation,
// however window.screen.availableWidth and window.screen.availableHeight,
// do change according to the orientation.
const isOfSize = function (width: number, height: number) {
  return window.screen.width >= width && window.screen.height >= height;
};

const choice = function <T>(options: ChoiceOption<T>[], fallback: T): T {
  const target = Arr.foldl(options, function (b, option) {
    return b.orThunk(function () {
      return option.predicate() ? Option.some(option.value()) : Option.none<T>();
    });
  }, Option.none<T>());

  return target.getOr(fallback);
};

const isLargeTouch = function () {
  return isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && isTouch();
};

const isLargeDesktop = function () {
  return isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && !isTouch();
};

const isSmallTouch = function () {
  return !isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && isTouch();
};

const isLarge = function () {
  return isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT);
};

const isSmallAndroid = function () {
  return isSmallTouch() && isAndroid();
};

export { isTouch, choice, isLarge, isLargeTouch, isSmallTouch, isLargeDesktop, isSmallAndroid, };
