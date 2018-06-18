import { Merger, Option } from '@ephox/katamari';
import { AlloySpec } from '../../api/component/SpecTypes';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ToolbarSchema from '../../ui/schema/ToolbarSchema';
import * as Behaviour from '../behaviour/Behaviour';
import { Replacing } from '../behaviour/Replacing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { composite, CompositeSketch } from './Sketcher';
import { console } from '@ephox/dom-globals';

export interface ToolbarSketch extends CompositeSketch {
  setGroups: (toolbar: AlloyComponent, groups: AlloySpec []) => void;
}

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

const Toolbar = composite({
  name: 'Toolbar',
  configFields: ToolbarSchema.schema(),
  partFields: ToolbarSchema.parts(),
  factory,
  apis: {
    setGroups (apis, toolbar, groups) {
      apis.setGroups(toolbar, groups);
    }
  }
}) as ToolbarSketch;

export {
  Toolbar
};