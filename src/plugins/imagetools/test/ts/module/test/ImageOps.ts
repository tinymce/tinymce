import { Chain, Guard, Mouse, Pipeline, Step, UiFinder } from '@ephox/agar';
import * as Clicks from '@ephox/agar/lib/main/ts/ephox/agar/mouse/Clicks';
import { Fun, Result } from '@ephox/katamari';
import { TinyDom, TinyUi } from '@ephox/mcagar';
import { Attr, DomEvent, PredicateFilter, Selectors, Visibility, Element } from '@ephox/sugar';

export default function (editor) {
  const ui = TinyUi(editor);

  const cHasState = function (predicate) {
    return Chain.binder(function (element) {
      return predicate(element) ? Result.value(element) : Result.error('Predicate didn\'t match.');
    });
  };

  const cWaitForState = function (predicate) {
    return Chain.control(
      cHasState(predicate),
      Guard.tryUntil('Predicate has failed.', 10, 3000)
    );
  };

  const cWaitForChain = function (chain) {
    return Chain.control(
      chain,
      Guard.tryUntil('Chain has failed.', 10, 3000)
    );
  };

  const cFindChildWithState = function (selector, predicate) {
    return Chain.on(function (scope: Element, next, die) {
      const children = PredicateFilter.descendants(scope, function (element) {
        return Selectors.is(element, selector) && predicate(element);
      });
      children.length ? next(Chain.wrap(children[0])) : die('No children with state');
    });
  };

  const cDragSlider = Chain.fromChains([
    UiFinder.cFindIn('div[role="slider"]'),
    Chain.on(function (element, next, die) {
      const unbindMouseMove = DomEvent.bind(element, 'mousemove', function (e) {
        Clicks.mouseup(element);
        unbindMouseMove();
        next(Chain.wrap(element));
      }).unbind;

      const unbindMouseDown = DomEvent.bind(element, 'mousedown', function (e) {
        Clicks.mousemove(element); // not sure if xy actually matters here
        unbindMouseDown();
      }).unbind;

      Clicks.mousedown(element);
    })
  ]);

  const cExecCommandFromDialog = function (label) {
    let cInteractWithUi;

    switch (label) {
      case 'Rotate counterclockwise':
      case 'Rotate clockwise':
      case 'Flip vertically':
      case 'Flip horizontally':
        // Orientation operations, like Flip or Rotate are grouped in a sub-panel
        cInteractWithUi = cClickToolbarButton(label);
        label = 'Orientation';
        break;

      case 'Brightness':
      case 'Contrast':
      case 'Color levels':
      case 'Gamma':
        cInteractWithUi = cDragSlider;
        break;

      default:
        cInteractWithUi = Chain.wait(1);
    }

    return Chain.fromChains([
      cClickToolbarButton('Edit image'),
      Chain.fromParent(ui.cWaitForPopup('wait for Edit Image dialog', 'div[aria-label="Edit image"][role="dialog"]'), [
        ui.cWaitForUi('wait for canvas', '.mce-imagepanel > img'),
        cClickToolbarButton(label),
        Chain.fromParent(cWaitForChain(cFindChildWithState('.mce-container.mce-form', Visibility.isVisible)), [
          Chain.fromChains([
            cInteractWithUi
          ]),
          cClickButton('Apply')
        ]),
        ui.cWaitForUi('wait for Save button to become enabled', 'div[role="button"]:contains(Save):not(.mce-disabled)'),
        cClickButton('Save')
      ])
    ]);
  };

  const cWaitForUi = function (label, selector) {
    return UiFinder.cWaitForState(label, selector, Fun.constant(true));
  };

  const cClickButton = function (text) {
    return Chain.fromChains([
      cWaitForUi('wait for ' + text + ' button', 'div[role="button"]:contains(' + text + '):not(.mce-disabled)'),
      Mouse.cClick
    ]);
  };

  const cClickToolbarButton = function (label) {
    return Chain.fromChains([
      UiFinder.cFindIn('div[aria-label="' + label + '"][role="button"]'),
      Mouse.cClick
    ]);
  };

  const sWaitForUrlChange = function (imgEl, origUrl) {
    return Chain.asStep(imgEl, [
      cWaitForState(function (el) {
        return Attr.get(el, 'src') !== origUrl;
      })
    ]);
  };

  const sExec = function (execFromToolbar, label) {
    return Step.async(function (next, die) {
      const imgEl = TinyDom.fromDom(editor.selection.getNode());
      const origUrl = Attr.get(imgEl, 'src');

      Pipeline.async({}, [
        Chain.asStep(imgEl, [
          Mouse.cClick,
          ui.cWaitForPopup('wait for Imagetools toolbar', 'div[aria-label="Inline toolbar"][role="dialog"]'),
          execFromToolbar ? cClickToolbarButton(label) : cExecCommandFromDialog(label)
        ]),
        sWaitForUrlChange(imgEl, origUrl)
      ], function () {
        next();
      }, die);
    });
  };

  return {
    sExecToolbar: Fun.curry(sExec, true),
    sExecDialog: Fun.curry(sExec, false)
  };
}