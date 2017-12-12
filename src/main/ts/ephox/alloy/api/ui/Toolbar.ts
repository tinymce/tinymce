import Behaviour from '../behaviour/Behaviour';
import Replacing from '../behaviour/Replacing';
import SketchBehaviours from '../component/SketchBehaviours';
import Sketcher from './Sketcher';
import AlloyParts from '../../parts/AlloyParts';
import ToolbarSchema from '../../ui/schema/ToolbarSchema';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var factory = function (detail, components, spec, _externals) {
  var setGroups = function (toolbar, groups) {
    getGroupContainer(toolbar).fold(function () {
      // check that the group container existed. It may not have if the components
      // did not list anything, and shell was false.
      console.error('Toolbar was defined to not be a shell, but no groups container was specified in components');
      throw new Error('Toolbar was defined to not be a shell, but no groups container was specified in components');
    }, function (container) {
      Replacing.set(container, groups);
    });
  };

  var getGroupContainer = function (component) {
    return detail.shell() ? Option.some(component) : AlloyParts.getPart(component, detail, 'groups');
  };

  // In shell mode, the group overrides need to be added to the main container, and there can be no children
  var extra = detail.shell() ? { behaviours: [ Replacing.config({ }) ], components: [ ] } :
    { behaviours: [ ], components: components };

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: extra.components,

    behaviours: Merger.deepMerge(
      Behaviour.derive(extra.behaviours),
      SketchBehaviours.get(detail.toolbarBehaviours())
    ),
    apis: {
      setGroups: setGroups
    },
    domModification: {
      attributes: {
        role: 'group'
      }
    }
  };
};

export default <any> Sketcher.composite({
  name: 'Toolbar',
  configFields: ToolbarSchema.schema(),
  partFields: ToolbarSchema.parts(),
  factory: factory,
  apis: {
    setGroups: function (apis, toolbar, groups) {
      apis.setGroups(toolbar, groups);
    }
  }
});