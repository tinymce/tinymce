import * as Behaviour from '../behaviour/Behaviour';
import { Replacing } from '../behaviour/Replacing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { Merger } from '@ephox/katamari';
import { TabviewSketcher, TabviewDetail } from '../../ui/types/TabviewTypes';
import { SingleSketchFactory } from 'ephox/alloy/api/ui/UiSketcher';

const factory: SingleSketchFactory<TabviewDetail> = function (detail, spec) {
  return {
    uid: detail.uid(),
    dom: Merger.deepMerge(
      {
        tag: 'div',
        attributes: {
          role: 'tabpanel'
        }
      },
      detail.dom()
    ),

    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Replacing.config({ })
      ]),
      SketchBehaviours.get(detail.tabviewBehaviours())
    )
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