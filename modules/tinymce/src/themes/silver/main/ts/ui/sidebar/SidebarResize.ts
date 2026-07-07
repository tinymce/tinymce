import { AlloyEvents, type Behaviour } from '@ephox/alloy';
import { Arr, Singleton } from '@ephox/katamari';
import { Class, Css, type SugarElement, Width } from '@ephox/sugar';

import { SimpleBehaviours } from '../alien/SimpleBehaviours';
import { numToPx } from '../sizing/Utils';

export const requestedWidthProperty = '--tox-private-requested-sidebar-width';
export const minEditingAreaWidthProperty = '--tox-private-min-editing-area-width';
export const minEditingAreaWidth = 280;
// The compact breakpoint is defined as a total editor width of 1024px. However, we measure
// against `.tox-sidebar-wrapper`, whose width excludes the editor's border (2px on each side,
// 4px total). We subtract that border width here so the breakpoint still triggers at an overall
// editor width of 1024px.
const editorBorderWidth = 4;
export const compactBreakpoint = 1024 - editorBorderWidth;
export const compactClass = 'tox-sidebar-wrap--compact';

export const applyWidth = (sidebar: SugarElement<HTMLElement>, width: number): void => {
  Css.set(sidebar, requestedWidthProperty, numToPx(width));
};

export const setupCompactObserver = (): Behaviour.AlloyBehaviourRecord => {
  const observerSingleton = Singleton.value<ResizeObserver>();
  return SimpleBehaviours.unnamedEvents([
    AlloyEvents.runOnAttached((comp) => {
      const update = (width: number) => {
        const shouldBeCompact = width <= compactBreakpoint;
        if (shouldBeCompact && !Class.has(comp.element, compactClass)) {
          Class.add(comp.element, compactClass);
        } else if (!shouldBeCompact && Class.has(comp.element, compactClass)) {
          Class.remove(comp.element, compactClass);
        }
      };
      const observer = new window.ResizeObserver((entries) => {
        Arr.each(entries, (entry) => {
          update(entry.borderBoxSize[0].inlineSize);
        });
      });
      observer.observe(comp.element.dom);
      observerSingleton.set(observer);

      update(Width.get(comp.element));
    }),
    AlloyEvents.runOnDetached(() => {
      observerSingleton.on((observer) => observer.disconnect());
      observerSingleton.clear();
    })
  ]);
};
