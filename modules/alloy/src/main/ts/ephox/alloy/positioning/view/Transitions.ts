import { Arr, Obj, Optional, Optionals, Singleton, Strings, Type } from '@ephox/katamari';
import { Attribute, Classes, Compare, Css, DomEvent, EventArgs, SugarElement } from '@ephox/sugar';

import * as NativeEvents from '../../api/events/NativeEvents';
import { PlacerResult } from '../layout/LayoutTypes';
import * as Origins from '../layout/Origins';
import { PositionCss } from './PositionCss';
import { RepositionDecision } from './Reposition';

export type TransitionProp = 'top' | 'left' | 'bottom' | 'right';
export type TransitionMode = 'all' | 'layout' | 'placement';

export interface Transition {
  readonly classes: string[];
  readonly mode: TransitionMode;
}

const properties: TransitionProp[] = [ 'top', 'bottom', 'right', 'left' ];
const timerAttr = 'data-alloy-transition-timer';

const isTransitioning = (element: SugarElement<HTMLElement>, transition: Transition): boolean =>
  Classes.hasAll(element, transition.classes);

const shouldApplyTransitionCss = (transition: Transition, decision: RepositionDecision, lastPlacement: Optional<PlacerResult>): boolean => {
  // Don't apply transitions if there was no previous placement as it's transitioning from offscreen
  return lastPlacement.exists((placer) => {
    const mode = transition.mode;
    return mode === 'all' ? true : placer[mode] !== decision[mode];
  });
};

const hasChanges = (position: PositionCss, intermediate: Record<TransitionProp, Optional<string>>): boolean => {
  // Round to 3 decimal points
  const round = (value: string) => parseFloat(value).toFixed(3);

  return Obj.find(intermediate, (value, key) => {
    const newValue = position[key as TransitionProp].map(round);
    const val = value.map(round);
    return !Optionals.equals(newValue, val);
  }).isSome();
};

const getTransitionDuration = (element: SugarElement<HTMLElement>): number => {
  const get = (name: string) => {
    const style = Css.get(element, name);
    const times = style.split(/\s*,\s*/);
    return Arr.filter(times, Strings.isNotEmpty);
  };

  const parse = (value: string | undefined) => {
    if (Type.isString(value) && /^[\d.]+/.test(value)) {
      const num = parseFloat(value);
      return Strings.endsWith(value, 'ms') ? num : num * 1000;
    } else {
      return 0;
    }
  };

  const delay = get('transition-delay');
  const duration = get('transition-duration');
  return Arr.foldl(duration, (acc, dur, i) => {
    const time = parse(delay[i]) + parse(dur);
    return Math.max(acc, time);
  }, 0);
};

const setupTransitionListeners = (element: SugarElement<HTMLElement>, transition: Transition): void => {
  const transitionEnd = Singleton.unbindable();
  const transitionCancel = Singleton.unbindable();
  let timer: number;

  const isSourceTransition = (e: EventArgs<TransitionEvent>) => {
    // Ensure the transition event isn't from a pseudo element
    const pseudoElement = e.raw.pseudoElement ?? '';
    return Compare.eq(e.target, element) && Strings.isEmpty(pseudoElement) && Arr.contains(properties, e.raw.propertyName);
  };

  const transitionDone = (e?: EventArgs<TransitionEvent>) => {
    if (Type.isNullable(e) || isSourceTransition(e)) {
      transitionEnd.clear();
      transitionCancel.clear();

      // Only cleanup the class/timer on transitionend not on a cancel. This is done as cancel
      // means the element has been repositioned and would need to keep transitioning
      const type = e?.raw.type;
      if (Type.isNullable(type) || type === NativeEvents.transitionend()) {
        clearTimeout(timer);
        Attribute.remove(element, timerAttr);
        Classes.remove(element, transition.classes);
      }
    }
  };

  const transitionStart = DomEvent.bind(element, NativeEvents.transitionstart(), (e) => {
    if (isSourceTransition(e)) {
      transitionStart.unbind();

      transitionEnd.set(DomEvent.bind(element, NativeEvents.transitionend(), transitionDone));
      transitionCancel.set(DomEvent.bind(element, NativeEvents.transitioncancel(), transitionDone));
    }
  });

  // Request the next animation frame so we can roughly determine when the transition starts and then ensure
  // the transition is cleaned up. In addition add ~17ms to the delay as that's about about 1 frame at 60fps
  const duration = getTransitionDuration(element);
  requestAnimationFrame(() => {
    timer = setTimeout(transitionDone, duration + 17);
    Attribute.set(element, timerAttr, timer);
  });
};

const startTransitioning = (element: SugarElement<HTMLElement>, transition: Transition): void => {
  Classes.add(element, transition.classes);
  // Clear any existing cleanup timers
  Attribute.getOpt(element, timerAttr).each((timerId) => {
    clearTimeout(parseInt(timerId, 10));
    Attribute.remove(element, timerAttr);
  });
  setupTransitionListeners(element, transition);
};

const applyTransitionCss = (
  element: SugarElement<HTMLElement>,
  origin: Origins.OriginAdt,
  position: PositionCss,
  transition: Transition,
  decision: RepositionDecision,
  lastPlacement: Optional<PlacerResult>
): void => {
  const shouldTransition = shouldApplyTransitionCss(transition, decision, lastPlacement);
  if (shouldTransition || isTransitioning(element, transition)) {
    // Set the new position first so we can calculate the computed position
    Css.set(element, 'position', position.position);

    // Get the computed positions for the current element based on the new position CSS being applied
    const rect = Origins.toBox(origin, element);
    const intermediatePosition = Origins.reposition(origin, { ...decision, rect });
    const intermediateCssOptions = Arr.mapToObject(properties, (prop) => intermediatePosition[prop]);

    // Apply the intermediate styles and transition classes if something has changed
    if (hasChanges(position, intermediateCssOptions)) {
      Css.setOptions(element, intermediateCssOptions);
      if (shouldTransition) {
        startTransitioning(element, transition);
      }
      Css.reflow(element);
    }
  } else {
    Classes.remove(element, transition.classes);
  }
};

export {
  getTransitionDuration,
  applyTransitionCss
};
