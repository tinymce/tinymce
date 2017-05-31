"use strict";

var HTMLReporter = require('../lib/reporters/HTMLReporter');

require('../test-cov/test/fixture.js');
require('../test-cov/test/fixture2.js');

var reporter = new HTMLReporter(global.__$coverObject);
console.log(reporter.report());
