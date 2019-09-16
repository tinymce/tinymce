/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Behaviour, SimpleSpec } from '@ephox/alloy';
import { Result } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import * as StickyHeader from './StickyHeader';
import * as StaticHeader from './StaticHeader';

export interface HeaderSpec extends SimpleSpec {
  sticky: boolean;
  editor: Editor;
  getSink: () => Result<AlloyComponent, Error>;
}

const renderHeader = (spec: HeaderSpec): AlloySpec => {
  const editor = spec.editor;
  const getBehaviours = spec.sticky ? StickyHeader.getBehaviours : StaticHeader.getBehaviours;
  return {
    uid: spec.uid,
    dom: spec.dom,
    components: spec.components,
    behaviours: Behaviour.derive(getBehaviours(editor, spec.getSink))
  };
};

export { renderHeader };
