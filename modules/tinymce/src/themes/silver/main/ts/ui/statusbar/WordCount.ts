import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Button, GuiFactory, Replacing, Representing, SimpleSpec, SystemEvents, Tabstopping
} from '@ephox/alloy';

import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { DisablingConfigs } from '../alien/DisablingConfigs';

interface WordCount {
  readonly words: number;
  readonly characters: number;
}

const enum WordCountMode {
  Words = 'words',
  Characters = 'characters'
}

export const renderWordCount = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const replaceCountText = (comp: AlloyComponent, count: WordCount, mode: WordCountMode) =>
    Replacing.set(comp, [ GuiFactory.text(providersBackstage.translate([ '{0} ' + mode, count[mode] ])) ]);

  return Button.sketch({
    dom: {
      // The tag for word count was changed to 'button' as Jaws does not read out spans.
      // Word count is just a toggle and changes modes between words and characters.
      tag: 'button',
      classes: [ 'tox-statusbar__wordcount' ]
    },
    components: [ ],
    buttonBehaviours: Behaviour.derive([
      DisablingConfigs.button(providersBackstage.isDisabled),
      ReadOnly.receivingConfig(),
      Tabstopping.config({ }),
      Replacing.config({ }),
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: {
            mode: WordCountMode.Words,
            count: { words: 0, characters: 0 }
          }
        }
      }),
      AddEventsBehaviour.config('wordcount-events', [
        AlloyEvents.runOnExecute((comp) => {
          const currentVal = Representing.getValue(comp);
          const newMode = currentVal.mode === WordCountMode.Words ? WordCountMode.Characters : WordCountMode.Words;
          Representing.setValue(comp, { mode: newMode, count: currentVal.count });
          replaceCountText(comp, currentVal.count, newMode);
        }),
        AlloyEvents.runOnAttached((comp) => {
          editor.on('wordCountUpdate', (e) => {
            const { mode } = Representing.getValue(comp);
            Representing.setValue(comp, { mode, count: e.wordCount });
            replaceCountText(comp, e.wordCount, mode);
          });
        })
      ])
    ]),
    eventOrder: {
      [SystemEvents.execute()]: [ 'disabling', 'alloy.base.behaviour', 'wordcount-events' ]
    }
  });
};
