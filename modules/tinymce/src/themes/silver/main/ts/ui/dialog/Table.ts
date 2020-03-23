/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { SimpleSpec, Behaviour, Tabstopping, Focusing } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';
import { Omit } from '../Omit';

type TableSpec = Omit<Types.Table.Table, 'type'>;

export const renderTable = (spec: TableSpec, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const renderTh = (text: string) => ({
    dom: {
      tag: 'th',
      innerHtml: providersBackstage.translate(text)
    }
  });
  const renderHeader = (header: string[]) => ({
    dom: {
      tag: 'thead'
    },
    components: [
      {
        dom: {
          tag: 'tr'
        },
        components: Arr.map(header, renderTh)
      }
    ]
  });
  const renderTd = (text: string) => ({ dom: { tag: 'td', innerHtml: providersBackstage.translate(text) }});
  const renderTr = (row: string[]) => ({ dom: { tag: 'tr' }, components: Arr.map(row, renderTd) });
  const renderRows = (rows: string[][]) => ({ dom: { tag: 'tbody' }, components: Arr.map(rows, renderTr) });
  return {
    dom: {
      tag: 'table',
      classes: [ 'tox-dialog__table' ]
    },
    components: [
      renderHeader(spec.header),
      renderRows(spec.cells)
    ],
    behaviours: Behaviour.derive([
      Tabstopping.config({ }),
      Focusing.config({ })
    ])
  };
};