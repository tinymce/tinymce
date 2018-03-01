import { Merger, Option } from '@ephox/katamari';

import * as AlloyParts from '../../parts/AlloyParts';
import * as ToolbarSchema from '../../ui/schema/ToolbarSchema';
import * as Behaviour from '../behaviour/Behaviour';
import Replacing from '../behaviour/Replacing';
import SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';

const factory = function (detail, components, spec, _externals) {
  const setGroups = function (toolbar, groups) {
    getGroupContainer(toolbar).fold(function () {
      // check that the group container existed. It may not have if the components
      // did not list anything, and shell was false.
      console.error('Toolbar was defined to not be a shell, but no groups container was specified in components');
      throw new Error('Toolbar was defined to not be a shell, but no groups container was specified in components');
    }, function (container) {
      Replacing.set(container, groups);
    });
  };

  const getGroupContainer = function (component) {
    return detail.shell() ? Option.some(component) : AlloyParts.getPart(component, detail, 'groups');
  };

  // In shell mode, the group overrides need to be added to the main container, and there can be no children
  const extra = detail.shell() ? { behaviours: [ Replacing.config({ }) ], components: [ ] } :
    { behaviours: [ ], components };

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: extra.components,

    behaviours: Merger.deepMerge(
      Behaviour.derive(extra.behaviours),
      SketchBehaviours.get(detail.toolbarBehaviours())
    ),
    apis: {
      setGroups
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
  factory,
  apis: {
    setGroups (apis, toolbar, groups) {
      apis.setGroups(toolbar, groups);
    }
  }
});