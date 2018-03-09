import { Merger } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

import * as TabbarSchema from '../../ui/schema/TabbarSchema';
import * as Behaviour from '../behaviour/Behaviour';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';

const factory = function (detail, components, spec, externals) {
  return {
    'uid': detail.uid(),
    'dom': Merger.deepMerge(
      {
        tag: 'div',
        attributes: {
          role: 'tablist'
        }
      },
      detail.dom()
    ),
    'components': components,
    'debug.sketcher': 'Tabbar',

    'behaviours': Merger.deepMerge(
      Behaviour.derive([
        Highlighting.config({
          highlightClass: detail.markers().selectedClass(),
          itemClass: detail.markers().tabClass(),

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
            return Highlighting.getHighlighted(tabbar).map(function (tab) {
              return tab.element();
            });
          },
          selector: '.' + detail.markers().tabClass(),
          executeOnMove: true
        })
      ]),
      // Add the permitted fields.
      SketchBehaviours.get(detail.tabbarBehaviours())
    )
  };
};

export default <any> Sketcher.composite({
  name: 'Tabbar',
  configFields: TabbarSchema.schema(),
  partFields: TabbarSchema.parts(),
  factory
});