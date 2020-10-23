import { ApproxStructure, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

type Alignment = 'left' | 'center' | 'right' | 'justify';

const figureImageApproxStructure = (alignment: Alignment) => {
  const alignClasses = (arr) => ({
    left: arr.has('align-left'),
    center: arr.has('align-center'),
    right: arr.has('align-right'),
    justify: arr.not('align-justify')
  });

  return ApproxStructure.build((s, str, arr) => s.element('body', {
    children: [
      s.element('figure', {
        classes: [
          arr.has('image'),
          alignClasses(arr)[alignment]
        ],
        children: [
          s.element('img', {
            attrs: {
              src: str.is('image.png')
            }
          }),
          s.theRest()
        ]
      }),
      s.theRest()
    ]
  }));
};

const imageApproxStructure = (alignment: Alignment) => {
  const alignStyles = (str) => ({
    left: { float: str.is('left') },
    center: { 'display': str.is('block'), 'margin-left': str.is('auto'), 'margin-right': str.is('auto') },
    right: { float: str.is('right') },
    justify: {}
  });

  return ApproxStructure.build((s, str) => s.element('body', {
    children: [
      s.element('p', {
        styles: alignment === 'justify' ? { 'text-align': str.is('justify') } : {},
        children: [
          s.element('img', {
            attrs: {
              src: str.is('image.png')
            },
            styles: alignStyles(str)[alignment]
          })
        ]
      }),
      s.theRest()
    ]
  }));
};

UnitTest.asynctest('browser.tinymce.plugins.image.ImageAlignTest', (success, failure) => {
  SilverTheme();
  ImagePlugin();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const sCheckToolbarHighlighting = (alignment: Alignment, isFigure: boolean) => {
      const ariaLabels = {
        left: 'Align left',
        center: 'Align center',
        right: 'Align right',
        justify: 'Justify'
      };
      const ariaLabel = ariaLabels[alignment];
      const otherLabels = Obj.values(Obj.filter(ariaLabels, (_, key) => key !== alignment));
      // Justify is the default for figures so it never gets highlighted
      const ariaPressed = isFigure && alignment === 'justify' ? 'false' : 'true';

      return Log.stepsAsStep('TINY-4057', 'Verify only one align toolbar button is highlighted', [
        tinyUi.sWaitForUi(`Check ${alignment} align toolbar button is highlighted`, `button[aria-label="${ariaLabel}"][aria-pressed="${ariaPressed}"]`),
        ...Arr.map(otherLabels, (label) => tinyUi.sWaitForUi(`Check ${alignment} align toolbar button is not highlighted`, `button[aria-label="${label}"][aria-pressed="false"]`))
      ]);
    };

    const sApplyAlignmentFromMenu = (alignment: Alignment) => {
      const ariaLabels = {
        left: 'Left',
        center: 'Center',
        right: 'Right',
        justify: 'Justify'
      };
      const ariaLabel = ariaLabels[alignment];

      return Log.stepsAsStep('TINY-4057', `Click ${ariaLabel} align menu button`, [
        tinyUi.sClickOnToolbar(`Open align menu`, `button[aria-label="Align"]`),
        tinyUi.sWaitForUi('Wait for align menu', `div[title="${ariaLabel}"]`),
        tinyUi.sClickOnUi(`Click ${alignment} align menu button`, `div[title="${ariaLabel}"]`)
      ]);
    };

    const sApplyAlignmentFromToolbar = (alignment: Alignment) => {
      const ariaLabels = {
        left: 'Align left',
        center: 'Align center',
        right: 'Align right',
        justify: 'Justify'
      };
      const ariaLabel = ariaLabels[alignment];
      return tinyUi.sClickOnToolbar(`Click ${alignment} align toolbar button`, `button[aria-label="${ariaLabel}"]`);
    };

    const sTestConsecutiveAlignments = (label: string, sAlignImage: (alignment: Alignment) => Step<unknown, unknown>, alignments: Alignment[]) => {
      const alignmentSteps = (isFigure: boolean) => Arr.map(alignments, (alignment) => Log.stepsAsStep('TINY-4057', `Apply ${alignment} alignment to ${isFigure ? 'figure' : ''} image`, [
        sAlignImage(alignment),
        sCheckToolbarHighlighting(alignment, isFigure),
        tinyApis.sAssertContentStructure(isFigure ? figureImageApproxStructure(alignment) : imageApproxStructure(alignment))
      ]));

      return Log.stepsAsStep('TINY-4057', label, [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<p><img src="image.png" /></p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 0 ], 1),
        ...alignmentSteps(false),
        tinyApis.sFocus(),
        tinyApis.sSetContent('<figure class="image"><img src="image.png" /><figcaption>Caption</figcaption></figure>'),
        tinyApis.sSetSelection([], 1, [], 2),
        ...alignmentSteps(true)
      ]);
    };

    const sTestImageAlignment = (alignmentType: 'toolbar' | 'menu', sAlignImage: (alignment: Alignment) => Step<unknown, unknown>) =>
      Log.stepsAsStep('TINY-4057', `Testing image alignment using the ${alignmentType}`, [
        sTestConsecutiveAlignments('Align: left -> center -> left', sAlignImage, [ 'left', 'center', 'left' ]),
        sTestConsecutiveAlignments('Align: left -> right -> left', sAlignImage, [ 'left', 'right', 'left' ]),
        sTestConsecutiveAlignments('Align: left -> justify -> left', sAlignImage, [ 'left', 'justify', 'left' ]),
        sTestConsecutiveAlignments('Align: right -> center -> right', sAlignImage, [ 'right', 'center', 'right' ]),
        sTestConsecutiveAlignments('Align: right -> justify -> right', sAlignImage, [ 'right', 'justify', 'right' ]),
        sTestConsecutiveAlignments('Align: center -> justify -> center', sAlignImage, [ 'center', 'justify', 'center' ]),
        sTestConsecutiveAlignments('Align: left -> center -> right -> justify', sAlignImage, [ 'left', 'center', 'right', 'justify' ])
      ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      sTestImageAlignment('toolbar', sApplyAlignmentFromToolbar),
      sTestImageAlignment('menu', sApplyAlignmentFromMenu)
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image align alignleft aligncenter alignright alignjustify',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true
  }, success, failure);
});
