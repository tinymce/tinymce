import { Arr, Optional } from '@ephox/katamari';
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
const isOfSize = (width: number, height: number): boolean =>
  window.screen.width >= width && window.screen.height >= height;

const choice = <T> (options: ChoiceOption<T>[], fallback: T): T => {
  const target = Arr.foldl(options, (b, option) => b.orThunk(() =>
    option.predicate() ? Optional.some(option.value()) : Optional.none<T>()
  ), Optional.none<T>());

  return target.getOr(fallback);
};

const isLargeTouch = (): boolean =>
  isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && isTouch();

const isLargeDesktop = (): boolean =>
  isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && !isTouch();

const isSmallTouch = (): boolean =>
  !isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT) && isTouch();

const isLarge = (): boolean =>
  isOfSize(MINIMUM_LARGE_WIDTH, MINIMUM_LARGE_HEIGHT);

const isSmallAndroid = (): boolean =>
  isSmallTouch() && isAndroid();

export {
  isTouch,
  choice,
  isLarge,
  isLargeTouch,
  isSmallTouch,
  isLargeDesktop,
  isSmallAndroid
};
