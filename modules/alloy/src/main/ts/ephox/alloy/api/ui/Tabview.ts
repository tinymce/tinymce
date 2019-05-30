import * as Behaviour from '../behaviour/Behaviour';
import { Replacing } from '../behaviour/Replacing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { Merger } from '@ephox/katamari';
import { TabviewSketcher, TabviewDetail, TabviewSpec } from '../../ui/types/TabviewTypes';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';

const factory: SingleSketchFactory<TabviewDetail, TabviewSpec> = (detail, spec) => {
  return {
    uid: detail.uid,
    dom: detail.dom,
    behaviours: SketchBehaviours.augment(
      detail.tabviewBehaviours,
      [
        Replacing.config({ })
      ]
    ),

    domModification: {
      attributes: { role: 'tabpanel' }
    }
  };
};

const Tabview = Sketcher.single({
  name: 'Tabview',
  configFields: [
    SketchBehaviours.field('tabviewBehaviours', [ Replacing ])
  ],
  factory
}) as TabviewSketcher;

export {
  Tabview
};