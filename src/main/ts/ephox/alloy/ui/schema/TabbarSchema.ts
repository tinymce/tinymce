import Highlighting from '../../api/behaviour/Highlighting';
import Keying from '../../api/behaviour/Keying';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import AlloyTriggers from '../../api/events/AlloyTriggers';
import SystemEvents from '../../api/events/SystemEvents';
import TabButton from '../../api/ui/TabButton';
import Fields from '../../data/Fields';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var schema = [
  FieldSchema.strict('tabs'),

  FieldSchema.strict('dom'),

  FieldSchema.defaulted('clickToDismiss', false),
  SketchBehaviours.field('tabbarBehaviours', [ Highlighting, Keying ]),
  Fields.markers([ 'tabClass', 'selectedClass' ])
];


var tabsPart = PartType.group({
  factory: TabButton,
  name: 'tabs',
  unit: 'tab',
  overrides: function (barDetail, tabSpec) {
    var dismissTab = function (tabbar, button) {
      Highlighting.dehighlight(tabbar, button);
      AlloyTriggers.emitWith(tabbar, SystemEvents.dismissTab(), {
        tabbar: tabbar,
        button: button
      });
    };

    var changeTab = function (tabbar, button) {
      Highlighting.highlight(tabbar, button);
      AlloyTriggers.emitWith(tabbar, SystemEvents.changeTab(), {
        tabbar: tabbar,
        button: button
      });
    };

    return {
      action: function (button) {
        var tabbar = button.getSystem().getByUid(barDetail.uid()).getOrDie();
        var activeButton = Highlighting.isHighlighted(tabbar, button);

        var response = (function () {
          if (activeButton && barDetail.clickToDismiss()) return dismissTab;
          else if (! activeButton) return changeTab;
          else return Fun.noop;
        })();

        response(tabbar, button);
      },

      domModification: {
        classes: [ barDetail.markers().tabClass() ]
      }
    };
  }
});

var partTypes = [
  tabsPart
];

export default <any> {
  name: Fun.constant('Tabbar'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};