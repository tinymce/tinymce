import RealKeys from './RealKeys';
import SeleniumAction from '../server/SeleniumAction';
import { PlatformDetection } from '@ephox/sand';

var platform = PlatformDetection.detect();

var sImportToClipboard = function (filename) {
  return SeleniumAction.sPerform('/clipboard', {
    'import': filename
  });
};

var sCopy = function (selector) {
  var modifiers = platform.os.isOSX() ? { metaKey: true } : { ctrlKey: true };
  return RealKeys.sSendKeysOn(selector, [
    RealKeys.combo(modifiers, 'c')
  ]);
};

var sPaste = function (selector) {
  var modifiers = platform.os.isOSX() ? { metaKey: true } : { ctrlKey: true };
  return RealKeys.sSendKeysOn(selector, [
    RealKeys.combo(modifiers, 'v')
  ]);
};

export default <any> {
  sImportToClipboard: sImportToClipboard,
  sCopy: sCopy,
  sPaste: sPaste
};