import { Fun } from '@ephox/katamari';
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
import { document, console } from '@ephox/dom-globals';
import { AlloyParts, Memento, Focusing } from 'ephox/alloy/api/Main';
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
      minX: 20,
      maxX: 100,
      minY: -1,
      maxY: -1,
      getInitialValue: Fun.constant({
        x: Fun.constant(80),
        y: Fun.constant(-1)
      }),
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
        }),
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

  const slider2 = HtmlDisplay.section(
    gui,
    'This is a basic slider with two snapping regions [35] and [75]. The minimum value is 0',
    Slider.sketch({
      dom: { tag: 'div', styles: { 'margin-bottom': '40px' } },

      minX: 0,
      maxX: 100,
      minY: -1,
      maxY: -1,
      getInitialValue: Fun.constant({
        x: Fun.constant(35),
        y: Fun.constant(-1)
      }),
      stepSize: 40,
      snapStart: 35,
      snapToGrid: true,
      onDragStart (_, thumb) { Toggling.on(thumb); },
      onDragEnd (_, thumb) { Toggling.off(thumb); },

      onInit (slider, thumb, detail) {
        Replacing.set(thumb, [
          GuiFactory.text(detail.value().get().toString())
        ]);
      },

      onChange (slider, thumb, detail) {
        Replacing.set(thumb, [
          GuiFactory.text(detail.value().get().toString())
        ]);
      },

      components: [
        Slider.parts().spectrum({
          dom: {
            tag: 'div',
            styles: {
              width: '300px', background: 'green', height: '20px'
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
            Replacing.config({ }),
            Toggling.config({
              toggleClass: 'thumb-pressed'
            })
          ])
        })
      ]
    })
  );

  const hueSlider = HtmlDisplay.section(
    gui,
    'This is a basic color slider with a sliding thumb and edges',
    Slider.sketch({
      dom: {
        tag: 'div',
        styles: {
          border: '1px solid black'
        }
      },
      minX: 0,
      maxX: 360,
      minY: -1,
      maxY: -1,
      getInitialValue: Fun.constant({
        x: Fun.constant(120),
        y: Fun.constant(-1)
      }),
      stepSize: 10,

      onChange (slider, thumb, detail) {
        const getColor = (hue) => {
          if (hue < 0) { return 'black'; } else if (hue > 360) { return 'white'; } else { return 'hsl(' + hue + ', 100%, 50%)'; }
        };

        Css.set(thumb.element(), 'background', getColor(detail.value().get()));
      },

      // TODO: Remove duplication in demo.
      onInit (slider, thumb, detail) {
        const getColor = (hue) => {
          if (hue < 0) { return 'black'; } else if (hue > 360) { return 'white'; } else { return 'hsl(' + hue + ', 100%, 50%)'; }
        };

        Css.set(thumb.element(), 'background', getColor(detail.value().get()));
      },

      components: [
        Container.sketch({
          dom: {
            tag: 'div',
            styles: {
              display: 'flex'
            }
          },
          components: [
            Slider.parts()['left-edge']({
              dom: {
                tag: 'div',
                styles: {
                  width: '120px',
                  height: '20px',
                  background: 'black'
                }
              }
            }),
            Slider.parts().spectrum({
              dom: {
                tag: 'div',
                styles: {
                  'height': '20px',
                  'background': 'linear-gradient(to right, hsl(0, 100%, 50%) 0%, hsl(60, 100%, 50%) 17%, hsl(120, 100%, 50%) 33%, hsl(180, 100%, 50%) 50%, hsl(240, 100%, 50%) 67%, hsl(300, 100%, 50%) 83%, hsl(360, 100%, 50%) 100%)',
                  'display': 'flex',
                  'flex-grow': '1'
                }
              }
            }),
            Slider.parts()['right-edge']({
              dom: {
                tag: 'div',
                styles: {
                  width: '120px',
                  height: '20px',
                  background: 'white'
                }
              }
            })
          ]
        }),
        Slider.parts().thumb({
          dom: {
            tag: 'div',
            classes: [ 'demo-sliding-thumb' ],
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

  const setColour = function (palette: AlloyComponent) {
    const canvas = palette.element().dom()
    const width = canvas.width;
    var height = canvas.height;

    var ctx = canvas.getContext('2d');   

    var rgba = `rgba(255,0,0,1)`;
    ctx.fillStyle = rgba;
    ctx.fillRect(0, 0, width, height);
  
    var grdWhite = ctx.createLinearGradient(0, 0, width, 0);
    grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
    grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grdWhite;
    ctx.fillRect(0, 0, width, height);
  
    var grdBlack = ctx.createLinearGradient(0, 0, 0, height);
    grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
    grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = grdBlack;
    ctx.fillRect(0, 0, width, height);
  };

  const saturationBrightnessSlider = HtmlDisplay.section(
    gui,
    'This is another basic color slider with a sliding thumb and edges',
    Slider.sketch({
      dom: {
        tag: 'div',
        styles: {
          width: '500px',
          height: '500px',
          display: 'flex',
          'flex-wrap': 'wrap'
        }
      },
      minX: 0,
      maxX: 100,
      minY: 0,
      maxY: 100,
      rounded: false,
      axisVertical: true,
      getInitialValue: Fun.constant({
        x: Fun.constant(256),
        y: Fun.constant(0)
      }),
      onChange (slider, thumb, detail) {
        const rightEdge = AlloyParts.getPart(slider, detail, 'right-edge').getOrDie();
        // This color is wrong but otherwise we'd need another library.
        const getColor = (value) => {
          return 'hsl(0, ' + value.x() + '%, ' + (100 - value.y()) + '%)';
        };
        const color = getColor(detail.value().get());
        Css.set(rightEdge.element(), 'background-color', color);
      },

      onInit (slider, thumb, detail) {
        const spectrum = AlloyParts.getPart(slider, detail, 'spectrum').getOrDie();
        setColour(spectrum);
      },

      components: [
        Slider.parts()['top-left-edge']({
          dom: {
            tag: 'div',
            styles: {
              width: '18px',
              height: '18px',
              background: 'transparent',
              border: '1px solid black'
            }
          }
        }),
        Slider.parts()['top-edge']({
          dom: {
            tag: 'div',
            styles: {
              width: '458px',
              height: '18px',
              background: 'transparent',
              border: '1px solid black'
            }
          }
        }),
        Slider.parts()['top-right-edge']({
          dom: {
            tag: 'div',
            styles: {
              width: '18px',
              height: '18px',
              background: 'transparent',
              border: '1px solid black'
            }
          }
        }),
        Slider.parts()['left-edge']({
          dom: {
            tag: 'div',
            styles: {
              width: '18px',
              height: '458px',
              background: 'white',
              border: '1px solid black'
            }
          }
        }),
        Slider.parts()['spectrum']({
          dom: {
            tag: 'canvas',
            styles: {
              width: '460px',
              height: '460px'
            }
          }
        }),
        Slider.parts()['right-edge']({
          dom: {
            tag: 'div',
            styles: {
              width: '18px',
              height: '458px',
              border: '1px solid black'
            }
          }
        }),
        Slider.parts()['bottom-left-edge']({
          dom: {
            tag: 'div',
            styles: {
              width: '18px',
              height: '18px',
              background: 'transparent',
              border: '1px solid black'
            }
          }
        }),
        Slider.parts()['bottom-edge']({
          dom: {
            tag: 'div',
            styles: {
              width: '458px',
              height: '18px',
              background: 'transparent',
              border: '1px solid black'
            }
          }
        }),
        Slider.parts()['bottom-right-edge']({
          dom: {
            tag: 'div',
            styles: {
              width: '18px',
              height: '18px',
              background: 'transparent',
              border: '1px solid black'
            }
          }
        }),
        Slider.parts().thumb({
          dom: {
            tag: 'div',
            classes: [ 'demo-sliding-thumb' ],
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
    if (! isTouch) { Keying.focusIn(saturationBrightnessSlider); }
  });
};