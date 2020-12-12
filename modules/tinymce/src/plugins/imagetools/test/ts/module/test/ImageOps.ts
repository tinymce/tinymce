import { Chain, Guard, Logger, Mouse, Pipeline, Step, UiFinder } from '@ephox/agar';
import { Fun, Result } from '@ephox/katamari';
import { TinyDom, TinyUi } from '@ephox/mcagar';
import { Attribute } from '@ephox/sugar';

export default (editor) => {
  const ui = TinyUi(editor);

  const cHasState = (predicate) => {
    return Chain.control(
      Chain.binder((element) => {
        return predicate(element) ? Result.value(element) : Result.error(`Predicate didn't match.`);
      }),
      Guard.addLogging('Assert element has state')
    );
  };

  const cWaitForState = (predicate) => {
    return Chain.control(
      cHasState(predicate),
      Guard.tryUntil('Predicate has failed.', 10, 3000)
    );
  };

  const cDragDrop = Chain.control(
    Chain.fromChains([
      UiFinder.cFindIn('.tox-slider__handle'),
      Mouse.cMouseDown,
      Mouse.cMouseMoveTo(5, 0),
      Mouse.cMouseUpTo(5, 0)
    ]),
    Guard.addLogging('Drag and drop')
  );

  const cExecCommandFromDialog = (label) => {
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
        cInteractWithUi = cDragDrop;
        break;

      default:
        cInteractWithUi = Chain.wait(1);
    }

    return Chain.control(
      Chain.fromChains([
        cClickToolbarButton('Edit image'),
        Chain.fromParent(ui.cWaitForPopup('wait for Edit Image dialog', '[role="dialog"]'), [
          ui.cWaitForUi('wait for canvas', '.tox-image-tools__image > img'),
          Chain.wait(200),
          cClickToolbarButton(label),
          cInteractWithUi,
          Chain.wait(200),
          cClickButton('Apply'),
          cClickButton('Save'),
          cWaitForDialogClose()
        ])
      ]),
      Guard.addLogging(`Execute ${label} command from dialog`)
    );
  };

  const cWaitForUi = (label, selector) => {
    return Chain.control(
      UiFinder.cWaitForState(label, selector, Fun.always),
      Guard.addLogging('Wait for UI')
    );
  };

  const cWaitForDialogClose = () => Chain.control(
    UiFinder.cNotExists('[role="dialog"]'),
    Guard.tryUntil('Waiting for dialog to go away', 10, 3000)
  );

  const cClickButton = (text) => {
    return Chain.control(
      Chain.fromChains([
        cWaitForUi('wait for ' + text + ' button', 'button:contains(' + text + ')'),
        cWaitForState((el) => {
          return Attribute.get(el, 'disabled') === undefined;
        }),
        Mouse.cClick
      ]),
      Guard.addLogging('Wait for UI')
    );
  };

  const cClickToolbarButton = (label) => {
    return Chain.control(
      Chain.fromChains([
        UiFinder.cFindIn('button[aria-label="' + label + '"]'),
        cWaitForState((el) => {
          return Attribute.get(el, 'disabled') === undefined;
        }),
        Mouse.cClick
      ]),
      Guard.addLogging('Wait for UI')
    );
  };

  const sWaitForUrlChange = (imgEl, origUrl) => {
    return Logger.t('Wait for url change', Chain.asStep(imgEl, [
      cWaitForState((el) => {
        return Attribute.get(el, 'src') !== origUrl;
      })
    ]));
  };

  const sExec = (execFromToolbar, label) => {
    return Logger.t(`Execute ${label}`, Step.async((next, die) => {
      const imgEl = TinyDom.fromDom(editor.selection.getNode());
      const origUrl = Attribute.get(imgEl, 'src');

      Pipeline.async({}, [
        Chain.asStep(imgEl, [
          Mouse.cClick,
          ui.cWaitForPopup('wait for Imagetools toolbar', '.tox-pop__dialog div'),
          execFromToolbar ? cClickToolbarButton(label) : cExecCommandFromDialog(label)
        ]),
        sWaitForUrlChange(imgEl, origUrl)
      ], () => {
        next();
      }, die);
    }));
  };

  return {
    sExecToolbar: Fun.curry(sExec, true),
    sExecDialog: Fun.curry(sExec, false),
    cClickToolbarButton
  };
};
