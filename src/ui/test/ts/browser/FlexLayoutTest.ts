import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.ui.FlexLayoutTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  const resetScroll = function (elm) {
    elm.scrollTop = 0;
    elm.scrollLeft = 0;
  };

  const renderPanel = function (settings) {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');

    const panel = Factory.create(Tools.extend({
      type: 'panel',
      layout: 'flex',
      width: 200, height: 200,
      items: [
        { type: 'spacer', classes: 'red' },
        { type: 'spacer', classes: 'green' },
        { type: 'spacer', classes: 'blue' }
      ]
    }, settings)).renderTo(viewBlock.get()).reflow();

    resetScroll(panel.getEl('body'));

    return panel;
  };

  suite.test('pack: default, align: default, flex: default', function () {
    const panel = renderPanel({});

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [20, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [40, 0, 20, 20]);
  });

  suite.test('pack: default, align: default, flex: default, borders', function () {
    const panel = renderPanel({ defaults: { border: 1 } });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 22, 22]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [22, 0, 22, 22]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [44, 0, 22, 22]);
  });

  suite.test('pack: default, flex: 1', function () {
    const panel = renderPanel({
      defaults: { flex: 1 }
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [67, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [133, 0, 67, 20]);
  });

  suite.test('pack: default, flex: 1, minWidth: various', function () {
    const panel = renderPanel({
      defaults: { flex: 1 },
      items: [
        { type: 'spacer', minWidth: 25, classes: 'red' },
        { type: 'spacer', minWidth: 30, classes: 'green' },
        { type: 'spacer', minWidth: 35, classes: 'blue' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 62, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [62, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [128, 0, 72, 20]);
  });

  suite.test('pack: start, flex: default', function () {
    const panel = renderPanel({
      pack: 'start'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [20, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [40, 0, 20, 20]);
  });

  suite.test('pack: start, flex: 1', function () {
    const panel = renderPanel({
      pack: 'start',
      defaults: { flex: 1 }
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [67, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [133, 0, 67, 20]);
  });

  suite.test('pack: end, flex: default', function () {
    const panel = renderPanel({
      pack: 'end'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [140, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [160, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [180, 0, 20, 20]);
  });

  suite.test('pack: end, flex: 1', function () {
    const panel = renderPanel({
      pack: 'end',
      defaults: { flex: 1 }
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [67, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [133, 0, 67, 20]);
  });

  suite.test('pack: center, flex: default', function () {
    const panel = renderPanel({
      pack: 'center'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [70, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [90, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [110, 0, 20, 20]);
  });

  suite.test('pack: center, flex: 1', function () {
    const panel = renderPanel({
      pack: 'center',
      defaults: { flex: 1 }
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [67, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [133, 0, 67, 20]);
  });

  suite.test('pack: start, spacing: 3', function () {
    const panel = renderPanel({
      layout: 'flex',
      pack: 'start',
      spacing: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [23, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [46, 0, 20, 20]);
  });

  suite.test('pack: end, spacing: 3', function () {
    const panel = renderPanel({
      pack: 'end',
      spacing: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [134, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [157, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [180, 0, 20, 20]);
  });

  suite.test('pack: center, spacing: 3', function () {
    const panel = renderPanel({
      pack: 'center',
      spacing: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [67, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [90, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [113, 0, 20, 20]);
  });

  suite.test('pack: start, padding: 3', function () {
    const panel = renderPanel({
      pack: 'start',
      padding: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [23, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [43, 3, 20, 20]);
  });

  suite.test('pack: start, spacing: 3, padding: 3', function () {
    const panel = renderPanel({
      pack: 'start',
      padding: 3,
      spacing: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [26, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [49, 3, 20, 20]);
  });

  suite.test('pack: start, align: start', function () {
    const panel = renderPanel({
      pack: 'start',
      align: 'start'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [20, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [40, 0, 20, 20]);
  });

  suite.test('pack start, align: center', function () {
    const panel = renderPanel({
      pack: 'start',
      align: 'center'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 90, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [20, 90, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [40, 90, 20, 20]);
  });

  suite.test('pack: start, align: end', function () {
    const panel = renderPanel({
      pack: 'start',
      align: 'end'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 180, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [20, 180, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [40, 180, 20, 20]);
  });

  suite.test('pack: start, align: stretch', function () {
    const panel = renderPanel({
      pack: 'start',
      align: 'stretch'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 200]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [20, 0, 20, 200]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [40, 0, 20, 200]);
  });

  suite.test('pack: start, padding: 3, align: stretch', function () {
    const panel = renderPanel({
      pack: 'start',
      align: 'stretch',
      padding: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 194]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [23, 3, 20, 194]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [43, 3, 20, 194]);
  });

  suite.test('pack: start, flex: mixed values', function () {
    const panel = renderPanel({
      pack: 'start',
      items: [
        { type: 'spacer', classes: 'red', flex: 0.3 },
        { type: 'spacer', classes: 'green', flex: 1 },
        { type: 'spacer', classes: 'blue', flex: 0.5 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 43, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [43, 0, 98, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [141, 0, 59, 20]);
  });

  suite.test('pack: justify', function () {
    const panel = renderPanel({
      pack: 'justify'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [90, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [180, 0, 20, 20]);
  });

  suite.test('pack: justify, padding: 3', function () {
    const panel = renderPanel({
      pack: 'justify',
      padding: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [90, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [177, 3, 20, 20]);
  });

  suite.test('pack: justify, minWidth: mixed values, padding: 3', function () {
    const panel = renderPanel({
      pack: 'justify',
      padding: 3,
      items: [
        { type: 'spacer', classes: 'red' },
        { type: 'spacer', classes: 'green', minWidth: 80 },
        { type: 'spacer', classes: 'blue', minWidth: 50 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [45, 3, 80, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [147, 3, 50, 20]);
  });

  suite.test('pack: start, flex: 1, maxWidth: 80 on second', function () {
    const panel = renderPanel({
      pack: 'start',
      width: 400,
      items: [
        { type: 'spacer', classes: 'red', flex: 1 },
        { type: 'spacer', classes: 'green', maxWidth: 80, flex: 1 },
        { type: 'spacer', classes: 'blue', flex: 1 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 160, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [160, 0, 80, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [240, 0, 160, 20]);
  });

  suite.test('pack: start, flex: 1, minWidth: 150 on second', function () {
    const panel = renderPanel({
      pack: 'start',
      width: 400,
      items: [
        { type: 'spacer', classes: 'red', flex: 1 },
        { type: 'spacer', classes: 'green', minWidth: 150, flex: 1 },
        { type: 'spacer', classes: 'blue', flex: 1 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 90, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [90, 0, 220, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [310, 0, 90, 20]);
  });

  suite.test('pack: start, flex: default, hide item and reflow', function () {
    const panel = renderPanel({
      pack: 'start',
      autoResize: true,
      items: [
        { type: 'spacer', classes: 'red' },
        { type: 'spacer', classes: 'green' },
        { type: 'spacer', classes: 'blue' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [20, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [40, 0, 20, 20]);

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 60, 20]);
    panel.items().eq(0).hide();
    panel.reflow();

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 40, 20]);
  });

  suite.test('pack: start, flex: 1, reflow after resize outer width', function () {
    const panel = renderPanel({
      pack: 'start',
      items: [
        { type: 'spacer', classes: 'red', flex: 1 },
        { type: 'spacer', classes: 'green', flex: 1 },
        { type: 'spacer', classes: 'blue', flex: 1 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [67, 0, 67, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [133, 0, 67, 20]);

    panel.layoutRect({ w: 400, h: 400 }).reflow();

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 400, 400]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 133, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [133, 0, 133, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [267, 0, 133, 20]);
  });

  suite.test('pack: start, maxWidth/maxHeight: 100, item minWidth/maxHeight: 200 (overflow W+H)', function () {
    const panel = renderPanel({
      pack: 'start',
      autoResize: true,
      autoScroll: true,
      maxWidth: 100,
      maxHeight: 100,
      items: [
        { type: 'spacer', minWidth: 200, minHeight: 200, classes: 'red dotted' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 100, 100]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 200, 200]);
    LegacyUnit.equal(panel.layoutRect().contentW, 200);
    LegacyUnit.equal(panel.layoutRect().contentH, 200);
  });

  suite.test('pack: start, direction: column, maxWidth/maxHeight: 100, padding: 20, spacing: 10, item minWidth/maxHeight: 200 (overflow W+H)', function () {
    const panel = renderPanel({
      pack: 'start',
      direction: 'column',
      autoResize: true,
      autoScroll: true,
      maxWidth: 100,
      maxHeight: 100,
      padding: 20,
      spacing: 10,
      items: [
        { type: 'spacer', minWidth: 100, minHeight: 100, classes: 'red dotted' },
        { type: 'spacer', minWidth: 100, minHeight: 100, classes: 'green dotted' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 100, 100]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [20, 20, 100, 100]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [20, 130, 100, 100]);
    LegacyUnit.equal(panel.layoutRect().contentW, 20 + 100 + 20);
    LegacyUnit.equal(panel.layoutRect().contentH, 20 + 100 + 10 + 100 + 20);
  });

  suite.test('pack: start, maxWidth/maxHeight: 100, item minWidth/maxHeight: 200 (overflow W)', function () {
    const panel = renderPanel({
      pack: 'start',
      autoResize: true,
      autoScroll: true,
      maxWidth: 100,
      items: [
        { type: 'spacer', minWidth: 200, minHeight: 200, classes: 'red dotted' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 200, 200]);
    LegacyUnit.equal(panel.layoutRect().contentW, 200);
    LegacyUnit.equal(panel.layoutRect().contentH, 200);
  });

  suite.test('pack: start, maxWidth/maxHeight: 100, item minWidth/maxHeight: 200 (overflow H)', function () {
    const panel = renderPanel({
      pack: 'start',
      autoResize: true,
      autoScroll: true,
      maxHeight: 100,
      items: [
        { type: 'spacer', minWidth: 200, minHeight: 200, classes: 'red dotted' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 200, 200]);
    LegacyUnit.equal(panel.layoutRect().contentW, 200);
    LegacyUnit.equal(panel.layoutRect().contentH, 200);
  });

  suite.test('pack: start, minWidth: 200, item minWidth: 100 (underflow)', function () {
    const panel = renderPanel({
      pack: 'start',
      autoResize: true,
      minWidth: 200,
      items: [
        { type: 'spacer', minWidth: 100, classes: 'red' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 200, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 100, 20]);
  });

  suite.test('pack: start, flex: 1, border: 1, reflow after resize inner width', function () {
    const panel = renderPanel({
      pack: 'start',
      border: 1,
      items: [
        { type: 'spacer', classes: 'red', flex: 1 }
      ]
    });

    panel.layoutRect({ innerW: 400, innerH: 400 }).reflow();

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 402, 402]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [1, 1, 400, 20]);
  });

  suite.test('row flexbox in row flexbox', function () {
    const panel = renderPanel({
      type: 'panel',
      layout: 'flex',
      align: 'end',
      width: null,
      height: null,
      items: [
        { type: 'spacer', classes: 'red' },
        {
          type: 'panel', layout: 'flex', padding: 10, spacing: 10, items: [
            { type: 'spacer', classes: 'yellow' },
            { type: 'spacer', classes: 'magenta' }
          ]
        },
        { type: 'spacer', classes: 'green' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 110, 40]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('panel')[0]), [20, 0, 70, 40]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 20, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [30, 10, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [60, 10, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [90, 20, 20, 20]);
  });

  suite.test('row flexbox in row flexbox hide inner item and reflow', function () {
    const panel = renderPanel({
      type: 'panel',
      layout: 'flex',
      align: 'end',
      width: null,
      height: null,
      items: [
        { type: 'spacer', classes: 'red' },
        {
          type: 'panel', layout: 'flex', padding: 10, spacing: 10, items: [
            { type: 'spacer', classes: 'yellow' },
            { type: 'spacer', classes: 'magenta' }
          ]
        },
        { type: 'spacer', classes: 'green' }
      ]
    });

    panel.find('spacer')[1].hide().parent().reflow();

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 80, 40]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('panel')[0]), [20, 0, 40, 40]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 20, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [30, 10, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [60, 20, 20, 20]);
  });

  // Direction column tests

  const renderColumnPanel = function (settings) {
    settings.direction = 'column';
    return renderPanel(settings);
  };

  suite.test('direction: column, pack: default, align: default, flex: default', function () {
    const panel = renderColumnPanel({});

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 20, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 40, 20, 20]);
  });

  suite.test('direction: column, pack: default, flex: 1', function () {
    const panel = renderColumnPanel({
      defaults: { flex: 1 }
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 67, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 133, 20, 67]);
  });

  suite.test('direction: column, pack: default, flex: 1, minWidth: various', function () {
    const panel = renderColumnPanel({
      defaults: { flex: 1 },
      items: [
        { type: 'spacer', minHeight: 25, classes: 'red' },
        { type: 'spacer', minHeight: 30, classes: 'green' },
        { type: 'spacer', minHeight: 35, classes: 'blue' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 62]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 62, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 128, 20, 72]);
  });

  suite.test('direction: column, pack: start, flex: default', function () {
    const panel = renderColumnPanel({
      pack: 'start'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 20, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 40, 20, 20]);
  });

  suite.test('direction: column, pack: start, flex: 1', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      defaults: { flex: 1 }
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 67, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 133, 20, 67]);
  });

  suite.test('direction: column, pack: end, flex: default', function () {
    const panel = renderColumnPanel({
      pack: 'end'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 140, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 160, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 180, 20, 20]);
  });

  suite.test('direction: column, pack: end, flex: 1', function () {
    const panel = renderColumnPanel({
      pack: 'end',
      defaults: { flex: 1 }
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 67, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 133, 20, 67]);
  });

  suite.test('direction: column, pack: center, flex: default', function () {
    const panel = renderColumnPanel({
      pack: 'center'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 70, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 90, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 110, 20, 20]);
  });

  suite.test('direction: column, pack: center, flex: 1', function () {
    const panel = renderColumnPanel({
      pack: 'center',
      defaults: { flex: 1 }
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 67, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 133, 20, 67]);
  });

  suite.test('direction: column, pack: start, spacing: 3', function () {
    const panel = renderColumnPanel({
      layout: 'flex',
      pack: 'start',
      spacing: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 23, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 46, 20, 20]);
  });

  suite.test('direction: column, pack: end, spacing: 3', function () {
    const panel = renderColumnPanel({
      pack: 'end',
      spacing: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 134, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 157, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 180, 20, 20]);
  });

  suite.test('direction: column, pack: center, spacing: 3', function () {
    const panel = renderColumnPanel({
      pack: 'center',
      spacing: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 67, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 90, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 113, 20, 20]);
  });

  suite.test('direction: column, pack: start, padding: 3', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      padding: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [3, 23, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [3, 43, 20, 20]);
  });

  suite.test('direction: column, pack: start, spacing: 3, padding: 3', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      padding: 3,
      spacing: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [3, 26, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [3, 49, 20, 20]);
  });

  suite.test('direction: column, pack: start, align: start', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      align: 'start'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 20, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 40, 20, 20]);
  });

  suite.test('direction: column, pack start, align: center', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      align: 'center'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [90, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [90, 20, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [90, 40, 20, 20]);
  });

  suite.test('direction: column, pack: start, align: end', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      align: 'end'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [180, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [180, 20, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [180, 40, 20, 20]);
  });

  suite.test('direction: column, pack: start, align: stretch', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      align: 'stretch'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 200, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 20, 200, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 40, 200, 20]);
  });

  suite.test('direction: column, pack: start, padding: 3, align: stretch', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      align: 'stretch',
      padding: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 194, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [3, 23, 194, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [3, 43, 194, 20]);
  });

  suite.test('direction: column, pack: start, flex: mixed values', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      items: [
        { type: 'spacer', classes: 'red', flex: 0.3 },
        { type: 'spacer', classes: 'green', flex: 1 },
        { type: 'spacer', classes: 'blue', flex: 0.5 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 43]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 43, 20, 98]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 141, 20, 59]);
  });

  suite.test('direction: column, pack: justify', function () {
    const panel = renderColumnPanel({
      pack: 'justify'
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 90, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 180, 20, 20]);
  });

  suite.test('direction: column, pack: justify, padding: 3', function () {
    const panel = renderColumnPanel({
      pack: 'justify',
      padding: 3
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [3, 90, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [3, 177, 20, 20]);
  });

  suite.test('direction: column, pack: justify, minHeight: mixed values, padding: 3', function () {
    const panel = renderColumnPanel({
      pack: 'justify',
      padding: 3,
      items: [
        { type: 'spacer', classes: 'red' },
        { type: 'spacer', classes: 'green', minHeight: 80 },
        { type: 'spacer', classes: 'blue', minHeight: 50 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [3, 3, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [3, 45, 20, 80]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [3, 147, 20, 50]);
  });

  suite.test('direction: column, pack: start, flex: 1, maxHeight: 80 on second', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      height: 400,
      items: [
        { type: 'spacer', classes: 'red', flex: 1 },
        { type: 'spacer', classes: 'green', maxHeight: 80, flex: 1 },
        { type: 'spacer', classes: 'blue', flex: 1 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 160]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 160, 20, 80]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 240, 20, 160]);
  });

  suite.test('direction: column, pack: start, flex: 1, minHeight: 150 on second', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      height: 400,
      items: [
        { type: 'spacer', classes: 'red', flex: 1 },
        { type: 'spacer', classes: 'green', minHeight: 150, flex: 1 },
        { type: 'spacer', classes: 'blue', flex: 1 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 90]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 90, 20, 220]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 310, 20, 90]);
  });

  suite.test('direction: column, pack: start, flex: 1, reflow after resize outer height', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      items: [
        { type: 'spacer', classes: 'red', flex: 1 },
        { type: 'spacer', classes: 'green', flex: 1 },
        { type: 'spacer', classes: 'blue', flex: 1 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 67, 20, 67]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 133, 20, 67]);

    panel.layoutRect({ w: 400, h: 400 }).reflow();

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 400, 400]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 0, 20, 133]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [0, 133, 20, 133]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [0, 267, 20, 133]);
  });

  suite.test('direction: column, pack: start, flex: 1, border: 1, reflow after resize inner width', function () {
    const panel = renderColumnPanel({
      pack: 'start',
      border: 1,
      items: [
        { type: 'spacer', classes: 'red', flex: 1 }
      ]
    });

    panel.layoutRect({ innerW: 400, innerH: 400 }).reflow();

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 402, 402]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [1, 1, 20, 400]);
  });

  suite.test('direction: column, row flexbox in row flexbox and resize parent', function () {
    const panel = renderPanel({
      type: 'panel',
      layout: 'flex',
      align: 'end',
      width: null,
      height: null,
      items: [
        { type: 'spacer', classes: 'red' },
        {
          type: 'panel', layout: 'flex', padding: 10, spacing: 10, items: [
            { type: 'spacer', classes: 'yellow' },
            { type: 'spacer', classes: 'magenta' }
          ]
        },
        { type: 'spacer', classes: 'green' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 110, 40]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('panel')[0]), [20, 0, 70, 40]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [0, 20, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[1]), [30, 10, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[2]), [60, 10, 20, 20]);
    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel.find('spacer')[3]), [90, 20, 20, 20]);
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  });
});
