import BasicPage from 'ephox/boss/api/BasicPage';
import { Element } from '@ephox/sugar';

var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
var boss = BasicPage();
boss.connect(ephoxUi);
