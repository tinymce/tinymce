const runsInPhantom = [
  '@ephox/acid',
  '@ephox/alloy',
  '@ephox/boss',
  '@ephox/boulder',
  '@ephox/dragster',
  '@ephox/echo',
  '@ephox/imagetools',
  '@ephox/jax',
  '@ephox/katamari',
  '@ephox/mcagar',
  '@ephox/polaris',
  '@ephox/porkbun',
  '@ephox/robin',
  '@ephox/snooker',
];

const needsTinyMCE = ['@ephox/mcagar'];

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

const testFolders = (tests, auto) => tests.flatMap(({location}) => [
  `${location}/**/test/**/atomic/**/*Test.ts`,
  `${location}/**/test/**/browser/**/*Test.ts`,
  `${location}/**/test/**/phantom/**/*Test.ts`,
].concat(auto ? `${location}/**/test/**/webdriver/**/*Test.ts` : []));

const bedrockDefaults = {
  config: 'tsconfig.json',
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
        customRoutes: 'modules/jax/src/test/json/routes.json',
      }
    }
  }
};

const bedrockBrowser = (tests, browserName, osName, auto) => {
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
        customRoutes: 'modules/tinymce/src/core/test/json/routes.json',

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

  const phantomTests = filterChanges(changes, runsInPhantom);
  const browserTests = filterChanges(changes, runsInBrowser);

  const activeBrowser = grunt.option('bedrock-browser') || 'chrome-headless';
  const activeOs = grunt.option('bedrock-os') || 'tests';
  const bedrockPhantomConfig = bedrockPhantom(phantomTests);
  const gruntConfig = {
    shell: {
      tsc: { command: 'yarn -s tsc' },
      rollup: { command: 'yarn -s tinymce-rollup' },
      yarn: { command: 'yarn' },
      'yarn-dev': { command: 'yarn -s dev' }
    },
    'bedrock-auto': {
      ...bedrockPhantomConfig,
      ...bedrockBrowser(browserTests, activeBrowser, activeOs, true)
    },
    'bedrock-manual': {
      ...bedrockPhantomConfig,
      ...bedrockBrowser(browserTests, activeBrowser, activeOs, false)
    }
  };

  // console.log(JSON.stringify(gruntConfig, null, 2))

  grunt.initConfig(gruntConfig);

  //dupe de dupe dupe
  if (phantomTests.length > 0) {
    grunt.registerTask('list-changed-phantom', () => {
      const changeList = JSON.stringify(phantomTests.reduce((acc, change) => acc.concat(change.name), []), null, 2);
      grunt.log.writeln('Changed projects for phantomjs testing:', changeList);
    });
    if (phantomTests.find(({name}) => needsTinyMCE.indexOf(name) > -1)) {
      // only run rollup if required, since it's quite slow
      grunt.registerTask('phantomjs-auto', ['shell:rollup', 'list-changed-phantom', 'shell:tsc', 'bedrock-auto:phantomjs']);
    } else {
      grunt.registerTask('phantomjs-auto', ['list-changed-phantom', 'shell:tsc', 'bedrock-auto:phantomjs']);
    }
    grunt.registerTask('phantomjs-manual', ['shell:tsc', 'bedrock-manual:phantomjs']);
  } else {
    const noPhantom = () => {
      grunt.log.writeln('no changed modules need phantomjs testing');
    };
    grunt.registerTask('phantomjs-auto', noPhantom);
    grunt.registerTask('phantomjs-manual', noPhantom);
    grunt.registerTask('list-changed-phantom', noPhantom);
  }

  //dupe de dupe dupe
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

  grunt.registerTask('default', []);

  require('load-grunt-tasks')(grunt, {
    requireResolution: true,
    config: 'package.json',
    pattern: ['@ephox/bedrock', 'grunt-shell']
  });
};
