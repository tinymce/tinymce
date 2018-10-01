import { Behaviour, Button as AlloyButton, Container as AlloyContainer, SketchSpec } from '@ephox/alloy';
import { AutocompleteGoo, renderAutocomplete } from 'tinymce/themes/silver/ui/dialog/Autocomplete';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import * as Icons from '../icons/Icons';

export interface TypeaheadInput extends AutocompleteGoo {
  icon: string;
}

export const renderTypeahead = (spec: TypeaheadInput, sharedBackstage: UiFactoryBackstageShared): SketchSpec => {
  return AlloyContainer.sketch({
    dom: {
      tag: 'div'
    },
    components: [
      renderAutocomplete(spec, sharedBackstage),

      AlloyButton.sketch({
        dom: {
          tag: 'button',
          innerHtml: Icons.get(spec.icon, sharedBackstage.providers.icons)
        }
      })
    ],

    containerBehaviours: Behaviour.derive([
      ComposingConfigs.self(),
      RepresentingConfigs.memory('NOT IMPLEMENTED')
    ])
  });
};
