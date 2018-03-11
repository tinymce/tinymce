import { FieldSchema } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import { Toggling } from '../../api/behaviour/Toggling';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as NativeEvents from '../../api/events/NativeEvents';
import SystemEvents from '../../api/events/SystemEvents';
import * as Fields from '../../data/Fields';
import * as ItemEvents from '../util/ItemEvents';

const builder = function (info) {
  return {
    dom: Merger.deepMerge(
      info.dom(),
      {
        attributes: {
          role: info.toggling().isSome() ? 'menuitemcheckbox' : 'menuitem'
        }
      }
    ),
    behaviours: Merger.deepMerge(
      Behaviour.derive([
        info.toggling().fold(Toggling.revoke, function (tConfig) {
          return Toggling.config(
            Merger.deepMerge({
              aria: {
                mode: 'checked'
              }
            }, tConfig)
          );
        }),
        Focusing.config({
          ignore: info.ignoreFocus(),
          onFocus (component) {
            ItemEvents.onFocus(component);
          }
        }),
        Keying.config({
          mode: 'execution'
        }),
        Representing.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        })
      ]),
      info.itemBehaviours()
    ),
    events: AlloyEvents.derive([
      // Trigger execute when clicked
      AlloyEvents.runWithTarget(SystemEvents.tapOrClick(), AlloyTriggers.emitExecute),

      // Like button, stop mousedown propagating up the DOM tree.
      AlloyEvents.cutter(NativeEvents.mousedown()),

      AlloyEvents.run(NativeEvents.mouseover(), ItemEvents.onHover),

      AlloyEvents.run(SystemEvents.focusItem(), Focusing.focus)
    ]),
    components: info.components(),

    domModification: info.domModification()
  };
};

const schema = [
  FieldSchema.strict('data'),
  FieldSchema.strict('components'),
  FieldSchema.strict('dom'),

  FieldSchema.option('toggling'),

  // Maybe this needs to have fewer behaviours
  FieldSchema.defaulted('itemBehaviours', { }),

  FieldSchema.defaulted('ignoreFocus', false),
  FieldSchema.defaulted('domModification', { }),
  Fields.output('builder', builder)
];

export default <any> schema;