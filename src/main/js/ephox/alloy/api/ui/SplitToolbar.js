import Replacing from '../behaviour/Replacing';
import Sliding from '../behaviour/Sliding';
import GuiFactory from '../component/GuiFactory';
import SketchBehaviours from '../component/SketchBehaviours';
import Button from './Button';
import Sketcher from './Sketcher';
import Toolbar from './Toolbar';
import ToolbarGroup from './ToolbarGroup';
import AlloyParts from '../../parts/AlloyParts';
import PartType from '../../parts/PartType';
import Overflows from '../../toolbar/Overflows';
import SplitToolbarSchema from '../../ui/schema/SplitToolbarSchema';
import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

var setStoredGroups = function (bar, storedGroups) {
  var bGroups = Arr.map(storedGroups, function (g) { return GuiFactory.premade(g); });
  Toolbar.setGroups(bar, bGroups);
};

var refresh = function (toolbar, detail, externals) {
  var ps = AlloyParts.getPartsOrDie(toolbar, detail, [ 'primary', 'overflow' ]);
  var primary = ps.primary();
  var overflow = ps.overflow();

  // Set the primary toolbar to have visibilty hidden;
  Css.set(primary.element(), 'visibility', 'hidden');

  // Clear the overflow toolbar
  Toolbar.setGroups(overflow, [ ]);

  // Put all the groups inside the primary toolbar
  var groups = detail.builtGroups().get();

  var overflowGroupSpec = ToolbarGroup.sketch(
    Merger.deepMerge(
      externals['overflow-group'](),
      {
        items: [
          Button.sketch(
            Merger.deepMerge(
              externals['overflow-button'](),
              {
                action: function (button) {
                  // This used to look up the overflow again ... we may need to do that.
                  Sliding.toggleGrow(ps.overflow());
                }
              }
            )
          )
        ]
      }
    )
  );
  var overflowGroup = toolbar.getSystem().build(overflowGroupSpec);

  setStoredGroups(primary, groups.concat([ overflowGroup ]));


  var total = Width.get(primary.element());

  var overflows = Overflows.partition(total, groups, function (comp) {
    return Width.get(comp.element());
  }, overflowGroup);

  if (overflows.extra().length === 0) {
    // Not ideal. Breaking abstraction somewhat, though remove is better than insert
    // Can just reset the toolbar groups also ... but may be a bit slower.
    Replacing.remove(primary, overflowGroup);
    Toolbar.setGroups(overflow, [ ]);
    // Maybe remove the overflow drawer.
  } else {
    setStoredGroups(primary, overflows.within());
    setStoredGroups(overflow, overflows.extra());
    // Maybe add the overflow drawer.
  }

  Css.remove(primary.element(), 'visibility');
  Css.reflow(primary.element());

};


var factory = function (detail, components, spec, externals) {
  var doSetGroups = function (toolbar, groups) {
    var built = Arr.map(groups, toolbar.getSystem().build);
    detail.builtGroups().set(built);
  };

  var setGroups = function (toolbar, groups) {
    doSetGroups(toolbar, groups);
    refresh(toolbar, detail, externals);
  };

  return Merger.deepMerge(
    {
      dom: {
        attributes: {
          role: 'group'
        }
      }
    },
    {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: SketchBehaviours.get(detail.splitToolbarBehaviours()),
      apis: {
        setGroups: setGroups,
        refresh: function (toolbar) {
          refresh(toolbar, detail, externals);
        }
      }
    }
  );
};

export default <any> Sketcher.composite({
  name: 'SplitToolbar',
  configFields: SplitToolbarSchema.schema(),
  partFields: SplitToolbarSchema.parts(),
  factory: factory,
  apis: {
    setGroups: function (apis, toolbar, groups) {
      apis.setGroups(toolbar, groups);
    },
    refresh: function (apis, toolbar) {
      apis.refresh(toolbar);
    }
  }
});