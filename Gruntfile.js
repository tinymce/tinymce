// Tests always run in a browser, but some we run headless
const runsHeadless = [
  '@ephox/alloy',
  '@ephox/mcagar',
  '@ephox/katamari',
  '@ephox/katamari-test',
  '@ephox/jax'
];

if (!Array.prototype.flatMap) {
  // simple polyfill for node versions < 11
  // not at all to ES2019 spec, but if you're relying on that you should use node 11 /shrug
  const concat = (x, y) => x.concat(y);

  const flatMap = (f, xs) => xs.map(f).reduce(concat, []);

  Array.prototype.flatMap = function (f) {
    return flatMap(f, this);
  };
}

const filterChanges = (changes, tests) => {
  return changes.filter((change => tests.indexOf(change.name) > -1));
};

const filterChangesNot = (changes, badTests) => {
  return changes.filter((change => badTests.indexOf(change.name) === -1));
};

/* structure of lerna output
{
  name: string,
  version: string,
  private: boolean,
  location: string
}
*/

/** Note: this is optimized for speed. Turns out globbing in node.js is time-consuming.
 *  Restrict tinymce to 2 arbitrary levels of test base folders.
 *  All other projects need their tests in src/test/ts
 */
const testFolders = (tests, auto) => tests.flatMap((test) => {
  const testTypes = ['atomic', 'browser', 'headless'].concat(auto ? ['webdriver'] : []);
  const bases = test.name === "tinymce" ? ["src/*/test/ts", "src/*/*/test/ts"] : ["src/test/ts"];
  return bases.flatMap(base => testTypes.map(tt => `${test.location}/${base}/${tt}/**/*Test.ts`));
});

const bedrockDefaults = {
  config: 'tsconfig.json',
  customRoutes: 'modules/tinymce/src/core/test/json/routes.json',
  overallTimeout: 180000,
  singleTimeout: 60000,
};

const bedrockHeadless = (tests, browser, auto) => {
  if (tests.length === 0) {
    return {};
  } else {
    return {
      headless: {
        ...bedrockDefaults,
        name: 'headless-tests',
        browser,
        testfiles: testFolders(tests, auto),

        // we have a few tests that don't play nicely when combined together in the monorepo
        retries: 3
      }
    }
  }
};

const bedrockBrowser = (tests, browserName, osName, bucket, buckets, chunk, auto) => {
  if (tests.length === 0) {
    return {};
  } else {
    return {
      browser: {
        ...bedrockDefaults,
        overallTimeout: 1200000,
        name: `${browserName}-${osName}`,
        browser: browserName,
        testfiles: testFolders(tests, auto),
        bucket: bucket,
        buckets: buckets,
        chunk: chunk,

        // we have a few tests that don't play nicely when combined together in the monorepo
        retries: 3
      }
    };
  }
};

const fetchLernaProjects = (log, runAllTests) => {
  // This has to be sync because grunt can't do async config
  var exec = require('child_process').execSync;

  // if JSON parse fails, well, grunt will just fail /shrug
  const parseLernaList = (cmd) => {
    try {
      return JSON.parse(exec(`yarn -s lerna ${cmd} -a --json --loglevel warn 2>&1`));
    } catch (e) {
      // If no changes are found, then lerna returns an exit code of 1, so deal with that gracefully
      if (e.status === 1) {
        return [];
      } else {
        throw e;
      }
    }
  };

  const changes = runAllTests ? [] : parseLernaList('changed --no-ignore-changes');

  if (changes.length === 0) {
    log.writeln('No changes found, testing all projects');
    // If there are no changes, use "lerna list" instead of "lerna changed" to test everything
    return parseLernaList('list');
  } else {
    return changes;
  }

};

module.exports = function (grunt) {
  const runAllTests = grunt.option('ignore-lerna-changed') || false;
  const changes = fetchLernaProjects(grunt.log, runAllTests);

  const bucket = parseInt(grunt.option('bucket'), 10) || 1;
  const buckets = parseInt(grunt.option('buckets'), 10) || 1;
  const chunk = parseInt(grunt.option('chunk'), 10) || 100;

  const headlessTests = filterChanges(changes, runsHeadless);
  const browserTests = filterChangesNot(changes, runsHeadless);

  const activeBrowser = grunt.option('bedrock-browser') || 'chrome-headless';
  const headlessBrowser = activeBrowser.endsWith("-headless") ? activeBrowser : 'chrome-headless';
  const activeOs = grunt.option('bedrock-os') || 'tests';
  const gruntConfig = {
    shell: {
      tsc: { command: 'yarn -s tsc' },
      legacy: { command: 'yarn build' },
      yarn: { command: 'yarn' },
      'yarn-dev': { command: 'yarn -s dev' }
    },
    'bedrock-auto': {
      ...bedrockHeadless(headlessTests, headlessBrowser, true),
      ...bedrockBrowser(browserTests, activeBrowser, activeOs, bucket, buckets, chunk, true)
    },
    'bedrock-manual': {
      ...bedrockHeadless(headlessTests, headlessBrowser, false),
      ...bedrockBrowser(browserTests, activeBrowser, activeOs, bucket, buckets, chunk, false)
    }
  };

  // console.log(JSON.stringify(gruntConfig, null, 2))

  grunt.initConfig(gruntConfig);

  //TODO: remove duplication
  if (headlessTests.length > 0) {
    grunt.registerTask('list-changed-headless', () => {
      const changeList = JSON.stringify(headlessTests.reduce((acc, change) => acc.concat(change.name), []), null, 2);
      grunt.log.writeln('Changed projects for headless testing:', changeList);
    });
    grunt.registerTask('headless-auto', ['list-changed-headless', 'shell:tsc', 'bedrock-auto:headless']);
    grunt.registerTask('headless-manual', ['list-changed-headless', 'shell:tsc', 'bedrock-manual:headless']);
  } else {
    const noHeadless = () => {
      grunt.log.writeln('no changed modules need headless testing');
    };
    grunt.registerTask('headless-auto', noHeadless);
    grunt.registerTask('headless-manual', noHeadless);
    grunt.registerTask('list-changed-headless', noHeadless);
  }

  //TODO: remove duplication
  if (browserTests.length > 0) {
    grunt.registerTask('list-changed-browser', () => {
      const changeList = JSON.stringify(browserTests.reduce((acc, change) => acc.concat(change.name), []), null, 2);
      grunt.log.writeln('Changed projects for browser testing:', changeList);
    });
    grunt.registerTask('browser-auto', ['list-changed-browser', 'shell:tsc', 'bedrock-auto:browser']);
    grunt.registerTask('browser-manual', ['list-changed-browser', 'shell:tsc', 'bedrock-manual:browser']);
  } else {
    const noBrowser = () => {
      grunt.log.writeln('no changed modules need browser testing');
    };
    grunt.registerTask('browser-auto', noBrowser);
    grunt.registerTask('browser-manual', noBrowser);
    grunt.registerTask('list-changed-browser', noBrowser);
  }

  grunt.registerTask('legacy-warn', () => grunt.log.warn(`
*******
Top-level grunt has been replaced by 'yarn build', and the output has moved from project root to modules/tinymce
*******
`));

  grunt.registerTask('default', ['legacy-warn', 'shell:legacy']);

  require('load-grunt-tasks')(grunt, {
    requireResolution: true,
    config: 'package.json',
    pattern: ['@ephox/bedrock-server', 'grunt-shell']
  });
};
