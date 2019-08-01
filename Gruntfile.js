const runsInPhantom = [
  '@ephox/acid',
  '@ephox/alloy',
  '@ephox/boss',
  '@ephox/boulder',
  '@ephox/dragster',
  '@ephox/imagetools',
  '@ephox/jax',
  '@ephox/katamari',
  '@ephox/mcagar',
  '@ephox/polaris',
  '@ephox/porkbun',
  '@ephox/robin',
  '@ephox/snooker',
];

const runsInBrowser = [
  '@ephox/agar',
  '@ephox/bridge',
  '@ephox/darwin',
  '@ephox/phoenix',
  '@ephox/sand',
  '@ephox/sugar',
  'tinymce',
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
  const testTypes = ['atomic', 'browser', 'phantom'].concat(auto ? ['webdriver'] : []);
  const bases = test.name === "tinymce" ? ["src/*/test/ts", "src/*/*/test/ts"] : ["src/test/ts"];
  return bases.flatMap(base => testTypes.map(tt => `${test.location}/${base}/${tt}/**/*Test.ts`));
});

const bedrockDefaults = {
  config: 'tsconfig.json',
  customRoutes: 'modules/tinymce/src/core/test/json/routes.json',
  overallTimeout: 180000,
  singleTimeout: 60000,
};

const bedrockPhantom = (tests) => {
  if (tests.length === 0) {
    return {};
  } else {
    return {
      phantomjs: {
        ...bedrockDefaults,
        name: 'phantom-tests',
        browser: 'phantomjs',
        testfiles: testFolders(tests, true),
      }
    }
  }
};

const bedrockBrowser = (tests, browserName, osName, bucket, buckets, auto) => {
  if (tests.length === 0) {
    return {};
  } else {
    return {
      browser: {
        ...bedrockDefaults,
        overallTimeout: 900000,
        name: `${browserName}-${osName}`,
        browser: browserName,
        testfiles: testFolders(tests, auto),
        bucket: bucket,
        buckets: buckets,

        // we have a few tests that don't play nicely when combined together in the monorepo
        retries: 3
      }
    }
  }
};

const fetchLernaProjects = (log, runAllTests) => {
  // This has to be sync because grunt can't do async config
  var exec = require('child_process').execSync;

  // if JSON parse fails, well, grunt will just fail /shrug
  const parseLernaList = (cmd) => {
    try {
      return JSON.parse(exec(`yarn -s lerna ${cmd} -a --no-ignore-changes --json --loglevel warn 2>&1`));
    } catch (e) {
      // If no changes are found, then lerna returns an exit code of 1, so deal with that gracefully
      if (e.status === 1) {
        return [];
      } else {
        throw e;
      }
    }
  };

  const changes = runAllTests ? [] : parseLernaList('changed');

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

  const bucket = grunt.option('bucket') || 1;
  const buckets = grunt.option('buckets') || 1;

  const phantomTests = filterChanges(changes, runsInPhantom);
  const browserTests = filterChanges(changes, runsInBrowser);

  const activeBrowser = grunt.option('bedrock-browser') || 'chrome-headless';
  const activeOs = grunt.option('bedrock-os') || 'tests';
  const bedrockPhantomConfig = bedrockPhantom(phantomTests);
  const gruntConfig = {
    shell: {
      tsc: { command: 'yarn -s tsc' },
      legacy: { command: 'yarn build' },
      yarn: { command: 'yarn' },
      'yarn-dev': { command: 'yarn -s dev' }
    },
    'bedrock-auto': {
      ...bedrockPhantomConfig,
      ...bedrockBrowser(browserTests, activeBrowser, activeOs, bucket, buckets, true)
    },
    'bedrock-manual': {
      ...bedrockPhantomConfig,
      ...bedrockBrowser(browserTests, activeBrowser, activeOs, bucket, buckets, false)
    }
  };

  // console.log(JSON.stringify(gruntConfig, null, 2))

  grunt.initConfig(gruntConfig);

  //TODO: remove duplication
  if (phantomTests.length > 0) {
    grunt.registerTask('list-changed-phantom', () => {
      const changeList = JSON.stringify(phantomTests.reduce((acc, change) => acc.concat(change.name), []), null, 2);
      grunt.log.writeln('Changed projects for phantomjs testing:', changeList);
    });
    grunt.registerTask('phantomjs-auto', ['list-changed-phantom', 'shell:tsc', 'bedrock-auto:phantomjs']);
    grunt.registerTask('phantomjs-manual', ['list-changed-phantom', 'shell:tsc', 'bedrock-manual:phantomjs']);
  } else {
    const noPhantom = () => {
      grunt.log.writeln('no changed modules need phantomjs testing');
    };
    grunt.registerTask('phantomjs-auto', noPhantom);
    grunt.registerTask('phantomjs-manual', noPhantom);
    grunt.registerTask('list-changed-phantom', noPhantom);
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
    pattern: ['@ephox/bedrock', 'grunt-shell']
  });
};
