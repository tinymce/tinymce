import { document } from '@ephox/dom-globals';
import { Option, Options } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css, DomEvent, Element, Elements, Height, Insert, InsertAll, Node, SelectorFind, Width } from '@ephox/sugar';

import { SugarEvent } from 'ephox/alloy/alien/TypeDefinitions';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import { Pinching } from 'ephox/alloy/api/behaviour/Pinching';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as ForeignGui from 'ephox/alloy/api/system/ForeignGui';

import * as Frames from './frames/Frames';

const resize = (element: Element, changeX: number, changeY: number): void => {
  const heading = document.querySelector('h2');
  if (heading === null) {
    throw new Error('heading not found');
  } else {
    heading.innerHTML = 'resizing';
    const width = Css.getRaw(element, 'width').map((w) => {
      return parseInt(w, 10);
    }).getOrThunk(() => {
      return Width.get(element);
    });
    const height = Css.getRaw(element, 'height').map((h) => {
      return parseInt(h, 10);
    }).getOrThunk(() => {
      return Height.get(element);
    });
    Css.set(element, 'width', (width + changeX) + 'px');
    Css.set(element, 'height', (height + changeY) + 'px');
  }
};

export default (): void => {
  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
  const platform = PlatformDetection.detect();

  const onNode = (name: string) => (elem: Element): Option<Element> =>
    Options.someIf(Node.name(elem) === name, elem);

  const contents = '<div><strong>drag1</strong> and <code>click1</code> and <strong>drag2</strong> ' +
    'and <code>click2</code> and <img style="width: 140px; height: 130px;" /></div>';

  const frame = Element.fromTag('iframe');
  Css.set(frame, 'min-width', '80%');
  const onload = DomEvent.bind(frame, 'load', () => {
    onload.unbind();
    Frames.write(
      frame,
      '<html>' +
        '<head>' +
          '<style>' +
            '.selected { color: white; background: black; }' +
            '* { font-size: bigger; }\n' +
            'span { padding: 30px; display: inline-block; border: 1px solid blue; }' +
          '</style>' +
        '</head>' +
        '<body>' +
          contents +
        '</body>' +
      '</html>'
    );
    const root = Element.fromDom(Frames.readDoc(frame).dom().documentElement);
    addAsForeign(root);
  });

  const inlineContainer = Element.fromHtml(
    contents
  );

  const addAsForeign = (root: Element) => {
    const connection = ForeignGui.engage({
      root,
      dispatchers: [
        {
          getTarget: onNode('code'),
          alloyConfig: {
            behaviours: Behaviour.derive([
              Toggling.config({
                toggleClass: 'selected'
              })
            ]),

            events: AlloyEvents.derive([
              AlloyEvents.run<SugarEvent>(NativeEvents.click(), (component, simulatedEvent) => {
                // We have to remove the proxy first, because we are during a proxied event (click)
                connection.unproxy(component);
                connection.dispatchTo(SystemEvents.execute(), simulatedEvent.event());
              })
            ])
          }
        },
        {
          getTarget: onNode('strong'),
          alloyConfig: {
            behaviours: Behaviour.derive([
              Dragging.config(
                platform.deviceType.isTouch() ? {
                  mode: 'touch'
                } : {
                  mode: 'mouse',
                  blockerClass: 'blocker'
                }
              )
            ])
          }
        },

        {
          getTarget: onNode('img'),
          alloyConfig: {
            behaviours: Behaviour.derive([
              Pinching.config({
                onPinch: resize,
                onPunch: resize
              })
            ])
          }
        }
      ]
    });

    return connection;
  };

  InsertAll.append(ephoxUi,
    Elements.fromHtml(
      '<p>This is a demo for alloy delegation. The iframe and the div editor are not alloy components' +
        ' but they need to exhibit alloy behaviours. This is done through ForeignGui</p>' +
      '<p>Drag the <strong>dragx</strong> elements and click on the <code>clickx</code> elements</p>'
    )
  );

  Insert.append(ephoxUi, Element.fromHtml('<h3>IFrame Editor</h3>'));
  Insert.append(ephoxUi, frame);
  Insert.append(ephoxUi, Element.fromHtml('<h3>Div Editor</h3>'));
  Insert.append(ephoxUi, inlineContainer);

  addAsForeign(inlineContainer);
};
