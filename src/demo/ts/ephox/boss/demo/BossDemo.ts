import { document } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';
import BasicPage from 'ephox/boss/api/BasicPage';

var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
var boss = BasicPage();
boss.connect(ephoxUi);
