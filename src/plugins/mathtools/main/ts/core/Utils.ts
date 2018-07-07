/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
const loadMathJax = function () {
  return new Promise(function (resolve, reject) {
    const config = document.createElement('script');
    config.type = 'text/x-mathjax-config';
    config.text = `
      MathJax.Hub.Register.StartupHook("TeX Jax Ready", function () {
        MathJax.InputJax.TeX.prefilterHooks.Add(function (data) {
            if (!data.display) {
                data.math = "\\\\displaystyle{" + data.math + "}"
            }
        });
      });
      MathJax.Hub.Config({
          jax: ["input/TeX", "output/SVG"],
          extensions: ["tex2jax.js"],
          TeX: {
              extensions: ["AMSmath.js", "AMSsymbols.js", "noErrors.js", "noUndefined.js"]
          },
          tex2jax: {
              ignoreClass: "ignore_math",
              inlineMath: [
                  ["$", "$"],
                  ["$$", "$$"],
                  ["\\\\", "\\\\"]
              ]
          },
          showMathMenu: false,
          displayAlign: "left",
          showProcessingMessages: false,
          messageStyle: "none",
          SVG: {
              useFontCache: false,
              useGlobalCache: false,
              linebreaks: {
                  automatic: true,
                  width: "container"
              },
              scale: 80
          }
      });
    `;
    document.body.appendChild(config);

    const script = document.createElement('script');
    document.body.appendChild(script);
    script.onload = function () {
      resolve();
    };
    script.onerror = function () {
      reject();
    };
    script.src = 'https://static.speiyou.com/MathJax-2.6.1/MathJax.js';
  });
};

const wraperLatex = function (latex) {
  return '$' + latex + '$';
};

const wrapperSVG = function (svg, latex) {
  return `<span class="mathjax_content" title="${latex}">${svg}</span>`;
};

const renderLatex = function (latex) {
  const MathJax = (<any> window).MathJax;
  const element = document.createElement('span');
  element.textContent = wraperLatex(latex);
  element.style.opacity = '0';
  document.body.appendChild(element);
  return new Promise(function (resolve, reject) {
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, element], function () {
      const outputEle = element.querySelector('.MathJax_SVG');
      const svgOutput = wrapperSVG(outputEle.innerHTML, latex);
      element.parentElement.removeChild(element);
      resolve(svgOutput);
    });
  });
};

const getSVGLatex = function (latex) {
  return new Promise(function (resolve, reject) {
    if ((<any> window).MathJax) {
      resolve(renderLatex(latex));
    } else {
     loadMathJax().then(function () {
        renderLatex(latex).then(function (data) {
          resolve(data);
        });
      });
    }
  });
};

export default {
  getSVGLatex
};