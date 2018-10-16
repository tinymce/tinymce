import { document } from '@ephox/dom-globals';
import PlatformDetection from 'ephox/sand/api/PlatformDetection';

const platform = PlatformDetection.detect();

const ephoxUi = document.querySelector('#ephox-ui');
ephoxUi.innerHTML = 'You are using: ' + platform.browser.current;
