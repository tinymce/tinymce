import { Logger, GeneralSteps, Files, DragnDrop as Dnd } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { DragnDrop } from 'ephox/alloy/api/behaviour/DragnDrop';
import { Arr } from '@ephox/katamari';
import TestStore from 'ephox/alloy/api/testhelpers/TestStore';
import { StartingDragndropConfigSpec, DropDragndropConfigSpec } from 'ephox/alloy/dragging/dragndrop/DragnDropTypes';
import { Blob, DataTransfer } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';

UnitTest.asynctest('DragnDropTest', (success, failure) => {
  const platform = PlatformDetection.detect();

  const createDraggable = (store: TestStore, cls: string, overrides: Partial<StartingDragndropConfigSpec>) => {
    return Container.sketch({
      dom: {
        styles: {
          width: '100px',
          height: '100px',
          background: 'red'
        },
        classes: [ cls ]
      },
      containerBehaviours: Behaviour.derive([
        DragnDrop.config({
          mode: 'drag',
          canDrag: (component, target) => {
            store.add('canDrag');
            return true;
          },
          onDragstart: (component, simulatedEvent) => {
            store.add('onDragstart');
          },
          onDragover: (component, simulatedEvent) => {
            store.add('onDragover');
          },
          onDragend: (component, simulatedEvent) => {
            store.add('onDragend');
          },
          ...overrides
        })
      ])
    });
  };

  const createDropZone = (store: TestStore, cls: string, overrides: Partial<DropDragndropConfigSpec>) => {
    return Container.sketch({
      dom: {
        styles: {
          width: '100px',
          height: '100px',
          background: 'blue'
        },
        classes: [ cls ]
      },
      containerBehaviours: Behaviour.derive([
        DragnDrop.config({
          mode: 'drop',
          onDrop: (comp, dropEvent) => {
            const files = Arr.map(dropEvent.files, ({ name, size, type, lastModified }) => {
              return { name, size, type, lastModified }
            })
            store.add({ type: 'drop', files, data: dropEvent.data });
          },
          onDrag: (component, simulatedEvent) => {
            store.add('onDrag');
          },
          onDragover: (component, simulatedEvent) => {
            store.add('onDragover');
          },
          onDragenter: (component, simulatedEvent) => {
            store.add('onDragenter');
          },
          onDragleave: (component, simulatedEvent) => {
            store.add('onDragleave');
          },
          ...overrides
        })
      ])
    });
  }

  const sAssertDraggedData = (label: string, store: TestStore, expectedDropData: Record<string, any>) => {
    return store.sAssertEq(label, ['canDrag', 'onDragstart', 'onDragenter', 'onDragover', {
      type: 'drop',
      files: [],
      ...expectedDropData
    }, 'onDragend' ])
  };

  const sAssertDraggedFiles = (label: string, store: TestStore, expectedDropFiles: Record<string, any>[]) => {
    return store.sAssertEq(label, ['canDrag', 'onDragstart', 'onDragenter', 'onDragover', {
      type: 'drop',
      data: '',
      files: expectedDropFiles
    }, 'onDragend' ])
  };

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        components: [
          createDropZone(store, 'dropzoneA', {}),
          createDropZone(store, 'dropzoneB', {
            type: 'text/html'
          }),

          createDropZone(store, 'dropzoneCopy', {
            dropEffect: 'copy'
          }),

          createDropZone(store, 'dropzoneMove', {
            dropEffect: 'move'
          }),

          createDraggable(store, 'draggableDataA', {
            getData: (comp) => {
              return 'a';
            }
          }),

          createDraggable(store, 'draggableDataB', {
            type: 'text/html',
            getData: (comp) => {
              return 'b';
            }
          }),

          createDraggable(store, 'draggableDataC', {
            onDragstart: (comp, simulatedEvent) => {
              const rawEvent: any = simulatedEvent.event().raw();
              const transfer: DataTransfer = rawEvent.dataTransfer;
              transfer.items.add('c', 'text/plain');
              store.add('onDragstart');
            }
          }),

          createDraggable(store, 'draggableCopy', {
            effectAllowed: 'copy',
            getData: (comp) => {
              return 'copy';
            }
          }),

          createDraggable(store, 'draggableMove', {
            effectAllowed: 'move',
            getData: (comp) => {
              return 'move';
            }
          }),

          createDraggable(store, 'draggableFilesA', {
            onDragstart: (comp, simulatedEvent) => {
              const rawEvent: any = simulatedEvent.event().raw();
              const transfer: DataTransfer = rawEvent.dataTransfer;
              transfer.items.add(Files.createFile('a.html', 1234, new Blob(['abc'], { type: 'text/html' })));
              transfer.items.add(Files.createFile('b.txt', 123, new Blob(['abcd'], { type: 'text/plain' })));
              store.add('onDragstart');
            }
          })
        ]
      })
    );
  }, (doc, body, gui, component, store) => {
    return [
      Logger.t('Drag and drop with getData', GeneralSteps.sequence([
        store.sClear,
        Dnd.sDragnDrop('.draggableDataA', '.dropzoneA'),
        sAssertDraggedData('Should have expected data', store, { data: 'a' }),

        store.sClear,
        Dnd.sDragnDrop('.draggableDataB', '.dropzoneB'),
        sAssertDraggedData('Should have expected data', store, { data: 'b' })
      ])),

      Logger.t('Drag and drop with custom dataTransfer code', GeneralSteps.sequence(platform.browser.isIE() ? [] : [
        store.sClear,
        Dnd.sDragnDrop('.draggableDataC', '.dropzoneA'),
        sAssertDraggedData('Should have expected data', store, { data: 'c' })
      ])),

      Logger.t('Drag and drop with files', GeneralSteps.sequence([
        store.sClear,
        Dnd.sDragnDrop('.draggableFilesA', '.dropzoneA'),
        sAssertDraggedFiles('Should have expected files', store, [
          { name: "a.html", size: 3, type: "text/html", lastModified: 1234 },
          { name: "b.txt", size: 4, type: "text/plain", lastModified: 123 }
        ]),
      ])),

      Logger.t('Drag and drop copy to copy', GeneralSteps.sequence([
        store.sClear,
        Dnd.sDragnDrop('.draggableCopy', '.dropzoneCopy'),
        sAssertDraggedData('Should have expected data', store, { data: 'copy' }),
      ])),

      Logger.t('Drag and drop move to move', GeneralSteps.sequence([
        store.sClear,
        Dnd.sDragnDrop('.draggableMove', '.dropzoneMove'),
        sAssertDraggedData('Should have expected data', store, { data: 'move' }),
      ])),

      Logger.t('Drag and drop move to copy', GeneralSteps.sequence([
        store.sClear,
        Dnd.sDragnDrop('.draggableMove', '.dropzoneCopy'),
        store.sAssertEq('Should not include drop since it is a invalid drop', ['canDrag', 'onDragstart', 'onDragenter', 'onDragover', 'onDragend'])
      ]))
    ];
  }, () => success(), failure);
});
