/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyEvents, Replacing, SystemEvents, TabSection } from '@ephox/alloy';
import { document, window } from '@ephox/dom-globals';
import { Arr, Cell, Option } from '@ephox/katamari';
import { Css, Element, Focus, SelectorFind } from '@ephox/sugar';
import Delay from 'tinymce/core/api/util/Delay';
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

const getMaxTabviewHeight = (dialog: Element, dialogBody: Element) => {
  const rootElm = SelectorFind.ancestor(dialog, '.tox-dialog-wrap').getOr(dialog);
  const isFixed = Css.get(rootElm, 'position') === 'fixed';
  // Get the document or window/viewport height
  let maxHeight;
  if (isFixed) {
    maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  } else {
    maxHeight = Math.max(document.documentElement.offsetHeight, document.documentElement.scrollHeight);
  }
  // Determine the max dialog body height
  const dialogChrome = dialog.dom().getBoundingClientRect().height - dialogBody.dom().getBoundingClientRect().height;
  return maxHeight - dialogChrome;
};

const showTab = (allTabs, comp: AlloyComponent) => {
  Arr.head(allTabs).each((tab) => TabSection.showTab(comp, tab.value));
};

const updateTabviewHeight = (dialogBody: Element, tabview: Element, maxTabHeight: Cell<Option<number>>) => {
  SelectorFind.ancestor(dialogBody, '[role="dialog"]').each((dialog) => {
    maxTabHeight.get().map((height) => {
      // Set the tab view height to 0, so we can calculate the max tabview height, without worrying about overflows
      Css.set(tabview, 'height', '0');
      return Math.min(height, getMaxTabviewHeight(dialog, dialogBody));
    }).each((height) => {
      Css.set(tabview, 'height', height + 'px');
    });
  });
};

const setMode = (allTabs) => {
  const smartTabHeight = (() => {
    const maxTabHeight = Cell<Option<number>>(Option.none());

    const extraEvents = [
      AlloyEvents.runOnAttached((comp) => {
        SelectorFind.descendant(comp.element(), '[role="tabpanel"]').each((tabview) => {
          Css.set(tabview, 'visibility', 'hidden');

          // Determine the maximum heights of each tab
          comp.getSystem().getByDom(tabview).toOption().each((tabviewComp) => {
            const heights = measureHeights(allTabs, tabview, tabviewComp);

            // Calculate the maximum tab height and store it
            const maxTabHeightOpt = getMaxHeight(heights);
            maxTabHeight.set(maxTabHeightOpt);
          });

          // Set an initial height, based on the current size
          updateTabviewHeight(comp.element(), tabview, maxTabHeight);

          // Show the tabs
          Css.remove(tabview, 'visibility');
          showTab(allTabs, comp);

          // Use a delay here and recalculate the height, as we need all the components attached
          // to be able to properly calculate the max height
          Delay.requestAnimationFrame(() => {
            updateTabviewHeight(comp.element(), tabview, maxTabHeight);
          });
        });
      }),
      AlloyEvents.run(SystemEvents.windowResize(), (comp) => {
        SelectorFind.descendant(comp.element(), '[role="tabpanel"]').each((tabview) => {
          updateTabviewHeight(comp.element(), tabview, maxTabHeight);
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
            maxTabHeight.set(Option.from(newHeight));
            updateTabviewHeight(comp.element(), tabview, maxTabHeight);
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