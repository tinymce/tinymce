/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyEvents, Replacing, SystemEvents, TabSection, TabbarTypes } from '@ephox/alloy';
import { Element as DomElement, window } from '@ephox/dom-globals';
import { Arr, Cell, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css, Element, Focus, Height, SelectorFind, Traverse, Width } from '@ephox/sugar';
import Delay from 'tinymce/core/api/util/Delay';
import { formResizeEvent } from '../general/FormEvents';

const measureHeights = (allTabs: Array<Partial<TabbarTypes.TabButtonWithViewSpec>>, tabview, tabviewComp): number[] => {
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

const getMaxTabviewHeight = (dialog: Element, tabview: Element, tablist: Element) => {
  const documentElement = Traverse.documentElement(dialog).dom();
  const rootElm = SelectorFind.ancestor(dialog, '.tox-dialog-wrap').getOr(dialog) as Element<DomElement>;
  const isFixed = Css.get(rootElm, 'position') === 'fixed';

  // Get the document or window/viewport height
  let maxHeight;
  if (isFixed) {
    maxHeight = Math.max(documentElement.clientHeight, window.innerHeight);
  } else {
    maxHeight = Math.max(documentElement.offsetHeight, documentElement.scrollHeight);
  }

  // Determine the current height taken up by the tabview panel
  const tabviewHeight = Height.get(tabview);
  const isTabListBeside = tabview.dom().offsetLeft >= tablist.dom().offsetLeft + Width.get(tablist);
  const currentTabHeight = isTabListBeside ? Math.max(Height.get(tablist), tabviewHeight) : tabviewHeight;

  // Get the dialog height, making sure to account for any margins on the dialog
  const dialogTopMargin = parseInt(Css.get(dialog, 'margin-top'), 10) || 0;
  const dialogBottomMargin = parseInt(Css.get(dialog, 'margin-bottom'), 10) || 0;
  const dialogHeight = Height.get(dialog) + dialogTopMargin + dialogBottomMargin;

  const chromeHeight = dialogHeight - currentTabHeight;
  return maxHeight - chromeHeight;
};

// TODO: add a stronger type for allTabs
const showTab = (allTabs: Array<Partial<TabbarTypes.TabButtonWithViewSpec>>, comp: AlloyComponent) => {
  Arr.head(allTabs).each((tab) => TabSection.showTab(comp, tab.value));
};

const setTabviewHeight = (tabview: Element<DomElement>, height: number) => {
  // Set both height and flex-basis as some browsers don't support flex-basis. However don't set it on
  // IE 11 since it incorrectly includes margins in the flex-basis calculations so it can't be relied on.
  Css.set(tabview, 'height', height + 'px');
  if (!PlatformDetection.detect().browser.isIE()) {
    Css.set(tabview, 'flex-basis', height + 'px');
  } else {
    Css.remove(tabview, 'flex-basis');
  }
};

const updateTabviewHeight = (dialogBody: Element, tabview: Element, maxTabHeight: Cell<Option<number>>) => {
  SelectorFind.ancestor(dialogBody, '[role="dialog"]').each((dialog) => {
    SelectorFind.descendant(dialog, '[role="tablist"]').each((tablist) => {
      maxTabHeight.get().map((height) => {
        // Set the tab view height to 0, so we can calculate the max tabview height, without worrying about overflows
        Css.set(tabview, 'height', '0');
        Css.set(tabview, 'flex-basis', '0');
        return Math.min(height, getMaxTabviewHeight(dialog, tabview, tablist));
      }).each((height) => {
        setTabviewHeight(tabview, height);
      });
    });
  });
};

const getTabview = (dialog: Element<DomElement>) => SelectorFind.descendant(dialog, '[role="tabpanel"]');

const setMode = (allTabs: Array<Partial<TabbarTypes.TabButtonWithViewSpec>>) => {
  const smartTabHeight = (() => {
    const maxTabHeight = Cell<Option<number>>(Option.none());

    const extraEvents = [
      AlloyEvents.runOnAttached((comp) => {
        const dialog = comp.element();
        getTabview(dialog).each((tabview) => {
          Css.set(tabview, 'visibility', 'hidden');

          // Determine the maximum heights of each tab
          comp.getSystem().getByDom(tabview).toOption().each((tabviewComp) => {
            const heights = measureHeights(allTabs, tabview, tabviewComp);

            // Calculate the maximum tab height and store it
            const maxTabHeightOpt = getMaxHeight(heights);
            maxTabHeight.set(maxTabHeightOpt);
          });

          // Set an initial height, based on the current size
          updateTabviewHeight(dialog, tabview, maxTabHeight);

          // Show the tabs
          Css.remove(tabview, 'visibility');
          showTab(allTabs, comp);

          // Use a delay here and recalculate the height, as we need all the components attached
          // to be able to properly calculate the max height
          Delay.requestAnimationFrame(() => {
            updateTabviewHeight(dialog, tabview, maxTabHeight);
          });
        });
      }),
      AlloyEvents.run(SystemEvents.windowResize(), (comp) => {
        const dialog = comp.element();
        getTabview(dialog).each((tabview) => {
          updateTabviewHeight(dialog, tabview, maxTabHeight);
        });
      }),
      AlloyEvents.run(formResizeEvent, (comp, se) => {
        const dialog = comp.element();
        getTabview(dialog).each((tabview) => {
          const oldFocus = Focus.active();
          Css.set(tabview, 'visibility', 'hidden');
          const oldHeight = Css.getRaw(tabview, 'height').map((h) => parseInt(h, 10));
          Css.remove(tabview, 'height');
          Css.remove(tabview, 'flex-basis');
          const newHeight = tabview.dom().getBoundingClientRect().height;
          const hasGrown = oldHeight.forall((h) => newHeight > h);

          if (hasGrown) {
            maxTabHeight.set(Option.from(newHeight));
            updateTabviewHeight(dialog, tabview, maxTabHeight);
          } else {
            oldHeight.each((h) => {
              setTabviewHeight(tabview, h);
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
