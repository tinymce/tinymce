import { type AlloySpec, Behaviour, type SimpleSpec } from '@ephox/alloy';

import type Editor from 'tinymce/core/api/Editor';

import type { UiFactoryBackstageShared } from '../../backstage/Backstage';

import * as StaticHeader from './StaticHeader';
import * as StickyHeader from './StickyHeader';

export interface HeaderSpec extends SimpleSpec {
  sticky: boolean;
  editor: Editor;
  sharedBackstage: UiFactoryBackstageShared;
}

const renderHeader = (spec: HeaderSpec): AlloySpec => {
  const editor = spec.editor;
  const getBehaviours = spec.sticky ? StickyHeader.getBehaviours : StaticHeader.getBehaviours;
  return {
    uid: spec.uid,
    dom: spec.dom,
    components: spec.components,
    behaviours: Behaviour.derive(getBehaviours(editor, spec.sharedBackstage))
  };
};

export { renderHeader };
