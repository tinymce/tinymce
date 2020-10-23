import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Id } from '@ephox/katamari';

import { events } from '../../ui/common/ButtonBase';
import { TabButtonDetail, TabButtonSketcher, TabButtonSpec } from '../../ui/types/TabButtonTypes';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { SingleSketchFactory } from './UiSketcher';

const factory: SingleSketchFactory<TabButtonDetail, TabButtonSpec> = (detail, _spec) => ({
  uid: detail.uid,
  dom: detail.dom,
  components: detail.components,
  events: events(detail.action),
  behaviours: SketchBehaviours.augment(
    detail.tabButtonBehaviours,
    [
      Focusing.config({ }),
      Keying.config({
        mode: 'execution',
        useSpace: true,
        useEnter: true
      }),
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: detail.value
        }
      })
    ]
  ),

  domModification: detail.domModification
});

const TabButton: TabButtonSketcher = Sketcher.single({
  name: 'TabButton',
  configFields: [
    FieldSchema.defaulted('uid', undefined),
    FieldSchema.strict('value'),
    FieldSchema.field('dom', 'dom', FieldPresence.mergeWithThunk(() => ({
      attributes: {
        'role': 'tab',
        // NOTE: This is used in TabSection to connect "labelledby"
        'id': Id.generate('aria'),
        'aria-selected': 'false'
      }
    })), ValueSchema.anyValue()),
    FieldSchema.option('action'),
    FieldSchema.defaulted('domModification', { }),
    SketchBehaviours.field('tabButtonBehaviours', [ Focusing, Keying, Representing ]),

    FieldSchema.strict('view')
  ],
  factory
});

export {
  TabButton
};
