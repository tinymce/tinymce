import { Behaviour, Button, Container, Memento, Toggling, SketchSpec } from '@ephox/alloy';
import { Throttler } from '@ephox/katamari';

import Styles from '../../style/Styles';
import * as UiDomFactory from '../../util/UiDomFactory';

const sketch = function (onView, translate): SketchSpec {

  const memIcon = Memento.record(
    Container.sketch({
      dom: UiDomFactory.dom('<div aria-hidden="true" class="${prefix}-mask-tap-icon"></div>'),
      containerBehaviours: Behaviour.derive([
        Toggling.config({
          toggleClass: Styles.resolve('mask-tap-icon-selected'),
          toggleOnExecute: false
        })
      ])
    })
  );

  const onViewThrottle = Throttler.first(onView, 200);

  return Container.sketch({
    dom: UiDomFactory.dom('<div class="${prefix}-disabled-mask"></div>'),
    components: [
      Container.sketch({
        dom: UiDomFactory.dom('<div class="${prefix}-content-container"></div>'),
        components: [
          Button.sketch({
            dom: UiDomFactory.dom('<div class="${prefix}-content-tap-section"></div>'),
            components: [
              memIcon.asSpec()
            ],
            action (button) {
              onViewThrottle.throttle();
            },

            buttonBehaviours: Behaviour.derive([
              Toggling.config({
                toggleClass: Styles.resolve('mask-tap-icon-selected')
              })
            ])
          })
        ]
      })
    ]
  });
};

export default {
  sketch
};