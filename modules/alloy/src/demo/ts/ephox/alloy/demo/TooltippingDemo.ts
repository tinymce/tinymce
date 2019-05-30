import { document } from '@ephox/dom-globals';
import { Arr, Result } from '@ephox/katamari';
import { Class, Element } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { Tooltipping } from 'ephox/alloy/api/behaviour/Tooltipping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = GuiFactory.build({
    dom: {
      tag: 'div'
    },
    behaviours: Behaviour.derive([
      Positioning.config({ })
    ])
  });

  const lazySink = function () {
    return Result.value(sink);
  };
  gui.add(sink);

  const button1 = HtmlDisplay.section(
    gui,
    'This is a container of three buttons with tooltips',
    Container.sketch({
      dom: {
        tag: 'div'
      },
      containerBehaviours: Behaviour.derive([
        Focusing.config({ }),
        Keying.config({
          mode: 'flow',
          selector: 'button'
        })
      ]),

      components: Arr.map([ 'alpha', 'beta', 'gamma' ], function (n) {
        return <AlloySpec> {
          dom: {
            tag: 'button',
            innerHtml: n
          },
          behaviours: Behaviour.derive([
            Focusing.config({ }),
            Tooltipping.config({
              lazySink,
              // NOTE: At this stage, exclusive=false, probably doesn't do much, because
              // a mouseout/focusout is almost always fired before another tooltip
              // would show. However, if there was an API to make tooltips show,
              // then it would have a purpose.
              exclusive: true,
              tooltipDom: {
                tag: 'span',
                styles: {
                  background: 'black',
                  color: 'white',
                  padding: '10px'
                },
                innerHtml: 'Tooltip: ' + n
              }
            })
          ])
        };
      }).concat([
        <AlloySpec> GuiFactory.premade(sink)
      ])
    })
  );
};