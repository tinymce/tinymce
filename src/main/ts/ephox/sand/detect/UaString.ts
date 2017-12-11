import { Arr } from '@ephox/katamari';
import Version from './Version';

var detect = function (candidates, userAgent) {
  var agent = String(userAgent).toLowerCase();
  return Arr.find(candidates, function (candidate) {
    return candidate.search(agent);
  });
};

// They (browser and os) are the same at the moment, but they might
// not stay that way.
var detectBrowser = function (browsers, userAgent) {
  return detect(browsers, userAgent).map(function (browser) {
    var version = Version.detect(browser.versionRegexes, userAgent);
    return {
      current: browser.name,
      version: version
    };
  });
};

var detectOs = function (oses, userAgent) {
  return detect(oses, userAgent).map(function (os) {
    var version = Version.detect(os.versionRegexes, userAgent);
    return {
      current: os.name,
      version: version
    };
  });
};

export default <any> {
  detectBrowser: detectBrowser,
  detectOs: detectOs
};