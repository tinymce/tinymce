import { Button, SketchSpec, Behaviour, Dragging, Unselecting, DragCoord } from '@ephox/alloy';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { PlatformDetection } from '@ephox/sand';
import { Position } from '@ephox/sugar';
import { Option } from '@ephox/katamari';

export const renderSizer = (spec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const snapData = {
    getSnapPoints () {
      return [
        Dragging.snap({
          sensor: DragCoord.fixed(300, 10),
          range: Position(1000, 30),
          output: DragCoord.fixed(Option.none(), Option.some(10))
        }),

        Dragging.snap({
          sensor: DragCoord.offset(300, 500),
          range: Position(40, 40),
          output: DragCoord.absolute(Option.some(300), Option.some(500))
        })
      ];
    },
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top'
  };
  // For using the alert banner inside a dialog
  return Button.sketch({
    dom: {
      tag: 'span',
      innerHtml: 'Drag datass',
      styles: {
        padding: '10px',
        display: 'inline-block',
        background: '#333',
        color: '#fff'
      }
    },

    buttonBehaviours: Behaviour.derive([
      Dragging.config(
        PlatformDetection.detect().deviceType.isTouch() ? {
          mode: 'touch',
          snaps: snapData
        } : {
          mode: 'mouse',
          blockerClass: 'blocker',
          snaps: snapData
        }
      ),
      Unselecting.config({ })
    ]),
    eventOrder: {
      // Because this is a button, allow dragging. It will stop clicking.
      mousedown: [ 'dragging', 'alloy.base.behaviour' ]
    }
  });
};