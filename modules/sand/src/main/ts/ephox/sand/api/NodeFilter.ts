import Global from '../util/Global';
import { NodeFilter } from '@ephox/dom-globals';

export default function () {
  const f: typeof NodeFilter = Global.getOrDie('NodeFilter');
  return f;
};