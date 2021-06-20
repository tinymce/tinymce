import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import BasicPage from 'ephox/boss/api/BasicPage';

const ephoxUi = SugarElement.fromDom(Optional.from(document.getElementById('ephox-ui')).getOrDie('Expected item on page with id "ephox-ui"'));
const boss = BasicPage();
boss.connect(ephoxUi);
