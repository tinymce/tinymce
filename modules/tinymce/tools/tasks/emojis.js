const resolve = require('resolve');
const twemoji = require('twemoji');

const prettyPrint = (obj) => JSON.stringify(obj, null, 2);

const generateContent = (json, attribution) => {
  const content = `window.tinymce.Resource.add('tinymce.plugins.emoticons', ${json});`;
  return '// Source: npm package: emojilib' + attribution + '\n' + content;
};

const getTwemojiOptions = (grunt, options) => {
  const twemojiOptions = options.twemoji || { base: '', ext: '.png' };

  const type = grunt.option('twemojiType');
  if (type === 'svg') {
    twemojiOptions.folder = 'svg';
    twemojiOptions.ext = '.svg';
  }

  return twemojiOptions;
};

module.exports = function (grunt) {
  grunt.registerTask("emojis", "Generates the emoji databases used for the emoticon plugin", function () {
    const options = grunt.config([this.name]) || {};
    const twemojiOptions = getTwemojiOptions(grunt, options);

    const emojiJson = grunt.file.read(resolve.sync('emojilib/emojis.json'));
    const emojiDatabase = JSON.parse(emojiJson);

    const emojiImageDatabase = {};
    Object.keys(emojiDatabase).forEach((name) => {
      const item = emojiDatabase[name];
      // See https://github.com/twitter/twemoji#inline-styles for the inline styles
      item.char = twemoji.parse(item.char, twemojiOptions)
        .replace('class="emoji"', 'data-emoticon="true" style="width:1em;height:1em;margin:0 .05em 0 .1em;vertical-align:-.1em"')
        .replace(/src="([^"]+)"/, (match, url) => {
          const fragments = url.split('/');
          return `src="${fragments[fragments.length - 1]}"`;
        });
      emojiImageDatabase[name] = item;
    });

    grunt.file.write('src/plugins/emoticons/main/js/emojis.js', generateContent(emojiJson, ', file:emojis.json'));
    grunt.file.write('src/plugins/emoticons/main/js/emojiimages.js', generateContent(prettyPrint(emojiImageDatabase), '\n// Images provided by twemoji: https://github.com/twitter/twemoji'));
  });
};
