/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Checkbox from './Checkbox';

/**
 * Creates a new radio button.
 *
 * @-x-less Radio.less
 * @class tinymce.ui.Radio
 * @extends tinymce.ui.Checkbox
 */

export default Checkbox.extend({
  Defaults: {
    classes: 'radio',
    role: 'radio'
  }
});