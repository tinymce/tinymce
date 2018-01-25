import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.ui.WindowTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  const createWindow = function (settings) {
    return Factory.create(Tools.extend({
      type: 'window'
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  suite.test('window x, y, w, h', function () {
    const win = createWindow({ x: 100, y: 120, width: 200, height: 210 });

    UiUtils.nearlyEqualRects(UiUtils.size(win), [200, 210]);
  });

  suite.test('no title, no buttonbar, autoResize', function () {
    const win = createWindow({
      x: 100,
      y: 120,
      items: [
        { type: 'spacer', classes: 'red' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.size(win), [22, 22]);
    UiUtils.nearlyEqualRects(UiUtils.size(win.find('spacer')[0]), [20, 20]);
    win.close();
  });

  suite.test('title, no buttonbar, autoResize, title is widest', function () {
    const win1 = createWindow({
      x: 100,
      y: 120,
      title: 'XXXXXXXXXXXXXXXXXXX',
      items: [
        { type: 'spacer', classes: 'red', flex: 1 }
      ]
    });

    const win2 = createWindow({
      x: 100,
      y: 120,
      title: 'XXXXXXXXXXXXXXXXXXXXXX',
      items: [
        { type: 'spacer', classes: 'red', flex: 1 }
      ]
    });

    LegacyUnit.equal(UiUtils.size(win2)[0] > UiUtils.size(win1)[0], true, 'Window 2 should be wider since the title spaces out the window');
    LegacyUnit.equal(UiUtils.size(win2.find('spacer')[0]) > UiUtils.size(win1.find('spacer')[0]), true, 'Window 2 spacer should be widger than window 1');

    win1.close();
    win2.close();
  });

  suite.test('buttonbar, autoResize, buttonbar is widest', function () {
    const win = createWindow({
      x: 100,
      y: 120,
      items: [
        { type: 'spacer', classes: 'red', flex: 1 }
      ],
      buttons: [
        { type: 'spacer', classes: 'green', minWidth: 400 }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.size(win), [422, 63]);
    UiUtils.nearlyEqualRects(UiUtils.size(win.find('spacer')[0]), [420, 20]);
    UiUtils.nearlyEqualRects(UiUtils.size(win.statusbar.find('spacer')[0]), [400, 20]);

    win.close();
  });

  suite.test('buttonbar, title, autoResize, content is widest', function () {
    const win = createWindow({
      x: 100,
      y: 120,
      title: 'X',
      items: [
        { type: 'spacer', classes: 'red', minWidth: 400 }
      ],
      buttons: [
        { type: 'spacer', classes: 'green' }
      ]
    });

    UiUtils.nearlyEqualRects(UiUtils.size(win), [402, 102]);
    UiUtils.nearlyEqualRects(UiUtils.size(win.getEl('head')), [400, 39]);
    UiUtils.nearlyEqualRects(UiUtils.size(win.find('spacer')[0]), [400, 20]);
    UiUtils.nearlyEqualRects(UiUtils.size(win.statusbar.find('spacer')[0]), [20, 20]);

    win.close();
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      DOMUtils.DOM.remove(DOMUtils.DOM.get('mce-modal-block'));
      viewBlock.detach();
      success();
    }, failure);
  });
});
