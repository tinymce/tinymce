import { console } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';

import * as AlloyParts from '../../parts/AlloyParts';
import * as CustomListSchema from '../../ui/schema/CustomListSchema';
import { CustomListApis, CustomListDetail, CustomListSketcher, CustomListSpec } from '../../ui/types/CustomListTypes';
import { NamedConfiguredBehaviour } from '../behaviour/Behaviour';
import { Replacing } from '../behaviour/Replacing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<CustomListDetail, CustomListSpec> = (detail, components, _spec, _external) => {

  const setItems = (list: AlloyComponent, items: AlloySpec[]) => {
    getListContainer(list).fold(() => {
      // check that the group container existed. It may not have if the components
      // did not list anything, and shell was false.
      // tslint:disable-next-line:no-console
      console.error('Custom List was defined to not be a shell, but no item container was specified in components');
      throw new Error('Custom List was defined to not be a shell, but no item container was specified in components');
    }, (container) => {

      // Get all the children of container, because they will be items.
      // And then use the item setGroup api
      const itemComps = Replacing.contents(container);

      const numListsRequired = items.length;

      const numListsToAdd = numListsRequired - itemComps.length;
      const itemsToAdd = numListsToAdd > 0 ?
        Arr.range(numListsToAdd, () => detail.makeItem()) : [ ];

      const itemsToRemove = itemComps.slice(numListsRequired);

      Arr.each(itemsToRemove, (item) => Replacing.remove(container, item));
      Arr.each(itemsToAdd, (item) => Replacing.append(container, item));

      const builtLists = Replacing.contents(container);

      Arr.each(builtLists, (item, i) => {
        detail.setupItem(list, item, items[i], i);
      });
    });
  };

  // In shell mode, the group overrides need to be added to the main container, and there can be no children
  const extra: {
    behaviours: Array<NamedConfiguredBehaviour<any, any>>;
    components: AlloySpec[];
  } = detail.shell ? { behaviours: [ Replacing.config({ }) ], components: [ ] } : { behaviours: [ ], components };

  const getListContainer = (component: AlloyComponent) => detail.shell ? Option.some(component) : AlloyParts.getPart(component, detail, 'items');

  return {
    uid: detail.uid,
    dom: detail.dom,
    components: extra.components,
    behaviours: SketchBehaviours.augment(
      detail.listBehaviours,
      extra.behaviours
    ),

    apis: {
      setItems
    }
  };
};

const CustomList: CustomListSketcher = Sketcher.composite<CustomListSpec, CustomListDetail, CustomListApis>({
  name: CustomListSchema.name(),
  configFields: CustomListSchema.schema(),
  partFields: CustomListSchema.parts(),
  factory,
  apis: {
    setItems: (apis, list, items) => {
      apis.setItems(list, items);
    }
  }
});

export {
  CustomList
};
