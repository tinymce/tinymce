asynctest(
  'browser.tinymce.core.html.EntitiesTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.html.Entities'
  ],
  function (LegacyUnit, Pipeline, Entities) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test('encodeRaw', function () {
      LegacyUnit.equal(
        Entities.encodeRaw('<>"\'&\u00e5\u00e4\u00f6\u0060'),
        '&lt;&gt;"\'&amp;\u00e5\u00e4\u00f6\u0060',
        'Raw encoding text'
      );
      LegacyUnit.equal(
        Entities.encodeRaw('<>"\'&\u00e5\u00e4\u00f6\u0060', true),
        '&lt;&gt;&quot;\'&amp;\u00e5\u00e4\u00f6&#96;',
        'Raw encoding attribute'
      );
    });

    suite.test('encodeAllRaw', function () {
      LegacyUnit.equal(Entities.encodeAllRaw('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;&quot;&#39;&amp;\u00e5\u00e4\u00f6', 'Raw encoding all');
    });

    suite.test('encodeNumeric', function () {
      LegacyUnit.equal(
        Entities.encodeNumeric('<>"\'&\u00e5\u00e4\u00f6\u03b8\u2170\ufa11'),
        '&lt;&gt;"\'&amp;&#229;&#228;&#246;&#952;&#8560;&#64017;',
        'Numeric encoding text'
      );
      LegacyUnit.equal(
        Entities.encodeNumeric('<>"\'&\u00e5\u00e4\u00f6', true),
        '&lt;&gt;&quot;\'&amp;&#229;&#228;&#246;',
        'Numeric encoding attribute'
      );
    });

    suite.test('encodeNamed', function () {
      LegacyUnit.equal(Entities.encodeNamed('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&aring;&auml;&ouml;', 'Named encoding text');
      LegacyUnit.equal(
        Entities.encodeNamed('<>"\'&\u00e5\u00e4\u00f6', true),
        '&lt;&gt;&quot;\'&amp;&aring;&auml;&ouml;',
        'Named encoding attribute'
      );
      LegacyUnit.equal(
        Entities.encodeNamed('<>"\'\u00e5\u00e4\u00f6', false, { '\u00e5': '&aring;' }),
        '&lt;&gt;"\'&aring;\u00e4\u00f6',
        'Named encoding text'
      );
      LegacyUnit.equal(
        Entities.encodeNamed('<>"\'\u00e5\u00e4\u00f6', true, { '\u00e5': '&aring;' }),
        '&lt;&gt;&quot;\'&aring;\u00e4\u00f6',
        'Named encoding attribute'
      );
    });

    suite.test('getEncodeFunc', function () {
      var encodeFunc;

      encodeFunc = Entities.getEncodeFunc('raw');
      LegacyUnit.equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;\u00e5\u00e4\u00f6', 'Raw encoding text');
      LegacyUnit.equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true), '&lt;&gt;&quot;\'&amp;\u00e5\u00e4\u00f6', 'Raw encoding attribute');
      LegacyUnit.equal(encodeFunc('\ud87e\udc04'), '\ud87e\udc04', 'Raw high-byte encoding text');
      LegacyUnit.equal(encodeFunc('\ud87e\udc04', true), '\ud87e\udc04', 'Raw high-byte encoding attribute');

      encodeFunc = Entities.getEncodeFunc('named');
      LegacyUnit.equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&aring;&auml;&ouml;', 'Named encoding text');
      LegacyUnit.equal(
        encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true),
        '&lt;&gt;&quot;\'&amp;&aring;&auml;&ouml;',
        'Named encoding attribute'
      );
      LegacyUnit.equal(encodeFunc('\ud87e\udc04'), '\ud87e\udc04', 'Named high-byte encoding text');
      LegacyUnit.equal(encodeFunc('\ud87e\udc04', true), '\ud87e\udc04', 'Named high-byte encoding attribute');

      encodeFunc = Entities.getEncodeFunc('numeric');
      LegacyUnit.equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&#229;&#228;&#246;', 'Numeric encoding text');
      LegacyUnit.equal(
        encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true),
        '&lt;&gt;&quot;\'&amp;&#229;&#228;&#246;',
        'Numeric encoding attribute');
      LegacyUnit.equal(encodeFunc('\ud87e\udc04'), '&#194564;', 'Numeric high-byte encoding text');
      LegacyUnit.equal(encodeFunc('\ud87e\udc04', true), '&#194564;', 'Numeric high-byte encoding attribute');

      encodeFunc = Entities.getEncodeFunc('named+numeric', '229,aring');
      LegacyUnit.equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&aring;&#228;&#246;', 'Named+numeric encoding text');
      LegacyUnit.equal(
        encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true),
        '&lt;&gt;&quot;\'&amp;&aring;&#228;&#246;',
        'Named+numeric encoding attribute'
      );
      LegacyUnit.equal(encodeFunc('\ud87e\udc04'), '&#194564;', 'Named+numeric high-byte encoding text');
      LegacyUnit.equal(encodeFunc('\ud87e\udc04', true), '&#194564;', 'Named+numeric high-byte encoding attribute');

      encodeFunc = Entities.getEncodeFunc('named,numeric', '229,aring');
      LegacyUnit.equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&aring;&#228;&#246;', 'Named+numeric encoding text');
      LegacyUnit.equal(
        encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true),
        '&lt;&gt;&quot;\'&amp;&aring;&#228;&#246;',
        'Named+numeric encoding attribute'
      );
      LegacyUnit.equal(encodeFunc('\ud87e\udc04'), '&#194564;', 'Named+numeric high-byte encoding text');
      LegacyUnit.equal(encodeFunc('\ud87e\udc04', true), '&#194564;', 'Named+numeric high-byte encoding attribute');
    });

    suite.test('decode', function () {
      LegacyUnit.equal(
        Entities.decode('&lt;&gt;&quot;&#39;&amp;&aring;&auml;&ouml;&unknown;'),
        '<>"\'&\u00e5\u00e4\u00f6&unknown;',
        'Decode text with various entities'
      );
      LegacyUnit.equal(Entities.decode('&#65;&#66;&#039;'), 'AB\'', 'Decode numeric entities');
      LegacyUnit.equal(Entities.decode('&#x4F;&#X4F;&#x27;'), 'OO\'', 'Decode hexanumeric entities');
      LegacyUnit.equal(Entities.decode('&#65&#66&#x43'), 'ABC', 'Decode numeric entities with no semicolon');
      LegacyUnit.equal(Entities.decode('&test'), '&test', 'Dont decode invalid entity name without semicolon');

      LegacyUnit.equal(Entities.encodeNumeric(Entities.decode(
        '&#130;&#131;&#132;&#133;&#134;&#135;&#136;&#137;&#138;' +
        '&#139;&#140;&#141;&#142;&#143;&#144;&#145;&#146;&#147;&#148;&#149;&#150;&#151;&#152;' +
        '&#153;&#154;&#155;&#156;&#157;&#158;&#159;')
      ), '&#8218;&#402;&#8222;&#8230;&#8224;&#8225;&#710;&#8240;&#352;&#8249;&#338;&#141;&#381;' +
      '&#143;&#144;&#8216;&#8217;&#8220;&#8221;&#8226;&#8211;&#8212;&#732;&#8482;&#353;' +
        '&#8250;&#339;&#157;&#382;&#376;',
        'Entity decode ascii');

      LegacyUnit.equal(Entities.encodeNumeric(Entities.decode('&#194564;')), '&#194564;', "High byte non western character.");
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);