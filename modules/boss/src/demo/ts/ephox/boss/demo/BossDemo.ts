import { document } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import BasicPage from 'ephox/boss/api/BasicPage';

const ephoxUi = Element.fromDom(Option.from(document.getElementById('ephox-ui')).getOrDie('Expected item on page with id "ephox-ui"'));
const boss = BasicPage();
boss.connect(ephoxUi);
