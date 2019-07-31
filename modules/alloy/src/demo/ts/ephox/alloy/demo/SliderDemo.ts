import { document } from '@ephox/dom-globals';
import { Fun, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { Class, Css, DomEvent, Element, Insert } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Slider } from 'ephox/alloy/api/ui/Slider';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { SliderValue, SliderValueX, SliderValueY } from 'ephox/alloy/ui/types/SliderTypes';
import { ConfiguredPart } from 'ephox/alloy/parts/AlloyParts';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Insert.append(body, gui.element());

  const slider1 = HtmlDisplay.section(
    gui,
    'This is a basic slider from [20, 100] with snapping to grid at 10',
    Slider.sketch({
      dom: {
        tag: 'div'
      },
      model: {
        mode: 'x',
        minX: 20,
        maxX: 100,
        getInitialValue: Fun.constant({x: Fun.constant(80)})
      },
      stepSize: 10,
      snapToGrid: true,

      components: [
        Slider.parts().spectrum({
          dom: {
            tag: 'div',
            styles: {
              height: '20px',
              background: 'blue',
              outline: '4px solid green'
            }
          }
        }) as ConfiguredPart,
        Slider.parts().thumb({
          dom: {
            tag: 'div',
            styles: {
              'height': '30px',
              'width': '10px',
              'top': '0px',
              'background': 'black',
              'padding-top': '-5px'
            }
          }
        })
      ]
    })
  );

  HtmlDisplay.section(
    gui,
    'This is a basic slider with two snapping regions [35] and [75]. The minimum value is 0',
    Slider.sketch({
      dom: { tag: 'div', styles: { 'margin-bottom': '40px' } },
      model: {
        mode: 'y',
        getInitialValue: Fun.constant({y: Fun.constant(35)})
      },

      stepSize: 40,
      snapStart: 35,
      snapToGrid: true,
      onDragStart(_, thumb) { Toggling.on(thumb); },
      onDragEnd(_, thumb) { Toggling.off(thumb); },

      onChange(_slider, thumb, value: SliderValue) {
        if (isValueY(value)) {
          Replacing.set(thumb, [
            GuiFactory.text(value.y().toString())
          ]);
        }
      },
      onInit(_slider, thumb, _spectrum, value: SliderValue) {
        if (isValueY(value)) {
          Replacing.set(thumb, [
            GuiFactory.text(value.y().toString())
          ]);
        }
      },

      components: [
        Slider.parts().spectrum({
          dom: {
            tag: 'div',
            styles: {
              width: '20px', background: 'green', height: '300px'
            }
          }
        }),
        Slider.parts().thumb({
          dom: {
            tag: 'div',
            styles: {
              'border-radius': '20px',
              'width': '25px',
              'height': '25px',
              'border': '1px solid green',
              'background': 'transparent',
              'display': 'flex', 'align-items': 'center', 'justify-content': 'center'
            }
          },
          behaviours: Behaviour.derive([
            Replacing.config({}),
            Toggling.config({
              toggleClass: 'thumb-pressed'
            })
          ])
        })
      ]
    })
  );

  function isValueX(v: SliderValue): v is SliderValueX {
    return Type.isFunction((v as SliderValueX).x);
  }

  function isValueY(v: SliderValue): v is SliderValueY {
    return Type.isFunction((v as SliderValueY).y);
  }

  const setColor = (thumb: AlloyComponent, hue: number) => {
    const color = (hue < 0) ? 'black' : (hue > 360) ? 'white' : 'hsl(' + hue + ', 100%, 50%)';
    Css.set(thumb.element(), 'background', color);
  };

  HtmlDisplay.section(
    gui,
    'This is a basic color slider with a sliding thumb and edges',
    Slider.sketch({
      dom: {
        tag: 'div'
      },
      model: {
        mode: 'xy',
        minX: 0,
        maxX: 360,
        minY: 0,
        maxY: 360,
        getInitialValue: Fun.constant({x: Fun.constant(120), y: Fun.constant(120)})
      },
      stepSize: 10,

      onChange(_slider, thumb, value: SliderValue) {
        if (isValueX(value)) {
          setColor(thumb, value.x());
        }
      },

      onInit(_slider, thumb, _spectrum, value: SliderValue) {
        if (isValueX(value)) {
          setColor(thumb, value.x());
        }
      },

      components: [
        Container.sketch({
          dom: {
            tag: 'div',
            styles: {
              display: 'flex',
              width: '540px',
              border: '1px solid black'
            }
          },
          components: [
            Slider.parts()['left-edge']({
              dom: {
                tag: 'div',
                styles: {
                  width: '20px',
                  height: '500px',
                  background: 'black'
                }
              }
            }),
            Slider.parts().spectrum({
              dom: {
                tag: 'div',
                styles: {
                  height: '500px',
                  background: 'linear-gradient(to right, hsl(0, 100%, 50%) 0%, hsl(60, 100%, 50%) 17%, hsl(120, 100%, 50%) 33%, hsl(180, 100%, 50%) 50%, hsl(240, 100%, 50%) 67%, hsl(300, 100%, 50%) 83%, hsl(360, 100%, 50%) 100%)',
                  width: '500px'
                }
              }
            }),
            Slider.parts()['right-edge']({
              dom: {
                tag: 'div',
                styles: {
                  width: '20px',
                  height: '500px',
                  background: 'white'
                }
              }
            })
          ]
        }),
        Slider.parts().thumb({
          dom: {
            tag: 'div',
            classes: ['demo-sliding-thumb'],
            styles: {
              'height': '30px',
              'width': '10px',
              'top': '0px',
              'background': 'black',
              'padding-top': '-5px',
              'border': '1px solid black',
              'outline': '1px solid white'
            }
          }
        })
      ]
    })
  );

  const platform = PlatformDetection.detect();
  const isTouch = platform.deviceType.isTouch();

  DomEvent.bind(body, 'click', () => {
    if (!isTouch) { Keying.focusIn(slider1); }
  });
};
