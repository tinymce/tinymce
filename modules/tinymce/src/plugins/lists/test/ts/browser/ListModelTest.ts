import { Arbitraries } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

import { composeList } from 'tinymce/plugins/lists/listModel/ComposeList';
import { Entry } from 'tinymce/plugins/lists/listModel/Entry';
import { normalizeEntries } from 'tinymce/plugins/lists/listModel/NormalizeEntries';
import { parseLists } from 'tinymce/plugins/lists/listModel/ParseLists';
import { ListType } from 'tinymce/plugins/lists/listModel/Util';

describe('browser.tinymce.plugins.lists.ListModelTest', () => {
  // TODO: Migrate to fast-check
  it('TBA: Validate lists plugin model', () => {
    const arbitratyContent = Jsc.bless({
      generator: Arbitraries.content('inline').generator.map((el) => [ el ])
    });

    const arbitraryEntry = Jsc.record({
      isSelected: Jsc.constant(false),
      depth: Jsc.integer(1, 10),
      content: Jsc.small(arbitratyContent),
      listType: Jsc.oneof(Jsc.constant(ListType.OL), Jsc.constant(ListType.UL)),
      listAttributes: Jsc.oneof(Jsc.constant({}), Jsc.constant({ style: 'list-style-type: lower-alpha;' })),
      itemAttributes: Jsc.oneof(Jsc.constant({}), Jsc.constant({ style: 'color: red;' }))
    });

    const arbitraryEntries = Jsc.array(arbitraryEntry);

    const composeParseProperty = Jsc.forall(arbitraryEntries, (inputEntries: Entry[]) => {
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

    const errorMessage = (inputEntries: Entry[], outputEntries: Entry[]): string => '\nPretty print counterexample:\n' +
      `input: [${stringifyEntries(inputEntries)}\n]\n` +
      `output: [${stringifyEntries(outputEntries)}\n]`;

    const stringifyEntries = (entries: Entry[]): string => Arr.map(entries, stringifyEntry).join(',');

    const stringifyEntry = (entry: Entry): string => `\n  {
        depth: ${entry.depth}
        content: ${entry.content.length > 0 ? serializeElements(entry.content) : '[Empty]'}
        listType: ${entry.listType}
        isSelected: ${entry.isSelected}
        listAttributes: ${JSON.stringify(entry.listAttributes)}
        itemAttributes: ${JSON.stringify(entry.itemAttributes)}
      }`;

    const serializeElements = (elms: SugarElement[]): string => Arr.map(elms, (el) => el.dom.outerHTML).join('');

    Jsc.assert(composeParseProperty, {
      size: 500,
      tests: 500,
      quiet: true
    });
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
