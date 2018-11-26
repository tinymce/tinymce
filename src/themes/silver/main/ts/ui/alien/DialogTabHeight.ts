/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyEvents, Replacing, TabSection } from '@ephox/alloy';
import { SelectorFind, Css, Focus } from '@ephox/sugar';
import { Option, Arr } from '@ephox/katamari';
import { formResizeEvent } from '../general/FormEvents';

const measureHeights = (allTabs, tabview, tabviewComp): number[] => {
  return Arr.map(allTabs, (tab, i) => {
    Replacing.set(tabviewComp, allTabs[i].view());
    const rect = tabview.dom().getBoundingClientRect();
    Replacing.set(tabviewComp, [ ]);
    return rect.height;
  });
};

const getMaxHeight = (heights: number[]) => {
  return Arr.head(Arr.sort(heights, (a, b) => {
    if (a > b) {
      return -1;
    } else if (a < b) {
      return +1;
    } else {
      return 0;
    }
  }));
};

const showTab = (allTabs, comp) => {
  Arr.head(allTabs).each((tab) => TabSection.showTab(comp, tab.value));
};

const setMode = (allTabs) => {
  const smartTabHeight = (() => {
    const extraEvents = [
      AlloyEvents.runOnAttached((comp) => {
        SelectorFind.descendant(comp.element(), '[role="tabpanel"]').each((tabview) => {
          Css.set(tabview, 'visibility', 'hidden');
          // Tab may or may not have a height property
          const optHeight: Option<number> = comp.getSystem().getByDom(tabview).toOption().bind((tabviewComp) => {
            const heights = measureHeights(allTabs, tabview, tabviewComp);
            return getMaxHeight(heights);
          });
          // Set the height of the tallest tab to all tabs
          optHeight.each((height) => {
            Css.set(tabview, 'height', height + 'px');
          });

          Css.remove(tabview, 'visibility');

          showTab(allTabs, comp);
        });
      }),
      AlloyEvents.run(formResizeEvent, (comp, se) => {
        SelectorFind.descendant(comp.element(), '[role="tabpanel"]').each((tabview) => {
          const oldFocus = Focus.active();
          Css.set(tabview, 'visibility', 'hidden');
          const oldHeight = Css.getRaw(tabview, 'height').map((h) => parseInt(h, 10));
          Css.remove(tabview, 'height');
          const newHeight = tabview.dom().getBoundingClientRect().height;
          const hasGrown = oldHeight.forall((h) => newHeight > h);

          if (hasGrown) {
            Css.set(tabview, 'height', `${newHeight}px`);
          } else {
            oldHeight.each((h) => {
              Css.set(tabview, 'height', `${h}px`);
            });
          }

          Css.remove(tabview, 'visibility');
          oldFocus.each(Focus.focus);
        });

      })
    ];

    const selectFirst = false;

    return {
      extraEvents,
      selectFirst
    };
  })();

  // Set tab heights within a dialog to vary according to their contents
  const naiveTabHeight = (() => {
    const extraEvents = [ ];

    const selectFirst = true;

    return {
      extraEvents,
      selectFirst
    };
  })();

  return {
    smartTabHeight,
    naiveTabHeight
  };

};

export {
  setMode
};