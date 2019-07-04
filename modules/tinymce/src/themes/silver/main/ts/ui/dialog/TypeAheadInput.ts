/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Button as AlloyButton, Container as AlloyContainer, SketchSpec } from '@ephox/alloy';
import { AutocompleteSpec, renderAutocomplete } from 'tinymce/themes/silver/ui/dialog/Autocomplete';
import { UiFactoryBackstage } from '../../backstage/Backstage';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import * as Icons from '../icons/Icons';

export interface TypeaheadInput extends AutocompleteSpec {
  icon: string;
}

export const renderTypeahead = (spec: TypeaheadInput, backstage: UiFactoryBackstage): SketchSpec => {
  return AlloyContainer.sketch({
    dom: {
      tag: 'div'
    },
    components: [
      renderAutocomplete(spec, backstage),

      AlloyButton.sketch({
        dom: {
          tag: 'button',
          innerHtml: Icons.get(spec.icon, backstage.shared.providers.icons)
        }
      })
    ],

    containerBehaviours: Behaviour.derive([
      ComposingConfigs.self(),
      RepresentingConfigs.memory('NOT IMPLEMENTED')
    ])
  });
};
