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
const isOfSize = (width: number, height: number) => window.screen.width >= width && window.screen.height >= height;

const choice = <T> (options: ChoiceOption<T>[], fallback: T): T => {
  const target = Arr.foldl(options, (b, option) => b.orThunk(() =>
    option.predicate() ? Option.some(option.value()) : Option.none<T>()
  ), Option.none<T>());

  return target.getOr(fallback);
};

const isLargeTouch = () => isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && isTouch();

const isLargeDesktop = () => isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && !isTouch();

const isSmallTouch = () => !isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && isTouch();

const isLarge = () => isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT);

const isSmallAndroid = () => isSmallTouch() && isAndroid();

export { isTouch, choice, isLarge, isLargeTouch, isSmallTouch, isLargeDesktop, isSmallAndroid };
