import PlatformDetection from 'ephox/sand/api/PlatformDetection';

var platform = PlatformDetection.detect();

var ephoxUi = document.querySelector('#ephox-ui');
ephoxUi.innerHTML = 'You are using: ' + platform.browser.current;
