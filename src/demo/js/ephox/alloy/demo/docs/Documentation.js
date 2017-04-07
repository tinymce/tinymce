define(
  'ephox.alloy.demo.docs.Documentation',

  [
    'ephox.alloy.api.ui.Slider',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (Slider, Fun, Merger) {
    var toggling = {
      'toggling': {
        desc: 'The <em>toggling</em> behaviour is used to allow a component to switch ' +
          'between two states: off and on. At the moment, this <strong>must</strong> be ' +
          'associated with a change in ARIA state, but that might change in the future'
      },
      'toggling > selected': {
        desc: 'specify whether or not the component starts toggled',
      },
      'toggling > toggleClass': {
        desc: 'The class which is present when the component is toggled "on"',
      },
      'toggling > toggleOnExecute': {
        desc: 'Whether or not executing on the component should fire "toggle"'
      },
      'toggling > aria > aria-pressed-attr': {
        desc: 'The aria attribute to use for a toggled "on" state'
      },
      'toggling > aria > aria-expanded-attr': {
        desc: 'The aria attribute to use for a toggled "on" state which is expanded'
      }
    };

    var button = {
      'Button': {
        desc: 'A basic component with execution behaviour'
      },
      'Button > dom': {
        desc: 'The DOM structure of the button'
      },
      'Button > action': {
        desc: 'The action to fire on execute. If one is not supplied, it just triggers an execute on click'
      },
      'Button > role': {
        desc: 'The ARIA role for this button'
      }
    };

    var container = {
      'Container': {
        desc: 'The simplest component. Defaults to a <code>div</code>'
      }
    };

    var input = {
      'Input': {
        desc: 'A basic input area for the user. Can be an <code>input</code> or a <code>textarea</code>'
      },
      'Input > data': {
        desc: 'a <code>(value, text)</code> pair of information representing the value inside the input. Note, both values are required because the display value may be different from the internal value.'
      },
      'Input > type': {
        desc: 'the <code>type</code> attribute of the input'
      },
      'Input > tag': {
        desc: 'the tag to use for the input. Can be <code>input</code> or <code>textarea</code>'
      },
      'Input > placeholder': {
        desc: 'the placeholder to use for the input'
      },
      'Input > hasTabstop': {
        desc: 'Whether or not the input component should be a tabstop'
      }
    };

    var slider = {
      'Slider': {
        desc: 'A component which allows the user to choose a value with a range from [min, max]. It ' +
          'can have discrete steps (using snapToGrid) or be continuous. Optionally, you can specify a ' +
          'left and/or right edge which represents one value below or more than the max. It is a separate ' +
          'part, so it can be styled differently. A use case for edges is in colour gradients, where hue cannot ' + 
          'represent black and white.',

        example: [
          Slider.sketch({
            dom: {
              tag: 'div',
              attributes: {
                title: 'slider'
              },
              styles: {
                background: 'blue',
                display: 'flex',
                height: '50px',
                outline: '2px solid black',
                padding: '10px'
              }
            },
            components: [
              Slider.parts()['left-edge'](),
              Slider.parts().spectrum(),
              Slider.parts()['right-edge'](),
              Slider.parts().thumb()
            ],
            min: 0,
            max: 100,
            getInitialValue: Fun.constant(10),
            parts: {
              'left-edge': {
                dom: {
                  tag: 'div',
                  innerHtml: 'L',
                  attributes: {
                    title: 'left-edge'
                  },
                  styles: {
                    background: 'black',
                    color: 'white',
                    width: '80px',
                    height: '80%',
                    display: 'flex',
                    'margin-top': '5px',
                    'justify-content': 'center',
                    'align-items': 'center'
                  }
                }
              },
              'right-edge': {
                dom: {
                  tag: 'div',
                  innerHtml: 'R',
                  attributes: {
                    title: 'right-edge'
                  },
                  styles: {
                    background: 'white',
                    color: 'black',
                    width: '80px',
                    'margin-top': '5px',
                    height: '40px',
                    display: 'flex',
                    'justify-content': 'center',
                    'align-items': 'center'
                  }
                }
              },
              spectrum: {
                dom: {
                  tag: 'div',
                  innerHtml: 'Spectrum',
                  attributes: {
                    title: 'spectrum'
                  },
                  styles: {
                    display: 'flex',
                    'font-weight': 'bold',
                    background: '#cadbee',
                    'justify-content': 'center',
                    'align-items': 'center',
                    'flex-grow': '1'
                  }
                }
              },
              thumb: {
                dom: {
                  tag: 'div',
                  innerHtml: 'Thumb',
                  attributes: {
                    title: 'thumb'
                  },
                  styles: {
                    background: '#e493e4',
                    height: '60px',
                    width: '60px',
                    'margin-top': '-5px',
                    'border-radius': '50px',
                    border: '1px solid black',
                    display: 'flex',
                    'justify-content': 'center',
                    'align-items': 'center'
                  }
                }
              }
            }
          })
        ]
      },
      'Slider > min': { desc: 'The minimum value the slider can have before it reaches the optional left edge' },
      'Slider > max': { desc: 'The maximum value the slider can have before it reaches the optional right edge' },
      'Slider > stepSize': { desc: 'The amount to change the value by when snapping to grid or using arrow keys' },
      'Slider > onChange': { desc: 'A handler that is called when the slider value changes' },
      'Slider > snapToGrid': { desc: 'Whether or not to use the stepSize as discrete positions on the slider' },
      'Slider > initialValue': { desc: 'The initial value for the slider when it first appears' }
    };

    return Merger.deepMerge(
      slider,
      toggling,
      button,
      container,
      input
    );
  }
);