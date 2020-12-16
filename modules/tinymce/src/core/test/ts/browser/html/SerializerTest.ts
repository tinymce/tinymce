import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import DomParser from 'tinymce/core/api/html/DomParser';
import Schema from 'tinymce/core/api/html/Schema';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';

UnitTest.asynctest('browser.tinymce.core.html.SerializerTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  suite.test('Basic serialization', () => {
    const serializer = HtmlSerializer();

    LegacyUnit.equal(serializer.serialize(DomParser().parse('text<text&')), 'text&lt;text&amp;');
    LegacyUnit.equal(
      serializer.serialize(DomParser().parse('<B>text</B><IMG src="1.gif">')),
      '<strong>text</strong><img src="1.gif" />'
    );
    LegacyUnit.equal(serializer.serialize(DomParser().parse('<!-- comment -->')), '<!-- comment -->');
    LegacyUnit.equal(serializer.serialize(DomParser().parse('<![CDATA[cdata]]>', { format: 'xml' })), '<![CDATA[cdata]]>');
    LegacyUnit.equal(serializer.serialize(DomParser().parse('<?xml attr="value" ?>', { format: 'xml' })), '<?xml attr="value" ?>');
    LegacyUnit.equal(serializer.serialize(DomParser().parse('<!DOCTYPE html>')), '<!DOCTYPE html>');
  });

  suite.test('Sorting of attributes', () => {
    const serializer = HtmlSerializer();

    LegacyUnit.equal(
      serializer.serialize(DomParser().parse('<b class="class" id="id">x</b>')),
      '<strong id="id" class="class">x</strong>'
    );
  });

  suite.test('Serialize with validate: true, when parsing with validate:false bug', () => {
    const schema = Schema({ valid_elements: 'b' });
    const serializer = HtmlSerializer({}, schema);

    LegacyUnit.equal(
      serializer.serialize(DomParser({ validate: false }, schema).parse('<b a="1" b="2">a</b><i a="1" b="2">b</i>')),
      '<b a="1" b="2">a</b><i a="1" b="2">b</i>'
    );
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
