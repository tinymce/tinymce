import { Attr } from '@ephox/sugar';

import * as TabbarSchema from '../../ui/schema/TabbarSchema';
import { TabbarDetail, TabbarSketcher, TabbarSpec } from '../../ui/types/TabbarTypes';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<TabbarDetail, TabbarSpec> = (detail, components, spec, externals) => {
  return {
    'uid': detail.uid,
    'dom': detail.dom,
    'components': components,
    'debug.sketcher': 'Tabbar',

    'domModification': {
      attributes: {
        role: 'tablist'
      }
    },

    'behaviours': SketchBehaviours.augment(
      detail.tabbarBehaviours,
      [
        Highlighting.config({
          highlightClass: detail.markers.selectedClass,
          itemClass: detail.markers.tabClass,

          // https://www.w3.org/TR/2010/WD-wai-aria-practices-20100916/#tabpanel
          // Consider a more seam-less way of combining highlighting and toggling
          onHighlight (tabbar, tab) {
            // TODO: Integrate highlighting and toggling in a nice way
            Attr.set(tab.element(), 'aria-selected', 'true');
          },
          onDehighlight (tabbar, tab) {
            Attr.set(tab.element(), 'aria-selected', 'false');
          }
        }),

        Keying.config({
          mode: 'flow',
          getInitial (tabbar) {
            // Restore focus to the previously highlighted tab.
            return Highlighting.getHighlighted(tabbar).map((tab) => {
              return tab.element();
            });
          },
          selector: '.' + detail.markers.tabClass,
          executeOnMove: true
        })
      ]
    )
  };
};

const Tabbar: TabbarSketcher = Sketcher.composite({
  name: 'Tabbar',
  configFields: TabbarSchema.schema(),
  partFields: TabbarSchema.parts(),
  factory
});

export {
  Tabbar
};
