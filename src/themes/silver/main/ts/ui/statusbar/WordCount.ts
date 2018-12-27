/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Replacing, GuiFactory, SimpleSpec, Behaviour, Representing, AddEventsBehaviour, AlloyEvents, NativeEvents, Focusing, Tabstopping } from '@ephox/alloy';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { Editor } from 'tinymce/core/api/Editor';

const enum WordCountMode {
  Words = 'words',
  Characters = 'characters'
}

export const renderWordCount = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const replaceCountText = (comp, count, mode) => Replacing.set(comp, [ GuiFactory.text(providersBackstage.translate(['{0} ' + mode, count[mode]])) ]);
  return {
    dom: {
      tag: 'button',
      classes: [ 'tox-statusbar__wordcount' ],
      attributes: {
        'aria-live': 'polite',
        'title': 'word count'
      }
    },
    components: [ ],
    behaviours: Behaviour.derive([
      Tabstopping.config({ }),
      Focusing.config({ }),
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
        AlloyEvents.run(NativeEvents.click(), (comp) => {
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
    ])
  };
};