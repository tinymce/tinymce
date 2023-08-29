import { Fun, Optional } from '@ephox/katamari';

import * as AlloyParts from '../../parts/AlloyParts';
import * as ToolbarSchema from '../../ui/schema/ToolbarSchema';
import { ToolbarApis, ToolbarDetail, ToolbarSketcher, ToolbarSpec } from '../../ui/types/ToolbarTypes';
import { NamedConfiguredBehaviour } from '../behaviour/Behaviour';
import { Replacing } from '../behaviour/Replacing';
import { AlloyComponent } from '../component/ComponentApi';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { AlloySpec } from '../component/SpecTypes';
import { composite } from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<ToolbarDetail, ToolbarSpec> = (detail, components, _spec, _externals) => {
  const setGroups = (toolbar: AlloyComponent, groups: AlloySpec[]) => {
    getGroupContainer(toolbar).fold(() => {
      // check that the group container existed. It may not have if the components
      // did not list anything, and shell was false.
      // eslint-disable-next-line no-console
      console.error('Toolbar was defined to not be a shell, but no groups container was specified in components');
      throw new Error('Toolbar was defined to not be a shell, but no groups container was specified in components');
    }, (container) => {
      Replacing.set(container, groups);
    });
  };

  const getGroupContainer = (component: AlloyComponent) => detail.shell ? Optional.some(component) : AlloyParts.getPart(component, detail, 'groups');

  // In shell mode, the group overrides need to be added to the main container, and there can be no children
  const extra: {
    behaviours: Array<NamedConfiguredBehaviour<any, any>>;
    components: AlloySpec[];
  } = detail.shell ? { behaviours: [ Replacing.config({ }) ], components: [ ] } : { behaviours: [ ], components };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components: extra.components,

    behaviours: SketchBehaviours.augment(
      detail.toolbarBehaviours,
      extra.behaviours
    ),
    apis: {
      setGroups,
      refresh: Fun.noop
    },
    domModification: {
      attributes: {
        role: 'group'
      }
    }
  };
};

const Toolbar: ToolbarSketcher = composite<ToolbarSpec, ToolbarDetail, ToolbarApis>({
  name: 'Toolbar',
  configFields: ToolbarSchema.schema(),
  partFields: ToolbarSchema.parts(),
  factory,
  apis: {
    setGroups: (apis, toolbar, groups) => {
      apis.setGroups(toolbar, groups);
    }
  }
});

export {
  Toolbar
};
