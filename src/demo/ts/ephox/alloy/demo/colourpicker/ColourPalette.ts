import { Option } from '@ephox/katamari';
import { Palette } from "ephox/alloy/api/ui/Palette";
import { Behaviour, Composing, Tabstopping, Focusing } from "ephox/alloy/api/Main";
import { SketchSpec } from 'ephox/alloy/api/ui/Sketcher';

var palette = Palette.parts().palette({
  dom: {
    tag: 'canvas',
    attributes: {
      title: 'palette'
    },
    classes: [ 'example-palette-palette' ]
  }
});

var paletteThumb = Palette.parts().thumb({
  dom: {
    tag: 'div',
    innerHtml: 'Thumb',
    attributes: {
      title: 'thumb'
    },
    classes: [ 'example-slider-thumb' ]
  }
});

var picker = Palette.sketch({
  dom: {
    tag: 'div',
    attributes: {
      title: 'picker'
    },
    classes: [ 'example-palette' ]
  },
  components: [
    palette,
    paletteThumb
  ],
  paletteBehaviours: Behaviour.derive([
    Composing.config({
      find: Option.some
    }),
    Tabstopping.config({ }),
    Focusing.config({ })
  ])
})

const renderPalette = (): SketchSpec => {
  return Palette.sketch({
    dom: {
      tag: 'div',
      attributes: {
        title: 'picker'
      },
      classes: [ 'example-palette' ]
    },
    components: [
      palette,
      paletteThumb
    ],
    paletteBehaviours: Behaviour.derive([
      Composing.config({
        find: Option.some
      }),
      Tabstopping.config({ }),
      Focusing.config({ })
    ])
  });
};

export {
  renderPalette
};