/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyEvents, Behaviour, Button, GuiFactory, Replacing, Representing, SimpleSpec, SystemEvents, Tabstopping } from '@ephox/alloy';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import Editor from 'tinymce/core/api/Editor';

const enum WordCountMode {
  Words = 'words',
  Characters = 'characters'
}

export const renderWordCount = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const replaceCountText = (comp, count, mode) => Replacing.set(comp, [ GuiFactory.text(providersBackstage.translate(['{0} ' + mode, count[mode]])) ]);
  return Button.sketch({
    dom: {
      // The tag for word count was changed to 'button' as Jaws does not read out spans.
      // Word count is just a toggle and changes modes between words and characters.
      tag: 'button',
      classes: [ 'tox-statusbar__wordcount' ]
    },
    components: [ ],
    buttonBehaviours: Behaviour.derive([
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
        AlloyEvents.run(SystemEvents.tapOrClick(), (comp) => {
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
      [SystemEvents.tapOrClick()]: [ 'wordcount-events', 'alloy.base.behaviour' ]
    }
  });
};