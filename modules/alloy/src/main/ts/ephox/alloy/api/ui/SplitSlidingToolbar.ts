import * as AlloyParts from '../../parts/AlloyParts';
import * as SplitToolbarUtils from '../../toolbar/SplitToolbarUtils';
import * as SplitToolbarBase from '../../ui/common/SplitToolbarBase';
import * as SplitSlidingToolbarSchema from '../../ui/schema/SplitSlidingToolbarSchema';
import { SplitSlidingToolbarDetail, SplitSlidingToolbarSketcher, SplitSlidingToolbarSpec } from '../../ui/types/SplitSlidingToolbarTypes';
import { Sliding } from '../behaviour/Sliding';
import { AlloyComponent } from '../component/ComponentApi';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const toggleToolbar = (toolbar: AlloyComponent, detail: SplitSlidingToolbarDetail) => {
  AlloyParts.getPart(toolbar, detail, 'overflow').each((overf) => {
    refresh(toolbar, detail);
    Sliding.toggleGrow(overf);
  });
};

const isOpen = (overf: AlloyComponent) => Sliding.hasGrown(overf);

const refresh = (toolbar: AlloyComponent, detail: SplitSlidingToolbarDetail) => {
  const overflow = AlloyParts.getPart(toolbar, detail, 'overflow');
  SplitToolbarUtils.refresh(toolbar, detail, overflow, isOpen);
  overflow.each(Sliding.refresh);
};

const factory: CompositeSketchFactory<SplitSlidingToolbarDetail, SplitSlidingToolbarSpec> = (detail, components, spec, externals) => {
  return SplitToolbarBase.spec(detail, components, spec, externals, {
    refresh,
    toggleToolbar,
    getOverflow: (toolbar) => AlloyParts.getPart(toolbar, detail, 'overflow'),
    coupling: {}
  });
};

const SplitSlidingToolbar = Sketcher.composite({
  name: 'SplitSlidingToolbar',
  configFields: SplitSlidingToolbarSchema.schema(),
  partFields: SplitSlidingToolbarSchema.parts(),
  factory,
  apis: {
    setGroups(apis, toolbar, groups) {
      apis.setGroups(toolbar, groups);
    },
    refresh(apis, toolbar) {
      apis.refresh(toolbar);
    },
    getMoreButton(apis, toolbar) {
      return apis.getMoreButton(toolbar);
    },
    getOverflow(apis, toolbar) {
      return apis.getOverflow(toolbar);
    },
    toggle(apis, toolbar) {
      apis.toggle(toolbar);
    }
  }
}) as SplitSlidingToolbarSketcher;

export {
  SplitSlidingToolbar
};
