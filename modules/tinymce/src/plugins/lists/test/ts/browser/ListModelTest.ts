import { Arbitraries } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as fc from 'fast-check';

import { composeList } from 'tinymce/plugins/lists/listmodel/ComposeList';
import { Entry, isEntryList } from 'tinymce/plugins/lists/listmodel/Entry';
import { normalizeEntries } from 'tinymce/plugins/lists/listmodel/NormalizeEntries';
import { parseLists } from 'tinymce/plugins/lists/listmodel/ParseLists';
import { ListType } from 'tinymce/plugins/lists/listmodel/Util';

describe('browser.tinymce.plugins.lists.ListModelTest', () => {
  it('TBA: Validate lists plugin model', () => {
    const arbitraryContent = Arbitraries.content('inline').map((el) => [ el ]);

    const arbitraryEntry = fc.record({
      isSelected: fc.constant(false),
      dirty: fc.constant(false),
      depth: fc.integer({ min: 1, max: 10 }),
      content: arbitraryContent,
      listType: fc.constantFrom(ListType.OL, ListType.UL),
      listAttributes: fc.constantFrom({}, { style: 'list-style-type: lower-alpha;' }),
      itemAttributes: fc.constantFrom({}, { style: 'color: red;' }),
      isInPreviousLi: fc.constant(false)
    });

    const arbitraryEntries = fc.array(arbitraryEntry);

    const composeParseProperty = fc.property(arbitraryEntries, (inputEntries: Entry[]) => {
      normalizeEntries(inputEntries);
      const outputEntries = composeParse(inputEntries);
      return isEqualEntries(inputEntries, outputEntries) || errorMessage(inputEntries, outputEntries);
    });

    const composeParse = (entries: Entry[]): Entry[] => composeList(document, entries)
      .map((list) => parseLists([ list ], Optional.none()))
      .bind(Arr.head)
      .map((entrySet) => entrySet.entries)
      .getOr([]);

    const isEqualEntries = (a: Entry[], b: Entry[]): boolean => stringifyEntries(a) === stringifyEntries(b);

    const errorMessage = (inputEntries: Entry[], outputEntries: Entry[]): never => {
      throw new Error('\nPretty print counterexample:\n' +
        `input: [${stringifyEntries(inputEntries)}\n]\n` +
        `output: [${stringifyEntries(outputEntries)}\n]`);
    };

    const stringifyEntries = (entries: Entry[]): string => Arr.map(entries, stringifyEntry).join(',');

    const stringifyEntry = (entry: Entry): string => isEntryList(entry) ? `\n  {
        depth: ${entry.depth}
        content: ${entry.content.length > 0 ? serializeElements(entry.content) : '[Empty]'}
        listType: ${entry.listType}
        isSelected: ${entry.isSelected}
        listAttributes: ${JSON.stringify(entry.listAttributes)}
        itemAttributes: ${JSON.stringify(entry.itemAttributes)}
      }` : '';

    const serializeElements = (elms: SugarElement[]): string => Arr.map(elms, (el) => el.dom.outerHTML).join('');

    fc.assert(composeParseProperty, { numRuns: 200 });
  });

  // Manual testing. To simplify debugging once a counterexample has been found.
  /* const inputEntries: Entry[] = [
    {
      depth: 2,
      content: [SugarElement.fromHtml('<i>stuff</i>')],
      listType: ListType.OL,
      isSelected: false,
      listAttributes: {style: 'list-style-type: lower-alpha;'},
      itemAttributes: {}
    }
  ];
  throw composeParse(inputEntries); */
});
