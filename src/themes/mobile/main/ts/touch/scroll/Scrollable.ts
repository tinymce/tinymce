/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { Class } from '@ephox/sugar';
import Styles from '../../style/Styles';

const scrollable = Styles.resolve('scrollable');

const register = function (element) {
/*
 *  The reason this function exists is to have a
 *  central place where to set if an element can be explicitly
 *  scrolled. This is for mobile devices atm.
 */
  Class.add(element, scrollable);
};

const deregister = function (element) {
  Class.remove(element, scrollable);
};

export default {
  register,
  deregister,
  scrollable: Fun.constant(scrollable)
};