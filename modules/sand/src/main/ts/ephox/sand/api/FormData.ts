import Global from '../util/Global';
import { FormData } from '@ephox/dom-globals';

export default function () {
  const f: typeof FormData = Global.getOrDie('FormData');
  return new f();
};