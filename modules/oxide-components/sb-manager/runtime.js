var cf = Object.create;
var Uo = Object.defineProperty;
var pf = Object.getOwnPropertyDescriptor;
var df = Object.getOwnPropertyNames;
var ff = Object.getPrototypeOf, mf = Object.prototype.hasOwnProperty;
var a = (e, t) => Uo(e, "name", { value: t, configurable: !0 }), mo = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy <
"u" ? new Proxy(e, {
  get: (t, o) => (typeof require < "u" ? require : t)[o]
}) : e)(function(e) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + e + '" is not supported');
});
var we = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), hf = (e, t) => {
  for (var o in t)
    Uo(e, o, { get: t[o], enumerable: !0 });
}, gf = (e, t, o, i) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let r of df(t))
      !mf.call(e, r) && r !== o && Uo(e, r, { get: () => t[r], enumerable: !(i = pf(t, r)) || i.enumerable });
  return e;
};
var Ve = (e, t, o) => (o = e != null ? cf(ff(e)) : {}, gf(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  t || !e || !e.__esModule ? Uo(o, "default", { value: e, enumerable: !0 }) : o,
  e
));

// ../node_modules/prop-types/lib/ReactPropTypesSecret.js
var Ga = we((v_, Ua) => {
  "use strict";
  var ay = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  Ua.exports = ay;
});

// ../node_modules/prop-types/factoryWithThrowingShims.js
var Xa = we((x_, Qa) => {
  "use strict";
  var ly = Ga();
  function qa() {
  }
  a(qa, "emptyFunction");
  function Ya() {
  }
  a(Ya, "emptyFunctionWithReset");
  Ya.resetWarningCache = qa;
  Qa.exports = function() {
    function e(i, r, n, l, u, c) {
      if (c !== ly) {
        var d = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. \
Read more at http://fb.me/use-check-prop-types"
        );
        throw d.name = "Invariant Violation", d;
      }
    }
    a(e, "shim"), e.isRequired = e;
    function t() {
      return e;
    }
    a(t, "getShim");
    var o = {
      array: e,
      bigint: e,
      bool: e,
      func: e,
      number: e,
      object: e,
      string: e,
      symbol: e,
      any: e,
      arrayOf: t,
      element: e,
      elementType: e,
      instanceOf: t,
      node: e,
      objectOf: t,
      oneOf: t,
      oneOfType: t,
      shape: t,
      exact: t,
      checkPropTypes: Ya,
      resetWarningCache: qa
    };
    return o.PropTypes = o, o;
  };
});

// ../node_modules/prop-types/index.js
var ni = we((E_, Za) => {
  Za.exports = Xa()();
  var S_, w_;
});

// ../node_modules/react-fast-compare/index.js
var el = we((T_, Ja) => {
  var uy = typeof Element < "u", cy = typeof Map == "function", py = typeof Set == "function", dy = typeof ArrayBuffer == "function" && !!ArrayBuffer.
  isView;
  function dr(e, t) {
    if (e === t) return !0;
    if (e && t && typeof e == "object" && typeof t == "object") {
      if (e.constructor !== t.constructor) return !1;
      var o, i, r;
      if (Array.isArray(e)) {
        if (o = e.length, o != t.length) return !1;
        for (i = o; i-- !== 0; )
          if (!dr(e[i], t[i])) return !1;
        return !0;
      }
      var n;
      if (cy && e instanceof Map && t instanceof Map) {
        if (e.size !== t.size) return !1;
        for (n = e.entries(); !(i = n.next()).done; )
          if (!t.has(i.value[0])) return !1;
        for (n = e.entries(); !(i = n.next()).done; )
          if (!dr(i.value[1], t.get(i.value[0]))) return !1;
        return !0;
      }
      if (py && e instanceof Set && t instanceof Set) {
        if (e.size !== t.size) return !1;
        for (n = e.entries(); !(i = n.next()).done; )
          if (!t.has(i.value[0])) return !1;
        return !0;
      }
      if (dy && ArrayBuffer.isView(e) && ArrayBuffer.isView(t)) {
        if (o = e.length, o != t.length) return !1;
        for (i = o; i-- !== 0; )
          if (e[i] !== t[i]) return !1;
        return !0;
      }
      if (e.constructor === RegExp) return e.source === t.source && e.flags === t.flags;
      if (e.valueOf !== Object.prototype.valueOf && typeof e.valueOf == "function" && typeof t.valueOf == "function") return e.valueOf() ===
      t.valueOf();
      if (e.toString !== Object.prototype.toString && typeof e.toString == "function" && typeof t.toString == "function") return e.toString() ===
      t.toString();
      if (r = Object.keys(e), o = r.length, o !== Object.keys(t).length) return !1;
      for (i = o; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(t, r[i])) return !1;
      if (uy && e instanceof Element) return !1;
      for (i = o; i-- !== 0; )
        if (!((r[i] === "_owner" || r[i] === "__v" || r[i] === "__o") && e.$$typeof) && !dr(e[r[i]], t[r[i]]))
          return !1;
      return !0;
    }
    return e !== e && t !== t;
  }
  a(dr, "equal");
  Ja.exports = /* @__PURE__ */ a(function(t, o) {
    try {
      return dr(t, o);
    } catch (i) {
      if ((i.message || "").match(/stack|recursion/i))
        return console.warn("react-fast-compare cannot handle circular refs"), !1;
      throw i;
    }
  }, "isEqual");
});

// ../node_modules/invariant/browser.js
var ol = we((__, tl) => {
  "use strict";
  var fy = /* @__PURE__ */ a(function(e, t, o, i, r, n, l, u) {
    if (!e) {
      var c;
      if (t === void 0)
        c = new Error(
          "Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings."
        );
      else {
        var d = [o, i, r, n, l, u], p = 0;
        c = new Error(
          t.replace(/%s/g, function() {
            return d[p++];
          })
        ), c.name = "Invariant Violation";
      }
      throw c.framesToPop = 1, c;
    }
  }, "invariant");
  tl.exports = fy;
});

// ../node_modules/shallowequal/index.js
var nl = we((O_, rl) => {
  rl.exports = /* @__PURE__ */ a(function(t, o, i, r) {
    var n = i ? i.call(r, t, o) : void 0;
    if (n !== void 0)
      return !!n;
    if (t === o)
      return !0;
    if (typeof t != "object" || !t || typeof o != "object" || !o)
      return !1;
    var l = Object.keys(t), u = Object.keys(o);
    if (l.length !== u.length)
      return !1;
    for (var c = Object.prototype.hasOwnProperty.bind(o), d = 0; d < l.length; d++) {
      var p = l[d];
      if (!c(p))
        return !1;
      var m = t[p], h = o[p];
      if (n = i ? i.call(r, m, h, p) : void 0, n === !1 || n === void 0 && m !== h)
        return !1;
    }
    return !0;
  }, "shallowEqual");
});

// ../node_modules/memoizerific/memoizerific.js
var Pi = we((Ql, Oi) => {
  (function(e) {
    if (typeof Ql == "object" && typeof Oi < "u")
      Oi.exports = e();
    else if (typeof define == "function" && define.amd)
      define([], e);
    else {
      var t;
      typeof window < "u" ? t = window : typeof global < "u" ? t = global : typeof self < "u" ? t = self : t = this, t.memoizerific = e();
    }
  })(function() {
    var e, t, o;
    return (/* @__PURE__ */ a(function i(r, n, l) {
      function u(p, m) {
        if (!n[p]) {
          if (!r[p]) {
            var h = typeof mo == "function" && mo;
            if (!m && h) return h(p, !0);
            if (c) return c(p, !0);
            var b = new Error("Cannot find module '" + p + "'");
            throw b.code = "MODULE_NOT_FOUND", b;
          }
          var f = n[p] = { exports: {} };
          r[p][0].call(f.exports, function(y) {
            var S = r[p][1][y];
            return u(S || y);
          }, f, f.exports, i, r, n, l);
        }
        return n[p].exports;
      }
      a(u, "s");
      for (var c = typeof mo == "function" && mo, d = 0; d < l.length; d++) u(l[d]);
      return u;
    }, "e"))({ 1: [function(i, r, n) {
      r.exports = function(l) {
        if (typeof Map != "function" || l) {
          var u = i("./similar");
          return new u();
        } else
          return /* @__PURE__ */ new Map();
      };
    }, { "./similar": 2 }], 2: [function(i, r, n) {
      function l() {
        return this.list = [], this.lastItem = void 0, this.size = 0, this;
      }
      a(l, "Similar"), l.prototype.get = function(u) {
        var c;
        if (this.lastItem && this.isEqual(this.lastItem.key, u))
          return this.lastItem.val;
        if (c = this.indexOf(u), c >= 0)
          return this.lastItem = this.list[c], this.list[c].val;
      }, l.prototype.set = function(u, c) {
        var d;
        return this.lastItem && this.isEqual(this.lastItem.key, u) ? (this.lastItem.val = c, this) : (d = this.indexOf(u), d >= 0 ? (this.lastItem =
        this.list[d], this.list[d].val = c, this) : (this.lastItem = { key: u, val: c }, this.list.push(this.lastItem), this.size++, this));
      }, l.prototype.delete = function(u) {
        var c;
        if (this.lastItem && this.isEqual(this.lastItem.key, u) && (this.lastItem = void 0), c = this.indexOf(u), c >= 0)
          return this.size--, this.list.splice(c, 1)[0];
      }, l.prototype.has = function(u) {
        var c;
        return this.lastItem && this.isEqual(this.lastItem.key, u) ? !0 : (c = this.indexOf(u), c >= 0 ? (this.lastItem = this.list[c], !0) :
        !1);
      }, l.prototype.forEach = function(u, c) {
        var d;
        for (d = 0; d < this.size; d++)
          u.call(c || this, this.list[d].val, this.list[d].key, this);
      }, l.prototype.indexOf = function(u) {
        var c;
        for (c = 0; c < this.size; c++)
          if (this.isEqual(this.list[c].key, u))
            return c;
        return -1;
      }, l.prototype.isEqual = function(u, c) {
        return u === c || u !== u && c !== c;
      }, r.exports = l;
    }, {}], 3: [function(i, r, n) {
      var l = i("map-or-similar");
      r.exports = function(p) {
        var m = new l(!1), h = [];
        return function(b) {
          var f = /* @__PURE__ */ a(function() {
            var y = m, S, E, g = arguments.length - 1, v = Array(g + 1), I = !0, w;
            if ((f.numArgs || f.numArgs === 0) && f.numArgs !== g + 1)
              throw new Error("Memoizerific functions should always be called with the same number of arguments");
            for (w = 0; w < g; w++) {
              if (v[w] = {
                cacheItem: y,
                arg: arguments[w]
              }, y.has(arguments[w])) {
                y = y.get(arguments[w]);
                continue;
              }
              I = !1, S = new l(!1), y.set(arguments[w], S), y = S;
            }
            return I && (y.has(arguments[g]) ? E = y.get(arguments[g]) : I = !1), I || (E = b.apply(null, arguments), y.set(arguments[g], E)),
            p > 0 && (v[g] = {
              cacheItem: y,
              arg: arguments[g]
            }, I ? u(h, v) : h.push(v), h.length > p && c(h.shift())), f.wasMemoized = I, f.numArgs = g + 1, E;
          }, "memoizerific");
          return f.limit = p, f.wasMemoized = !1, f.cache = m, f.lru = h, f;
        };
      };
      function u(p, m) {
        var h = p.length, b = m.length, f, y, S;
        for (y = 0; y < h; y++) {
          for (f = !0, S = 0; S < b; S++)
            if (!d(p[y][S].arg, m[S].arg)) {
              f = !1;
              break;
            }
          if (f)
            break;
        }
        p.push(p.splice(y, 1)[0]);
      }
      a(u, "moveToMostRecentLru");
      function c(p) {
        var m = p.length, h = p[m - 1], b, f;
        for (h.cacheItem.delete(h.arg), f = m - 2; f >= 0 && (h = p[f], b = h.cacheItem.get(h.arg), !b || !b.size); f--)
          h.cacheItem.delete(h.arg);
      }
      a(c, "removeCachedResult");
      function d(p, m) {
        return p === m || p !== p && m !== m;
      }
      a(d, "isEqual");
    }, { "map-or-similar": 1 }] }, {}, [3])(3);
  });
});

// ../node_modules/picoquery/lib/string-util.js
var Di = we((Ai) => {
  "use strict";
  Object.defineProperty(Ai, "__esModule", { value: !0 });
  Ai.encodeString = Xb;
  var nt = Array.from({ length: 256 }, (e, t) => "%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase()), Qb = new Int8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    0
  ]);
  function Xb(e) {
    let t = e.length;
    if (t === 0)
      return "";
    let o = "", i = 0, r = 0;
    e: for (; r < t; r++) {
      let n = e.charCodeAt(r);
      for (; n < 128; ) {
        if (Qb[n] !== 1 && (i < r && (o += e.slice(i, r)), i = r + 1, o += nt[n]), ++r === t)
          break e;
        n = e.charCodeAt(r);
      }
      if (i < r && (o += e.slice(i, r)), n < 2048) {
        i = r + 1, o += nt[192 | n >> 6] + nt[128 | n & 63];
        continue;
      }
      if (n < 55296 || n >= 57344) {
        i = r + 1, o += nt[224 | n >> 12] + nt[128 | n >> 6 & 63] + nt[128 | n & 63];
        continue;
      }
      if (++r, r >= t)
        throw new Error("URI malformed");
      let l = e.charCodeAt(r) & 1023;
      i = r + 1, n = 65536 + ((n & 1023) << 10 | l), o += nt[240 | n >> 18] + nt[128 | n >> 12 & 63] + nt[128 | n >> 6 & 63] + nt[128 | n & 63];
    }
    return i === 0 ? e : i < t ? o + e.slice(i) : o;
  }
  a(Xb, "encodeString");
});

// ../node_modules/picoquery/lib/shared.js
var Tr = we((it) => {
  "use strict";
  Object.defineProperty(it, "__esModule", { value: !0 });
  it.defaultOptions = it.defaultShouldSerializeObject = it.defaultValueSerializer = void 0;
  var Mi = Di(), Zb = /* @__PURE__ */ a((e) => {
    switch (typeof e) {
      case "string":
        return (0, Mi.encodeString)(e);
      case "bigint":
      case "boolean":
        return "" + e;
      case "number":
        if (Number.isFinite(e))
          return e < 1e21 ? "" + e : (0, Mi.encodeString)("" + e);
        break;
    }
    return e instanceof Date ? (0, Mi.encodeString)(e.toISOString()) : "";
  }, "defaultValueSerializer");
  it.defaultValueSerializer = Zb;
  var Jb = /* @__PURE__ */ a((e) => e instanceof Date, "defaultShouldSerializeObject");
  it.defaultShouldSerializeObject = Jb;
  var Zl = /* @__PURE__ */ a((e) => e, "identityFunc");
  it.defaultOptions = {
    nesting: !0,
    nestingSyntax: "dot",
    arrayRepeat: !1,
    arrayRepeatSyntax: "repeat",
    delimiter: 38,
    valueDeserializer: Zl,
    valueSerializer: it.defaultValueSerializer,
    keyDeserializer: Zl,
    shouldSerializeObject: it.defaultShouldSerializeObject
  };
});

// ../node_modules/picoquery/lib/object-util.js
var Li = we((Cr) => {
  "use strict";
  Object.defineProperty(Cr, "__esModule", { value: !0 });
  Cr.getDeepObject = ov;
  Cr.stringifyObject = Jl;
  var Rt = Tr(), ev = Di();
  function tv(e) {
    return e === "__proto__" || e === "constructor" || e === "prototype";
  }
  a(tv, "isPrototypeKey");
  function ov(e, t, o, i, r) {
    if (tv(t))
      return e;
    let n = e[t];
    return typeof n == "object" && n !== null ? n : !i && (r || typeof o == "number" || typeof o == "string" && o * 0 === 0 && o.indexOf(".") ===
    -1) ? e[t] = [] : e[t] = {};
  }
  a(ov, "getDeepObject");
  var rv = 20, nv = "[]", iv = "[", sv = "]", av = ".";
  function Jl(e, t, o = 0, i, r) {
    let { nestingSyntax: n = Rt.defaultOptions.nestingSyntax, arrayRepeat: l = Rt.defaultOptions.arrayRepeat, arrayRepeatSyntax: u = Rt.defaultOptions.
    arrayRepeatSyntax, nesting: c = Rt.defaultOptions.nesting, delimiter: d = Rt.defaultOptions.delimiter, valueSerializer: p = Rt.defaultOptions.
    valueSerializer, shouldSerializeObject: m = Rt.defaultOptions.shouldSerializeObject } = t, h = typeof d == "number" ? String.fromCharCode(
    d) : d, b = r === !0 && l, f = n === "dot" || n === "js" && !r;
    if (o > rv)
      return "";
    let y = "", S = !0, E = !1;
    for (let g in e) {
      let v = e[g], I;
      i ? (I = i, b ? u === "bracket" && (I += nv) : f ? (I += av, I += g) : (I += iv, I += g, I += sv)) : I = g, S || (y += h), typeof v ==
      "object" && v !== null && !m(v) ? (E = v.pop !== void 0, (c || l && E) && (y += Jl(v, t, o + 1, I, E))) : (y += (0, ev.encodeString)(I),
      y += "=", y += p(v, g)), S && (S = !1);
    }
    return y;
  }
  a(Jl, "stringifyObject");
});

// ../node_modules/fast-decode-uri-component/index.js
var ru = we((mA, ou) => {
  "use strict";
  var eu = 12, lv = 0, Ni = [
    // The first part of the table maps bytes to character to a transition.
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    4,
    4,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    5,
    6,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    7,
    8,
    7,
    7,
    10,
    9,
    9,
    9,
    11,
    4,
    4,
    4,
    4,
    4,
    4,
    4,
    4,
    4,
    4,
    4,
    // The second part of the table maps a state to a new state when adding a
    // transition.
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    0,
    24,
    36,
    48,
    60,
    72,
    84,
    96,
    0,
    12,
    12,
    12,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    48,
    48,
    48,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    48,
    48,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    48,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // The third part maps the current transition to a mask that needs to apply
    // to the byte.
    127,
    63,
    63,
    63,
    0,
    31,
    15,
    15,
    15,
    7,
    7,
    7
  ];
  function uv(e) {
    var t = e.indexOf("%");
    if (t === -1) return e;
    for (var o = e.length, i = "", r = 0, n = 0, l = t, u = eu; t > -1 && t < o; ) {
      var c = tu(e[t + 1], 4), d = tu(e[t + 2], 0), p = c | d, m = Ni[p];
      if (u = Ni[256 + u + m], n = n << 6 | p & Ni[364 + m], u === eu)
        i += e.slice(r, l), i += n <= 65535 ? String.fromCharCode(n) : String.fromCharCode(
          55232 + (n >> 10),
          56320 + (n & 1023)
        ), n = 0, r = t + 3, t = l = e.indexOf("%", r);
      else {
        if (u === lv)
          return null;
        if (t += 3, t < o && e.charCodeAt(t) === 37) continue;
        return null;
      }
    }
    return i + e.slice(r);
  }
  a(uv, "decodeURIComponent");
  var cv = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    a: 10,
    A: 10,
    b: 11,
    B: 11,
    c: 12,
    C: 12,
    d: 13,
    D: 13,
    e: 14,
    E: 14,
    f: 15,
    F: 15
  };
  function tu(e, t) {
    var o = cv[e];
    return o === void 0 ? 255 : o << t;
  }
  a(tu, "hexCodeToInt");
  ou.exports = uv;
});

// ../node_modules/picoquery/lib/parse.js
var au = we((dt) => {
  "use strict";
  var pv = dt && dt.__importDefault || function(e) {
    return e && e.__esModule ? e : { default: e };
  };
  Object.defineProperty(dt, "__esModule", { value: !0 });
  dt.numberValueDeserializer = dt.numberKeyDeserializer = void 0;
  dt.parse = mv;
  var _r = Li(), Bt = Tr(), nu = pv(ru()), dv = /* @__PURE__ */ a((e) => {
    let t = Number(e);
    return Number.isNaN(t) ? e : t;
  }, "numberKeyDeserializer");
  dt.numberKeyDeserializer = dv;
  var fv = /* @__PURE__ */ a((e) => {
    let t = Number(e);
    return Number.isNaN(t) ? e : t;
  }, "numberValueDeserializer");
  dt.numberValueDeserializer = fv;
  var iu = /\+/g, su = /* @__PURE__ */ a(function() {
  }, "Empty");
  su.prototype = /* @__PURE__ */ Object.create(null);
  function kr(e, t, o, i, r) {
    let n = e.substring(t, o);
    return i && (n = n.replace(iu, " ")), r && (n = (0, nu.default)(n) || n), n;
  }
  a(kr, "computeKeySlice");
  function mv(e, t) {
    let { valueDeserializer: o = Bt.defaultOptions.valueDeserializer, keyDeserializer: i = Bt.defaultOptions.keyDeserializer, arrayRepeatSyntax: r = Bt.
    defaultOptions.arrayRepeatSyntax, nesting: n = Bt.defaultOptions.nesting, arrayRepeat: l = Bt.defaultOptions.arrayRepeat, nestingSyntax: u = Bt.
    defaultOptions.nestingSyntax, delimiter: c = Bt.defaultOptions.delimiter } = t ?? {}, d = typeof c == "string" ? c.charCodeAt(0) : c, p = u ===
    "js", m = new su();
    if (typeof e != "string")
      return m;
    let h = e.length, b = "", f = -1, y = -1, S = -1, E = m, g, v = "", I = "", w = !1, O = !1, _ = !1, k = !1, T = !1, C = !1, P = !1, D = 0,
    M = -1, F = -1, Z = -1;
    for (let W = 0; W < h + 1; W++) {
      if (D = W !== h ? e.charCodeAt(W) : d, D === d) {
        if (P = y > f, P || (y = W), S !== y - 1 && (I = kr(e, S + 1, M > -1 ? M : y, _, w), v = i(I), g !== void 0 && (E = (0, _r.getDeepObject)(
        E, g, v, p && T, p && C))), P || v !== "") {
          P && (b = e.slice(y + 1, W), k && (b = b.replace(iu, " ")), O && (b = (0, nu.default)(b) || b));
          let Q = o(b, v);
          if (l) {
            let H = E[v];
            H === void 0 ? M > -1 ? E[v] = [Q] : E[v] = Q : H.pop ? H.push(Q) : E[v] = [H, Q];
          } else
            E[v] = Q;
        }
        b = "", f = W, y = W, w = !1, O = !1, _ = !1, k = !1, T = !1, C = !1, M = -1, S = W, E = m, g = void 0, v = "";
      } else D === 93 ? (l && r === "bracket" && Z === 91 && (M = F), n && (u === "index" || p) && y <= f && (S !== F && (I = kr(e, S + 1, W,
      _, w), v = i(I), g !== void 0 && (E = (0, _r.getDeepObject)(E, g, v, void 0, p)), g = v, _ = !1, w = !1), S = W, C = !0, T = !1)) : D ===
      46 ? n && (u === "dot" || p) && y <= f && (S !== F && (I = kr(e, S + 1, W, _, w), v = i(I), g !== void 0 && (E = (0, _r.getDeepObject)(
      E, g, v, p)), g = v, _ = !1, w = !1), T = !0, C = !1, S = W) : D === 91 ? n && (u === "index" || p) && y <= f && (S !== F && (I = kr(e,
      S + 1, W, _, w), v = i(I), p && g !== void 0 && (E = (0, _r.getDeepObject)(E, g, v, p)), g = v, _ = !1, w = !1, T = !1, C = !0), S = W) :
      D === 61 ? y <= f ? y = W : O = !0 : D === 43 ? y > f ? k = !0 : _ = !0 : D === 37 && (y > f ? O = !0 : w = !0);
      F = W, Z = D;
    }
    return m;
  }
  a(mv, "parse");
});

// ../node_modules/picoquery/lib/stringify.js
var lu = we((Fi) => {
  "use strict";
  Object.defineProperty(Fi, "__esModule", { value: !0 });
  Fi.stringify = gv;
  var hv = Li();
  function gv(e, t) {
    if (e === null || typeof e != "object")
      return "";
    let o = t ?? {};
    return (0, hv.stringifyObject)(e, o);
  }
  a(gv, "stringify");
});

// ../node_modules/picoquery/lib/main.js
var uu = we((Xe) => {
  "use strict";
  var yv = Xe && Xe.__createBinding || (Object.create ? function(e, t, o, i) {
    i === void 0 && (i = o);
    var r = Object.getOwnPropertyDescriptor(t, o);
    (!r || ("get" in r ? !t.__esModule : r.writable || r.configurable)) && (r = { enumerable: !0, get: /* @__PURE__ */ a(function() {
      return t[o];
    }, "get") }), Object.defineProperty(e, i, r);
  } : function(e, t, o, i) {
    i === void 0 && (i = o), e[i] = t[o];
  }), bv = Xe && Xe.__exportStar || function(e, t) {
    for (var o in e) o !== "default" && !Object.prototype.hasOwnProperty.call(t, o) && yv(t, e, o);
  };
  Object.defineProperty(Xe, "__esModule", { value: !0 });
  Xe.stringify = Xe.parse = void 0;
  var vv = au();
  Object.defineProperty(Xe, "parse", { enumerable: !0, get: /* @__PURE__ */ a(function() {
    return vv.parse;
  }, "get") });
  var xv = lu();
  Object.defineProperty(Xe, "stringify", { enumerable: !0, get: /* @__PURE__ */ a(function() {
    return xv.stringify;
  }, "get") });
  bv(Tr(), Xe);
});

// ../node_modules/toggle-selection/index.js
var hu = we((BA, mu) => {
  mu.exports = function() {
    var e = document.getSelection();
    if (!e.rangeCount)
      return function() {
      };
    for (var t = document.activeElement, o = [], i = 0; i < e.rangeCount; i++)
      o.push(e.getRangeAt(i));
    switch (t.tagName.toUpperCase()) {
      // .toUpperCase handles XHTML
      case "INPUT":
      case "TEXTAREA":
        t.blur();
        break;
      default:
        t = null;
        break;
    }
    return e.removeAllRanges(), function() {
      e.type === "Caret" && e.removeAllRanges(), e.rangeCount || o.forEach(function(r) {
        e.addRange(r);
      }), t && t.focus();
    };
  };
});

// ../node_modules/copy-to-clipboard/index.js
var bu = we((HA, yu) => {
  "use strict";
  var Cv = hu(), gu = {
    "text/plain": "Text",
    "text/html": "Url",
    default: "Text"
  }, _v = "Copy to clipboard: #{key}, Enter";
  function kv(e) {
    var t = (/mac os x/i.test(navigator.userAgent) ? "\u2318" : "Ctrl") + "+C";
    return e.replace(/#{\s*key\s*}/g, t);
  }
  a(kv, "format");
  function Ov(e, t) {
    var o, i, r, n, l, u, c = !1;
    t || (t = {}), o = t.debug || !1;
    try {
      r = Cv(), n = document.createRange(), l = document.getSelection(), u = document.createElement("span"), u.textContent = e, u.ariaHidden =
      "true", u.style.all = "unset", u.style.position = "fixed", u.style.top = 0, u.style.clip = "rect(0, 0, 0, 0)", u.style.whiteSpace = "p\
re", u.style.webkitUserSelect = "text", u.style.MozUserSelect = "text", u.style.msUserSelect = "text", u.style.userSelect = "text", u.addEventListener(
      "copy", function(p) {
        if (p.stopPropagation(), t.format)
          if (p.preventDefault(), typeof p.clipboardData > "u") {
            o && console.warn("unable to use e.clipboardData"), o && console.warn("trying IE specific stuff"), window.clipboardData.clearData();
            var m = gu[t.format] || gu.default;
            window.clipboardData.setData(m, e);
          } else
            p.clipboardData.clearData(), p.clipboardData.setData(t.format, e);
        t.onCopy && (p.preventDefault(), t.onCopy(p.clipboardData));
      }), document.body.appendChild(u), n.selectNodeContents(u), l.addRange(n);
      var d = document.execCommand("copy");
      if (!d)
        throw new Error("copy command was unsuccessful");
      c = !0;
    } catch (p) {
      o && console.error("unable to copy using execCommand: ", p), o && console.warn("trying IE specific stuff");
      try {
        window.clipboardData.setData(t.format || "text", e), t.onCopy && t.onCopy(window.clipboardData), c = !0;
      } catch (m) {
        o && console.error("unable to copy using clipboardData: ", m), o && console.error("falling back to prompt"), i = kv("message" in t ?
        t.message : _v), window.prompt(i, e);
      }
    } finally {
      l && (typeof l.removeRange == "function" ? l.removeRange(n) : l.removeAllRanges()), u && document.body.removeChild(u), r();
    }
    return c;
  }
  a(Ov, "copy");
  yu.exports = Ov;
});

// ../node_modules/downshift/node_modules/react-is/cjs/react-is.production.min.js
var Ip = we((pe) => {
  "use strict";
  var Qi = Symbol.for("react.element"), Xi = Symbol.for("react.portal"), Vr = Symbol.for("react.fragment"), jr = Symbol.for("react.strict_mo\
de"), Kr = Symbol.for("react.profiler"), $r = Symbol.for("react.provider"), Ur = Symbol.for("react.context"), _x = Symbol.for("react.server_\
context"), Gr = Symbol.for("react.forward_ref"), qr = Symbol.for("react.suspense"), Yr = Symbol.for("react.suspense_list"), Qr = Symbol.for(
  "react.memo"), Xr = Symbol.for("react.lazy"), kx = Symbol.for("react.offscreen"), xp;
  xp = Symbol.for("react.module.reference");
  function Ue(e) {
    if (typeof e == "object" && e !== null) {
      var t = e.$$typeof;
      switch (t) {
        case Qi:
          switch (e = e.type, e) {
            case Vr:
            case Kr:
            case jr:
            case qr:
            case Yr:
              return e;
            default:
              switch (e = e && e.$$typeof, e) {
                case _x:
                case Ur:
                case Gr:
                case Xr:
                case Qr:
                case $r:
                  return e;
                default:
                  return t;
              }
          }
        case Xi:
          return t;
      }
    }
  }
  a(Ue, "v");
  pe.ContextConsumer = Ur;
  pe.ContextProvider = $r;
  pe.Element = Qi;
  pe.ForwardRef = Gr;
  pe.Fragment = Vr;
  pe.Lazy = Xr;
  pe.Memo = Qr;
  pe.Portal = Xi;
  pe.Profiler = Kr;
  pe.StrictMode = jr;
  pe.Suspense = qr;
  pe.SuspenseList = Yr;
  pe.isAsyncMode = function() {
    return !1;
  };
  pe.isConcurrentMode = function() {
    return !1;
  };
  pe.isContextConsumer = function(e) {
    return Ue(e) === Ur;
  };
  pe.isContextProvider = function(e) {
    return Ue(e) === $r;
  };
  pe.isElement = function(e) {
    return typeof e == "object" && e !== null && e.$$typeof === Qi;
  };
  pe.isForwardRef = function(e) {
    return Ue(e) === Gr;
  };
  pe.isFragment = function(e) {
    return Ue(e) === Vr;
  };
  pe.isLazy = function(e) {
    return Ue(e) === Xr;
  };
  pe.isMemo = function(e) {
    return Ue(e) === Qr;
  };
  pe.isPortal = function(e) {
    return Ue(e) === Xi;
  };
  pe.isProfiler = function(e) {
    return Ue(e) === Kr;
  };
  pe.isStrictMode = function(e) {
    return Ue(e) === jr;
  };
  pe.isSuspense = function(e) {
    return Ue(e) === qr;
  };
  pe.isSuspenseList = function(e) {
    return Ue(e) === Yr;
  };
  pe.isValidElementType = function(e) {
    return typeof e == "string" || typeof e == "function" || e === Vr || e === Kr || e === jr || e === qr || e === Yr || e === kx || typeof e ==
    "object" && e !== null && (e.$$typeof === Xr || e.$$typeof === Qr || e.$$typeof === $r || e.$$typeof === Ur || e.$$typeof === Gr || e.$$typeof ===
    xp || e.getModuleId !== void 0);
  };
  pe.typeOf = Ue;
});

// ../node_modules/downshift/node_modules/react-is/index.js
var wp = we((bR, Sp) => {
  "use strict";
  Sp.exports = Ip();
});

// ../node_modules/fuse.js/dist/fuse.js
var Ad = we((jo, Ws) => {
  (function(e, t) {
    typeof jo == "object" && typeof Ws == "object" ? Ws.exports = t() : typeof define == "function" && define.amd ? define("Fuse", [], t) : typeof jo ==
    "object" ? jo.Fuse = t() : e.Fuse = t();
  })(jo, function() {
    return function(e) {
      var t = {};
      function o(i) {
        if (t[i]) return t[i].exports;
        var r = t[i] = { i, l: !1, exports: {} };
        return e[i].call(r.exports, r, r.exports, o), r.l = !0, r.exports;
      }
      return a(o, "r"), o.m = e, o.c = t, o.d = function(i, r, n) {
        o.o(i, r) || Object.defineProperty(i, r, { enumerable: !0, get: n });
      }, o.r = function(i) {
        typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(i, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(
        i, "__esModule", { value: !0 });
      }, o.t = function(i, r) {
        if (1 & r && (i = o(i)), 8 & r || 4 & r && typeof i == "object" && i && i.__esModule) return i;
        var n = /* @__PURE__ */ Object.create(null);
        if (o.r(n), Object.defineProperty(n, "default", { enumerable: !0, value: i }), 2 & r && typeof i != "string") for (var l in i) o.d(n,
        l, function(u) {
          return i[u];
        }.bind(null, l));
        return n;
      }, o.n = function(i) {
        var r = i && i.__esModule ? function() {
          return i.default;
        } : function() {
          return i;
        };
        return o.d(r, "a", r), r;
      }, o.o = function(i, r) {
        return Object.prototype.hasOwnProperty.call(i, r);
      }, o.p = "", o(o.s = 0);
    }([function(e, t, o) {
      function i(p) {
        return (i = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(m) {
          return typeof m;
        } : function(m) {
          return m && typeof Symbol == "function" && m.constructor === Symbol && m !== Symbol.prototype ? "symbol" : typeof m;
        })(p);
      }
      a(i, "n");
      function r(p, m) {
        for (var h = 0; h < m.length; h++) {
          var b = m[h];
          b.enumerable = b.enumerable || !1, b.configurable = !0, "value" in b && (b.writable = !0), Object.defineProperty(p, b.key, b);
        }
      }
      a(r, "o");
      var n = o(1), l = o(7), u = l.get, c = (l.deepValue, l.isArray), d = function() {
        function p(f, y) {
          var S = y.location, E = S === void 0 ? 0 : S, g = y.distance, v = g === void 0 ? 100 : g, I = y.threshold, w = I === void 0 ? 0.6 :
          I, O = y.maxPatternLength, _ = O === void 0 ? 32 : O, k = y.caseSensitive, T = k !== void 0 && k, C = y.tokenSeparator, P = C === void 0 ?
          / +/g : C, D = y.findAllMatches, M = D !== void 0 && D, F = y.minMatchCharLength, Z = F === void 0 ? 1 : F, W = y.id, Q = W === void 0 ?
          null : W, H = y.keys, G = H === void 0 ? [] : H, z = y.shouldSort, re = z === void 0 || z, R = y.getFn, B = R === void 0 ? u : R, L = y.
          sortFn, $ = L === void 0 ? function(fe, Se) {
            return fe.score - Se.score;
          } : L, J = y.tokenize, ie = J !== void 0 && J, te = y.matchAllTokens, de = te !== void 0 && te, ae = y.includeMatches, ce = ae !==
          void 0 && ae, ue = y.includeScore, Ie = ue !== void 0 && ue, ye = y.verbose, Oe = ye !== void 0 && ye;
          (function(fe, Se) {
            if (!(fe instanceof Se)) throw new TypeError("Cannot call a class as a function");
          })(this, p), this.options = { location: E, distance: v, threshold: w, maxPatternLength: _, isCaseSensitive: T, tokenSeparator: P, findAllMatches: M,
          minMatchCharLength: Z, id: Q, keys: G, includeMatches: ce, includeScore: Ie, shouldSort: re, getFn: B, sortFn: $, verbose: Oe, tokenize: ie,
          matchAllTokens: de }, this.setCollection(f), this._processKeys(G);
        }
        a(p, "e");
        var m, h, b;
        return m = p, (h = [{ key: "setCollection", value: /* @__PURE__ */ a(function(f) {
          return this.list = f, f;
        }, "value") }, { key: "_processKeys", value: /* @__PURE__ */ a(function(f) {
          if (this._keyWeights = {}, this._keyNames = [], f.length && typeof f[0] == "string") for (var y = 0, S = f.length; y < S; y += 1) {
            var E = f[y];
            this._keyWeights[E] = 1, this._keyNames.push(E);
          }
          else {
            for (var g = null, v = null, I = 0, w = 0, O = f.length; w < O; w += 1) {
              var _ = f[w];
              if (!_.hasOwnProperty("name")) throw new Error('Missing "name" property in key object');
              var k = _.name;
              if (this._keyNames.push(k), !_.hasOwnProperty("weight")) throw new Error('Missing "weight" property in key object');
              var T = _.weight;
              if (T < 0 || T > 1) throw new Error('"weight" property in key must bein the range of [0, 1)');
              v = v == null ? T : Math.max(v, T), g = g == null ? T : Math.min(g, T), this._keyWeights[k] = T, I += T;
            }
            if (I > 1) throw new Error("Total of weights cannot exceed 1");
          }
        }, "value") }, { key: "search", value: /* @__PURE__ */ a(function(f) {
          var y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : { limit: !1 };
          this._log(`---------
Search pattern: "`.concat(f, '"'));
          var S = this._prepareSearchers(f), E = S.tokenSearchers, g = S.fullSearcher, v = this._search(E, g);
          return this._computeScore(v), this.options.shouldSort && this._sort(v), y.limit && typeof y.limit == "number" && (v = v.slice(0, y.
          limit)), this._format(v);
        }, "value") }, { key: "_prepareSearchers", value: /* @__PURE__ */ a(function() {
          var f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", y = [];
          if (this.options.tokenize) for (var S = f.split(this.options.tokenSeparator), E = 0, g = S.length; E < g; E += 1) y.push(new n(S[E],
          this.options));
          return { tokenSearchers: y, fullSearcher: new n(f, this.options) };
        }, "value") }, { key: "_search", value: /* @__PURE__ */ a(function() {
          var f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], y = arguments.length > 1 ? arguments[1] : void 0, S = this.
          list, E = {}, g = [];
          if (typeof S[0] == "string") {
            for (var v = 0, I = S.length; v < I; v += 1) this._analyze({ key: "", value: S[v], record: v, index: v }, { resultMap: E, results: g,
            tokenSearchers: f, fullSearcher: y });
            return g;
          }
          for (var w = 0, O = S.length; w < O; w += 1) for (var _ = S[w], k = 0, T = this._keyNames.length; k < T; k += 1) {
            var C = this._keyNames[k];
            this._analyze({ key: C, value: this.options.getFn(_, C), record: _, index: w }, { resultMap: E, results: g, tokenSearchers: f, fullSearcher: y });
          }
          return g;
        }, "value") }, { key: "_analyze", value: /* @__PURE__ */ a(function(f, y) {
          var S = this, E = f.key, g = f.arrayIndex, v = g === void 0 ? -1 : g, I = f.value, w = f.record, O = f.index, _ = y.tokenSearchers,
          k = _ === void 0 ? [] : _, T = y.fullSearcher, C = y.resultMap, P = C === void 0 ? {} : C, D = y.results, M = D === void 0 ? [] : D;
          (/* @__PURE__ */ a(function F(Z, W, Q, H) {
            if (W != null) {
              if (typeof W == "string") {
                var G = !1, z = -1, re = 0;
                S._log(`
Key: `.concat(E === "" ? "--" : E));
                var R = T.search(W);
                if (S._log('Full text: "'.concat(W, '", score: ').concat(R.score)), S.options.tokenize) {
                  for (var B = W.split(S.options.tokenSeparator), L = B.length, $ = [], J = 0, ie = k.length; J < ie; J += 1) {
                    var te = k[J];
                    S._log(`
Pattern: "`.concat(te.pattern, '"'));
                    for (var de = !1, ae = 0; ae < L; ae += 1) {
                      var ce = B[ae], ue = te.search(ce), Ie = {};
                      ue.isMatch ? (Ie[ce] = ue.score, G = !0, de = !0, $.push(ue.score)) : (Ie[ce] = 1, S.options.matchAllTokens || $.push(
                      1)), S._log('Token: "'.concat(ce, '", score: ').concat(Ie[ce]));
                    }
                    de && (re += 1);
                  }
                  z = $[0];
                  for (var ye = $.length, Oe = 1; Oe < ye; Oe += 1) z += $[Oe];
                  z /= ye, S._log("Token score average:", z);
                }
                var fe = R.score;
                z > -1 && (fe = (fe + z) / 2), S._log("Score average:", fe);
                var Se = !S.options.tokenize || !S.options.matchAllTokens || re >= k.length;
                if (S._log(`
Check Matches: `.concat(Se)), (G || R.isMatch) && Se) {
                  var _e = { key: E, arrayIndex: Z, value: W, score: fe };
                  S.options.includeMatches && (_e.matchedIndices = R.matchedIndices);
                  var Ae = P[H];
                  Ae ? Ae.output.push(_e) : (P[H] = { item: Q, output: [_e] }, M.push(P[H]));
                }
              } else if (c(W)) for (var et = 0, N = W.length; et < N; et += 1) F(et, W[et], Q, H);
            }
          }, "e"))(v, I, w, O);
        }, "value") }, { key: "_computeScore", value: /* @__PURE__ */ a(function(f) {
          this._log(`

Computing score:
`);
          for (var y = this._keyWeights, S = !!Object.keys(y).length, E = 0, g = f.length; E < g; E += 1) {
            for (var v = f[E], I = v.output, w = I.length, O = 1, _ = 0; _ < w; _ += 1) {
              var k = I[_], T = k.key, C = S ? y[T] : 1, P = k.score === 0 && y && y[T] > 0 ? Number.EPSILON : k.score;
              O *= Math.pow(P, C);
            }
            v.score = O, this._log(v);
          }
        }, "value") }, { key: "_sort", value: /* @__PURE__ */ a(function(f) {
          this._log(`

Sorting....`), f.sort(this.options.sortFn);
        }, "value") }, { key: "_format", value: /* @__PURE__ */ a(function(f) {
          var y = [];
          if (this.options.verbose) {
            var S = [];
            this._log(`

Output:

`, JSON.stringify(f, function(k, T) {
              if (i(T) === "object" && T !== null) {
                if (S.indexOf(T) !== -1) return;
                S.push(T);
              }
              return T;
            }, 2)), S = null;
          }
          var E = [];
          this.options.includeMatches && E.push(function(k, T) {
            var C = k.output;
            T.matches = [];
            for (var P = 0, D = C.length; P < D; P += 1) {
              var M = C[P];
              if (M.matchedIndices.length !== 0) {
                var F = { indices: M.matchedIndices, value: M.value };
                M.key && (F.key = M.key), M.hasOwnProperty("arrayIndex") && M.arrayIndex > -1 && (F.arrayIndex = M.arrayIndex), T.matches.push(
                F);
              }
            }
          }), this.options.includeScore && E.push(function(k, T) {
            T.score = k.score;
          });
          for (var g = 0, v = f.length; g < v; g += 1) {
            var I = f[g];
            if (this.options.id && (I.item = this.options.getFn(I.item, this.options.id)[0]), E.length) {
              for (var w = { item: I.item }, O = 0, _ = E.length; O < _; O += 1) E[O](I, w);
              y.push(w);
            } else y.push(I.item);
          }
          return y;
        }, "value") }, { key: "_log", value: /* @__PURE__ */ a(function() {
          var f;
          this.options.verbose && (f = console).log.apply(f, arguments);
        }, "value") }]) && r(m.prototype, h), b && r(m, b), p;
      }();
      e.exports = d;
    }, function(e, t, o) {
      function i(c, d) {
        for (var p = 0; p < d.length; p++) {
          var m = d[p];
          m.enumerable = m.enumerable || !1, m.configurable = !0, "value" in m && (m.writable = !0), Object.defineProperty(c, m.key, m);
        }
      }
      a(i, "n");
      var r = o(2), n = o(3), l = o(6), u = function() {
        function c(h, b) {
          var f = b.location, y = f === void 0 ? 0 : f, S = b.distance, E = S === void 0 ? 100 : S, g = b.threshold, v = g === void 0 ? 0.6 :
          g, I = b.maxPatternLength, w = I === void 0 ? 32 : I, O = b.isCaseSensitive, _ = O !== void 0 && O, k = b.tokenSeparator, T = k ===
          void 0 ? / +/g : k, C = b.findAllMatches, P = C !== void 0 && C, D = b.minMatchCharLength, M = D === void 0 ? 1 : D, F = b.includeMatches,
          Z = F !== void 0 && F;
          (function(W, Q) {
            if (!(W instanceof Q)) throw new TypeError("Cannot call a class as a function");
          })(this, c), this.options = { location: y, distance: E, threshold: v, maxPatternLength: w, isCaseSensitive: _, tokenSeparator: T, findAllMatches: P,
          includeMatches: Z, minMatchCharLength: M }, this.pattern = _ ? h : h.toLowerCase(), this.pattern.length <= w && (this.patternAlphabet =
          l(this.pattern));
        }
        a(c, "e");
        var d, p, m;
        return d = c, (p = [{ key: "search", value: /* @__PURE__ */ a(function(h) {
          var b = this.options, f = b.isCaseSensitive, y = b.includeMatches;
          if (f || (h = h.toLowerCase()), this.pattern === h) {
            var S = { isMatch: !0, score: 0 };
            return y && (S.matchedIndices = [[0, h.length - 1]]), S;
          }
          var E = this.options, g = E.maxPatternLength, v = E.tokenSeparator;
          if (this.pattern.length > g) return r(h, this.pattern, v);
          var I = this.options, w = I.location, O = I.distance, _ = I.threshold, k = I.findAllMatches, T = I.minMatchCharLength;
          return n(h, this.pattern, this.patternAlphabet, { location: w, distance: O, threshold: _, findAllMatches: k, minMatchCharLength: T,
          includeMatches: y });
        }, "value") }]) && i(d.prototype, p), m && i(d, m), c;
      }();
      e.exports = u;
    }, function(e, t) {
      var o = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
      e.exports = function(i, r) {
        var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : / +/g, l = new RegExp(r.replace(o, "\\$&").replace(n, "|")),
        u = i.match(l), c = !!u, d = [];
        if (c) for (var p = 0, m = u.length; p < m; p += 1) {
          var h = u[p];
          d.push([i.indexOf(h), h.length - 1]);
        }
        return { score: c ? 0.5 : 1, isMatch: c, matchedIndices: d };
      };
    }, function(e, t, o) {
      var i = o(4), r = o(5);
      e.exports = function(n, l, u, c) {
        for (var d = c.location, p = d === void 0 ? 0 : d, m = c.distance, h = m === void 0 ? 100 : m, b = c.threshold, f = b === void 0 ? 0.6 :
        b, y = c.findAllMatches, S = y !== void 0 && y, E = c.minMatchCharLength, g = E === void 0 ? 1 : E, v = c.includeMatches, I = v !== void 0 &&
        v, w = p, O = n.length, _ = f, k = n.indexOf(l, w), T = l.length, C = [], P = 0; P < O; P += 1) C[P] = 0;
        if (k !== -1) {
          var D = i(l, { errors: 0, currentLocation: k, expectedLocation: w, distance: h });
          if (_ = Math.min(D, _), (k = n.lastIndexOf(l, w + T)) !== -1) {
            var M = i(l, { errors: 0, currentLocation: k, expectedLocation: w, distance: h });
            _ = Math.min(M, _);
          }
        }
        k = -1;
        for (var F = [], Z = 1, W = T + O, Q = 1 << (T <= 31 ? T - 1 : 30), H = 0; H < T; H += 1) {
          for (var G = 0, z = W; G < z; )
            i(l, { errors: H, currentLocation: w + z, expectedLocation: w, distance: h }) <= _ ? G = z : W = z, z = Math.floor((W - G) / 2 +
            G);
          W = z;
          var re = Math.max(1, w - z + 1), R = S ? O : Math.min(w + z, O) + T, B = Array(R + 2);
          B[R + 1] = (1 << H) - 1;
          for (var L = R; L >= re; L -= 1) {
            var $ = L - 1, J = u[n.charAt($)];
            if (J && (C[$] = 1), B[L] = (B[L + 1] << 1 | 1) & J, H !== 0 && (B[L] |= (F[L + 1] | F[L]) << 1 | 1 | F[L + 1]), B[L] & Q && (Z =
            i(l, { errors: H, currentLocation: $, expectedLocation: w, distance: h })) <= _) {
              if (_ = Z, (k = $) <= w) break;
              re = Math.max(1, 2 * w - k);
            }
          }
          if (i(l, { errors: H + 1, currentLocation: w, expectedLocation: w, distance: h }) > _) break;
          F = B;
        }
        var ie = { isMatch: k >= 0, score: Z === 0 ? 1e-3 : Z };
        return I && (ie.matchedIndices = r(C, g)), ie;
      };
    }, function(e, t) {
      e.exports = function(o, i) {
        var r = i.errors, n = r === void 0 ? 0 : r, l = i.currentLocation, u = l === void 0 ? 0 : l, c = i.expectedLocation, d = c === void 0 ?
        0 : c, p = i.distance, m = p === void 0 ? 100 : p, h = n / o.length, b = Math.abs(d - u);
        return m ? h + b / m : b ? 1 : h;
      };
    }, function(e, t) {
      e.exports = function() {
        for (var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], i = arguments.length > 1 && arguments[1] !== void 0 ?
        arguments[1] : 1, r = [], n = -1, l = -1, u = 0, c = o.length; u < c; u += 1) {
          var d = o[u];
          d && n === -1 ? n = u : d || n === -1 || ((l = u - 1) - n + 1 >= i && r.push([n, l]), n = -1);
        }
        return o[u - 1] && u - n >= i && r.push([n, u - 1]), r;
      };
    }, function(e, t) {
      e.exports = function(o) {
        for (var i = {}, r = o.length, n = 0; n < r; n += 1) i[o.charAt(n)] = 0;
        for (var l = 0; l < r; l += 1) i[o.charAt(l)] |= 1 << r - l - 1;
        return i;
      };
    }, function(e, t) {
      var o = /* @__PURE__ */ a(function(l) {
        return Array.isArray ? Array.isArray(l) : Object.prototype.toString.call(l) === "[object Array]";
      }, "r"), i = /* @__PURE__ */ a(function(l) {
        return l == null ? "" : function(u) {
          if (typeof u == "string") return u;
          var c = u + "";
          return c == "0" && 1 / u == -1 / 0 ? "-0" : c;
        }(l);
      }, "n"), r = /* @__PURE__ */ a(function(l) {
        return typeof l == "string";
      }, "o"), n = /* @__PURE__ */ a(function(l) {
        return typeof l == "number";
      }, "i");
      e.exports = { get: /* @__PURE__ */ a(function(l, u) {
        var c = [];
        return (/* @__PURE__ */ a(function d(p, m) {
          if (m) {
            var h = m.indexOf("."), b = m, f = null;
            h !== -1 && (b = m.slice(0, h), f = m.slice(h + 1));
            var y = p[b];
            if (y != null) if (f || !r(y) && !n(y)) if (o(y)) for (var S = 0, E = y.length; S < E; S += 1) d(y[S], f);
            else f && d(y, f);
            else c.push(i(y));
          } else c.push(p);
        }, "e"))(l, u), c;
      }, "get"), isArray: o, isString: r, isNum: n, toString: i };
    }]);
  });
});

// ../node_modules/store2/dist/store2.js
var Vd = we((gn, yn) => {
  (function(e, t) {
    var o = {
      version: "2.14.4",
      areas: {},
      apis: {},
      nsdelim: ".",
      // utilities
      inherit: /* @__PURE__ */ a(function(r, n) {
        for (var l in r)
          n.hasOwnProperty(l) || Object.defineProperty(n, l, Object.getOwnPropertyDescriptor(r, l));
        return n;
      }, "inherit"),
      stringify: /* @__PURE__ */ a(function(r, n) {
        return r === void 0 || typeof r == "function" ? r + "" : JSON.stringify(r, n || o.replace);
      }, "stringify"),
      parse: /* @__PURE__ */ a(function(r, n) {
        try {
          return JSON.parse(r, n || o.revive);
        } catch {
          return r;
        }
      }, "parse"),
      // extension hooks
      fn: /* @__PURE__ */ a(function(r, n) {
        o.storeAPI[r] = n;
        for (var l in o.apis)
          o.apis[l][r] = n;
      }, "fn"),
      get: /* @__PURE__ */ a(function(r, n) {
        return r.getItem(n);
      }, "get"),
      set: /* @__PURE__ */ a(function(r, n, l) {
        r.setItem(n, l);
      }, "set"),
      remove: /* @__PURE__ */ a(function(r, n) {
        r.removeItem(n);
      }, "remove"),
      key: /* @__PURE__ */ a(function(r, n) {
        return r.key(n);
      }, "key"),
      length: /* @__PURE__ */ a(function(r) {
        return r.length;
      }, "length"),
      clear: /* @__PURE__ */ a(function(r) {
        r.clear();
      }, "clear"),
      // core functions
      Store: /* @__PURE__ */ a(function(r, n, l) {
        var u = o.inherit(o.storeAPI, function(d, p, m) {
          return arguments.length === 0 ? u.getAll() : typeof p == "function" ? u.transact(d, p, m) : p !== void 0 ? u.set(d, p, m) : typeof d ==
          "string" || typeof d == "number" ? u.get(d) : typeof d == "function" ? u.each(d) : d ? u.setAll(d, p) : u.clear();
        });
        u._id = r;
        try {
          var c = "__store2_test";
          n.setItem(c, "ok"), u._area = n, n.removeItem(c);
        } catch {
          u._area = o.storage("fake");
        }
        return u._ns = l || "", o.areas[r] || (o.areas[r] = u._area), o.apis[u._ns + u._id] || (o.apis[u._ns + u._id] = u), u;
      }, "Store"),
      storeAPI: {
        // admin functions
        area: /* @__PURE__ */ a(function(r, n) {
          var l = this[r];
          return (!l || !l.area) && (l = o.Store(r, n, this._ns), this[r] || (this[r] = l)), l;
        }, "area"),
        namespace: /* @__PURE__ */ a(function(r, n, l) {
          if (l = l || this._delim || o.nsdelim, !r)
            return this._ns ? this._ns.substring(0, this._ns.length - l.length) : "";
          var u = r, c = this[u];
          if ((!c || !c.namespace) && (c = o.Store(this._id, this._area, this._ns + u + l), c._delim = l, this[u] || (this[u] = c), !n))
            for (var d in o.areas)
              c.area(d, o.areas[d]);
          return c;
        }, "namespace"),
        isFake: /* @__PURE__ */ a(function(r) {
          return r ? (this._real = this._area, this._area = o.storage("fake")) : r === !1 && (this._area = this._real || this._area), this._area.
          name === "fake";
        }, "isFake"),
        toString: /* @__PURE__ */ a(function() {
          return "store" + (this._ns ? "." + this.namespace() : "") + "[" + this._id + "]";
        }, "toString"),
        // storage functions
        has: /* @__PURE__ */ a(function(r) {
          return this._area.has ? this._area.has(this._in(r)) : this._in(r) in this._area;
        }, "has"),
        size: /* @__PURE__ */ a(function() {
          return this.keys().length;
        }, "size"),
        each: /* @__PURE__ */ a(function(r, n) {
          for (var l = 0, u = o.length(this._area); l < u; l++) {
            var c = this._out(o.key(this._area, l));
            if (c !== void 0 && r.call(this, c, this.get(c), n) === !1)
              break;
            u > o.length(this._area) && (u--, l--);
          }
          return n || this;
        }, "each"),
        keys: /* @__PURE__ */ a(function(r) {
          return this.each(function(n, l, u) {
            u.push(n);
          }, r || []);
        }, "keys"),
        get: /* @__PURE__ */ a(function(r, n) {
          var l = o.get(this._area, this._in(r)), u;
          return typeof n == "function" && (u = n, n = null), l !== null ? o.parse(l, u) : n ?? l;
        }, "get"),
        getAll: /* @__PURE__ */ a(function(r) {
          return this.each(function(n, l, u) {
            u[n] = l;
          }, r || {});
        }, "getAll"),
        transact: /* @__PURE__ */ a(function(r, n, l) {
          var u = this.get(r, l), c = n(u);
          return this.set(r, c === void 0 ? u : c), this;
        }, "transact"),
        set: /* @__PURE__ */ a(function(r, n, l) {
          var u = this.get(r), c;
          return u != null && l === !1 ? n : (typeof l == "function" && (c = l, l = void 0), o.set(this._area, this._in(r), o.stringify(n, c),
          l) || u);
        }, "set"),
        setAll: /* @__PURE__ */ a(function(r, n) {
          var l, u;
          for (var c in r)
            u = r[c], this.set(c, u, n) !== u && (l = !0);
          return l;
        }, "setAll"),
        add: /* @__PURE__ */ a(function(r, n, l) {
          var u = this.get(r);
          if (u instanceof Array)
            n = u.concat(n);
          else if (u !== null) {
            var c = typeof u;
            if (c === typeof n && c === "object") {
              for (var d in n)
                u[d] = n[d];
              n = u;
            } else
              n = u + n;
          }
          return o.set(this._area, this._in(r), o.stringify(n, l)), n;
        }, "add"),
        remove: /* @__PURE__ */ a(function(r, n) {
          var l = this.get(r, n);
          return o.remove(this._area, this._in(r)), l;
        }, "remove"),
        clear: /* @__PURE__ */ a(function() {
          return this._ns ? this.each(function(r) {
            o.remove(this._area, this._in(r));
          }, 1) : o.clear(this._area), this;
        }, "clear"),
        clearAll: /* @__PURE__ */ a(function() {
          var r = this._area;
          for (var n in o.areas)
            o.areas.hasOwnProperty(n) && (this._area = o.areas[n], this.clear());
          return this._area = r, this;
        }, "clearAll"),
        // internal use functions
        _in: /* @__PURE__ */ a(function(r) {
          return typeof r != "string" && (r = o.stringify(r)), this._ns ? this._ns + r : r;
        }, "_in"),
        _out: /* @__PURE__ */ a(function(r) {
          return this._ns ? r && r.indexOf(this._ns) === 0 ? r.substring(this._ns.length) : void 0 : (
            // so each() knows to skip it
            r
          );
        }, "_out")
      },
      // end _.storeAPI
      storage: /* @__PURE__ */ a(function(r) {
        return o.inherit(o.storageAPI, { items: {}, name: r });
      }, "storage"),
      storageAPI: {
        length: 0,
        has: /* @__PURE__ */ a(function(r) {
          return this.items.hasOwnProperty(r);
        }, "has"),
        key: /* @__PURE__ */ a(function(r) {
          var n = 0;
          for (var l in this.items)
            if (this.has(l) && r === n++)
              return l;
        }, "key"),
        setItem: /* @__PURE__ */ a(function(r, n) {
          this.has(r) || this.length++, this.items[r] = n;
        }, "setItem"),
        removeItem: /* @__PURE__ */ a(function(r) {
          this.has(r) && (delete this.items[r], this.length--);
        }, "removeItem"),
        getItem: /* @__PURE__ */ a(function(r) {
          return this.has(r) ? this.items[r] : null;
        }, "getItem"),
        clear: /* @__PURE__ */ a(function() {
          for (var r in this.items)
            this.removeItem(r);
        }, "clear")
      }
      // end _.storageAPI
    }, i = (
      // safely set this up (throws error in IE10/32bit mode for local files)
      o.Store("local", function() {
        try {
          return localStorage;
        } catch {
        }
      }())
    );
    i.local = i, i._ = o, i.area("session", function() {
      try {
        return sessionStorage;
      } catch {
      }
    }()), i.area("page", o.storage("page")), typeof t == "function" && t.amd !== void 0 ? t("store2", [], function() {
      return i;
    }) : typeof yn < "u" && yn.exports ? yn.exports = i : (e.store && (o.conflict = e.store), e.store = i);
  })(gn, gn && gn.define);
});

// global-externals:react
var s = __REACT__, { Children: uw, Component: Le, Fragment: Ee, Profiler: cw, PureComponent: pw, StrictMode: dw, Suspense: fw, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: mw,
act: hw, cloneElement: Js, createContext: Qt, createElement: gw, createFactory: yw, createRef: bw, forwardRef: ea, isValidElement: vw, lazy: xw,
memo: Tt, startTransition: Iw, unstable_act: Sw, useCallback: A, useContext: Go, useDebugValue: ww, useDeferredValue: ta, useEffect: V, useId: Ew,
useImperativeHandle: Tw, useInsertionEffect: Cw, useLayoutEffect: Xt, useMemo: U, useReducer: Zt, useRef: q, useState: K, useSyncExternalStore: _w,
useTransition: oa, version: kw } = __REACT__;

// global-externals:storybook/internal/channels
var Ow = __STORYBOOK_CHANNELS__, { Channel: Pw, HEARTBEAT_INTERVAL: Aw, HEARTBEAT_MAX_LATENCY: Dw, PostMessageTransport: Mw, WebsocketTransport: Lw,
createBrowserChannel: ra } = __STORYBOOK_CHANNELS__;

// global-externals:storybook/internal/core-events
var Fw = __STORYBOOK_CORE_EVENTS__, { ARGTYPES_INFO_REQUEST: na, ARGTYPES_INFO_RESPONSE: ia, CHANNEL_CREATED: sa, CHANNEL_WS_DISCONNECT: aa,
CONFIG_ERROR: Rw, CREATE_NEW_STORYFILE_REQUEST: la, CREATE_NEW_STORYFILE_RESPONSE: ua, CURRENT_STORY_WAS_SET: Bw, DOCS_PREPARED: Hw, DOCS_RENDERED: zw,
FILE_COMPONENT_SEARCH_REQUEST: ca, FILE_COMPONENT_SEARCH_RESPONSE: qo, FORCE_REMOUNT: xn, FORCE_RE_RENDER: Ww, GLOBALS_UPDATED: Vw, NAVIGATE_URL: jw,
PLAY_FUNCTION_THREW_EXCEPTION: Kw, PRELOAD_ENTRIES: Ct, PREVIEW_BUILDER_PROGRESS: pa, PREVIEW_KEYDOWN: $w, REGISTER_SUBSCRIPTION: Uw, REQUEST_WHATS_NEW_DATA: Gw,
RESET_STORY_ARGS: qw, RESULT_WHATS_NEW_DATA: Yw, SAVE_STORY_REQUEST: da, SAVE_STORY_RESPONSE: fa, SELECT_STORY: Qw, SET_CONFIG: Xw, SET_CURRENT_STORY: ma,
SET_FILTER: Zw, SET_GLOBALS: Jw, SET_INDEX: eE, SET_STORIES: tE, SET_WHATS_NEW_CACHE: oE, SHARED_STATE_CHANGED: rE, SHARED_STATE_SET: nE, STORIES_COLLAPSE_ALL: ho,
STORIES_EXPAND_ALL: In, STORY_ARGS_UPDATED: iE, STORY_CHANGED: sE, STORY_ERRORED: aE, STORY_FINISHED: lE, STORY_HOT_UPDATED: uE, STORY_INDEX_INVALIDATED: cE,
STORY_MISSING: pE, STORY_PREPARED: dE, STORY_RENDERED: fE, STORY_RENDER_PHASE_CHANGED: mE, STORY_SPECIFIED: hE, STORY_THREW_EXCEPTION: gE, STORY_UNCHANGED: yE,
TELEMETRY_ERROR: bE, TOGGLE_WHATS_NEW_NOTIFICATIONS: vE, UNHANDLED_ERRORS_WHILE_PLAYING: xE, UPDATE_GLOBALS: IE, UPDATE_QUERY_PARAMS: SE, UPDATE_STORY_ARGS: wE } = __STORYBOOK_CORE_EVENTS__;

// ../node_modules/@storybook/global/dist/index.mjs
var se = (() => {
  let e;
  return typeof window < "u" ? e = window : typeof globalThis < "u" ? e = globalThis : typeof global < "u" ? e = global : typeof self < "u" ?
  e = self : e = {}, e;
})();

// global-externals:@storybook/icons
var ei = {};
hf(ei, {
  AccessibilityAltIcon: () => vf,
  AccessibilityIcon: () => xf,
  AccessibilityIgnoredIcon: () => If,
  AddIcon: () => Sf,
  AdminIcon: () => wf,
  AlertAltIcon: () => Ef,
  AlertIcon: () => go,
  AlignLeftIcon: () => Tf,
  AlignRightIcon: () => Cf,
  AppleIcon: () => _f,
  ArrowBottomLeftIcon: () => kf,
  ArrowBottomRightIcon: () => Of,
  ArrowDownIcon: () => Pf,
  ArrowLeftIcon: () => Sn,
  ArrowRightIcon: () => Af,
  ArrowSolidDownIcon: () => Df,
  ArrowSolidLeftIcon: () => Mf,
  ArrowSolidRightIcon: () => Lf,
  ArrowSolidUpIcon: () => Nf,
  ArrowTopLeftIcon: () => Ff,
  ArrowTopRightIcon: () => Rf,
  ArrowUpIcon: () => Bf,
  AzureDevOpsIcon: () => Hf,
  BackIcon: () => zf,
  BasketIcon: () => Wf,
  BatchAcceptIcon: () => Vf,
  BatchDenyIcon: () => jf,
  BeakerIcon: () => Kf,
  BellIcon: () => $f,
  BitbucketIcon: () => Uf,
  BoldIcon: () => Gf,
  BookIcon: () => qf,
  BookmarkHollowIcon: () => Yf,
  BookmarkIcon: () => Qf,
  BottomBarIcon: () => yo,
  BottomBarToggleIcon: () => wn,
  BoxIcon: () => Xf,
  BranchIcon: () => Zf,
  BrowserIcon: () => Jf,
  ButtonIcon: () => em,
  CPUIcon: () => tm,
  CalendarIcon: () => om,
  CameraIcon: () => rm,
  CameraStabilizeIcon: () => nm,
  CategoryIcon: () => im,
  CertificateIcon: () => sm,
  ChangedIcon: () => am,
  ChatIcon: () => lm,
  CheckIcon: () => Be,
  ChevronDownIcon: () => _t,
  ChevronLeftIcon: () => um,
  ChevronRightIcon: () => En,
  ChevronSmallDownIcon: () => cm,
  ChevronSmallLeftIcon: () => pm,
  ChevronSmallRightIcon: () => dm,
  ChevronSmallUpIcon: () => Tn,
  ChevronUpIcon: () => fm,
  ChromaticIcon: () => mm,
  ChromeIcon: () => hm,
  CircleHollowIcon: () => gm,
  CircleIcon: () => Cn,
  ClearIcon: () => ym,
  CloseAltIcon: () => bo,
  CloseIcon: () => je,
  CloudHollowIcon: () => bm,
  CloudIcon: () => vm,
  CogIcon: () => Yo,
  CollapseIcon: () => _n,
  CommandIcon: () => kn,
  CommentAddIcon: () => xm,
  CommentIcon: () => Im,
  CommentsIcon: () => Sm,
  CommitIcon: () => wm,
  CompassIcon: () => Em,
  ComponentDrivenIcon: () => Tm,
  ComponentIcon: () => Qo,
  ContrastIcon: () => Cm,
  ContrastIgnoredIcon: () => _m,
  ControlsIcon: () => km,
  CopyIcon: () => Om,
  CreditIcon: () => Pm,
  CrossIcon: () => Am,
  DashboardIcon: () => Dm,
  DatabaseIcon: () => Mm,
  DeleteIcon: () => Lm,
  DiamondIcon: () => Nm,
  DirectionIcon: () => Fm,
  DiscordIcon: () => Rm,
  DocChartIcon: () => Bm,
  DocListIcon: () => Hm,
  DocumentIcon: () => kt,
  DownloadIcon: () => zm,
  DragIcon: () => Wm,
  EditIcon: () => Vm,
  EllipsisIcon: () => On,
  EmailIcon: () => jm,
  ExpandAltIcon: () => Pn,
  ExpandIcon: () => An,
  EyeCloseIcon: () => Dn,
  EyeIcon: () => Mn,
  FaceHappyIcon: () => Km,
  FaceNeutralIcon: () => $m,
  FaceSadIcon: () => Um,
  FacebookIcon: () => Gm,
  FailedIcon: () => Ln,
  FastForwardIcon: () => qm,
  FigmaIcon: () => Ym,
  FilterIcon: () => Nn,
  FlagIcon: () => Qm,
  FolderIcon: () => Xm,
  FormIcon: () => Zm,
  GDriveIcon: () => Jm,
  GithubIcon: () => vo,
  GitlabIcon: () => eh,
  GlobeIcon: () => Xo,
  GoogleIcon: () => th,
  GraphBarIcon: () => oh,
  GraphLineIcon: () => rh,
  GraphqlIcon: () => nh,
  GridAltIcon: () => ih,
  GridIcon: () => sh,
  GrowIcon: () => ah,
  HeartHollowIcon: () => lh,
  HeartIcon: () => Fn,
  HomeIcon: () => uh,
  HourglassIcon: () => ch,
  InfoIcon: () => Rn,
  ItalicIcon: () => ph,
  JumpToIcon: () => dh,
  KeyIcon: () => fh,
  LightningIcon: () => Bn,
  LightningOffIcon: () => mh,
  LinkBrokenIcon: () => hh,
  LinkIcon: () => Hn,
  LinkedinIcon: () => gh,
  LinuxIcon: () => yh,
  ListOrderedIcon: () => bh,
  ListUnorderedIcon: () => vh,
  LocationIcon: () => xh,
  LockIcon: () => xo,
  MarkdownIcon: () => Ih,
  MarkupIcon: () => zn,
  MediumIcon: () => Sh,
  MemoryIcon: () => wh,
  MenuIcon: () => Io,
  MergeIcon: () => Eh,
  MirrorIcon: () => Th,
  MobileIcon: () => Ch,
  MoonIcon: () => _h,
  NutIcon: () => kh,
  OutboxIcon: () => Oh,
  OutlineIcon: () => Ph,
  PaintBrushIcon: () => Ah,
  PaperClipIcon: () => Dh,
  ParagraphIcon: () => Mh,
  PassedIcon: () => Lh,
  PhoneIcon: () => Nh,
  PhotoDragIcon: () => Fh,
  PhotoIcon: () => Rh,
  PhotoStabilizeIcon: () => Bh,
  PinAltIcon: () => Hh,
  PinIcon: () => zh,
  PlayAllHollowIcon: () => Wn,
  PlayBackIcon: () => Wh,
  PlayHollowIcon: () => Vh,
  PlayIcon: () => jh,
  PlayNextIcon: () => Kh,
  PlusIcon: () => Vn,
  PointerDefaultIcon: () => $h,
  PointerHandIcon: () => Uh,
  PowerIcon: () => Gh,
  PrintIcon: () => qh,
  ProceedIcon: () => Yh,
  ProfileIcon: () => Qh,
  PullRequestIcon: () => Xh,
  QuestionIcon: () => Zh,
  RSSIcon: () => Jh,
  RedirectIcon: () => eg,
  ReduxIcon: () => tg,
  RefreshIcon: () => og,
  ReplyIcon: () => rg,
  RepoIcon: () => ng,
  RequestChangeIcon: () => ig,
  RewindIcon: () => sg,
  RulerIcon: () => ag,
  SaveIcon: () => lg,
  SearchIcon: () => So,
  ShareAltIcon: () => tt,
  ShareIcon: () => ug,
  ShieldIcon: () => cg,
  SideBySideIcon: () => pg,
  SidebarAltIcon: () => wo,
  SidebarAltToggleIcon: () => dg,
  SidebarIcon: () => fg,
  SidebarToggleIcon: () => mg,
  SpeakerIcon: () => hg,
  StackedIcon: () => gg,
  StarHollowIcon: () => yg,
  StarIcon: () => bg,
  StatusFailIcon: () => jn,
  StatusIcon: () => vg,
  StatusPassIcon: () => Kn,
  StatusWarnIcon: () => $n,
  StickerIcon: () => xg,
  StopAltHollowIcon: () => Ig,
  StopAltIcon: () => Sg,
  StopIcon: () => wg,
  StorybookIcon: () => Un,
  StructureIcon: () => Eg,
  SubtractIcon: () => Tg,
  SunIcon: () => Cg,
  SupportIcon: () => _g,
  SweepIcon: () => Gn,
  SwitchAltIcon: () => kg,
  SyncIcon: () => ut,
  TabletIcon: () => Og,
  ThumbsUpIcon: () => Pg,
  TimeIcon: () => qn,
  TimerIcon: () => Ag,
  TransferIcon: () => Dg,
  TrashIcon: () => Yn,
  TwitterIcon: () => Mg,
  TypeIcon: () => Lg,
  UbuntuIcon: () => Ng,
  UndoIcon: () => Fg,
  UnfoldIcon: () => Rg,
  UnlockIcon: () => Bg,
  UnpinIcon: () => Hg,
  UploadIcon: () => zg,
  UserAddIcon: () => Wg,
  UserAltIcon: () => Vg,
  UserIcon: () => jg,
  UsersIcon: () => Kg,
  VSCodeIcon: () => $g,
  VerifiedIcon: () => Ug,
  VideoIcon: () => Gg,
  WandIcon: () => Qn,
  WatchIcon: () => qg,
  WindowsIcon: () => Yg,
  WrenchIcon: () => Qg,
  XIcon: () => Xg,
  YoutubeIcon: () => Zg,
  ZoomIcon: () => Xn,
  ZoomOutIcon: () => Zn,
  ZoomResetIcon: () => Jn,
  default: () => bf,
  iconList: () => Jg
});
var bf = __STORYBOOK_ICONS__, { AccessibilityAltIcon: vf, AccessibilityIcon: xf, AccessibilityIgnoredIcon: If, AddIcon: Sf, AdminIcon: wf, AlertAltIcon: Ef,
AlertIcon: go, AlignLeftIcon: Tf, AlignRightIcon: Cf, AppleIcon: _f, ArrowBottomLeftIcon: kf, ArrowBottomRightIcon: Of, ArrowDownIcon: Pf, ArrowLeftIcon: Sn,
ArrowRightIcon: Af, ArrowSolidDownIcon: Df, ArrowSolidLeftIcon: Mf, ArrowSolidRightIcon: Lf, ArrowSolidUpIcon: Nf, ArrowTopLeftIcon: Ff, ArrowTopRightIcon: Rf,
ArrowUpIcon: Bf, AzureDevOpsIcon: Hf, BackIcon: zf, BasketIcon: Wf, BatchAcceptIcon: Vf, BatchDenyIcon: jf, BeakerIcon: Kf, BellIcon: $f, BitbucketIcon: Uf,
BoldIcon: Gf, BookIcon: qf, BookmarkHollowIcon: Yf, BookmarkIcon: Qf, BottomBarIcon: yo, BottomBarToggleIcon: wn, BoxIcon: Xf, BranchIcon: Zf,
BrowserIcon: Jf, ButtonIcon: em, CPUIcon: tm, CalendarIcon: om, CameraIcon: rm, CameraStabilizeIcon: nm, CategoryIcon: im, CertificateIcon: sm,
ChangedIcon: am, ChatIcon: lm, CheckIcon: Be, ChevronDownIcon: _t, ChevronLeftIcon: um, ChevronRightIcon: En, ChevronSmallDownIcon: cm, ChevronSmallLeftIcon: pm,
ChevronSmallRightIcon: dm, ChevronSmallUpIcon: Tn, ChevronUpIcon: fm, ChromaticIcon: mm, ChromeIcon: hm, CircleHollowIcon: gm, CircleIcon: Cn,
ClearIcon: ym, CloseAltIcon: bo, CloseIcon: je, CloudHollowIcon: bm, CloudIcon: vm, CogIcon: Yo, CollapseIcon: _n, CommandIcon: kn, CommentAddIcon: xm,
CommentIcon: Im, CommentsIcon: Sm, CommitIcon: wm, CompassIcon: Em, ComponentDrivenIcon: Tm, ComponentIcon: Qo, ContrastIcon: Cm, ContrastIgnoredIcon: _m,
ControlsIcon: km, CopyIcon: Om, CreditIcon: Pm, CrossIcon: Am, DashboardIcon: Dm, DatabaseIcon: Mm, DeleteIcon: Lm, DiamondIcon: Nm, DirectionIcon: Fm,
DiscordIcon: Rm, DocChartIcon: Bm, DocListIcon: Hm, DocumentIcon: kt, DownloadIcon: zm, DragIcon: Wm, EditIcon: Vm, EllipsisIcon: On, EmailIcon: jm,
ExpandAltIcon: Pn, ExpandIcon: An, EyeCloseIcon: Dn, EyeIcon: Mn, FaceHappyIcon: Km, FaceNeutralIcon: $m, FaceSadIcon: Um, FacebookIcon: Gm,
FailedIcon: Ln, FastForwardIcon: qm, FigmaIcon: Ym, FilterIcon: Nn, FlagIcon: Qm, FolderIcon: Xm, FormIcon: Zm, GDriveIcon: Jm, GithubIcon: vo,
GitlabIcon: eh, GlobeIcon: Xo, GoogleIcon: th, GraphBarIcon: oh, GraphLineIcon: rh, GraphqlIcon: nh, GridAltIcon: ih, GridIcon: sh, GrowIcon: ah,
HeartHollowIcon: lh, HeartIcon: Fn, HomeIcon: uh, HourglassIcon: ch, InfoIcon: Rn, ItalicIcon: ph, JumpToIcon: dh, KeyIcon: fh, LightningIcon: Bn,
LightningOffIcon: mh, LinkBrokenIcon: hh, LinkIcon: Hn, LinkedinIcon: gh, LinuxIcon: yh, ListOrderedIcon: bh, ListUnorderedIcon: vh, LocationIcon: xh,
LockIcon: xo, MarkdownIcon: Ih, MarkupIcon: zn, MediumIcon: Sh, MemoryIcon: wh, MenuIcon: Io, MergeIcon: Eh, MirrorIcon: Th, MobileIcon: Ch,
MoonIcon: _h, NutIcon: kh, OutboxIcon: Oh, OutlineIcon: Ph, PaintBrushIcon: Ah, PaperClipIcon: Dh, ParagraphIcon: Mh, PassedIcon: Lh, PhoneIcon: Nh,
PhotoDragIcon: Fh, PhotoIcon: Rh, PhotoStabilizeIcon: Bh, PinAltIcon: Hh, PinIcon: zh, PlayAllHollowIcon: Wn, PlayBackIcon: Wh, PlayHollowIcon: Vh,
PlayIcon: jh, PlayNextIcon: Kh, PlusIcon: Vn, PointerDefaultIcon: $h, PointerHandIcon: Uh, PowerIcon: Gh, PrintIcon: qh, ProceedIcon: Yh, ProfileIcon: Qh,
PullRequestIcon: Xh, QuestionIcon: Zh, RSSIcon: Jh, RedirectIcon: eg, ReduxIcon: tg, RefreshIcon: og, ReplyIcon: rg, RepoIcon: ng, RequestChangeIcon: ig,
RewindIcon: sg, RulerIcon: ag, SaveIcon: lg, SearchIcon: So, ShareAltIcon: tt, ShareIcon: ug, ShieldIcon: cg, SideBySideIcon: pg, SidebarAltIcon: wo,
SidebarAltToggleIcon: dg, SidebarIcon: fg, SidebarToggleIcon: mg, SpeakerIcon: hg, StackedIcon: gg, StarHollowIcon: yg, StarIcon: bg, StatusFailIcon: jn,
StatusIcon: vg, StatusPassIcon: Kn, StatusWarnIcon: $n, StickerIcon: xg, StopAltHollowIcon: Ig, StopAltIcon: Sg, StopIcon: wg, StorybookIcon: Un,
StructureIcon: Eg, SubtractIcon: Tg, SunIcon: Cg, SupportIcon: _g, SweepIcon: Gn, SwitchAltIcon: kg, SyncIcon: ut, TabletIcon: Og, ThumbsUpIcon: Pg,
TimeIcon: qn, TimerIcon: Ag, TransferIcon: Dg, TrashIcon: Yn, TwitterIcon: Mg, TypeIcon: Lg, UbuntuIcon: Ng, UndoIcon: Fg, UnfoldIcon: Rg, UnlockIcon: Bg,
UnpinIcon: Hg, UploadIcon: zg, UserAddIcon: Wg, UserAltIcon: Vg, UserIcon: jg, UsersIcon: Kg, VSCodeIcon: $g, VerifiedIcon: Ug, VideoIcon: Gg,
WandIcon: Qn, WatchIcon: qg, WindowsIcon: Yg, WrenchIcon: Qg, XIcon: Xg, YoutubeIcon: Zg, ZoomIcon: Xn, ZoomOutIcon: Zn, ZoomResetIcon: Jn, iconList: Jg } = __STORYBOOK_ICONS__;

// global-externals:storybook/manager-api
var CE = __STORYBOOK_API__, { ActiveTabs: _E, Consumer: me, ManagerContext: kE, Provider: ha, RequestResponseError: OE, addons: He, combineParameters: PE,
controlOrMetaKey: AE, controlOrMetaSymbol: DE, eventMatchesShortcut: ME, eventToShortcut: ga, experimental_MockUniversalStore: LE, experimental_UniversalStore: NE,
experimental_getStatusStore: ey, experimental_getTestProviderStore: ty, experimental_requestResponse: Zo, experimental_useStatusStore: Eo, experimental_useTestProviderStore: ti,
experimental_useUniversalStore: FE, internal_fullStatusStore: Ot, internal_fullTestProviderStore: Jt, internal_universalStatusStore: RE, internal_universalTestProviderStore: BE,
isMacLike: HE, isShortcutTaken: zE, keyToSymbol: WE, merge: Jo, mockChannel: VE, optionOrAltSymbol: jE, shortcutMatchesShortcut: ya, shortcutToHumanString: Ye,
types: be, useAddonState: KE, useArgTypes: $E, useArgs: UE, useChannel: ba, useGlobalTypes: va, useGlobals: er, useParameter: GE, useSharedState: qE,
useStoryPrepared: YE, useStorybookApi: oe, useStorybookState: Ne } = __STORYBOOK_API__;

// global-externals:storybook/theming
var XE = __STORYBOOK_THEMING__, { CacheProvider: ZE, ClassNames: JE, Global: eo, ThemeProvider: oi, background: eT, color: xa, convert: tT, create: oT,
createCache: rT, createGlobal: Ia, createReset: nT, css: iT, darken: sT, ensure: Sa, ignoreSsrWarning: aT, isPropValid: lT, jsx: uT, keyframes: Pt,
lighten: cT, styled: x, themes: pT, typography: dT, useTheme: De, withTheme: wa } = __STORYBOOK_THEMING__;

// global-externals:storybook/internal/components
var mT = __STORYBOOK_COMPONENTS__, { A: hT, ActionBar: gT, AddonPanel: yT, Badge: tr, Bar: bT, Blockquote: vT, Button: he, ClipboardCode: xT,
Code: IT, DL: ST, Div: wT, DocumentWrapper: ET, EmptyTabContent: Ea, ErrorFormatter: Ta, FlexBar: TT, Form: or, H1: CT, H2: _T, H3: kT, H4: OT,
H5: PT, H6: AT, HR: DT, IconButton: ee, Img: MT, LI: LT, Link: Pe, ListItem: oy, Loader: rr, Modal: At, OL: NT, P: FT, Placeholder: RT, Pre: BT,
ProgressSpinner: HT, ResetWrapper: zT, ScrollArea: nr, Separator: ht, Spaced: ct, Span: WT, StorybookIcon: VT, StorybookLogo: ir, SyntaxHighlighter: jT,
TT: KT, TabBar: sr, TabButton: ar, TabWrapper: $T, Table: UT, Tabs: Ca, TabsState: GT, TooltipLinkList: ot, TooltipMessage: qT, TooltipNote: rt,
UL: YT, WithTooltip: ve, WithTooltipPure: QT, Zoom: _a, codeCommon: XT, components: ZT, createCopyToClipboardFunction: JT, getStoryHref: to,
interleaveSeparators: eC, nameSpaceClassNames: tC, resetComponents: oC, withReset: rC } = __STORYBOOK_COMPONENTS__;

// src/toolbar/utils/normalize-toolbar-arg-type.ts
var ry = {
  type: "item",
  value: ""
}, ka = /* @__PURE__ */ a((e, t) => ({
  ...t,
  name: t.name || e,
  description: t.description || e,
  toolbar: {
    ...t.toolbar,
    items: t.toolbar.items.map((o) => {
      let i = typeof o == "string" ? { value: o, title: o } : o;
      return i.type === "reset" && t.toolbar.icon && (i.icon = t.toolbar.icon, i.hideIcon = !0), { ...ry, ...i };
    })
  }
}), "normalizeArgType");

// src/toolbar/utils/create-cycle-value-array.ts
var ny = ["reset"], Oa = /* @__PURE__ */ a((e) => e.filter((o) => !ny.includes(o.type)).map((o) => o.value), "createCycleValueArray");

// src/toolbar/constants.ts
var gt = "toolbar";

// src/toolbar/utils/register-shortcuts.ts
var Pa = /* @__PURE__ */ a(async (e, t, o) => {
  o && o.next && await e.setAddonShortcut(gt, {
    label: o.next.label,
    defaultShortcut: o.next.keys,
    actionName: `${t}:next`,
    action: o.next.action
  }), o && o.previous && await e.setAddonShortcut(gt, {
    label: o.previous.label,
    defaultShortcut: o.previous.keys,
    actionName: `${t}:previous`,
    action: o.previous.action
  }), o && o.reset && await e.setAddonShortcut(gt, {
    label: o.reset.label,
    defaultShortcut: o.reset.keys,
    actionName: `${t}:reset`,
    action: o.reset.action
  });
}, "registerShortcuts");

// src/toolbar/hoc/withKeyboardCycle.tsx
var Aa = /* @__PURE__ */ a((e) => /* @__PURE__ */ a((o) => {
  let {
    id: i,
    toolbar: { items: r, shortcuts: n }
  } = o, l = oe(), [u, c] = er(), d = q([]), p = u[i], m = A(() => {
    c({ [i]: "" });
  }, [c]), h = A(() => {
    let f = d.current, y = f.indexOf(p), E = y === f.length - 1 ? 0 : y + 1, g = d.current[E];
    c({ [i]: g });
  }, [d, p, c]), b = A(() => {
    let f = d.current, y = f.indexOf(p), S = y > -1 ? y : 0, g = S === 0 ? f.length - 1 : S - 1, v = d.current[g];
    c({ [i]: v });
  }, [d, p, c]);
  return V(() => {
    n && Pa(l, i, {
      next: { ...n.next, action: h },
      previous: { ...n.previous, action: b },
      reset: { ...n.reset, action: m }
    });
  }, [l, i, n, h, b, m]), V(() => {
    d.current = Oa(r);
  }, []), /* @__PURE__ */ s.createElement(e, { cycleValues: d.current, ...o });
}, "WithKeyboardCycle"), "withKeyboardCycle");

// src/toolbar/utils/get-selected.ts
var Da = /* @__PURE__ */ a(({ currentValue: e, items: t }) => e != null && t.find((i) => i.value === e && i.type !== "reset"), "getSelectedI\
tem"), Ma = /* @__PURE__ */ a(({ currentValue: e, items: t }) => {
  let o = Da({ currentValue: e, items: t });
  if (o)
    return o.icon;
}, "getSelectedIcon"), La = /* @__PURE__ */ a(({ currentValue: e, items: t }) => {
  let o = Da({ currentValue: e, items: t });
  if (o)
    return o.title;
}, "getSelectedTitle");

// global-externals:storybook/internal/client-logger
var IC = __STORYBOOK_CLIENT_LOGGER__, { deprecate: Na, logger: lr, once: Fa, pretty: SC } = __STORYBOOK_CLIENT_LOGGER__;

// src/components/components/icon/icon.tsx
var iy = ei, sy = x.svg`
  display: inline-block;
  shape-rendering: inherit;
  vertical-align: middle;
  fill: currentColor;
  path {
    fill: currentColor;
  }
`, ur = /* @__PURE__ */ a(({
  icon: e,
  useSymbol: t,
  __suppressDeprecationWarning: o = !1,
  ...i
}) => {
  o || Na(
    `Use of the deprecated Icons ${`(${e})` || ""} component detected. Please use the @storybook/icons component directly. For more informat\
ions, see the migration notes at https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#icons-is-deprecated`
  );
  let r = ri[e] || null;
  if (!r)
    return lr.warn(
      `Use of an unknown prop ${`(${e})` || ""} in the Icons component. The Icons component is deprecated. Please use the @storybook/icons c\
omponent directly. For more informations, see the migration notes at https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#icons-i\
s-deprecated`
    ), null;
  let n = iy[r];
  return /* @__PURE__ */ s.createElement(n, { ...i });
}, "Icons"), _C = Tt(/* @__PURE__ */ a(function({ icons: t = Object.keys(ri) }) {
  return /* @__PURE__ */ s.createElement(
    sy,
    {
      viewBox: "0 0 14 14",
      style: { position: "absolute", width: 0, height: 0 },
      "data-chromatic": "ignore"
    },
    t.map((o) => /* @__PURE__ */ s.createElement("symbol", { id: `icon--${o}`, key: o }, ri[o]))
  );
}, "Symbols")), ri = {
  user: "UserIcon",
  useralt: "UserAltIcon",
  useradd: "UserAddIcon",
  users: "UsersIcon",
  profile: "ProfileIcon",
  facehappy: "FaceHappyIcon",
  faceneutral: "FaceNeutralIcon",
  facesad: "FaceSadIcon",
  accessibility: "AccessibilityIcon",
  accessibilityalt: "AccessibilityAltIcon",
  arrowup: "ChevronUpIcon",
  arrowdown: "ChevronDownIcon",
  arrowleft: "ChevronLeftIcon",
  arrowright: "ChevronRightIcon",
  arrowupalt: "ArrowUpIcon",
  arrowdownalt: "ArrowDownIcon",
  arrowleftalt: "ArrowLeftIcon",
  arrowrightalt: "ArrowRightIcon",
  expandalt: "ExpandAltIcon",
  collapse: "CollapseIcon",
  expand: "ExpandIcon",
  unfold: "UnfoldIcon",
  transfer: "TransferIcon",
  redirect: "RedirectIcon",
  undo: "UndoIcon",
  reply: "ReplyIcon",
  sync: "SyncIcon",
  upload: "UploadIcon",
  download: "DownloadIcon",
  back: "BackIcon",
  proceed: "ProceedIcon",
  refresh: "RefreshIcon",
  globe: "GlobeIcon",
  compass: "CompassIcon",
  location: "LocationIcon",
  pin: "PinIcon",
  time: "TimeIcon",
  dashboard: "DashboardIcon",
  timer: "TimerIcon",
  home: "HomeIcon",
  admin: "AdminIcon",
  info: "InfoIcon",
  question: "QuestionIcon",
  support: "SupportIcon",
  alert: "AlertIcon",
  email: "EmailIcon",
  phone: "PhoneIcon",
  link: "LinkIcon",
  unlink: "LinkBrokenIcon",
  bell: "BellIcon",
  rss: "RSSIcon",
  sharealt: "ShareAltIcon",
  share: "ShareIcon",
  circle: "CircleIcon",
  circlehollow: "CircleHollowIcon",
  bookmarkhollow: "BookmarkHollowIcon",
  bookmark: "BookmarkIcon",
  hearthollow: "HeartHollowIcon",
  heart: "HeartIcon",
  starhollow: "StarHollowIcon",
  star: "StarIcon",
  certificate: "CertificateIcon",
  verified: "VerifiedIcon",
  thumbsup: "ThumbsUpIcon",
  shield: "ShieldIcon",
  basket: "BasketIcon",
  beaker: "BeakerIcon",
  hourglass: "HourglassIcon",
  flag: "FlagIcon",
  cloudhollow: "CloudHollowIcon",
  edit: "EditIcon",
  cog: "CogIcon",
  nut: "NutIcon",
  wrench: "WrenchIcon",
  ellipsis: "EllipsisIcon",
  check: "CheckIcon",
  form: "FormIcon",
  batchdeny: "BatchDenyIcon",
  batchaccept: "BatchAcceptIcon",
  controls: "ControlsIcon",
  plus: "PlusIcon",
  closeAlt: "CloseAltIcon",
  cross: "CrossIcon",
  trash: "TrashIcon",
  pinalt: "PinAltIcon",
  unpin: "UnpinIcon",
  add: "AddIcon",
  subtract: "SubtractIcon",
  close: "CloseIcon",
  delete: "DeleteIcon",
  passed: "PassedIcon",
  changed: "ChangedIcon",
  failed: "FailedIcon",
  clear: "ClearIcon",
  comment: "CommentIcon",
  commentadd: "CommentAddIcon",
  requestchange: "RequestChangeIcon",
  comments: "CommentsIcon",
  lock: "LockIcon",
  unlock: "UnlockIcon",
  key: "KeyIcon",
  outbox: "OutboxIcon",
  credit: "CreditIcon",
  button: "ButtonIcon",
  type: "TypeIcon",
  pointerdefault: "PointerDefaultIcon",
  pointerhand: "PointerHandIcon",
  browser: "BrowserIcon",
  tablet: "TabletIcon",
  mobile: "MobileIcon",
  watch: "WatchIcon",
  sidebar: "SidebarIcon",
  sidebaralt: "SidebarAltIcon",
  sidebaralttoggle: "SidebarAltToggleIcon",
  sidebartoggle: "SidebarToggleIcon",
  bottombar: "BottomBarIcon",
  bottombartoggle: "BottomBarToggleIcon",
  cpu: "CPUIcon",
  database: "DatabaseIcon",
  memory: "MemoryIcon",
  structure: "StructureIcon",
  box: "BoxIcon",
  power: "PowerIcon",
  photo: "PhotoIcon",
  component: "ComponentIcon",
  grid: "GridIcon",
  outline: "OutlineIcon",
  photodrag: "PhotoDragIcon",
  search: "SearchIcon",
  zoom: "ZoomIcon",
  zoomout: "ZoomOutIcon",
  zoomreset: "ZoomResetIcon",
  eye: "EyeIcon",
  eyeclose: "EyeCloseIcon",
  lightning: "LightningIcon",
  lightningoff: "LightningOffIcon",
  contrast: "ContrastIcon",
  switchalt: "SwitchAltIcon",
  mirror: "MirrorIcon",
  grow: "GrowIcon",
  paintbrush: "PaintBrushIcon",
  ruler: "RulerIcon",
  stop: "StopIcon",
  camera: "CameraIcon",
  video: "VideoIcon",
  speaker: "SpeakerIcon",
  play: "PlayIcon",
  playback: "PlayBackIcon",
  playnext: "PlayNextIcon",
  rewind: "RewindIcon",
  fastforward: "FastForwardIcon",
  stopalt: "StopAltIcon",
  sidebyside: "SideBySideIcon",
  stacked: "StackedIcon",
  sun: "SunIcon",
  moon: "MoonIcon",
  book: "BookIcon",
  document: "DocumentIcon",
  copy: "CopyIcon",
  category: "CategoryIcon",
  folder: "FolderIcon",
  print: "PrintIcon",
  graphline: "GraphLineIcon",
  calendar: "CalendarIcon",
  graphbar: "GraphBarIcon",
  menu: "MenuIcon",
  menualt: "MenuIcon",
  filter: "FilterIcon",
  docchart: "DocChartIcon",
  doclist: "DocListIcon",
  markup: "MarkupIcon",
  bold: "BoldIcon",
  paperclip: "PaperClipIcon",
  listordered: "ListOrderedIcon",
  listunordered: "ListUnorderedIcon",
  paragraph: "ParagraphIcon",
  markdown: "MarkdownIcon",
  repository: "RepoIcon",
  commit: "CommitIcon",
  branch: "BranchIcon",
  pullrequest: "PullRequestIcon",
  merge: "MergeIcon",
  apple: "AppleIcon",
  linux: "LinuxIcon",
  ubuntu: "UbuntuIcon",
  windows: "WindowsIcon",
  storybook: "StorybookIcon",
  azuredevops: "AzureDevOpsIcon",
  bitbucket: "BitbucketIcon",
  chrome: "ChromeIcon",
  chromatic: "ChromaticIcon",
  componentdriven: "ComponentDrivenIcon",
  discord: "DiscordIcon",
  facebook: "FacebookIcon",
  figma: "FigmaIcon",
  gdrive: "GDriveIcon",
  github: "GithubIcon",
  gitlab: "GitlabIcon",
  google: "GoogleIcon",
  graphql: "GraphqlIcon",
  medium: "MediumIcon",
  redux: "ReduxIcon",
  twitter: "TwitterIcon",
  youtube: "YoutubeIcon",
  vscode: "VSCodeIcon"
};

// src/toolbar/components/ToolbarMenuButton.tsx
var Ra = /* @__PURE__ */ a(({
  active: e,
  disabled: t,
  title: o,
  icon: i,
  description: r,
  onClick: n
}) => /* @__PURE__ */ s.createElement(
  ee,
  {
    active: e,
    title: r,
    disabled: t,
    onClick: t ? () => {
    } : n
  },
  i && /* @__PURE__ */ s.createElement(ur, { icon: i, __suppressDeprecationWarning: !0 }),
  o ? `\xA0${o}` : null
), "ToolbarMenuButton");

// src/toolbar/components/ToolbarMenuListItem.tsx
var Ba = /* @__PURE__ */ a(({
  right: e,
  title: t,
  value: o,
  icon: i,
  hideIcon: r,
  onClick: n,
  disabled: l,
  currentValue: u
}) => {
  let c = i && /* @__PURE__ */ s.createElement(ur, { style: { opacity: 1 }, icon: i, __suppressDeprecationWarning: !0 }), d = {
    id: o ?? "_reset",
    active: u === o,
    right: e,
    title: t,
    disabled: l,
    onClick: n
  };
  return i && !r && (d.icon = c), d;
}, "ToolbarMenuListItem");

// src/toolbar/components/ToolbarMenuList.tsx
var Ha = Aa(
  ({
    id: e,
    name: t,
    description: o,
    toolbar: { icon: i, items: r, title: n, preventDynamicIcon: l, dynamicTitle: u }
  }) => {
    let [c, d, p] = er(), [m, h] = K(!1), b = c[e], f = !!b, y = e in p, S = i, E = n;
    l || (S = Ma({ currentValue: b, items: r }) || S), u && (E = La({ currentValue: b, items: r }) || E), !E && !S && console.warn(`Toolbar \
'${t}' has no title or icon`);
    let g = A(
      (v) => {
        d({ [e]: v });
      },
      [e, d]
    );
    return /* @__PURE__ */ s.createElement(
      ve,
      {
        placement: "top",
        tooltip: ({ onHide: v }) => {
          let I = r.filter(({ type: w }) => {
            let O = !0;
            return w === "reset" && !b && (O = !1), O;
          }).map((w) => Ba({
            ...w,
            currentValue: b,
            disabled: y,
            onClick: /* @__PURE__ */ a(() => {
              g(w.value), v();
            }, "onClick")
          }));
          return /* @__PURE__ */ s.createElement(ot, { links: I });
        },
        closeOnOutsideClick: !0,
        onVisibleChange: h
      },
      /* @__PURE__ */ s.createElement(
        Ra,
        {
          active: m || f,
          disabled: y,
          description: o || "",
          icon: S,
          title: E || ""
        }
      )
    );
  }
);

// src/toolbar/components/ToolbarManager.tsx
var za = /* @__PURE__ */ a(() => {
  let e = va(), t = Object.keys(e).filter((o) => !!e[o].toolbar);
  return t.length ? /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(ht, null), t.map((o) => {
    let i = ka(o, e[o]);
    return /* @__PURE__ */ s.createElement(Ha, { key: o, id: o, ...i });
  })) : null;
}, "ToolbarManager");

// global-externals:react-dom/client
var t_ = __REACT_DOM_CLIENT__, { createRoot: Wa, hydrateRoot: o_ } = __REACT_DOM_CLIENT__;

// global-externals:storybook/internal/manager-errors
var n_ = __STORYBOOK_CORE_EVENTS_MANAGER_ERRORS__, { Category: i_, ProviderDoesNotExtendBaseProviderError: Va, StatusTypeIdMismatchError: s_,
UncaughtManagerError: a_ } = __STORYBOOK_CORE_EVENTS_MANAGER_ERRORS__;

// global-externals:storybook/internal/router
var u_ = __STORYBOOK_ROUTER__, { BaseLocationProvider: c_, DEEPLY_EQUAL: p_, Link: cr, Location: pr, LocationProvider: ja, Match: Ka, Route: To,
buildArgsParam: d_, deepDiff: f_, getMatch: m_, parsePath: h_, queryFromLocation: g_, stringifyQuery: y_, useNavigate: $a } = __STORYBOOK_ROUTER__;

// ../node_modules/react-helmet-async/lib/index.module.js
var ne = Ve(ni()), pl = Ve(el()), ui = Ve(ol()), dl = Ve(nl());
function xe() {
  return xe = Object.assign || function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var o = arguments[t];
      for (var i in o) Object.prototype.hasOwnProperty.call(o, i) && (e[i] = o[i]);
    }
    return e;
  }, xe.apply(this, arguments);
}
a(xe, "a");
function fi(e, t) {
  e.prototype = Object.create(t.prototype), e.prototype.constructor = e, ci(e, t);
}
a(fi, "s");
function ci(e, t) {
  return ci = Object.setPrototypeOf || function(o, i) {
    return o.__proto__ = i, o;
  }, ci(e, t);
}
a(ci, "c");
function il(e, t) {
  if (e == null) return {};
  var o, i, r = {}, n = Object.keys(e);
  for (i = 0; i < n.length; i++) t.indexOf(o = n[i]) >= 0 || (r[o] = e[o]);
  return r;
}
a(il, "u");
var X = { BASE: "base", BODY: "body", HEAD: "head", HTML: "html", LINK: "link", META: "meta", NOSCRIPT: "noscript", SCRIPT: "script", STYLE: "\
style", TITLE: "title", FRAGMENT: "Symbol(react.fragment)" }, my = { rel: ["amphtml", "canonical", "alternate"] }, hy = { type: ["applicatio\
n/ld+json"] }, gy = { charset: "", name: ["robots", "description"], property: ["og:type", "og:title", "og:url", "og:image", "og:image:alt", "\
og:description", "twitter:url", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt", "twitter:card", "twitter:site"] },
sl = Object.keys(X).map(function(e) {
  return X[e];
}), hr = { accesskey: "accessKey", charset: "charSet", class: "className", contenteditable: "contentEditable", contextmenu: "contextMenu", "\
http-equiv": "httpEquiv", itemprop: "itemProp", tabindex: "tabIndex" }, yy = Object.keys(hr).reduce(function(e, t) {
  return e[hr[t]] = t, e;
}, {}), ro = /* @__PURE__ */ a(function(e, t) {
  for (var o = e.length - 1; o >= 0; o -= 1) {
    var i = e[o];
    if (Object.prototype.hasOwnProperty.call(i, t)) return i[t];
  }
  return null;
}, "T"), by = /* @__PURE__ */ a(function(e) {
  var t = ro(e, X.TITLE), o = ro(e, "titleTemplate");
  if (Array.isArray(t) && (t = t.join("")), o && t) return o.replace(/%s/g, function() {
    return t;
  });
  var i = ro(e, "defaultTitle");
  return t || i || void 0;
}, "g"), vy = /* @__PURE__ */ a(function(e) {
  return ro(e, "onChangeClientState") || function() {
  };
}, "b"), ii = /* @__PURE__ */ a(function(e, t) {
  return t.filter(function(o) {
    return o[e] !== void 0;
  }).map(function(o) {
    return o[e];
  }).reduce(function(o, i) {
    return xe({}, o, i);
  }, {});
}, "v"), xy = /* @__PURE__ */ a(function(e, t) {
  return t.filter(function(o) {
    return o[X.BASE] !== void 0;
  }).map(function(o) {
    return o[X.BASE];
  }).reverse().reduce(function(o, i) {
    if (!o.length) for (var r = Object.keys(i), n = 0; n < r.length; n += 1) {
      var l = r[n].toLowerCase();
      if (e.indexOf(l) !== -1 && i[l]) return o.concat(i);
    }
    return o;
  }, []);
}, "A"), Co = /* @__PURE__ */ a(function(e, t, o) {
  var i = {};
  return o.filter(function(r) {
    return !!Array.isArray(r[e]) || (r[e] !== void 0 && console && typeof console.warn == "function" && console.warn("Helmet: " + e + ' shou\
ld be of type "Array". Instead found type "' + typeof r[e] + '"'), !1);
  }).map(function(r) {
    return r[e];
  }).reverse().reduce(function(r, n) {
    var l = {};
    n.filter(function(m) {
      for (var h, b = Object.keys(m), f = 0; f < b.length; f += 1) {
        var y = b[f], S = y.toLowerCase();
        t.indexOf(S) === -1 || h === "rel" && m[h].toLowerCase() === "canonical" || S === "rel" && m[S].toLowerCase() === "stylesheet" || (h =
        S), t.indexOf(y) === -1 || y !== "innerHTML" && y !== "cssText" && y !== "itemprop" || (h = y);
      }
      if (!h || !m[h]) return !1;
      var E = m[h].toLowerCase();
      return i[h] || (i[h] = {}), l[h] || (l[h] = {}), !i[h][E] && (l[h][E] = !0, !0);
    }).reverse().forEach(function(m) {
      return r.push(m);
    });
    for (var u = Object.keys(l), c = 0; c < u.length; c += 1) {
      var d = u[c], p = xe({}, i[d], l[d]);
      i[d] = p;
    }
    return r;
  }, []).reverse();
}, "C"), Iy = /* @__PURE__ */ a(function(e, t) {
  if (Array.isArray(e) && e.length) {
    for (var o = 0; o < e.length; o += 1) if (e[o][t]) return !0;
  }
  return !1;
}, "O"), fl = /* @__PURE__ */ a(function(e) {
  return Array.isArray(e) ? e.join("") : e;
}, "S"), si = /* @__PURE__ */ a(function(e, t) {
  return Array.isArray(e) ? e.reduce(function(o, i) {
    return function(r, n) {
      for (var l = Object.keys(r), u = 0; u < l.length; u += 1) if (n[l[u]] && n[l[u]].includes(r[l[u]])) return !0;
      return !1;
    }(i, t) ? o.priority.push(i) : o.default.push(i), o;
  }, { priority: [], default: [] }) : { default: e };
}, "E"), al = /* @__PURE__ */ a(function(e, t) {
  var o;
  return xe({}, e, ((o = {})[t] = void 0, o));
}, "I"), Sy = [X.NOSCRIPT, X.SCRIPT, X.STYLE], ai = /* @__PURE__ */ a(function(e, t) {
  return t === void 0 && (t = !0), t === !1 ? String(e) : String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(
  /"/g, "&quot;").replace(/'/g, "&#x27;");
}, "w"), ll = /* @__PURE__ */ a(function(e) {
  return Object.keys(e).reduce(function(t, o) {
    var i = e[o] !== void 0 ? o + '="' + e[o] + '"' : "" + o;
    return t ? t + " " + i : i;
  }, "");
}, "x"), ul = /* @__PURE__ */ a(function(e, t) {
  return t === void 0 && (t = {}), Object.keys(e).reduce(function(o, i) {
    return o[hr[i] || i] = e[i], o;
  }, t);
}, "L"), mr = /* @__PURE__ */ a(function(e, t) {
  return t.map(function(o, i) {
    var r, n = ((r = { key: i })["data-rh"] = !0, r);
    return Object.keys(o).forEach(function(l) {
      var u = hr[l] || l;
      u === "innerHTML" || u === "cssText" ? n.dangerouslySetInnerHTML = { __html: o.innerHTML || o.cssText } : n[u] = o[l];
    }), s.createElement(e, n);
  });
}, "j"), Ke = /* @__PURE__ */ a(function(e, t, o) {
  switch (e) {
    case X.TITLE:
      return { toComponent: /* @__PURE__ */ a(function() {
        return r = t.titleAttributes, (n = { key: i = t.title })["data-rh"] = !0, l = ul(r, n), [s.createElement(X.TITLE, l, i)];
        var i, r, n, l;
      }, "toComponent"), toString: /* @__PURE__ */ a(function() {
        return function(i, r, n, l) {
          var u = ll(n), c = fl(r);
          return u ? "<" + i + ' data-rh="true" ' + u + ">" + ai(c, l) + "</" + i + ">" : "<" + i + ' data-rh="true">' + ai(c, l) + "</" + i +
          ">";
        }(e, t.title, t.titleAttributes, o);
      }, "toString") };
    case "bodyAttributes":
    case "htmlAttributes":
      return { toComponent: /* @__PURE__ */ a(function() {
        return ul(t);
      }, "toComponent"), toString: /* @__PURE__ */ a(function() {
        return ll(t);
      }, "toString") };
    default:
      return { toComponent: /* @__PURE__ */ a(function() {
        return mr(e, t);
      }, "toComponent"), toString: /* @__PURE__ */ a(function() {
        return function(i, r, n) {
          return r.reduce(function(l, u) {
            var c = Object.keys(u).filter(function(m) {
              return !(m === "innerHTML" || m === "cssText");
            }).reduce(function(m, h) {
              var b = u[h] === void 0 ? h : h + '="' + ai(u[h], n) + '"';
              return m ? m + " " + b : b;
            }, ""), d = u.innerHTML || u.cssText || "", p = Sy.indexOf(i) === -1;
            return l + "<" + i + ' data-rh="true" ' + c + (p ? "/>" : ">" + d + "</" + i + ">");
          }, "");
        }(e, t, o);
      }, "toString") };
  }
}, "M"), pi = /* @__PURE__ */ a(function(e) {
  var t = e.baseTag, o = e.bodyAttributes, i = e.encode, r = e.htmlAttributes, n = e.noscriptTags, l = e.styleTags, u = e.title, c = u === void 0 ?
  "" : u, d = e.titleAttributes, p = e.linkTags, m = e.metaTags, h = e.scriptTags, b = { toComponent: /* @__PURE__ */ a(function() {
  }, "toComponent"), toString: /* @__PURE__ */ a(function() {
    return "";
  }, "toString") };
  if (e.prioritizeSeoTags) {
    var f = function(y) {
      var S = y.linkTags, E = y.scriptTags, g = y.encode, v = si(y.metaTags, gy), I = si(S, my), w = si(E, hy);
      return { priorityMethods: { toComponent: /* @__PURE__ */ a(function() {
        return [].concat(mr(X.META, v.priority), mr(X.LINK, I.priority), mr(X.SCRIPT, w.priority));
      }, "toComponent"), toString: /* @__PURE__ */ a(function() {
        return Ke(X.META, v.priority, g) + " " + Ke(X.LINK, I.priority, g) + " " + Ke(X.SCRIPT, w.priority, g);
      }, "toString") }, metaTags: v.default, linkTags: I.default, scriptTags: w.default };
    }(e);
    b = f.priorityMethods, p = f.linkTags, m = f.metaTags, h = f.scriptTags;
  }
  return { priority: b, base: Ke(X.BASE, t, i), bodyAttributes: Ke("bodyAttributes", o, i), htmlAttributes: Ke("htmlAttributes", r, i), link: Ke(
  X.LINK, p, i), meta: Ke(X.META, m, i), noscript: Ke(X.NOSCRIPT, n, i), script: Ke(X.SCRIPT, h, i), style: Ke(X.STYLE, l, i), title: Ke(X.TITLE,
  { title: c, titleAttributes: d }, i) };
}, "k"), fr = [], di = /* @__PURE__ */ a(function(e, t) {
  var o = this;
  t === void 0 && (t = typeof document < "u"), this.instances = [], this.value = { setHelmet: /* @__PURE__ */ a(function(i) {
    o.context.helmet = i;
  }, "setHelmet"), helmetInstances: { get: /* @__PURE__ */ a(function() {
    return o.canUseDOM ? fr : o.instances;
  }, "get"), add: /* @__PURE__ */ a(function(i) {
    (o.canUseDOM ? fr : o.instances).push(i);
  }, "add"), remove: /* @__PURE__ */ a(function(i) {
    var r = (o.canUseDOM ? fr : o.instances).indexOf(i);
    (o.canUseDOM ? fr : o.instances).splice(r, 1);
  }, "remove") } }, this.context = e, this.canUseDOM = t, t || (e.helmet = pi({ baseTag: [], bodyAttributes: {}, encodeSpecialCharacters: !0,
  htmlAttributes: {}, linkTags: [], metaTags: [], noscriptTags: [], scriptTags: [], styleTags: [], title: "", titleAttributes: {} }));
}, "N"), ml = s.createContext({}), wy = ne.default.shape({ setHelmet: ne.default.func, helmetInstances: ne.default.shape({ get: ne.default.func,
add: ne.default.func, remove: ne.default.func }) }), Ey = typeof document < "u", yt = /* @__PURE__ */ function(e) {
  function t(o) {
    var i;
    return (i = e.call(this, o) || this).helmetData = new di(i.props.context, t.canUseDOM), i;
  }
  return a(t, "r"), fi(t, e), t.prototype.render = function() {
    return s.createElement(ml.Provider, { value: this.helmetData.value }, this.props.children);
  }, t;
}(Le);
yt.canUseDOM = Ey, yt.propTypes = { context: ne.default.shape({ helmet: ne.default.shape() }), children: ne.default.node.isRequired }, yt.defaultProps =
{ context: {} }, yt.displayName = "HelmetProvider";
var oo = /* @__PURE__ */ a(function(e, t) {
  var o, i = document.head || document.querySelector(X.HEAD), r = i.querySelectorAll(e + "[data-rh]"), n = [].slice.call(r), l = [];
  return t && t.length && t.forEach(function(u) {
    var c = document.createElement(e);
    for (var d in u) Object.prototype.hasOwnProperty.call(u, d) && (d === "innerHTML" ? c.innerHTML = u.innerHTML : d === "cssText" ? c.styleSheet ?
    c.styleSheet.cssText = u.cssText : c.appendChild(document.createTextNode(u.cssText)) : c.setAttribute(d, u[d] === void 0 ? "" : u[d]));
    c.setAttribute("data-rh", "true"), n.some(function(p, m) {
      return o = m, c.isEqualNode(p);
    }) ? n.splice(o, 1) : l.push(c);
  }), n.forEach(function(u) {
    return u.parentNode.removeChild(u);
  }), l.forEach(function(u) {
    return i.appendChild(u);
  }), { oldTags: n, newTags: l };
}, "Y"), li = /* @__PURE__ */ a(function(e, t) {
  var o = document.getElementsByTagName(e)[0];
  if (o) {
    for (var i = o.getAttribute("data-rh"), r = i ? i.split(",") : [], n = [].concat(r), l = Object.keys(t), u = 0; u < l.length; u += 1) {
      var c = l[u], d = t[c] || "";
      o.getAttribute(c) !== d && o.setAttribute(c, d), r.indexOf(c) === -1 && r.push(c);
      var p = n.indexOf(c);
      p !== -1 && n.splice(p, 1);
    }
    for (var m = n.length - 1; m >= 0; m -= 1) o.removeAttribute(n[m]);
    r.length === n.length ? o.removeAttribute("data-rh") : o.getAttribute("data-rh") !== l.join(",") && o.setAttribute("data-rh", l.join(","));
  }
}, "B"), cl = /* @__PURE__ */ a(function(e, t) {
  var o = e.baseTag, i = e.htmlAttributes, r = e.linkTags, n = e.metaTags, l = e.noscriptTags, u = e.onChangeClientState, c = e.scriptTags, d = e.
  styleTags, p = e.title, m = e.titleAttributes;
  li(X.BODY, e.bodyAttributes), li(X.HTML, i), function(y, S) {
    y !== void 0 && document.title !== y && (document.title = fl(y)), li(X.TITLE, S);
  }(p, m);
  var h = { baseTag: oo(X.BASE, o), linkTags: oo(X.LINK, r), metaTags: oo(X.META, n), noscriptTags: oo(X.NOSCRIPT, l), scriptTags: oo(X.SCRIPT,
  c), styleTags: oo(X.STYLE, d) }, b = {}, f = {};
  Object.keys(h).forEach(function(y) {
    var S = h[y], E = S.newTags, g = S.oldTags;
    E.length && (b[y] = E), g.length && (f[y] = h[y].oldTags);
  }), t && t(), u(e, b, f);
}, "K"), _o = null, gr = /* @__PURE__ */ function(e) {
  function t() {
    for (var i, r = arguments.length, n = new Array(r), l = 0; l < r; l++) n[l] = arguments[l];
    return (i = e.call.apply(e, [this].concat(n)) || this).rendered = !1, i;
  }
  a(t, "e"), fi(t, e);
  var o = t.prototype;
  return o.shouldComponentUpdate = function(i) {
    return !(0, dl.default)(i, this.props);
  }, o.componentDidUpdate = function() {
    this.emitChange();
  }, o.componentWillUnmount = function() {
    this.props.context.helmetInstances.remove(this), this.emitChange();
  }, o.emitChange = function() {
    var i, r, n = this.props.context, l = n.setHelmet, u = null, c = (i = n.helmetInstances.get().map(function(d) {
      var p = xe({}, d.props);
      return delete p.context, p;
    }), { baseTag: xy(["href"], i), bodyAttributes: ii("bodyAttributes", i), defer: ro(i, "defer"), encode: ro(i, "encodeSpecialCharacters"),
    htmlAttributes: ii("htmlAttributes", i), linkTags: Co(X.LINK, ["rel", "href"], i), metaTags: Co(X.META, ["name", "charset", "http-equiv",
    "property", "itemprop"], i), noscriptTags: Co(X.NOSCRIPT, ["innerHTML"], i), onChangeClientState: vy(i), scriptTags: Co(X.SCRIPT, ["src",
    "innerHTML"], i), styleTags: Co(X.STYLE, ["cssText"], i), title: by(i), titleAttributes: ii("titleAttributes", i), prioritizeSeoTags: Iy(
    i, "prioritizeSeoTags") });
    yt.canUseDOM ? (r = c, _o && cancelAnimationFrame(_o), r.defer ? _o = requestAnimationFrame(function() {
      cl(r, function() {
        _o = null;
      });
    }) : (cl(r), _o = null)) : pi && (u = pi(c)), l(u);
  }, o.init = function() {
    this.rendered || (this.rendered = !0, this.props.context.helmetInstances.add(this), this.emitChange());
  }, o.render = function() {
    return this.init(), null;
  }, t;
}(Le);
gr.propTypes = { context: wy.isRequired }, gr.displayName = "HelmetDispatcher";
var Ty = ["children"], Cy = ["children"], ko = /* @__PURE__ */ function(e) {
  function t() {
    return e.apply(this, arguments) || this;
  }
  a(t, "r"), fi(t, e);
  var o = t.prototype;
  return o.shouldComponentUpdate = function(i) {
    return !(0, pl.default)(al(this.props, "helmetData"), al(i, "helmetData"));
  }, o.mapNestedChildrenToProps = function(i, r) {
    if (!r) return null;
    switch (i.type) {
      case X.SCRIPT:
      case X.NOSCRIPT:
        return { innerHTML: r };
      case X.STYLE:
        return { cssText: r };
      default:
        throw new Error("<" + i.type + " /> elements are self-closing and can not contain children. Refer to our API for more information.");
    }
  }, o.flattenArrayTypeChildren = function(i) {
    var r, n = i.child, l = i.arrayTypeChildren;
    return xe({}, l, ((r = {})[n.type] = [].concat(l[n.type] || [], [xe({}, i.newChildProps, this.mapNestedChildrenToProps(n, i.nestedChildren))]),
    r));
  }, o.mapObjectTypeChildren = function(i) {
    var r, n, l = i.child, u = i.newProps, c = i.newChildProps, d = i.nestedChildren;
    switch (l.type) {
      case X.TITLE:
        return xe({}, u, ((r = {})[l.type] = d, r.titleAttributes = xe({}, c), r));
      case X.BODY:
        return xe({}, u, { bodyAttributes: xe({}, c) });
      case X.HTML:
        return xe({}, u, { htmlAttributes: xe({}, c) });
      default:
        return xe({}, u, ((n = {})[l.type] = xe({}, c), n));
    }
  }, o.mapArrayTypeChildrenToProps = function(i, r) {
    var n = xe({}, r);
    return Object.keys(i).forEach(function(l) {
      var u;
      n = xe({}, n, ((u = {})[l] = i[l], u));
    }), n;
  }, o.warnOnInvalidChildren = function(i, r) {
    return (0, ui.default)(sl.some(function(n) {
      return i.type === n;
    }), typeof i.type == "function" ? "You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to o\
ur API for more information." : "Only elements types " + sl.join(", ") + " are allowed. Helmet does not support rendering <" + i.type + "> e\
lements. Refer to our API for more information."), (0, ui.default)(!r || typeof r == "string" || Array.isArray(r) && !r.some(function(n) {
      return typeof n != "string";
    }), "Helmet expects a string as a child of <" + i.type + ">. Did you forget to wrap your children in braces? ( <" + i.type + ">{``}</" +
    i.type + "> ) Refer to our API for more information."), !0;
  }, o.mapChildrenToProps = function(i, r) {
    var n = this, l = {};
    return s.Children.forEach(i, function(u) {
      if (u && u.props) {
        var c = u.props, d = c.children, p = il(c, Ty), m = Object.keys(p).reduce(function(b, f) {
          return b[yy[f] || f] = p[f], b;
        }, {}), h = u.type;
        switch (typeof h == "symbol" ? h = h.toString() : n.warnOnInvalidChildren(u, d), h) {
          case X.FRAGMENT:
            r = n.mapChildrenToProps(d, r);
            break;
          case X.LINK:
          case X.META:
          case X.NOSCRIPT:
          case X.SCRIPT:
          case X.STYLE:
            l = n.flattenArrayTypeChildren({ child: u, arrayTypeChildren: l, newChildProps: m, nestedChildren: d });
            break;
          default:
            r = n.mapObjectTypeChildren({ child: u, newProps: r, newChildProps: m, nestedChildren: d });
        }
      }
    }), this.mapArrayTypeChildrenToProps(l, r);
  }, o.render = function() {
    var i = this.props, r = i.children, n = il(i, Cy), l = xe({}, n), u = n.helmetData;
    return r && (l = this.mapChildrenToProps(r, l)), !u || u instanceof di || (u = new di(u.context, u.instances)), u ? /* @__PURE__ */ s.createElement(
    gr, xe({}, l, { context: u.value, helmetData: void 0 })) : /* @__PURE__ */ s.createElement(ml.Consumer, null, function(c) {
      return s.createElement(gr, xe({}, l, { context: c }));
    });
  }, t;
}(Le);
ko.propTypes = { base: ne.default.object, bodyAttributes: ne.default.object, children: ne.default.oneOfType([ne.default.arrayOf(ne.default.node),
ne.default.node]), defaultTitle: ne.default.string, defer: ne.default.bool, encodeSpecialCharacters: ne.default.bool, htmlAttributes: ne.default.
object, link: ne.default.arrayOf(ne.default.object), meta: ne.default.arrayOf(ne.default.object), noscript: ne.default.arrayOf(ne.default.object),
onChangeClientState: ne.default.func, script: ne.default.arrayOf(ne.default.object), style: ne.default.arrayOf(ne.default.object), title: ne.default.
string, titleAttributes: ne.default.object, titleTemplate: ne.default.string, prioritizeSeoTags: ne.default.bool, helmetData: ne.default.object },
ko.defaultProps = { defer: !0, encodeSpecialCharacters: !0, prioritizeSeoTags: !1 }, ko.displayName = "Helmet";

// src/manager/constants.ts
var Qe = "@media (min-width: 600px)";

// src/manager/components/hooks/useMedia.tsx
function hl(e) {
  let t = /* @__PURE__ */ a((n) => typeof window < "u" ? window.matchMedia(n).matches : !1, "getMatches"), [o, i] = K(t(e));
  function r() {
    i(t(e));
  }
  return a(r, "handleChange"), V(() => {
    let n = window.matchMedia(e);
    return r(), n.addEventListener("change", r), () => {
      n.removeEventListener("change", r);
    };
  }, [e]), o;
}
a(hl, "useMediaQuery");

// src/manager/components/layout/LayoutProvider.tsx
var gl = Qt({
  isMobileMenuOpen: !1,
  setMobileMenuOpen: /* @__PURE__ */ a(() => {
  }, "setMobileMenuOpen"),
  isMobileAboutOpen: !1,
  setMobileAboutOpen: /* @__PURE__ */ a(() => {
  }, "setMobileAboutOpen"),
  isMobilePanelOpen: !1,
  setMobilePanelOpen: /* @__PURE__ */ a(() => {
  }, "setMobilePanelOpen"),
  isDesktop: !1,
  isMobile: !1
}), yl = /* @__PURE__ */ a(({ children: e }) => {
  let [t, o] = K(!1), [i, r] = K(!1), [n, l] = K(!1), u = hl(`(min-width: ${600}px)`), c = !u, d = U(
    () => ({
      isMobileMenuOpen: t,
      setMobileMenuOpen: o,
      isMobileAboutOpen: i,
      setMobileAboutOpen: r,
      isMobilePanelOpen: n,
      setMobilePanelOpen: l,
      isDesktop: u,
      isMobile: c
    }),
    [
      t,
      o,
      i,
      r,
      n,
      l,
      u,
      c
    ]
  );
  return /* @__PURE__ */ s.createElement(gl.Provider, { value: d }, e);
}, "LayoutProvider"), ge = /* @__PURE__ */ a(() => Go(gl), "useLayout");

// ../node_modules/@babel/runtime/helpers/esm/extends.js
function j() {
  return j = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var o = arguments[t];
      for (var i in o) ({}).hasOwnProperty.call(o, i) && (e[i] = o[i]);
    }
    return e;
  }, j.apply(null, arguments);
}
a(j, "_extends");

// ../node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function bl(e) {
  if (e === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
a(bl, "_assertThisInitialized");

// ../node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function bt(e, t) {
  return bt = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(o, i) {
    return o.__proto__ = i, o;
  }, bt(e, t);
}
a(bt, "_setPrototypeOf");

// ../node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
function no(e, t) {
  e.prototype = Object.create(t.prototype), e.prototype.constructor = e, bt(e, t);
}
a(no, "_inheritsLoose");

// ../node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function yr(e) {
  return yr = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, yr(e);
}
a(yr, "_getPrototypeOf");

// ../node_modules/@babel/runtime/helpers/esm/isNativeFunction.js
function vl(e) {
  try {
    return Function.toString.call(e).indexOf("[native code]") !== -1;
  } catch {
    return typeof e == "function";
  }
}
a(vl, "_isNativeFunction");

// ../node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js
function mi() {
  try {
    var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch {
  }
  return (mi = /* @__PURE__ */ a(function() {
    return !!e;
  }, "_isNativeReflectConstruct"))();
}
a(mi, "_isNativeReflectConstruct");

// ../node_modules/@babel/runtime/helpers/esm/construct.js
function xl(e, t, o) {
  if (mi()) return Reflect.construct.apply(null, arguments);
  var i = [null];
  i.push.apply(i, t);
  var r = new (e.bind.apply(e, i))();
  return o && bt(r, o.prototype), r;
}
a(xl, "_construct");

// ../node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js
function br(e) {
  var t = typeof Map == "function" ? /* @__PURE__ */ new Map() : void 0;
  return br = /* @__PURE__ */ a(function(i) {
    if (i === null || !vl(i)) return i;
    if (typeof i != "function") throw new TypeError("Super expression must either be null or a function");
    if (t !== void 0) {
      if (t.has(i)) return t.get(i);
      t.set(i, r);
    }
    function r() {
      return xl(i, arguments, yr(this).constructor);
    }
    return a(r, "Wrapper"), r.prototype = Object.create(i.prototype, {
      constructor: {
        value: r,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), bt(r, i);
  }, "_wrapNativeSuper"), br(e);
}
a(br, "_wrapNativeSuper");

// ../node_modules/polished/dist/polished.esm.js
var Fe = /* @__PURE__ */ function(e) {
  no(t, e);
  function t(o) {
    var i;
    if (1)
      i = e.call(this, "An error occurred. See https://github.com/styled-components/polished/blob/main/src/internalHelpers/errors.md#" + o +
      " for more information.") || this;
    else
      for (var r, n, l; l < r; l++)
        ;
    return bl(i);
  }
  return a(t, "PolishedError"), t;
}(/* @__PURE__ */ br(Error));
function Il(e, t) {
  return e.substr(-t.length) === t;
}
a(Il, "endsWith");
var _y = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;
function Sl(e) {
  if (typeof e != "string") return e;
  var t = e.match(_y);
  return t ? parseFloat(e) : e;
}
a(Sl, "stripUnit");
var ky = /* @__PURE__ */ a(function(t) {
  return function(o, i) {
    i === void 0 && (i = "16px");
    var r = o, n = i;
    if (typeof o == "string") {
      if (!Il(o, "px"))
        throw new Fe(69, t, o);
      r = Sl(o);
    }
    if (typeof i == "string") {
      if (!Il(i, "px"))
        throw new Fe(70, t, i);
      n = Sl(i);
    }
    if (typeof r == "string")
      throw new Fe(71, o, t);
    if (typeof n == "string")
      throw new Fe(72, i, t);
    return "" + r / n + t;
  };
}, "pxtoFactory"), El = ky, S1 = El("em");
var w1 = El("rem");
function hi(e) {
  return Math.round(e * 255);
}
a(hi, "colorToInt");
function Oy(e, t, o) {
  return hi(e) + "," + hi(t) + "," + hi(o);
}
a(Oy, "convertToInt");
function Oo(e, t, o, i) {
  if (i === void 0 && (i = Oy), t === 0)
    return i(o, o, o);
  var r = (e % 360 + 360) % 360 / 60, n = (1 - Math.abs(2 * o - 1)) * t, l = n * (1 - Math.abs(r % 2 - 1)), u = 0, c = 0, d = 0;
  r >= 0 && r < 1 ? (u = n, c = l) : r >= 1 && r < 2 ? (u = l, c = n) : r >= 2 && r < 3 ? (c = n, d = l) : r >= 3 && r < 4 ? (c = l, d = n) :
  r >= 4 && r < 5 ? (u = l, d = n) : r >= 5 && r < 6 && (u = n, d = l);
  var p = o - n / 2, m = u + p, h = c + p, b = d + p;
  return i(m, h, b);
}
a(Oo, "hslToRgb");
var wl = {
  aliceblue: "f0f8ff",
  antiquewhite: "faebd7",
  aqua: "00ffff",
  aquamarine: "7fffd4",
  azure: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "000",
  blanchedalmond: "ffebcd",
  blue: "0000ff",
  blueviolet: "8a2be2",
  brown: "a52a2a",
  burlywood: "deb887",
  cadetblue: "5f9ea0",
  chartreuse: "7fff00",
  chocolate: "d2691e",
  coral: "ff7f50",
  cornflowerblue: "6495ed",
  cornsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "00ffff",
  darkblue: "00008b",
  darkcyan: "008b8b",
  darkgoldenrod: "b8860b",
  darkgray: "a9a9a9",
  darkgreen: "006400",
  darkgrey: "a9a9a9",
  darkkhaki: "bdb76b",
  darkmagenta: "8b008b",
  darkolivegreen: "556b2f",
  darkorange: "ff8c00",
  darkorchid: "9932cc",
  darkred: "8b0000",
  darksalmon: "e9967a",
  darkseagreen: "8fbc8f",
  darkslateblue: "483d8b",
  darkslategray: "2f4f4f",
  darkslategrey: "2f4f4f",
  darkturquoise: "00ced1",
  darkviolet: "9400d3",
  deeppink: "ff1493",
  deepskyblue: "00bfff",
  dimgray: "696969",
  dimgrey: "696969",
  dodgerblue: "1e90ff",
  firebrick: "b22222",
  floralwhite: "fffaf0",
  forestgreen: "228b22",
  fuchsia: "ff00ff",
  gainsboro: "dcdcdc",
  ghostwhite: "f8f8ff",
  gold: "ffd700",
  goldenrod: "daa520",
  gray: "808080",
  green: "008000",
  greenyellow: "adff2f",
  grey: "808080",
  honeydew: "f0fff0",
  hotpink: "ff69b4",
  indianred: "cd5c5c",
  indigo: "4b0082",
  ivory: "fffff0",
  khaki: "f0e68c",
  lavender: "e6e6fa",
  lavenderblush: "fff0f5",
  lawngreen: "7cfc00",
  lemonchiffon: "fffacd",
  lightblue: "add8e6",
  lightcoral: "f08080",
  lightcyan: "e0ffff",
  lightgoldenrodyellow: "fafad2",
  lightgray: "d3d3d3",
  lightgreen: "90ee90",
  lightgrey: "d3d3d3",
  lightpink: "ffb6c1",
  lightsalmon: "ffa07a",
  lightseagreen: "20b2aa",
  lightskyblue: "87cefa",
  lightslategray: "789",
  lightslategrey: "789",
  lightsteelblue: "b0c4de",
  lightyellow: "ffffe0",
  lime: "0f0",
  limegreen: "32cd32",
  linen: "faf0e6",
  magenta: "f0f",
  maroon: "800000",
  mediumaquamarine: "66cdaa",
  mediumblue: "0000cd",
  mediumorchid: "ba55d3",
  mediumpurple: "9370db",
  mediumseagreen: "3cb371",
  mediumslateblue: "7b68ee",
  mediumspringgreen: "00fa9a",
  mediumturquoise: "48d1cc",
  mediumvioletred: "c71585",
  midnightblue: "191970",
  mintcream: "f5fffa",
  mistyrose: "ffe4e1",
  moccasin: "ffe4b5",
  navajowhite: "ffdead",
  navy: "000080",
  oldlace: "fdf5e6",
  olive: "808000",
  olivedrab: "6b8e23",
  orange: "ffa500",
  orangered: "ff4500",
  orchid: "da70d6",
  palegoldenrod: "eee8aa",
  palegreen: "98fb98",
  paleturquoise: "afeeee",
  palevioletred: "db7093",
  papayawhip: "ffefd5",
  peachpuff: "ffdab9",
  peru: "cd853f",
  pink: "ffc0cb",
  plum: "dda0dd",
  powderblue: "b0e0e6",
  purple: "800080",
  rebeccapurple: "639",
  red: "f00",
  rosybrown: "bc8f8f",
  royalblue: "4169e1",
  saddlebrown: "8b4513",
  salmon: "fa8072",
  sandybrown: "f4a460",
  seagreen: "2e8b57",
  seashell: "fff5ee",
  sienna: "a0522d",
  silver: "c0c0c0",
  skyblue: "87ceeb",
  slateblue: "6a5acd",
  slategray: "708090",
  slategrey: "708090",
  snow: "fffafa",
  springgreen: "00ff7f",
  steelblue: "4682b4",
  tan: "d2b48c",
  teal: "008080",
  thistle: "d8bfd8",
  tomato: "ff6347",
  turquoise: "40e0d0",
  violet: "ee82ee",
  wheat: "f5deb3",
  white: "fff",
  whitesmoke: "f5f5f5",
  yellow: "ff0",
  yellowgreen: "9acd32"
};
function Py(e) {
  if (typeof e != "string") return e;
  var t = e.toLowerCase();
  return wl[t] ? "#" + wl[t] : e;
}
a(Py, "nameToHex");
var Ay = /^#[a-fA-F0-9]{6}$/, Dy = /^#[a-fA-F0-9]{8}$/, My = /^#[a-fA-F0-9]{3}$/, Ly = /^#[a-fA-F0-9]{4}$/, gi = /^rgb\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*\)$/i,
Ny = /^rgb(?:a)?\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i, Fy = /^hsl\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*\)$/i,
Ry = /^hsl(?:a)?\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
function io(e) {
  if (typeof e != "string")
    throw new Fe(3);
  var t = Py(e);
  if (t.match(Ay))
    return {
      red: parseInt("" + t[1] + t[2], 16),
      green: parseInt("" + t[3] + t[4], 16),
      blue: parseInt("" + t[5] + t[6], 16)
    };
  if (t.match(Dy)) {
    var o = parseFloat((parseInt("" + t[7] + t[8], 16) / 255).toFixed(2));
    return {
      red: parseInt("" + t[1] + t[2], 16),
      green: parseInt("" + t[3] + t[4], 16),
      blue: parseInt("" + t[5] + t[6], 16),
      alpha: o
    };
  }
  if (t.match(My))
    return {
      red: parseInt("" + t[1] + t[1], 16),
      green: parseInt("" + t[2] + t[2], 16),
      blue: parseInt("" + t[3] + t[3], 16)
    };
  if (t.match(Ly)) {
    var i = parseFloat((parseInt("" + t[4] + t[4], 16) / 255).toFixed(2));
    return {
      red: parseInt("" + t[1] + t[1], 16),
      green: parseInt("" + t[2] + t[2], 16),
      blue: parseInt("" + t[3] + t[3], 16),
      alpha: i
    };
  }
  var r = gi.exec(t);
  if (r)
    return {
      red: parseInt("" + r[1], 10),
      green: parseInt("" + r[2], 10),
      blue: parseInt("" + r[3], 10)
    };
  var n = Ny.exec(t.substring(0, 50));
  if (n)
    return {
      red: parseInt("" + n[1], 10),
      green: parseInt("" + n[2], 10),
      blue: parseInt("" + n[3], 10),
      alpha: parseFloat("" + n[4]) > 1 ? parseFloat("" + n[4]) / 100 : parseFloat("" + n[4])
    };
  var l = Fy.exec(t);
  if (l) {
    var u = parseInt("" + l[1], 10), c = parseInt("" + l[2], 10) / 100, d = parseInt("" + l[3], 10) / 100, p = "rgb(" + Oo(u, c, d) + ")", m = gi.
    exec(p);
    if (!m)
      throw new Fe(4, t, p);
    return {
      red: parseInt("" + m[1], 10),
      green: parseInt("" + m[2], 10),
      blue: parseInt("" + m[3], 10)
    };
  }
  var h = Ry.exec(t.substring(0, 50));
  if (h) {
    var b = parseInt("" + h[1], 10), f = parseInt("" + h[2], 10) / 100, y = parseInt("" + h[3], 10) / 100, S = "rgb(" + Oo(b, f, y) + ")", E = gi.
    exec(S);
    if (!E)
      throw new Fe(4, t, S);
    return {
      red: parseInt("" + E[1], 10),
      green: parseInt("" + E[2], 10),
      blue: parseInt("" + E[3], 10),
      alpha: parseFloat("" + h[4]) > 1 ? parseFloat("" + h[4]) / 100 : parseFloat("" + h[4])
    };
  }
  throw new Fe(5);
}
a(io, "parseToRgb");
function By(e) {
  var t = e.red / 255, o = e.green / 255, i = e.blue / 255, r = Math.max(t, o, i), n = Math.min(t, o, i), l = (r + n) / 2;
  if (r === n)
    return e.alpha !== void 0 ? {
      hue: 0,
      saturation: 0,
      lightness: l,
      alpha: e.alpha
    } : {
      hue: 0,
      saturation: 0,
      lightness: l
    };
  var u, c = r - n, d = l > 0.5 ? c / (2 - r - n) : c / (r + n);
  switch (r) {
    case t:
      u = (o - i) / c + (o < i ? 6 : 0);
      break;
    case o:
      u = (i - t) / c + 2;
      break;
    default:
      u = (t - o) / c + 4;
      break;
  }
  return u *= 60, e.alpha !== void 0 ? {
    hue: u,
    saturation: d,
    lightness: l,
    alpha: e.alpha
  } : {
    hue: u,
    saturation: d,
    lightness: l
  };
}
a(By, "rgbToHsl");
function vt(e) {
  return By(io(e));
}
a(vt, "parseToHsl");
var Hy = /* @__PURE__ */ a(function(t) {
  return t.length === 7 && t[1] === t[2] && t[3] === t[4] && t[5] === t[6] ? "#" + t[1] + t[3] + t[5] : t;
}, "reduceHexValue"), bi = Hy;
function Dt(e) {
  var t = e.toString(16);
  return t.length === 1 ? "0" + t : t;
}
a(Dt, "numberToHex");
function yi(e) {
  return Dt(Math.round(e * 255));
}
a(yi, "colorToHex");
function zy(e, t, o) {
  return bi("#" + yi(e) + yi(t) + yi(o));
}
a(zy, "convertToHex");
function vr(e, t, o) {
  return Oo(e, t, o, zy);
}
a(vr, "hslToHex");
function Wy(e, t, o) {
  if (typeof e == "number" && typeof t == "number" && typeof o == "number")
    return vr(e, t, o);
  if (typeof e == "object" && t === void 0 && o === void 0)
    return vr(e.hue, e.saturation, e.lightness);
  throw new Fe(1);
}
a(Wy, "hsl");
function Vy(e, t, o, i) {
  if (typeof e == "number" && typeof t == "number" && typeof o == "number" && typeof i == "number")
    return i >= 1 ? vr(e, t, o) : "rgba(" + Oo(e, t, o) + "," + i + ")";
  if (typeof e == "object" && t === void 0 && o === void 0 && i === void 0)
    return e.alpha >= 1 ? vr(e.hue, e.saturation, e.lightness) : "rgba(" + Oo(e.hue, e.saturation, e.lightness) + "," + e.alpha + ")";
  throw new Fe(2);
}
a(Vy, "hsla");
function vi(e, t, o) {
  if (typeof e == "number" && typeof t == "number" && typeof o == "number")
    return bi("#" + Dt(e) + Dt(t) + Dt(o));
  if (typeof e == "object" && t === void 0 && o === void 0)
    return bi("#" + Dt(e.red) + Dt(e.green) + Dt(e.blue));
  throw new Fe(6);
}
a(vi, "rgb");
function so(e, t, o, i) {
  if (typeof e == "string" && typeof t == "number") {
    var r = io(e);
    return "rgba(" + r.red + "," + r.green + "," + r.blue + "," + t + ")";
  } else {
    if (typeof e == "number" && typeof t == "number" && typeof o == "number" && typeof i == "number")
      return i >= 1 ? vi(e, t, o) : "rgba(" + e + "," + t + "," + o + "," + i + ")";
    if (typeof e == "object" && t === void 0 && o === void 0 && i === void 0)
      return e.alpha >= 1 ? vi(e.red, e.green, e.blue) : "rgba(" + e.red + "," + e.green + "," + e.blue + "," + e.alpha + ")";
  }
  throw new Fe(7);
}
a(so, "rgba");
var jy = /* @__PURE__ */ a(function(t) {
  return typeof t.red == "number" && typeof t.green == "number" && typeof t.blue == "number" && (typeof t.alpha != "number" || typeof t.alpha >
  "u");
}, "isRgb"), Ky = /* @__PURE__ */ a(function(t) {
  return typeof t.red == "number" && typeof t.green == "number" && typeof t.blue == "number" && typeof t.alpha == "number";
}, "isRgba"), $y = /* @__PURE__ */ a(function(t) {
  return typeof t.hue == "number" && typeof t.saturation == "number" && typeof t.lightness == "number" && (typeof t.alpha != "number" || typeof t.
  alpha > "u");
}, "isHsl"), Uy = /* @__PURE__ */ a(function(t) {
  return typeof t.hue == "number" && typeof t.saturation == "number" && typeof t.lightness == "number" && typeof t.alpha == "number";
}, "isHsla");
function xt(e) {
  if (typeof e != "object") throw new Fe(8);
  if (Ky(e)) return so(e);
  if (jy(e)) return vi(e);
  if (Uy(e)) return Vy(e);
  if ($y(e)) return Wy(e);
  throw new Fe(8);
}
a(xt, "toColorString");
function Tl(e, t, o) {
  return /* @__PURE__ */ a(function() {
    var r = o.concat(Array.prototype.slice.call(arguments));
    return r.length >= t ? e.apply(this, r) : Tl(e, t, r);
  }, "fn");
}
a(Tl, "curried");
function ze(e) {
  return Tl(e, e.length, []);
}
a(ze, "curry");
function Gy(e, t) {
  if (t === "transparent") return t;
  var o = vt(t);
  return xt(j({}, o, {
    hue: o.hue + parseFloat(e)
  }));
}
a(Gy, "adjustHue");
var E1 = ze(Gy);
function ao(e, t, o) {
  return Math.max(e, Math.min(t, o));
}
a(ao, "guard");
function qy(e, t) {
  if (t === "transparent") return t;
  var o = vt(t);
  return xt(j({}, o, {
    lightness: ao(0, 1, o.lightness - parseFloat(e))
  }));
}
a(qy, "darken");
var Yy = ze(qy), xr = Yy;
function Qy(e, t) {
  if (t === "transparent") return t;
  var o = vt(t);
  return xt(j({}, o, {
    saturation: ao(0, 1, o.saturation - parseFloat(e))
  }));
}
a(Qy, "desaturate");
var T1 = ze(Qy);
function Xy(e, t) {
  if (t === "transparent") return t;
  var o = vt(t);
  return xt(j({}, o, {
    lightness: ao(0, 1, o.lightness + parseFloat(e))
  }));
}
a(Xy, "lighten");
var Zy = ze(Xy), Po = Zy;
function Jy(e, t, o) {
  if (t === "transparent") return o;
  if (o === "transparent") return t;
  if (e === 0) return o;
  var i = io(t), r = j({}, i, {
    alpha: typeof i.alpha == "number" ? i.alpha : 1
  }), n = io(o), l = j({}, n, {
    alpha: typeof n.alpha == "number" ? n.alpha : 1
  }), u = r.alpha - l.alpha, c = parseFloat(e) * 2 - 1, d = c * u === -1 ? c : c + u, p = 1 + c * u, m = (d / p + 1) / 2, h = 1 - m, b = {
    red: Math.floor(r.red * m + l.red * h),
    green: Math.floor(r.green * m + l.green * h),
    blue: Math.floor(r.blue * m + l.blue * h),
    alpha: r.alpha * parseFloat(e) + l.alpha * (1 - parseFloat(e))
  };
  return so(b);
}
a(Jy, "mix");
var eb = ze(Jy), Cl = eb;
function tb(e, t) {
  if (t === "transparent") return t;
  var o = io(t), i = typeof o.alpha == "number" ? o.alpha : 1, r = j({}, o, {
    alpha: ao(0, 1, (i * 100 + parseFloat(e) * 100) / 100)
  });
  return so(r);
}
a(tb, "opacify");
var C1 = ze(tb);
function ob(e, t) {
  if (t === "transparent") return t;
  var o = vt(t);
  return xt(j({}, o, {
    saturation: ao(0, 1, o.saturation + parseFloat(e))
  }));
}
a(ob, "saturate");
var _1 = ze(ob);
function rb(e, t) {
  return t === "transparent" ? t : xt(j({}, vt(t), {
    hue: parseFloat(e)
  }));
}
a(rb, "setHue");
var k1 = ze(rb);
function nb(e, t) {
  return t === "transparent" ? t : xt(j({}, vt(t), {
    lightness: parseFloat(e)
  }));
}
a(nb, "setLightness");
var O1 = ze(nb);
function ib(e, t) {
  return t === "transparent" ? t : xt(j({}, vt(t), {
    saturation: parseFloat(e)
  }));
}
a(ib, "setSaturation");
var P1 = ze(ib);
function sb(e, t) {
  return t === "transparent" ? t : Cl(parseFloat(e), "rgb(0, 0, 0)", t);
}
a(sb, "shade");
var A1 = ze(sb);
function ab(e, t) {
  return t === "transparent" ? t : Cl(parseFloat(e), "rgb(255, 255, 255)", t);
}
a(ab, "tint");
var D1 = ze(ab);
function lb(e, t) {
  if (t === "transparent") return t;
  var o = io(t), i = typeof o.alpha == "number" ? o.alpha : 1, r = j({}, o, {
    alpha: ao(0, 1, +(i * 100 - parseFloat(e) * 100).toFixed(2) / 100)
  });
  return so(r);
}
a(lb, "transparentize");
var ub = ze(lb), Te = ub;

// src/manager/components/notifications/NotificationItem.tsx
var cb = Pt({
  "0%": {
    opacity: 0,
    transform: "translateY(30px)"
  },
  "100%": {
    opacity: 1,
    transform: "translateY(0)"
  }
}), pb = Pt({
  "0%": {
    width: "0%"
  },
  "100%": {
    width: "100%"
  }
}), _l = x.div(
  ({ theme: e }) => ({
    position: "relative",
    display: "flex",
    border: `1px solid ${e.appBorderColor}`,
    padding: "12px 6px 12px 12px",
    borderRadius: e.appBorderRadius + 1,
    alignItems: "center",
    animation: `${cb} 500ms`,
    background: e.base === "light" ? "hsla(203, 50%, 20%, .97)" : "hsla(203, 30%, 95%, .97)",
    boxShadow: "0 2px 5px 0 rgba(0, 0, 0, 0.05), 0 5px 15px 0 rgba(0, 0, 0, 0.1)",
    color: e.color.inverseText,
    textDecoration: "none",
    overflow: "hidden",
    [Qe]: {
      boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05), 0px -5px 20px 10px ${e.background.app}`
    }
  }),
  ({ duration: e, theme: t }) => e && {
    "&::after": {
      content: '""',
      display: "block",
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 3,
      background: t.color.secondary,
      animation: `${pb} ${e}ms linear forwards reverse`
    }
  }
), kl = x(_l)({
  cursor: "pointer",
  border: "none",
  outline: "none",
  textAlign: "left",
  transition: "all 150ms ease-out",
  transform: "translate3d(0, 0, 0)",
  "&:hover": {
    transform: "translate3d(0, -3px, 0)",
    boxShadow: "0 1px 3px 0 rgba(30,167,253,0.5), 0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0.1)"
  },
  "&:active": {
    transform: "translate3d(0, 0, 0)",
    boxShadow: "0 1px 3px 0 rgba(30,167,253,0.5), 0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0.1)"
  },
  "&:focus": {
    boxShadow: "rgba(2,156,253,1) 0 0 0 1px inset, 0 1px 3px 0 rgba(30,167,253,0.5), 0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0\
.1)"
  }
}), db = kl.withComponent("div"), fb = kl.withComponent(cr), mb = x.div({
  display: "flex",
  marginRight: 10,
  alignItems: "center",
  svg: {
    width: 16,
    height: 16
  }
}), hb = x.div(({ theme: e }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  color: e.base === "dark" ? e.color.mediumdark : e.color.mediumlight
})), gb = x.div(({ theme: e, hasIcon: t }) => ({
  height: "100%",
  alignItems: "center",
  whiteSpace: "balance",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: e.typography.size.s1,
  lineHeight: "16px",
  fontWeight: e.typography.weight.bold
})), yb = x.div(({ theme: e }) => ({
  color: Te(0.25, e.color.inverseText),
  fontSize: e.typography.size.s1 - 1,
  lineHeight: "14px",
  marginTop: 2,
  whiteSpace: "balance"
})), xi = /* @__PURE__ */ a(({
  icon: e,
  content: { headline: t, subHeadline: o }
}) => /* @__PURE__ */ s.createElement(s.Fragment, null, !e || /* @__PURE__ */ s.createElement(mb, null, e), /* @__PURE__ */ s.createElement(
hb, null, /* @__PURE__ */ s.createElement(gb, { title: t, hasIcon: !!e }, t), o && /* @__PURE__ */ s.createElement(yb, null, o))), "ItemCont\
ent"), bb = x(ee)(({ theme: e }) => ({
  width: 28,
  alignSelf: "center",
  marginTop: 0,
  color: e.base === "light" ? "rgba(255,255,255,0.7)" : " #999999"
})), Ii = /* @__PURE__ */ a(({ onDismiss: e }) => /* @__PURE__ */ s.createElement(
  bb,
  {
    title: "Dismiss notification",
    onClick: (t) => {
      t.preventDefault(), t.stopPropagation(), e();
    }
  },
  /* @__PURE__ */ s.createElement(bo, { size: 12 })
), "DismissNotificationItem"), V1 = x.div({
  height: 48
}), vb = /* @__PURE__ */ a(({
  notification: { content: e, duration: t, link: o, onClear: i, onClick: r, id: n, icon: l },
  onDismissNotification: u,
  zIndex: c
}) => {
  let d = A(() => {
    u(n), i && i({ dismissed: !1, timeout: !0 });
  }, [n, u, i]), p = q(null);
  V(() => {
    if (t)
      return p.current = setTimeout(d, t), () => clearTimeout(p.current);
  }, [t, d]);
  let m = A(() => {
    clearTimeout(p.current), u(n), i && i({ dismissed: !0, timeout: !1 });
  }, [n, u, i]);
  return o ? /* @__PURE__ */ s.createElement(fb, { to: o, duration: t, style: { zIndex: c } }, /* @__PURE__ */ s.createElement(xi, { icon: l,
  content: e }), /* @__PURE__ */ s.createElement(Ii, { onDismiss: m })) : r ? /* @__PURE__ */ s.createElement(
    db,
    {
      duration: t,
      onClick: () => r({ onDismiss: m }),
      style: { zIndex: c }
    },
    /* @__PURE__ */ s.createElement(xi, { icon: l, content: e }),
    /* @__PURE__ */ s.createElement(Ii, { onDismiss: m })
  ) : /* @__PURE__ */ s.createElement(_l, { duration: t, style: { zIndex: c } }, /* @__PURE__ */ s.createElement(xi, { icon: l, content: e }),
  /* @__PURE__ */ s.createElement(Ii, { onDismiss: m }));
}, "NotificationItem"), Ol = vb;

// src/manager/components/notifications/NotificationList.tsx
var Ir = /* @__PURE__ */ a(({
  notifications: e,
  clearNotification: t
}) => {
  let { isMobile: o } = ge();
  return /* @__PURE__ */ s.createElement(xb, { isMobile: o }, e && e.map((i, r) => /* @__PURE__ */ s.createElement(
    Ol,
    {
      key: i.id,
      onDismissNotification: (n) => t(n),
      notification: i,
      zIndex: e.length - r
    }
  )));
}, "NotificationList"), xb = x.div(
  {
    zIndex: 200,
    "> * + *": {
      marginTop: 12
    },
    "&:empty": {
      display: "none"
    }
  },
  ({ isMobile: e }) => e && {
    position: "fixed",
    bottom: 40,
    margin: 20
  }
);

// src/manager/container/Notifications.tsx
var Ib = /* @__PURE__ */ a(({ state: e, api: t }) => ({
  notifications: e.notifications,
  clearNotification: t.clearNotification
}), "mapper"), Pl = /* @__PURE__ */ a((e) => /* @__PURE__ */ s.createElement(me, { filter: Ib }, (t) => /* @__PURE__ */ s.createElement(Ir, {
...e, ...t })), "Notifications");

// src/manager/components/mobile/navigation/MobileAddonsDrawer.tsx
var Sb = x.div(({ theme: e }) => ({
  position: "relative",
  boxSizing: "border-box",
  width: "100%",
  background: e.background.content,
  height: "42vh",
  zIndex: 11,
  overflow: "hidden"
})), Al = /* @__PURE__ */ a(({ children: e }) => /* @__PURE__ */ s.createElement(Sb, null, e), "MobileAddonsDrawer");

// ../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
function ke(e, t) {
  if (e == null) return {};
  var o = {};
  for (var i in e) if ({}.hasOwnProperty.call(e, i)) {
    if (t.indexOf(i) !== -1) continue;
    o[i] = e[i];
  }
  return o;
}
a(ke, "_objectWithoutPropertiesLoose");

// global-externals:react-dom
var Ao = __REACT_DOM__, { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: lk, createPortal: uk, createRoot: ck, findDOMNode: pk, flushSync: Do,
hydrate: dk, hydrateRoot: fk, render: mk, unmountComponentAtNode: hk, unstable_batchedUpdates: gk, unstable_renderSubtreeIntoContainer: yk, version: bk } = __REACT_DOM__;

// ../node_modules/react-transition-group/esm/config.js
var Si = {
  disabled: !1
};

// ../node_modules/react-transition-group/esm/TransitionGroupContext.js
var wi = s.createContext(null);

// ../node_modules/react-transition-group/esm/utils/reflow.js
var Dl = /* @__PURE__ */ a(function(t) {
  return t.scrollTop;
}, "forceReflow");

// ../node_modules/react-transition-group/esm/Transition.js
var Mo = "unmounted", Mt = "exited", Lt = "entering", uo = "entered", Ei = "exiting", pt = /* @__PURE__ */ function(e) {
  no(t, e);
  function t(i, r) {
    var n;
    n = e.call(this, i, r) || this;
    var l = r, u = l && !l.isMounting ? i.enter : i.appear, c;
    return n.appearStatus = null, i.in ? u ? (c = Mt, n.appearStatus = Lt) : c = uo : i.unmountOnExit || i.mountOnEnter ? c = Mo : c = Mt, n.
    state = {
      status: c
    }, n.nextCallback = null, n;
  }
  a(t, "Transition"), t.getDerivedStateFromProps = /* @__PURE__ */ a(function(r, n) {
    var l = r.in;
    return l && n.status === Mo ? {
      status: Mt
    } : null;
  }, "getDerivedStateFromProps");
  var o = t.prototype;
  return o.componentDidMount = /* @__PURE__ */ a(function() {
    this.updateStatus(!0, this.appearStatus);
  }, "componentDidMount"), o.componentDidUpdate = /* @__PURE__ */ a(function(r) {
    var n = null;
    if (r !== this.props) {
      var l = this.state.status;
      this.props.in ? l !== Lt && l !== uo && (n = Lt) : (l === Lt || l === uo) && (n = Ei);
    }
    this.updateStatus(!1, n);
  }, "componentDidUpdate"), o.componentWillUnmount = /* @__PURE__ */ a(function() {
    this.cancelNextCallback();
  }, "componentWillUnmount"), o.getTimeouts = /* @__PURE__ */ a(function() {
    var r = this.props.timeout, n, l, u;
    return n = l = u = r, r != null && typeof r != "number" && (n = r.exit, l = r.enter, u = r.appear !== void 0 ? r.appear : l), {
      exit: n,
      enter: l,
      appear: u
    };
  }, "getTimeouts"), o.updateStatus = /* @__PURE__ */ a(function(r, n) {
    if (r === void 0 && (r = !1), n !== null)
      if (this.cancelNextCallback(), n === Lt) {
        if (this.props.unmountOnExit || this.props.mountOnEnter) {
          var l = this.props.nodeRef ? this.props.nodeRef.current : Ao.findDOMNode(this);
          l && Dl(l);
        }
        this.performEnter(r);
      } else
        this.performExit();
    else this.props.unmountOnExit && this.state.status === Mt && this.setState({
      status: Mo
    });
  }, "updateStatus"), o.performEnter = /* @__PURE__ */ a(function(r) {
    var n = this, l = this.props.enter, u = this.context ? this.context.isMounting : r, c = this.props.nodeRef ? [u] : [Ao.findDOMNode(this),
    u], d = c[0], p = c[1], m = this.getTimeouts(), h = u ? m.appear : m.enter;
    if (!r && !l || Si.disabled) {
      this.safeSetState({
        status: uo
      }, function() {
        n.props.onEntered(d);
      });
      return;
    }
    this.props.onEnter(d, p), this.safeSetState({
      status: Lt
    }, function() {
      n.props.onEntering(d, p), n.onTransitionEnd(h, function() {
        n.safeSetState({
          status: uo
        }, function() {
          n.props.onEntered(d, p);
        });
      });
    });
  }, "performEnter"), o.performExit = /* @__PURE__ */ a(function() {
    var r = this, n = this.props.exit, l = this.getTimeouts(), u = this.props.nodeRef ? void 0 : Ao.findDOMNode(this);
    if (!n || Si.disabled) {
      this.safeSetState({
        status: Mt
      }, function() {
        r.props.onExited(u);
      });
      return;
    }
    this.props.onExit(u), this.safeSetState({
      status: Ei
    }, function() {
      r.props.onExiting(u), r.onTransitionEnd(l.exit, function() {
        r.safeSetState({
          status: Mt
        }, function() {
          r.props.onExited(u);
        });
      });
    });
  }, "performExit"), o.cancelNextCallback = /* @__PURE__ */ a(function() {
    this.nextCallback !== null && (this.nextCallback.cancel(), this.nextCallback = null);
  }, "cancelNextCallback"), o.safeSetState = /* @__PURE__ */ a(function(r, n) {
    n = this.setNextCallback(n), this.setState(r, n);
  }, "safeSetState"), o.setNextCallback = /* @__PURE__ */ a(function(r) {
    var n = this, l = !0;
    return this.nextCallback = function(u) {
      l && (l = !1, n.nextCallback = null, r(u));
    }, this.nextCallback.cancel = function() {
      l = !1;
    }, this.nextCallback;
  }, "setNextCallback"), o.onTransitionEnd = /* @__PURE__ */ a(function(r, n) {
    this.setNextCallback(n);
    var l = this.props.nodeRef ? this.props.nodeRef.current : Ao.findDOMNode(this), u = r == null && !this.props.addEndListener;
    if (!l || u) {
      setTimeout(this.nextCallback, 0);
      return;
    }
    if (this.props.addEndListener) {
      var c = this.props.nodeRef ? [this.nextCallback] : [l, this.nextCallback], d = c[0], p = c[1];
      this.props.addEndListener(d, p);
    }
    r != null && setTimeout(this.nextCallback, r);
  }, "onTransitionEnd"), o.render = /* @__PURE__ */ a(function() {
    var r = this.state.status;
    if (r === Mo)
      return null;
    var n = this.props, l = n.children, u = n.in, c = n.mountOnEnter, d = n.unmountOnExit, p = n.appear, m = n.enter, h = n.exit, b = n.timeout,
    f = n.addEndListener, y = n.onEnter, S = n.onEntering, E = n.onEntered, g = n.onExit, v = n.onExiting, I = n.onExited, w = n.nodeRef, O = ke(
    n, ["children", "in", "mountOnEnter", "unmountOnExit", "appear", "enter", "exit", "timeout", "addEndListener", "onEnter", "onEntering", "\
onEntered", "onExit", "onExiting", "onExited", "nodeRef"]);
    return (
      // allows for nested Transitions
      /* @__PURE__ */ s.createElement(wi.Provider, {
        value: null
      }, typeof l == "function" ? l(r, O) : s.cloneElement(s.Children.only(l), O))
    );
  }, "render"), t;
}(s.Component);
pt.contextType = wi;
pt.propTypes = {};
function lo() {
}
a(lo, "noop");
pt.defaultProps = {
  in: !1,
  mountOnEnter: !1,
  unmountOnExit: !1,
  appear: !1,
  enter: !0,
  exit: !0,
  onEnter: lo,
  onEntering: lo,
  onEntered: lo,
  onExit: lo,
  onExiting: lo,
  onExited: lo
};
pt.UNMOUNTED = Mo;
pt.EXITED = Mt;
pt.ENTERING = Lt;
pt.ENTERED = uo;
pt.EXITING = Ei;
var Nt = pt;

// src/manager/components/upgrade/UpgradeBlock.tsx
var Sr = /* @__PURE__ */ a(({ onNavigateToWhatsNew: e }) => {
  let t = oe(), [o, i] = K("npm");
  return /* @__PURE__ */ s.createElement(wb, null, /* @__PURE__ */ s.createElement("strong", null, "You are on Storybook ", t.getCurrentVersion().
  version), /* @__PURE__ */ s.createElement("p", null, "Run the following script to check for updates and upgrade to the latest version."), /* @__PURE__ */ s.
  createElement(Eb, null, /* @__PURE__ */ s.createElement(Ti, { active: o === "npm", onClick: () => i("npm") }, "npm"), /* @__PURE__ */ s.createElement(
  Ti, { active: o === "yarn", onClick: () => i("yarn") }, "yarn"), /* @__PURE__ */ s.createElement(Ti, { active: o === "pnpm", onClick: () => i(
  "pnpm") }, "pnpm")), /* @__PURE__ */ s.createElement(Tb, null, o === "npm" ? "npx storybook@latest upgrade" : `${o} dlx storybook@latest u\
pgrade`), e && /* @__PURE__ */ s.createElement(Pe, { onClick: e }, "See what's new in Storybook"));
}, "UpgradeBlock"), wb = x.div(({ theme: e }) => ({
  border: "1px solid",
  borderRadius: 5,
  padding: 20,
  marginTop: 0,
  borderColor: e.appBorderColor,
  fontSize: e.typography.size.s2,
  width: "100%",
  [Qe]: {
    maxWidth: 400
  }
})), Eb = x.div({
  display: "flex",
  gap: 2
}), Tb = x.pre(({ theme: e }) => ({
  background: e.base === "light" ? "rgba(0, 0, 0, 0.05)" : e.appBorderColor,
  fontSize: e.typography.size.s2 - 1,
  margin: "4px 0 16px"
})), Ti = x.button(({ theme: e, active: t }) => ({
  all: "unset",
  alignItems: "center",
  gap: 10,
  color: e.color.defaultText,
  fontSize: e.typography.size.s2 - 1,
  borderBottom: "2px solid transparent",
  borderBottomColor: t ? e.color.secondary : "none",
  padding: "0 10px 5px",
  marginBottom: "5px",
  cursor: "pointer"
}));

// src/manager/components/mobile/about/MobileAbout.tsx
var Nl = /* @__PURE__ */ a(() => {
  let { isMobileAboutOpen: e, setMobileAboutOpen: t } = ge(), o = q(null);
  return /* @__PURE__ */ s.createElement(
    Nt,
    {
      nodeRef: o,
      in: e,
      timeout: 300,
      appear: !0,
      mountOnEnter: !0,
      unmountOnExit: !0
    },
    (i) => /* @__PURE__ */ s.createElement(Cb, { ref: o, state: i, transitionDuration: 300 }, /* @__PURE__ */ s.createElement(Ob, { onClick: () => t(
    !1), title: "Close about section" }, /* @__PURE__ */ s.createElement(Sn, null), "Back"), /* @__PURE__ */ s.createElement(_b, null, /* @__PURE__ */ s.
    createElement(Ml, { href: "https://github.com/storybookjs/storybook", target: "_blank" }, /* @__PURE__ */ s.createElement(Ll, null, /* @__PURE__ */ s.
    createElement(vo, null), /* @__PURE__ */ s.createElement("span", null, "Github")), /* @__PURE__ */ s.createElement(tt, { width: 12 })), /* @__PURE__ */ s.
    createElement(
      Ml,
      {
        href: "https://storybook.js.org/docs/react/get-started/install/",
        target: "_blank"
      },
      /* @__PURE__ */ s.createElement(Ll, null, /* @__PURE__ */ s.createElement(Un, null), /* @__PURE__ */ s.createElement("span", null, "Do\
cumentation")),
      /* @__PURE__ */ s.createElement(tt, { width: 12 })
    )), /* @__PURE__ */ s.createElement(Sr, null), /* @__PURE__ */ s.createElement(kb, null, "Open source software maintained by", " ", /* @__PURE__ */ s.
    createElement(Pe, { href: "https://chromatic.com", target: "_blank" }, "Chromatic"), " ", "and the", " ", /* @__PURE__ */ s.createElement(
    Pe, { href: "https://github.com/storybookjs/storybook/graphs/contributors" }, "Storybook Community")))
  );
}, "MobileAbout"), Cb = x.div(
  ({ theme: e, state: t, transitionDuration: o }) => ({
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 11,
    transition: `all ${o}ms ease-in-out`,
    overflow: "scroll",
    padding: "25px 10px 10px",
    color: e.color.defaultText,
    background: e.background.content,
    opacity: `${(() => {
      switch (t) {
        case "entering":
        case "entered":
          return 1;
        case "exiting":
        case "exited":
          return 0;
        default:
          return 0;
      }
    })()}`,
    transform: `${(() => {
      switch (t) {
        case "entering":
        case "entered":
          return "translateX(0)";
        case "exiting":
        case "exited":
          return "translateX(20px)";
        default:
          return "translateX(0)";
      }
    })()}`
  })
), _b = x.div({
  marginTop: 20,
  marginBottom: 20
}), Ml = x.a(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: e.typography.size.s2 - 1,
  height: 52,
  borderBottom: `1px solid ${e.appBorderColor}`,
  cursor: "pointer",
  padding: "0 10px",
  "&:last-child": {
    borderBottom: "none"
  }
})), Ll = x.div(({ theme: e }) => ({
  display: "flex",
  alignItems: "center",
  fontSize: e.typography.size.s2 - 1,
  height: 40,
  gap: 5
})), kb = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2 - 1,
  marginTop: 30
})), Ob = x.button(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "currentColor",
  fontSize: e.typography.size.s2 - 1,
  padding: "0 10px"
}));

// src/manager/components/mobile/navigation/MobileMenuDrawer.tsx
var Fl = /* @__PURE__ */ a(({ children: e }) => {
  let t = q(null), o = q(null), i = q(null), { isMobileMenuOpen: r, setMobileMenuOpen: n, isMobileAboutOpen: l, setMobileAboutOpen: u } = ge();
  return /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(
    Nt,
    {
      nodeRef: t,
      in: r,
      timeout: 300,
      mountOnEnter: !0,
      unmountOnExit: !0,
      onExited: () => u(!1)
    },
    (c) => /* @__PURE__ */ s.createElement(Pb, { ref: t, state: c }, /* @__PURE__ */ s.createElement(
      Nt,
      {
        nodeRef: o,
        in: !l,
        timeout: 300
      },
      (d) => /* @__PURE__ */ s.createElement(Ab, { ref: o, state: d }, e)
    ), /* @__PURE__ */ s.createElement(Nl, null))
  ), /* @__PURE__ */ s.createElement(
    Nt,
    {
      nodeRef: i,
      in: r,
      timeout: 300,
      mountOnEnter: !0,
      unmountOnExit: !0
    },
    (c) => /* @__PURE__ */ s.createElement(
      Db,
      {
        ref: i,
        state: c,
        onClick: () => n(!1),
        "aria-label": "Close navigation menu"
      }
    )
  ));
}, "MobileMenuDrawer"), Pb = x.div(({ theme: e, state: t }) => ({
  position: "fixed",
  boxSizing: "border-box",
  width: "100%",
  background: e.background.content,
  height: "80%",
  bottom: 0,
  left: 0,
  zIndex: 11,
  borderRadius: "10px 10px 0 0",
  transition: `all ${300}ms ease-in-out`,
  overflow: "hidden",
  transform: `${t === "entering" || t === "entered" ? "translateY(0)" : t === "exiting" || t === "exited" ? "translateY(100%)" : "translateY\
(0)"}`
})), Ab = x.div(({ theme: e, state: t }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  zIndex: 1,
  transition: `all ${300}ms ease-in-out`,
  overflow: "hidden",
  opacity: `${t === "entered" || t === "entering" ? 1 : t === "exiting" || t === "exited" ? 0 : 1}`,
  transform: `${(() => {
    switch (t) {
      case "entering":
      case "entered":
        return "translateX(0)";
      case "exiting":
      case "exited":
        return "translateX(-20px)";
      default:
        return "translateX(0)";
    }
  })()}`
})), Db = x.div(({ state: e }) => ({
  position: "fixed",
  boxSizing: "border-box",
  background: "rgba(0, 0, 0, 0.5)",
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  zIndex: 10,
  transition: `all ${300}ms ease-in-out`,
  cursor: "pointer",
  opacity: `${(() => {
    switch (e) {
      case "entering":
      case "entered":
        return 1;
      case "exiting":
      case "exited":
        return 0;
      default:
        return 0;
    }
  })()}`,
  "&:hover": {
    background: "rgba(0, 0, 0, 0.6)"
  }
}));

// src/manager/components/mobile/navigation/MobileNavigation.tsx
function Mb(e, t) {
  let o = { ...e || {} };
  return Object.values(t).forEach((i) => {
    i.index && Object.assign(o, i.index);
  }), o;
}
a(Mb, "combineIndexes");
var Lb = /* @__PURE__ */ a(() => {
  let { index: e, refs: t } = Ne(), o = oe(), i = o.getCurrentStoryData();
  if (!i)
    return "";
  let r = Mb(e, t || {}), n = i.renderLabel?.(i, o) || i.name, l = r[i.id];
  for (; l && "parent" in l && l.parent && r[l.parent] && n.length < 24; )
    l = r[l.parent], n = `${l.renderLabel?.(l, o) || l.name}/${n}`;
  return n;
}, "useFullStoryName"), Rl = /* @__PURE__ */ a(({
  menu: e,
  panel: t,
  showPanel: o,
  ...i
}) => {
  let { isMobileMenuOpen: r, isMobilePanelOpen: n, setMobileMenuOpen: l, setMobilePanelOpen: u } = ge(), c = Lb();
  return /* @__PURE__ */ s.createElement(Nb, { ...i }, /* @__PURE__ */ s.createElement(Fl, null, e), n ? /* @__PURE__ */ s.createElement(Al,
  null, t) : /* @__PURE__ */ s.createElement(Fb, { className: "sb-bar" }, /* @__PURE__ */ s.createElement(Rb, { onClick: () => l(!r), title: "\
Open navigation menu" }, /* @__PURE__ */ s.createElement(Io, null), /* @__PURE__ */ s.createElement(Bb, null, c)), o && /* @__PURE__ */ s.createElement(
  ee, { onClick: () => u(!0), title: "Open addon panel" }, /* @__PURE__ */ s.createElement(wn, null))));
}, "MobileNavigation"), Nb = x.div(({ theme: e }) => ({
  bottom: 0,
  left: 0,
  width: "100%",
  zIndex: 10,
  background: e.barBg,
  borderTop: `1px solid ${e.appBorderColor}`
})), Fb = x.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  height: 40,
  padding: "0 6px"
}), Rb = x.button(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: e.barTextColor,
  fontSize: `${e.typography.size.s2 - 1}px`,
  padding: "0 7px",
  fontWeight: e.typography.weight.bold,
  WebkitLineClamp: 1,
  "> svg": {
    width: 14,
    height: 14,
    flexShrink: 0
  }
})), Bb = x.p({
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
});

// src/manager/components/layout/useDragging.ts
var Bl = 30, wr = 240, Er = 270, Hl = 0.9;
function zl(e, t, o) {
  return Math.min(Math.max(e, t), o);
}
a(zl, "clamp");
function Wl(e, t, o) {
  return t + (o - t) * e;
}
a(Wl, "interpolate");
function Vl({
  setState: e,
  isPanelShown: t,
  isDesktop: o
}) {
  let i = q(null), r = q(null);
  return V(() => {
    let n = i.current, l = r.current, u = document.querySelector("#storybook-preview-wrapper"), c = null, d = /* @__PURE__ */ a((h) => {
      h.preventDefault(), e((b) => ({
        ...b,
        isDragging: !0
      })), h.currentTarget === n ? c = n : h.currentTarget === l && (c = l), window.addEventListener("mousemove", m), window.addEventListener(
      "mouseup", p), u && (u.style.pointerEvents = "none");
    }, "onDragStart"), p = /* @__PURE__ */ a((h) => {
      e((b) => c === l && b.navSize < wr && b.navSize > 0 ? {
        ...b,
        isDragging: !1,
        navSize: wr
      } : c === n && b.panelPosition === "right" && b.rightPanelWidth < Er && b.rightPanelWidth > 0 ? {
        ...b,
        isDragging: !1,
        rightPanelWidth: Er
      } : {
        ...b,
        isDragging: !1
      }), window.removeEventListener("mousemove", m), window.removeEventListener("mouseup", p), u?.removeAttribute("style"), c = null;
    }, "onDragEnd"), m = /* @__PURE__ */ a((h) => {
      if (h.buttons === 0) {
        p(h);
        return;
      }
      e((b) => {
        if (c === l) {
          let f = h.clientX;
          return f === b.navSize ? b : f <= Bl ? {
            ...b,
            navSize: 0
          } : f <= wr ? {
            ...b,
            navSize: Wl(Hl, f, wr)
          } : {
            ...b,
            // @ts-expect-error (non strict)
            navSize: zl(f, 0, h.view.innerWidth)
          };
        }
        if (c === n) {
          let f = b.panelPosition === "bottom" ? "bottomPanelHeight" : "rightPanelWidth", y = b.panelPosition === "bottom" ? (
            // @ts-expect-error (non strict)
            h.view.innerHeight - h.clientY
          ) : (
            // @ts-expect-error (non strict)
            h.view.innerWidth - h.clientX
          );
          if (y === b[f])
            return b;
          if (y <= Bl)
            return {
              ...b,
              [f]: 0
            };
          if (b.panelPosition === "right" && y <= Er)
            return {
              ...b,
              [f]: Wl(
                Hl,
                y,
                Er
              )
            };
          let S = (
            // @ts-expect-error (non strict)
            b.panelPosition === "bottom" ? h.view.innerHeight : h.view.innerWidth
          );
          return {
            ...b,
            [f]: zl(y, 0, S)
          };
        }
        return b;
      });
    }, "onDrag");
    return n?.addEventListener("mousedown", d), l?.addEventListener("mousedown", d), () => {
      n?.removeEventListener("mousedown", d), l?.removeEventListener("mousedown", d), u?.removeAttribute("style");
    };
  }, [
    // we need to rerun this effect when the panel is shown/hidden or when changing between mobile/desktop to re-attach the event listeners
    t,
    o,
    e
  ]), { panelResizerRef: i, sidebarResizerRef: r };
}
a(Vl, "useDragging");

// src/manager/components/layout/Layout.tsx
var Hb = 100, jl = /* @__PURE__ */ a((e, t) => e.navSize === t.navSize && e.bottomPanelHeight === t.bottomPanelHeight && e.rightPanelWidth ===
t.rightPanelWidth && e.panelPosition === t.panelPosition, "layoutStateIsEqual"), zb = /* @__PURE__ */ a(({
  api: e,
  managerLayoutState: t,
  setManagerLayoutState: o,
  isDesktop: i,
  hasTab: r
}) => {
  let n = s.useRef(t), [l, u] = K({
    ...t,
    isDragging: !1
  });
  V(() => {
    l.isDragging || // don't interrupt user's drag
    jl(t, n.current) || (n.current = t, u((S) => ({ ...S, ...t })));
  }, [l.isDragging, t, u]), Xt(() => {
    if (l.isDragging || // wait with syncing managerLayoutState until user is done dragging
    jl(t, l))
      return;
    let S = {
      navSize: l.navSize,
      bottomPanelHeight: l.bottomPanelHeight,
      rightPanelWidth: l.rightPanelWidth
    };
    n.current = {
      ...n.current,
      ...S
    }, o(S);
  }, [l, o]);
  let c = t.viewMode !== "story" && t.viewMode !== "docs", d = t.viewMode === "story" && !r, { panelResizerRef: p, sidebarResizerRef: m } = Vl(
  {
    setState: u,
    isPanelShown: d,
    isDesktop: i
  }), { navSize: h, rightPanelWidth: b, bottomPanelHeight: f } = l.isDragging ? l : t;
  return {
    navSize: e.getNavSizeWithCustomisations?.(h) ?? h,
    rightPanelWidth: b,
    bottomPanelHeight: f,
    panelPosition: t.panelPosition,
    panelResizerRef: p,
    sidebarResizerRef: m,
    showPages: c,
    showPanel: d,
    isDragging: l.isDragging
  };
}, "useLayoutSyncingState"), Kl = /* @__PURE__ */ a(({ children: e }) => /* @__PURE__ */ s.createElement(Ka, { path: /(^\/story|docs|onboarding\/|^\/$)/,
startsWith: !1 }, ({ match: t }) => /* @__PURE__ */ s.createElement(Kb, { shown: !!t }, e)), "MainContentMatcher"), Wb = x(Rl)({
  order: 1
}), Ul = /* @__PURE__ */ a(({ managerLayoutState: e, setManagerLayoutState: t, hasTab: o, ...i }) => {
  let { isDesktop: r, isMobile: n } = ge(), l = oe(), {
    navSize: u,
    rightPanelWidth: c,
    bottomPanelHeight: d,
    panelPosition: p,
    panelResizerRef: m,
    sidebarResizerRef: h,
    showPages: b,
    showPanel: f,
    isDragging: y
  } = zb({ api: l, managerLayoutState: e, setManagerLayoutState: t, isDesktop: r, hasTab: o });
  return /* @__PURE__ */ s.createElement(
    Vb,
    {
      navSize: u,
      rightPanelWidth: c,
      bottomPanelHeight: d,
      panelPosition: e.panelPosition,
      isDragging: y,
      viewMode: e.viewMode,
      showPanel: f
    },
    b && /* @__PURE__ */ s.createElement($b, null, i.slotPages),
    r && /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(jb, null, /* @__PURE__ */ s.createElement($l, { ref: h }),
    i.slotSidebar), /* @__PURE__ */ s.createElement(Kl, null, i.slotMain), f && /* @__PURE__ */ s.createElement(Ub, { position: p }, /* @__PURE__ */ s.
    createElement(
      $l,
      {
        orientation: p === "bottom" ? "horizontal" : "vertical",
        position: p === "bottom" ? "left" : "right",
        ref: m
      }
    ), i.slotPanel)),
    n && /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(
      Wb,
      {
        menu: i.slotSidebar,
        panel: i.slotPanel,
        showPanel: f
      }
    ), /* @__PURE__ */ s.createElement(Kl, null, i.slotMain), /* @__PURE__ */ s.createElement(Pl, null))
  );
}, "Layout"), Vb = x.div(
  ({ navSize: e, rightPanelWidth: t, bottomPanelHeight: o, viewMode: i, panelPosition: r, showPanel: n }) => ({
    width: "100%",
    height: ["100vh", "100dvh"],
    // This array is a special Emotion syntax to set a fallback if 100dvh is not supported
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    colorScheme: "light dark",
    [Qe]: {
      display: "grid",
      gap: 0,
      gridTemplateColumns: `minmax(0, ${e}px) minmax(${Hb}px, 1fr) minmax(0, ${t}px)`,
      gridTemplateRows: `1fr minmax(0, ${o}px)`,
      gridTemplateAreas: i === "docs" || !n ? `"sidebar content content"
                  "sidebar content content"` : r === "right" ? `"sidebar content panel"
                  "sidebar content panel"` : `"sidebar content content"
                "sidebar panel   panel"`
    }
  })
), jb = x.div(({ theme: e }) => ({
  backgroundColor: e.background.app,
  gridArea: "sidebar",
  position: "relative",
  borderRight: `1px solid ${e.color.border}`
})), Kb = x.div(({ theme: e, shown: t }) => ({
  flex: 1,
  position: "relative",
  backgroundColor: e.background.content,
  display: t ? "grid" : "none",
  // This is needed to make the content container fill the available space
  overflow: "auto",
  [Qe]: {
    flex: "auto",
    gridArea: "content"
  }
})), $b = x.div(({ theme: e }) => ({
  gridRowStart: "sidebar-start",
  gridRowEnd: "-1",
  gridColumnStart: "sidebar-end",
  gridColumnEnd: "-1",
  backgroundColor: e.background.content,
  zIndex: 1
})), Ub = x.div(
  ({ theme: e, position: t }) => ({
    gridArea: "panel",
    position: "relative",
    backgroundColor: e.background.content,
    borderTop: t === "bottom" ? `1px solid ${e.color.border}` : void 0,
    borderLeft: t === "right" ? `1px solid ${e.color.border}` : void 0
  })
), $l = x.div(
  ({ theme: e }) => ({
    position: "absolute",
    opacity: 0,
    transition: "opacity 0.2s ease-in-out",
    zIndex: 100,
    "&:after": {
      content: '""',
      display: "block",
      backgroundColor: e.color.secondary
    },
    "&:hover": {
      opacity: 1
    }
  }),
  ({ orientation: e = "vertical", position: t = "left" }) => e === "vertical" ? {
    width: t === "left" ? 10 : 13,
    height: "100%",
    top: 0,
    right: t === "left" ? "-7px" : void 0,
    left: t === "right" ? "-7px" : void 0,
    "&:after": {
      width: 1,
      height: "100%",
      marginLeft: t === "left" ? 3 : 6
    },
    "&:hover": {
      cursor: "col-resize"
    }
  } : {
    width: "100%",
    height: "13px",
    top: "-7px",
    left: 0,
    "&:after": {
      width: "100%",
      height: 1,
      marginTop: 6
    },
    "&:hover": {
      cursor: "row-resize"
    }
  }
);

// global-externals:storybook/internal/types
var OO = __STORYBOOK_TYPES__, { Addon_TypesEnum: Ce } = __STORYBOOK_TYPES__;

// src/core-events/index.ts
var Gl = /* @__PURE__ */ ((N) => (N.CHANNEL_WS_DISCONNECT = "channelWSDisconnect", N.CHANNEL_CREATED = "channelCreated", N.CONFIG_ERROR = "c\
onfigError", N.STORY_INDEX_INVALIDATED = "storyIndexInvalidated", N.STORY_SPECIFIED = "storySpecified", N.SET_CONFIG = "setConfig", N.SET_STORIES =
"setStories", N.SET_INDEX = "setIndex", N.SET_CURRENT_STORY = "setCurrentStory", N.CURRENT_STORY_WAS_SET = "currentStoryWasSet", N.FORCE_RE_RENDER =
"forceReRender", N.FORCE_REMOUNT = "forceRemount", N.PRELOAD_ENTRIES = "preloadStories", N.STORY_PREPARED = "storyPrepared", N.DOCS_PREPARED =
"docsPrepared", N.STORY_CHANGED = "storyChanged", N.STORY_UNCHANGED = "storyUnchanged", N.STORY_RENDERED = "storyRendered", N.STORY_FINISHED =
"storyFinished", N.STORY_MISSING = "storyMissing", N.STORY_ERRORED = "storyErrored", N.STORY_THREW_EXCEPTION = "storyThrewException", N.STORY_RENDER_PHASE_CHANGED =
"storyRenderPhaseChanged", N.STORY_HOT_UPDATED = "storyHotUpdated", N.PLAY_FUNCTION_THREW_EXCEPTION = "playFunctionThrewException", N.UNHANDLED_ERRORS_WHILE_PLAYING =
"unhandledErrorsWhilePlaying", N.UPDATE_STORY_ARGS = "updateStoryArgs", N.STORY_ARGS_UPDATED = "storyArgsUpdated", N.RESET_STORY_ARGS = "res\
etStoryArgs", N.SET_FILTER = "setFilter", N.SET_GLOBALS = "setGlobals", N.UPDATE_GLOBALS = "updateGlobals", N.GLOBALS_UPDATED = "globalsUpda\
ted", N.REGISTER_SUBSCRIPTION = "registerSubscription", N.PREVIEW_KEYDOWN = "previewKeydown", N.PREVIEW_BUILDER_PROGRESS = "preview_builder_\
progress", N.SELECT_STORY = "selectStory", N.STORIES_COLLAPSE_ALL = "storiesCollapseAll", N.STORIES_EXPAND_ALL = "storiesExpandAll", N.DOCS_RENDERED =
"docsRendered", N.SHARED_STATE_CHANGED = "sharedStateChanged", N.SHARED_STATE_SET = "sharedStateSet", N.NAVIGATE_URL = "navigateUrl", N.UPDATE_QUERY_PARAMS =
"updateQueryParams", N.REQUEST_WHATS_NEW_DATA = "requestWhatsNewData", N.RESULT_WHATS_NEW_DATA = "resultWhatsNewData", N.SET_WHATS_NEW_CACHE =
"setWhatsNewCache", N.TOGGLE_WHATS_NEW_NOTIFICATIONS = "toggleWhatsNewNotifications", N.TELEMETRY_ERROR = "telemetryError", N.FILE_COMPONENT_SEARCH_REQUEST =
"fileComponentSearchRequest", N.FILE_COMPONENT_SEARCH_RESPONSE = "fileComponentSearchResponse", N.SAVE_STORY_REQUEST = "saveStoryRequest", N.
SAVE_STORY_RESPONSE = "saveStoryResponse", N.ARGTYPES_INFO_REQUEST = "argtypesInfoRequest", N.ARGTYPES_INFO_RESPONSE = "argtypesInfoResponse",
N.CREATE_NEW_STORYFILE_REQUEST = "createNewStoryfileRequest", N.CREATE_NEW_STORYFILE_RESPONSE = "createNewStoryfileResponse", N))(Gl || {});
var {
  CHANNEL_WS_DISCONNECT: AO,
  CHANNEL_CREATED: DO,
  CONFIG_ERROR: MO,
  CREATE_NEW_STORYFILE_REQUEST: LO,
  CREATE_NEW_STORYFILE_RESPONSE: NO,
  CURRENT_STORY_WAS_SET: FO,
  DOCS_PREPARED: RO,
  DOCS_RENDERED: BO,
  FILE_COMPONENT_SEARCH_REQUEST: HO,
  FILE_COMPONENT_SEARCH_RESPONSE: zO,
  FORCE_RE_RENDER: WO,
  FORCE_REMOUNT: VO,
  GLOBALS_UPDATED: jO,
  NAVIGATE_URL: KO,
  PLAY_FUNCTION_THREW_EXCEPTION: $O,
  UNHANDLED_ERRORS_WHILE_PLAYING: UO,
  PRELOAD_ENTRIES: GO,
  PREVIEW_BUILDER_PROGRESS: qO,
  PREVIEW_KEYDOWN: YO,
  REGISTER_SUBSCRIPTION: QO,
  RESET_STORY_ARGS: XO,
  SELECT_STORY: ZO,
  SET_CONFIG: JO,
  SET_CURRENT_STORY: eP,
  SET_FILTER: tP,
  SET_GLOBALS: oP,
  SET_INDEX: rP,
  SET_STORIES: nP,
  SHARED_STATE_CHANGED: iP,
  SHARED_STATE_SET: sP,
  STORIES_COLLAPSE_ALL: aP,
  STORIES_EXPAND_ALL: lP,
  STORY_ARGS_UPDATED: uP,
  STORY_CHANGED: cP,
  STORY_ERRORED: pP,
  STORY_INDEX_INVALIDATED: dP,
  STORY_MISSING: fP,
  STORY_PREPARED: ql,
  STORY_RENDER_PHASE_CHANGED: mP,
  STORY_RENDERED: hP,
  STORY_FINISHED: gP,
  STORY_SPECIFIED: yP,
  STORY_THREW_EXCEPTION: bP,
  STORY_UNCHANGED: vP,
  STORY_HOT_UPDATED: xP,
  UPDATE_GLOBALS: IP,
  UPDATE_QUERY_PARAMS: SP,
  UPDATE_STORY_ARGS: wP,
  REQUEST_WHATS_NEW_DATA: EP,
  RESULT_WHATS_NEW_DATA: TP,
  SET_WHATS_NEW_CACHE: CP,
  TOGGLE_WHATS_NEW_NOTIFICATIONS: _P,
  TELEMETRY_ERROR: kP,
  SAVE_STORY_REQUEST: OP,
  SAVE_STORY_RESPONSE: PP,
  ARGTYPES_INFO_REQUEST: AP,
  ARGTYPES_INFO_RESPONSE: DP
} = Gl;

// src/manager/components/panel/Panel.tsx
var ki = class ki extends Le {
  constructor(t) {
    super(t), this.state = { hasError: !1 };
  }
  componentDidCatch(t, o) {
    this.setState({ hasError: !0 }), console.error(t, o);
  }
  // @ts-expect-error (we know this is broken)
  render() {
    let { hasError: t } = this.state, { children: o } = this.props;
    return t ? /* @__PURE__ */ s.createElement("h1", null, "Something went wrong.") : o;
  }
};
a(ki, "SafeTab");
var Ci = ki, _i = s.memo(
  ({
    panels: e,
    shortcuts: t,
    actions: o,
    selectedPanel: i = null,
    panelPosition: r = "right",
    absolute: n = !0
  }) => {
    let { isDesktop: l, setMobilePanelOpen: u } = ge();
    return /* @__PURE__ */ s.createElement(
      Ca,
      {
        absolute: n,
        ...i && e[i] ? { selected: i } : {},
        menuName: "Addons",
        actions: o,
        showToolsWhenEmpty: !0,
        emptyState: /* @__PURE__ */ s.createElement(
          Ea,
          {
            title: "Storybook add-ons",
            description: /* @__PURE__ */ s.createElement(s.Fragment, null, "Integrate your tools with Storybook to connect workflows and unl\
ock advanced features."),
            footer: /* @__PURE__ */ s.createElement(Pe, { href: "https://storybook.js.org/integrations", target: "_blank", withArrow: !0 }, /* @__PURE__ */ s.
            createElement(kt, null), " Explore integrations catalog")
          }
        ),
        tools: /* @__PURE__ */ s.createElement(Gb, null, l ? /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(
          ee,
          {
            key: "position",
            onClick: o.togglePosition,
            title: `Change addon orientation [${Ye(
              t.panelPosition
            )}]`
          },
          r === "bottom" ? /* @__PURE__ */ s.createElement(wo, null) : /* @__PURE__ */ s.createElement(yo, null)
        ), /* @__PURE__ */ s.createElement(
          ee,
          {
            key: "visibility",
            onClick: o.toggleVisibility,
            title: `Hide addons [${Ye(t.togglePanel)}]`
          },
          /* @__PURE__ */ s.createElement(je, null)
        )) : /* @__PURE__ */ s.createElement(ee, { onClick: () => u(!1), title: "Close addon panel" }, /* @__PURE__ */ s.createElement(je, null))),
        id: "storybook-panel-root"
      },
      Object.entries(e).map(([c, d]) => (
        // @ts-expect-error (we know this is broken)
        /* @__PURE__ */ s.createElement(Ci, { key: c, id: c, title: typeof d.title == "function" ? /* @__PURE__ */ s.createElement(d.title, null) :
        d.title }, d.render)
      ))
    );
  }
);
_i.displayName = "AddonPanel";
var Gb = x.div({
  display: "flex",
  alignItems: "center",
  gap: 6
});

// src/manager/container/Panel.tsx
var qb = /* @__PURE__ */ a((e) => {
  let t = oe(), o = Ne(), [i, r] = K(t.getCurrentStoryData());
  ba(
    {
      [ql]: () => {
        r(t.getCurrentStoryData());
      }
    },
    []
  );
  let { parameters: n, type: l } = i ?? {}, u = U(
    () => ({
      onSelect: /* @__PURE__ */ a((d) => t.setSelectedPanel(d), "onSelect"),
      toggleVisibility: /* @__PURE__ */ a(() => t.togglePanel(), "toggleVisibility"),
      togglePosition: /* @__PURE__ */ a(() => t.togglePanelPosition(), "togglePosition")
    }),
    [t]
  ), c = U(() => {
    let d = t.getElements(Ce.PANEL);
    if (!d || l !== "story")
      return d;
    let p = {};
    return Object.entries(d).forEach(([m, h]) => {
      let { paramKey: b } = h;
      b && n && n[b] && n[b].disable || h.disabled === !0 || typeof h.disabled == "function" && h.disabled(n) || (p[m] = h);
    }), p;
  }, [t, l, n]);
  return /* @__PURE__ */ s.createElement(
    _i,
    {
      panels: c,
      selectedPanel: t.getSelectedPanel(),
      panelPosition: o.layout.panelPosition,
      actions: u,
      shortcuts: t.getShortcutKeys(),
      ...e
    }
  );
}, "Panel"), Yl = qb;

// src/manager/container/Preview.tsx
var No = Ve(Pi(), 1);

// src/manager/components/preview/Iframe.tsx
var Yb = x.iframe(({ theme: e }) => ({
  backgroundColor: e.background.preview,
  display: "block",
  boxSizing: "content-box",
  height: "100%",
  width: "100%",
  border: "0 none",
  transition: "background-position 0s, visibility 0s",
  backgroundPosition: "-1px -1px, -1px -1px, -1px -1px, -1px -1px",
  margin: "auto",
  boxShadow: "0 0 100px 100vw rgba(0,0,0,0.5)"
}));
function Xl(e) {
  let { active: t, id: o, title: i, src: r, allowFullScreen: n, scale: l, ...u } = e, c = s.useRef(null);
  return /* @__PURE__ */ s.createElement(_a.IFrame, { scale: l, active: t, iFrameRef: c }, /* @__PURE__ */ s.createElement(
    Yb,
    {
      "data-is-storybook": t ? "true" : "false",
      onLoad: (d) => d.currentTarget.setAttribute("data-is-loaded", "true"),
      id: o,
      title: i,
      src: r,
      allow: "clipboard-write;",
      allowFullScreen: n,
      ref: c,
      ...u
    }
  ));
}
a(Xl, "IFrame");

// src/manager/components/preview/utils/stringifyQueryParams.tsx
var cu = Ve(uu(), 1);
var pu = /* @__PURE__ */ a((e) => {
  let t = (0, cu.stringify)(e);
  return t === "" ? "" : `&${t}`;
}, "stringifyQueryParams");

// src/manager/components/preview/FramesRenderer.tsx
var Iv = /* @__PURE__ */ a((e, t) => e && t[e] ? `storybook-ref-${e}` : "storybook-preview-iframe", "getActive"), Sv = x(he)(({ theme: e }) => ({
  display: "none",
  "@media (min-width: 600px)": {
    position: "absolute",
    display: "block",
    top: 10,
    right: 15,
    padding: "10px 15px",
    fontSize: e.typography.size.s1,
    transform: "translateY(-100px)",
    "&:focus": {
      transform: "translateY(0)",
      zIndex: 1
    }
  }
})), wv = /* @__PURE__ */ a(({ api: e, state: t }) => ({
  isFullscreen: e.getIsFullscreen(),
  isNavShown: e.getIsNavShown(),
  selectedStoryId: t.storyId
}), "whenSidebarIsVisible"), Ev = {
  '#root [data-is-storybook="false"]': {
    display: "none"
  },
  '#root [data-is-storybook="true"]': {
    display: "block"
  }
}, du = /* @__PURE__ */ a(({
  refs: e,
  scale: t,
  viewMode: o = "story",
  refId: i,
  queryParams: r = {},
  baseUrl: n,
  storyId: l = "*"
}) => {
  let u = e[i]?.version, c = pu({
    ...r,
    ...u && { version: u }
  }), d = Iv(i, e), { current: p } = q({}), m = Object.values(e).filter((h) => h.type === "auto-inject" || h.id === i, {});
  return p["storybook-preview-iframe"] || (p["storybook-preview-iframe"] = to(n, l, {
    ...r,
    ...u && { version: u },
    viewMode: o
  })), m.forEach((h) => {
    let b = `storybook-ref-${h.id}`, f = p[b]?.split("/iframe.html")[0];
    if (!f || h.url !== f) {
      let y = `${h.url}/iframe.html?id=${l}&viewMode=${o}&refId=${h.id}${c}`;
      p[b] = y;
    }
  }), /* @__PURE__ */ s.createElement(Ee, null, /* @__PURE__ */ s.createElement(eo, { styles: Ev }), /* @__PURE__ */ s.createElement(me, { filter: wv },
  ({ isFullscreen: h, isNavShown: b, selectedStoryId: f }) => h || !b || !f ? null : /* @__PURE__ */ s.createElement(Sv, { asChild: !0 }, /* @__PURE__ */ s.
  createElement("a", { href: `#${f}`, tabIndex: 0, title: "Skip to sidebar" }, "Skip to sidebar"))), Object.entries(p).map(([h, b]) => /* @__PURE__ */ s.
  createElement(Ee, { key: h }, /* @__PURE__ */ s.createElement(
    Xl,
    {
      active: h === d,
      key: h,
      id: h,
      title: h,
      src: b,
      allowFullScreen: !0,
      scale: t
    }
  ))));
}, "FramesRenderer");

// src/manager/components/preview/tools/addons.tsx
var Tv = /* @__PURE__ */ a(({ api: e, state: t }) => ({
  isVisible: e.getIsPanelShown(),
  singleStory: t.singleStory,
  panelPosition: t.layout.panelPosition,
  toggle: /* @__PURE__ */ a(() => e.togglePanel(), "toggle")
}), "menuMapper"), fu = {
  title: "addons",
  id: "addons",
  type: be.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(me, { filter: Tv }, ({ isVisible: e, toggle: t, singleStory: o, panelPosition: i }) => !o &&
  !e && /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(ee, { "aria-label": "Show addons", key: "addons", onClick: t,
  title: "Show addons" }, i === "bottom" ? /* @__PURE__ */ s.createElement(yo, null) : /* @__PURE__ */ s.createElement(wo, null)))), "render")
};

// src/manager/components/preview/tools/copy.tsx
var vu = Ve(bu(), 1);
var { PREVIEW_URL: Pv, document: Av } = se, Dv = /* @__PURE__ */ a(({ state: e }) => {
  let { storyId: t, refId: o, refs: i } = e, { location: r } = Av, n = i[o], l = `${r.origin}${r.pathname}`;
  return l.endsWith("/") || (l += "/"), {
    refId: o,
    baseUrl: n ? `${n.url}/iframe.html` : Pv || `${l}iframe.html`,
    storyId: t,
    queryParams: e.customQueryParams
  };
}, "copyMapper"), xu = {
  title: "copy",
  id: "copy",
  type: be.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(me, { filter: Dv }, ({ baseUrl: e, storyId: t, queryParams: o }) => t ? /* @__PURE__ */ s.
  createElement(
    ee,
    {
      key: "copy",
      onClick: () => (0, vu.default)(to(e, t, o)),
      title: "Copy canvas link"
    },
    /* @__PURE__ */ s.createElement(Hn, null)
  ) : null), "render")
};

// src/manager/components/preview/tools/eject.tsx
var { PREVIEW_URL: Mv } = se, Lv = /* @__PURE__ */ a(({ state: e }) => {
  let { storyId: t, refId: o, refs: i } = e, r = i[o];
  return {
    refId: o,
    baseUrl: r ? `${r.url}/iframe.html` : Mv || "iframe.html",
    storyId: t,
    queryParams: e.customQueryParams
  };
}, "ejectMapper"), Iu = {
  title: "eject",
  id: "eject",
  type: be.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(me, { filter: Lv }, ({ baseUrl: e, storyId: t, queryParams: o }) => t ? /* @__PURE__ */ s.
  createElement(ee, { key: "opener", asChild: !0 }, /* @__PURE__ */ s.createElement(
    "a",
    {
      href: to(e, t, o),
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Open canvas in new tab"
    },
    /* @__PURE__ */ s.createElement(tt, null)
  )) : null), "render")
};

// src/manager/components/preview/tools/remount.tsx
var Nv = x(ee)(({ theme: e, animating: t, disabled: o }) => ({
  opacity: o ? 0.5 : 1,
  svg: {
    animation: t ? `${e.animation.rotate360} 1000ms ease-out` : void 0
  }
})), Fv = /* @__PURE__ */ a(({ api: e, state: t }) => {
  let { storyId: o } = t;
  return {
    storyId: o,
    remount: /* @__PURE__ */ a(() => e.emit(xn, { storyId: t.storyId }), "remount"),
    api: e
  };
}, "menuMapper"), Su = {
  title: "remount",
  id: "remount",
  type: be.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(me, { filter: Fv }, ({ remount: e, storyId: t, api: o }) => {
    let [i, r] = K(!1), n = /* @__PURE__ */ a(() => {
      t && e();
    }, "remountComponent");
    return o.on(xn, () => {
      r(!0);
    }), /* @__PURE__ */ s.createElement(
      Nv,
      {
        key: "remount",
        title: "Remount component",
        onClick: n,
        onAnimationEnd: () => r(!1),
        animating: i,
        disabled: !t
      },
      /* @__PURE__ */ s.createElement(ut, null)
    );
  }), "render")
};

// src/manager/components/preview/tools/zoom.tsx
var Lo = 1, wu = Qt({ value: Lo, set: /* @__PURE__ */ a((e) => {
}, "set") }), Bi = class Bi extends Le {
  constructor() {
    super(...arguments);
    this.state = {
      value: Lo
    };
    this.set = /* @__PURE__ */ a((o) => this.setState({ value: o }), "set");
  }
  render() {
    let { children: o, shouldScale: i } = this.props, { set: r } = this, { value: n } = this.state;
    return /* @__PURE__ */ s.createElement(wu.Provider, { value: { value: i ? n : Lo, set: r } }, o);
  }
};
a(Bi, "ZoomProvider");
var Or = Bi, { Consumer: Ri } = wu, Rv = Tt(/* @__PURE__ */ a(function({ zoomIn: t, zoomOut: o, reset: i }) {
  return /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(ee, { key: "zoomin", onClick: t, title: "Zoom in" },
  /* @__PURE__ */ s.createElement(Xn, null)), /* @__PURE__ */ s.createElement(ee, { key: "zoomout", onClick: o, title: "Zoom out" }, /* @__PURE__ */ s.
  createElement(Zn, null)), /* @__PURE__ */ s.createElement(ee, { key: "zoomreset", onClick: i, title: "Reset zoom" }, /* @__PURE__ */ s.createElement(
  Jn, null)));
}, "Zoom"));
var Bv = Tt(/* @__PURE__ */ a(function({
  set: t,
  value: o
}) {
  let i = A(
    (l) => {
      l.preventDefault(), t(0.8 * o);
    },
    [t, o]
  ), r = A(
    (l) => {
      l.preventDefault(), t(1.25 * o);
    },
    [t, o]
  ), n = A(
    (l) => {
      l.preventDefault(), t(Lo);
    },
    [t, Lo]
  );
  return /* @__PURE__ */ s.createElement(Rv, { key: "zoom", zoomIn: i, zoomOut: r, reset: n });
}, "ZoomWrapper"));
function Hv() {
  return /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(Ri, null, ({ set: e, value: t }) => /* @__PURE__ */ s.
  createElement(Bv, { set: e, value: t })), /* @__PURE__ */ s.createElement(ht, null));
}
a(Hv, "ZoomToolRenderer");
var Eu = {
  title: "zoom",
  id: "zoom",
  type: be.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === "story" && !t, "match"),
  render: Hv
};

// src/manager/components/preview/Toolbar.tsx
var zv = /* @__PURE__ */ a(({ api: e, state: t }) => ({
  toggle: e.toggleFullscreen,
  isFullscreen: e.getIsFullscreen(),
  shortcut: Ye(e.getShortcutKeys().fullScreen),
  hasPanel: Object.keys(e.getElements(Ce.PANEL)).length > 0,
  singleStory: t.singleStory
}), "fullScreenMapper"), Cu = {
  title: "fullscreen",
  id: "fullscreen",
  type: be.TOOL,
  // @ts-expect-error (non strict)
  match: /* @__PURE__ */ a((e) => ["story", "docs"].includes(e.viewMode), "match"),
  render: /* @__PURE__ */ a(() => {
    let { isMobile: e } = ge();
    return e ? null : /* @__PURE__ */ s.createElement(me, { filter: zv }, ({ toggle: t, isFullscreen: o, shortcut: i, hasPanel: r, singleStory: n }) => (!n ||
    n && r) && /* @__PURE__ */ s.createElement(
      ee,
      {
        key: "full",
        onClick: t,
        title: `${o ? "Exit full screen" : "Go full screen"} [${i}]`,
        "aria-label": o ? "Exit full screen" : "Go full screen"
      },
      o ? /* @__PURE__ */ s.createElement(je, null) : /* @__PURE__ */ s.createElement(An, null)
    ));
  }, "render")
};
var _u = s.memo(/* @__PURE__ */ a(function({
  isShown: t,
  tools: o,
  toolsExtra: i,
  tabs: r,
  tabId: n,
  api: l
}) {
  return r || o || i ? /* @__PURE__ */ s.createElement(Vv, { className: "sb-bar", key: "toolbar", shown: t, "data-test-id": "sb-preview-tool\
bar" }, /* @__PURE__ */ s.createElement(jv, null, /* @__PURE__ */ s.createElement(ku, null, r.length > 1 ? /* @__PURE__ */ s.createElement(Ee,
  null, /* @__PURE__ */ s.createElement(sr, { key: "tabs" }, r.map((u, c) => /* @__PURE__ */ s.createElement(
    ar,
    {
      disabled: !!u.disabled,
      active: u.id === n || u.id === "canvas" && !n,
      onClick: () => {
        l.applyQueryParams({ tab: u.id === "canvas" ? void 0 : u.id });
      },
      key: u.id || `tab-${c}`
    },
    u.title
  ))), /* @__PURE__ */ s.createElement(ht, null)) : null, /* @__PURE__ */ s.createElement(Tu, { key: "left", list: o })), /* @__PURE__ */ s.
  createElement(Kv, null, /* @__PURE__ */ s.createElement(Tu, { key: "right", list: i })))) : null;
}, "ToolbarComp")), Tu = s.memo(/* @__PURE__ */ a(function({ list: t }) {
  return /* @__PURE__ */ s.createElement(s.Fragment, null, t.filter(Boolean).map(({ render: o, id: i, ...r }, n) => (
    // @ts-expect-error (Converted from ts-ignore)
    /* @__PURE__ */ s.createElement(o, { key: i || r.key || `f-${n}` })
  )));
}, "Tools"));
function Wv(e, t) {
  let o = t?.type === "story" && t?.prepared ? t?.parameters : {}, i = "toolbar" in o ? o.toolbar : void 0, { toolbar: r } = He.getConfig(),
  n = Jo(
    r || {},
    i || {}
  );
  return n ? !!n[e?.id]?.hidden : !1;
}
a(Wv, "toolbarItemHasBeenExcluded");
function Hi(e, t, o, i, r, n) {
  let l = /* @__PURE__ */ a((u) => u && (!u.match || u.match({
    storyId: t?.id,
    refId: t?.refId,
    viewMode: o,
    location: i,
    path: r,
    tabId: n
  })) && !Wv(u, t), "filter");
  return e.filter(l);
}
a(Hi, "filterToolsSide");
var Vv = x.div(({ theme: e, shown: t }) => ({
  position: "relative",
  color: e.barTextColor,
  width: "100%",
  height: 40,
  flexShrink: 0,
  overflowX: "auto",
  overflowY: "hidden",
  marginTop: t ? 0 : -40,
  boxShadow: `${e.appBorderColor}  0 -1px 0 0 inset`,
  background: e.barBg,
  scrollbarColor: `${e.barTextColor} ${e.barBg}`,
  scrollbarWidth: "thin",
  zIndex: 4
})), jv = x.div({
  position: "absolute",
  width: "calc(100% - 20px)",
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "nowrap",
  flexShrink: 0,
  height: 40,
  marginLeft: 10,
  marginRight: 10
}), ku = x.div({
  display: "flex",
  whiteSpace: "nowrap",
  flexBasis: "auto",
  gap: 6,
  alignItems: "center"
}), Kv = x(ku)({
  marginLeft: 30
});

// src/manager/components/preview/utils/components.ts
var Ou = x.main({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  overflow: "hidden"
}), Pu = x.div({
  overflow: "auto",
  width: "100%",
  zIndex: 3,
  background: "transparent",
  flex: 1
}), Au = x.div(
  {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    justifyItems: "center",
    overflow: "auto",
    gridTemplateColumns: "100%",
    gridTemplateRows: "100%",
    position: "relative",
    width: "100%",
    height: "100%"
  },
  ({ show: e }) => ({ display: e ? "grid" : "none" })
), CD = x(cr)({
  color: "inherit",
  textDecoration: "inherit",
  display: "inline-block"
}), _D = x.span({
  // Hides full screen icon at mobile breakpoint defined in app.js
  "@media (max-width: 599px)": {
    display: "none"
  }
}), Pr = x.div(({ theme: e }) => ({
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  justifyItems: "center",
  overflow: "auto",
  display: "grid",
  gridTemplateColumns: "100%",
  gridTemplateRows: "100%",
  position: "relative",
  width: "100%",
  height: "100%"
})), Du = x.div(({ theme: e }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  background: e.background.preview,
  zIndex: 1
}));

// src/manager/components/preview/Wrappers.tsx
var Mu = /* @__PURE__ */ a(({
  wrappers: e,
  id: t,
  storyId: o,
  children: i
}) => /* @__PURE__ */ s.createElement(Ee, null, e.reduceRight(
  (r, n, l) => /* @__PURE__ */ s.createElement(n.render, { index: l, children: r, id: t, storyId: o }),
  i
)), "ApplyWrappers"), Lu = [
  {
    id: "iframe-wrapper",
    type: Ce.PREVIEW,
    render: /* @__PURE__ */ a((e) => /* @__PURE__ */ s.createElement(Pr, { id: "storybook-preview-wrapper" }, e.children), "render")
  }
];

// src/manager/components/preview/Preview.tsx
var Uv = /* @__PURE__ */ a(({ state: e, api: t }) => ({
  storyId: e.storyId,
  refId: e.refId,
  viewMode: e.viewMode,
  customCanvas: t.renderPreview,
  queryParams: e.customQueryParams,
  getElements: t.getElements,
  entry: t.getData(e.storyId, e.refId),
  previewInitialized: e.previewInitialized,
  refs: e.refs
}), "canvasMapper"), Nu = /* @__PURE__ */ a(() => ({
  id: "canvas",
  type: be.TAB,
  title: "Canvas",
  route: /* @__PURE__ */ a(({ storyId: e, refId: t }) => t ? `/story/${t}_${e}` : `/story/${e}`, "route"),
  match: /* @__PURE__ */ a(({ viewMode: e }) => !!(e && e.match(/^(story|docs)$/)), "match"),
  render: /* @__PURE__ */ a(() => null, "render")
}), "createCanvasTab"), Fu = s.memo(/* @__PURE__ */ a(function(t) {
  let {
    api: o,
    id: i,
    options: r,
    viewMode: n,
    storyId: l,
    entry: u = void 0,
    description: c,
    baseUrl: d,
    withLoader: p = !0,
    tools: m,
    toolsExtra: h,
    tabs: b,
    wrappers: f,
    tabId: y
  } = t, S = b.find((w) => w.id === y)?.render, E = n === "story", { showToolbar: g } = r, v = o.getShowToolbarWithCustomisations(g), I = q(
  l);
  return V(() => {
    if (u && n) {
      if (l === I.current)
        return;
      if (I.current = l, n.match(/docs|story/)) {
        let { refId: w, id: O } = u;
        o.emit(ma, {
          storyId: O,
          viewMode: n,
          options: { target: w }
        });
      }
    }
  }, [u, n, l, o]), /* @__PURE__ */ s.createElement(Ee, null, i === "main" && /* @__PURE__ */ s.createElement(ko, { key: "description" }, /* @__PURE__ */ s.
  createElement("title", null, c)), /* @__PURE__ */ s.createElement(Or, { shouldScale: E }, /* @__PURE__ */ s.createElement(Ou, null, /* @__PURE__ */ s.
  createElement(
    _u,
    {
      key: "tools",
      isShown: v,
      tabId: y,
      tabs: b,
      tools: m,
      toolsExtra: h,
      api: o
    }
  ), /* @__PURE__ */ s.createElement(Pu, { key: "frame" }, S && /* @__PURE__ */ s.createElement(Pr, null, S({ active: !0 })), /* @__PURE__ */ s.
  createElement(Au, { show: !y }, /* @__PURE__ */ s.createElement(Gv, { withLoader: p, baseUrl: d, wrappers: f }))))));
}, "Preview"));
var Gv = /* @__PURE__ */ a(({ baseUrl: e, withLoader: t, wrappers: o }) => /* @__PURE__ */ s.createElement(me, { filter: Uv }, ({
  entry: i,
  refs: r,
  customCanvas: n,
  storyId: l,
  refId: u,
  viewMode: c,
  queryParams: d,
  previewInitialized: p
}) => {
  let m = "canvas", [h, b] = K(void 0);
  V(() => {
    if (se.CONFIG_TYPE === "DEVELOPMENT")
      try {
        He.getChannel().on(pa, (v) => {
          b(v);
        });
      } catch {
      }
  }, []);
  let f = !!r[u] && !r[u].previewInitialized, y = !(h?.value === 1 || h === void 0), S = !u && (!p || y), E = i && f || S;
  return /* @__PURE__ */ s.createElement(Ri, null, ({ value: g }) => /* @__PURE__ */ s.createElement(s.Fragment, null, t && E && /* @__PURE__ */ s.
  createElement(Du, null, /* @__PURE__ */ s.createElement(rr, { id: "preview-loader", role: "progressbar", progress: h })), /* @__PURE__ */ s.
  createElement(Mu, { id: m, storyId: l, viewMode: c, wrappers: o }, n ? n(l, c, m, e, g, d) : /* @__PURE__ */ s.createElement(
    du,
    {
      baseUrl: e,
      refs: r,
      scale: g,
      entry: i,
      viewMode: c,
      refId: u,
      queryParams: d,
      storyId: l
    }
  ))));
}), "Canvas");
function Ru(e, t) {
  let { previewTabs: o } = He.getConfig(), i = t ? t.previewTabs : void 0;
  if (o || i) {
    let r = Jo(o || {}, i || {}), n = Object.keys(r).map((l, u) => ({
      index: u,
      ...typeof r[l] == "string" ? { title: r[l] } : r[l],
      id: l
    }));
    return e.filter((l) => {
      let u = n.find((c) => c.id === l.id);
      return u === void 0 || u.id === "canvas" || !u.hidden;
    }).map((l, u) => ({ ...l, index: u })).sort((l, u) => {
      let c = n.find((h) => h.id === l.id), d = c ? c.index : n.length + l.index, p = n.find((h) => h.id === u.id), m = p ? p.index : n.length +
      u.index;
      return d - m;
    }).map((l) => {
      let u = n.find((c) => c.id === l.id);
      return u ? {
        ...l,
        title: u.title || l.title,
        disabled: u.disabled,
        hidden: u.hidden
      } : l;
    });
  }
  return e;
}
a(Ru, "filterTabs");

// src/manager/components/preview/tools/menu.tsx
var qv = /* @__PURE__ */ a(({ api: e, state: t }) => ({
  isVisible: e.getIsNavShown(),
  singleStory: t.singleStory,
  toggle: /* @__PURE__ */ a(() => e.toggleNav(), "toggle")
}), "menuMapper"), Bu = {
  title: "menu",
  id: "menu",
  type: be.TOOL,
  // @ts-expect-error (non strict)
  match: /* @__PURE__ */ a(({ viewMode: e }) => ["story", "docs"].includes(e), "match"),
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(me, { filter: qv }, ({ isVisible: e, toggle: t, singleStory: o }) => !o &&
  !e && /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(ee, { "aria-label": "Show sidebar", key: "menu", onClick: t,
  title: "Show sidebar" }, /* @__PURE__ */ s.createElement(Io, null)), /* @__PURE__ */ s.createElement(ht, null))), "render")
};

// src/manager/container/Preview.tsx
var Yv = [Nu()], Qv = [Bu, Su, Eu], Xv = [fu, Cu, Iu, xu], Zv = [], Jv = (0, No.default)(1)(
  (e, t, o, i) => i ? Ru([...Yv, ...Object.values(t)], o) : Zv
), e0 = (0, No.default)(1)(
  (e, t, o) => Hi([...Qv, ...Object.values(t)], ...o)
), t0 = (0, No.default)(1)(
  (e, t, o) => Hi([...Xv, ...Object.values(t)], ...o)
), o0 = (0, No.default)(1)((e, t) => [
  ...Lu,
  ...Object.values(t)
]), { PREVIEW_URL: r0 } = se, n0 = /* @__PURE__ */ a((e) => e.split("/").join(" / ").replace(/\s\s/, " "), "splitTitleAddExtraSpace"), i0 = /* @__PURE__ */ a(
(e) => {
  if (e?.type === "story" || e?.type === "docs") {
    let { title: t, name: o } = e;
    return t && o ? n0(`${t} - ${o} \u22C5 Storybook`) : "Storybook";
  }
  return e?.name ? `${e.name} \u22C5 Storybook` : "Storybook";
}, "getDescription"), s0 = /* @__PURE__ */ a(({
  api: e,
  state: t
  // @ts-expect-error (non strict)
}) => {
  let { layout: o, location: i, customQueryParams: r, storyId: n, refs: l, viewMode: u, path: c, refId: d } = t, p = e.getData(n, d), m = Object.
  values(e.getElements(Ce.TAB)), h = Object.values(e.getElements(Ce.PREVIEW)), b = Object.values(e.getElements(Ce.TOOL)), f = Object.values(
  e.getElements(Ce.TOOLEXTRA)), y = e.getQueryParam("tab"), S = e0(b.length, e.getElements(Ce.TOOL), [
    p,
    u,
    i,
    c,
    // @ts-expect-error (non strict)
    y
  ]), E = t0(
    f.length,
    e.getElements(Ce.TOOLEXTRA),
    // @ts-expect-error (non strict)
    [p, u, i, c, y]
  );
  return {
    api: e,
    entry: p,
    options: o,
    description: i0(p),
    viewMode: u,
    refs: l,
    storyId: n,
    baseUrl: r0 || "iframe.html",
    queryParams: r,
    tools: S,
    toolsExtra: E,
    tabs: Jv(
      m.length,
      e.getElements(Ce.TAB),
      p ? p.parameters : void 0,
      o.showTabs
    ),
    wrappers: o0(
      h.length,
      e.getElements(Ce.PREVIEW)
    ),
    tabId: y
  };
}, "mapper"), a0 = s.memo(/* @__PURE__ */ a(function(t) {
  return /* @__PURE__ */ s.createElement(me, { filter: s0 }, (o) => /* @__PURE__ */ s.createElement(Fu, { ...t, ...o }));
}, "PreviewConnected")), Hu = a0;

// src/manager/hooks/useDebounce.ts
function zu(e, t) {
  let [o, i] = K(e);
  return V(() => {
    let r = setTimeout(() => {
      i(e);
    }, t);
    return () => {
      clearTimeout(r);
    };
  }, [e, t]), o;
}
a(zu, "useDebounce");

// src/manager/hooks/useMeasure.tsx
function Wu() {
  let [e, t] = s.useState({
    width: null,
    height: null
  }), o = s.useRef(null);
  return [s.useCallback((r) => {
    if (o.current && (o.current.disconnect(), o.current = null), r?.nodeType === Node.ELEMENT_NODE) {
      let n = new ResizeObserver(([l]) => {
        if (l && l.borderBoxSize) {
          let { inlineSize: u, blockSize: c } = l.borderBoxSize[0];
          t({ width: u, height: c });
        }
      });
      n.observe(r), o.current = n;
    }
  }, []), e];
}
a(Wu, "useMeasure");

// ../node_modules/@tanstack/virtual-core/dist/esm/utils.js
function Ht(e, t, o) {
  let i = o.initialDeps ?? [], r;
  function n() {
    var l, u, c, d;
    let p;
    o.key && ((l = o.debug) != null && l.call(o)) && (p = Date.now());
    let m = e();
    if (!(m.length !== i.length || m.some((f, y) => i[y] !== f)))
      return r;
    i = m;
    let b;
    if (o.key && ((u = o.debug) != null && u.call(o)) && (b = Date.now()), r = t(...m), o.key && ((c = o.debug) != null && c.call(o))) {
      let f = Math.round((Date.now() - p) * 100) / 100, y = Math.round((Date.now() - b) * 100) / 100, S = y / 16, E = /* @__PURE__ */ a((g, v) => {
        for (g = String(g); g.length < v; )
          g = " " + g;
        return g;
      }, "pad");
      console.info(
        `%c\u23F1 ${E(y, 5)} /${E(f, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * S, 120)
        )}deg 100% 31%);`,
        o?.key
      );
    }
    return (d = o?.onChange) == null || d.call(o, r), r;
  }
  return a(n, "memoizedFunction"), n.updateDeps = (l) => {
    i = l;
  }, n;
}
a(Ht, "memo");
function Ar(e, t) {
  if (e === void 0)
    throw new Error(`Unexpected undefined${t ? `: ${t}` : ""}`);
  return e;
}
a(Ar, "notUndefined");
var Vu = /* @__PURE__ */ a((e, t) => Math.abs(e - t) < 1, "approxEqual"), ju = /* @__PURE__ */ a((e, t, o) => {
  let i;
  return function(...r) {
    e.clearTimeout(i), i = e.setTimeout(() => t.apply(this, r), o);
  };
}, "debounce");

// ../node_modules/@tanstack/virtual-core/dist/esm/index.js
var l0 = /* @__PURE__ */ a((e) => e, "defaultKeyExtractor"), u0 = /* @__PURE__ */ a((e) => {
  let t = Math.max(e.startIndex - e.overscan, 0), o = Math.min(e.endIndex + e.overscan, e.count - 1), i = [];
  for (let r = t; r <= o; r++)
    i.push(r);
  return i;
}, "defaultRangeExtractor"), Uu = /* @__PURE__ */ a((e, t) => {
  let o = e.scrollElement;
  if (!o)
    return;
  let i = e.targetWindow;
  if (!i)
    return;
  let r = /* @__PURE__ */ a((l) => {
    let { width: u, height: c } = l;
    t({ width: Math.round(u), height: Math.round(c) });
  }, "handler");
  if (r(o.getBoundingClientRect()), !i.ResizeObserver)
    return () => {
    };
  let n = new i.ResizeObserver((l) => {
    let u = /* @__PURE__ */ a(() => {
      let c = l[0];
      if (c?.borderBoxSize) {
        let d = c.borderBoxSize[0];
        if (d) {
          r({ width: d.inlineSize, height: d.blockSize });
          return;
        }
      }
      r(o.getBoundingClientRect());
    }, "run");
    e.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(u) : u();
  });
  return n.observe(o, { box: "border-box" }), () => {
    n.unobserve(o);
  };
}, "observeElementRect"), Ku = {
  passive: !0
};
var $u = typeof window > "u" ? !0 : "onscrollend" in window, Gu = /* @__PURE__ */ a((e, t) => {
  let o = e.scrollElement;
  if (!o)
    return;
  let i = e.targetWindow;
  if (!i)
    return;
  let r = 0, n = e.options.useScrollendEvent && $u ? () => {
  } : ju(
    i,
    () => {
      t(r, !1);
    },
    e.options.isScrollingResetDelay
  ), l = /* @__PURE__ */ a((p) => () => {
    let { horizontal: m, isRtl: h } = e.options;
    r = m ? o.scrollLeft * (h && -1 || 1) : o.scrollTop, n(), t(r, p);
  }, "createHandler"), u = l(!0), c = l(!1);
  c(), o.addEventListener("scroll", u, Ku);
  let d = e.options.useScrollendEvent && $u;
  return d && o.addEventListener("scrollend", c, Ku), () => {
    o.removeEventListener("scroll", u), d && o.removeEventListener("scrollend", c);
  };
}, "observeElementOffset");
var c0 = /* @__PURE__ */ a((e, t, o) => {
  if (t?.borderBoxSize) {
    let i = t.borderBoxSize[0];
    if (i)
      return Math.round(
        i[o.options.horizontal ? "inlineSize" : "blockSize"]
      );
  }
  return Math.round(
    e.getBoundingClientRect()[o.options.horizontal ? "width" : "height"]
  );
}, "measureElement");
var qu = /* @__PURE__ */ a((e, {
  adjustments: t = 0,
  behavior: o
}, i) => {
  var r, n;
  let l = e + t;
  (n = (r = i.scrollElement) == null ? void 0 : r.scrollTo) == null || n.call(r, {
    [i.options.horizontal ? "left" : "top"]: l,
    behavior: o
  });
}, "elementScroll"), zi = class zi {
  constructor(t) {
    this.unsubs = [], this.scrollElement = null, this.targetWindow = null, this.isScrolling = !1, this.scrollToIndexTimeoutId = null, this.measurementsCache =
    [], this.itemSizeCache = /* @__PURE__ */ new Map(), this.pendingMeasuredCacheIndexes = [], this.scrollRect = null, this.scrollOffset = null,
    this.scrollDirection = null, this.scrollAdjustments = 0, this.elementsCache = /* @__PURE__ */ new Map(), this.observer = /* @__PURE__ */ (() => {
      let o = null, i = /* @__PURE__ */ a(() => o || (!this.targetWindow || !this.targetWindow.ResizeObserver ? null : o = new this.targetWindow.
      ResizeObserver((r) => {
        r.forEach((n) => {
          let l = /* @__PURE__ */ a(() => {
            this._measureElement(n.target, n);
          }, "run");
          this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(l) : l();
        });
      })), "get");
      return {
        disconnect: /* @__PURE__ */ a(() => {
          var r;
          (r = i()) == null || r.disconnect(), o = null;
        }, "disconnect"),
        observe: /* @__PURE__ */ a((r) => {
          var n;
          return (n = i()) == null ? void 0 : n.observe(r, { box: "border-box" });
        }, "observe"),
        unobserve: /* @__PURE__ */ a((r) => {
          var n;
          return (n = i()) == null ? void 0 : n.unobserve(r);
        }, "unobserve")
      };
    })(), this.range = null, this.setOptions = (o) => {
      Object.entries(o).forEach(([i, r]) => {
        typeof r > "u" && delete o[i];
      }), this.options = {
        debug: !1,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: !1,
        getItemKey: l0,
        rangeExtractor: u0,
        onChange: /* @__PURE__ */ a(() => {
        }, "onChange"),
        measureElement: c0,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: !0,
        isRtl: !1,
        useScrollendEvent: !1,
        useAnimationFrameWithResizeObserver: !1,
        ...o
      };
    }, this.notify = (o) => {
      var i, r;
      (r = (i = this.options).onChange) == null || r.call(i, this, o);
    }, this.maybeNotify = Ht(
      () => (this.calculateRange(), [
        this.isScrolling,
        this.range ? this.range.startIndex : null,
        this.range ? this.range.endIndex : null
      ]),
      (o) => {
        this.notify(o);
      },
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug"),
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    ), this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((o) => o()), this.unsubs = [], this.observer.disconnect(), this.scrollElement = null, this.targetWindow =
      null;
    }, this._didMount = () => () => {
      this.cleanup();
    }, this._willUpdate = () => {
      var o;
      let i = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== i) {
        if (this.cleanup(), !i) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = i, this.scrollElement && "ownerDocument" in this.scrollElement ? this.targetWindow = this.scrollElement.ownerDocument.
        defaultView : this.targetWindow = ((o = this.scrollElement) == null ? void 0 : o.window) ?? null, this.elementsCache.forEach((r) => {
          this.observer.observe(r);
        }), this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        }), this.unsubs.push(
          this.options.observeElementRect(this, (r) => {
            this.scrollRect = r, this.maybeNotify();
          })
        ), this.unsubs.push(
          this.options.observeElementOffset(this, (r, n) => {
            this.scrollAdjustments = 0, this.scrollDirection = n ? this.getScrollOffset() < r ? "forward" : "backward" : null, this.scrollOffset =
            r, this.isScrolling = n, this.maybeNotify();
          })
        );
      }
    }, this.getSize = () => this.options.enabled ? (this.scrollRect = this.scrollRect ?? this.options.initialRect, this.scrollRect[this.options.
    horizontal ? "width" : "height"]) : (this.scrollRect = null, 0), this.getScrollOffset = () => this.options.enabled ? (this.scrollOffset =
    this.scrollOffset ?? (typeof this.options.initialOffset == "function" ? this.options.initialOffset() : this.options.initialOffset), this.
    scrollOffset) : (this.scrollOffset = null, 0), this.getFurthestMeasurement = (o, i) => {
      let r = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
      for (let l = i - 1; l >= 0; l--) {
        let u = o[l];
        if (r.has(u.lane))
          continue;
        let c = n.get(
          u.lane
        );
        if (c == null || u.end > c.end ? n.set(u.lane, u) : u.end < c.end && r.set(u.lane, !0), r.size === this.options.lanes)
          break;
      }
      return n.size === this.options.lanes ? Array.from(n.values()).sort((l, u) => l.end === u.end ? l.index - u.index : l.end - u.end)[0] :
      void 0;
    }, this.getMeasurementOptions = Ht(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled
      ],
      (o, i, r, n, l) => (this.pendingMeasuredCacheIndexes = [], {
        count: o,
        paddingStart: i,
        scrollMargin: r,
        getItemKey: n,
        enabled: l
      }),
      {
        key: !1
      }
    ), this.getMeasurements = Ht(
      () => [this.getMeasurementOptions(), this.itemSizeCache],
      ({ count: o, paddingStart: i, scrollMargin: r, getItemKey: n, enabled: l }, u) => {
        if (!l)
          return this.measurementsCache = [], this.itemSizeCache.clear(), [];
        this.measurementsCache.length === 0 && (this.measurementsCache = this.options.initialMeasurementsCache, this.measurementsCache.forEach(
        (p) => {
          this.itemSizeCache.set(p.key, p.size);
        }));
        let c = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [];
        let d = this.measurementsCache.slice(0, c);
        for (let p = c; p < o; p++) {
          let m = n(p), h = this.options.lanes === 1 ? d[p - 1] : this.getFurthestMeasurement(d, p), b = h ? h.end + this.options.gap : i + r,
          f = u.get(m), y = typeof f == "number" ? f : this.options.estimateSize(p), S = b + y, E = h ? h.lane : p % this.options.lanes;
          d[p] = {
            index: p,
            start: b,
            size: y,
            end: S,
            key: m,
            lane: E
          };
        }
        return this.measurementsCache = d, d;
      },
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug")
      }
    ), this.calculateRange = Ht(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (o, i, r, n) => this.range = o.length > 0 && i > 0 ? p0({
        measurements: o,
        outerSize: i,
        scrollOffset: r,
        lanes: n
      }) : null,
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug")
      }
    ), this.getVirtualIndexes = Ht(
      () => {
        let o = null, i = null, r = this.calculateRange();
        return r && (o = r.startIndex, i = r.endIndex), this.maybeNotify.updateDeps([this.isScrolling, o, i]), [
          this.options.rangeExtractor,
          this.options.overscan,
          this.options.count,
          o,
          i
        ];
      },
      (o, i, r, n, l) => n === null || l === null ? [] : o({
        startIndex: n,
        endIndex: l,
        overscan: i,
        count: r
      }),
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug")
      }
    ), this.indexFromElement = (o) => {
      let i = this.options.indexAttribute, r = o.getAttribute(i);
      return r ? parseInt(r, 10) : (console.warn(
        `Missing attribute name '${i}={index}' on measured element.`
      ), -1);
    }, this._measureElement = (o, i) => {
      let r = this.indexFromElement(o), n = this.measurementsCache[r];
      if (!n)
        return;
      let l = n.key, u = this.elementsCache.get(l);
      u !== o && (u && this.observer.unobserve(u), this.observer.observe(o), this.elementsCache.set(l, o)), o.isConnected && this.resizeItem(
      r, this.options.measureElement(o, i, this));
    }, this.resizeItem = (o, i) => {
      let r = this.measurementsCache[o];
      if (!r)
        return;
      let n = this.itemSizeCache.get(r.key) ?? r.size, l = i - n;
      l !== 0 && ((this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(r, l, this) :
      r.start < this.getScrollOffset() + this.scrollAdjustments) && this._scrollToOffset(this.getScrollOffset(), {
        adjustments: this.scrollAdjustments += l,
        behavior: void 0
      }), this.pendingMeasuredCacheIndexes.push(r.index), this.itemSizeCache = new Map(this.itemSizeCache.set(r.key, i)), this.notify(!1));
    }, this.measureElement = (o) => {
      if (!o) {
        this.elementsCache.forEach((i, r) => {
          i.isConnected || (this.observer.unobserve(i), this.elementsCache.delete(r));
        });
        return;
      }
      this._measureElement(o, void 0);
    }, this.getVirtualItems = Ht(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (o, i) => {
        let r = [];
        for (let n = 0, l = o.length; n < l; n++) {
          let u = o[n], c = i[u];
          r.push(c);
        }
        return r;
      },
      {
        key: !1,
        debug: /* @__PURE__ */ a(() => this.options.debug, "debug")
      }
    ), this.getVirtualItemForOffset = (o) => {
      let i = this.getMeasurements();
      if (i.length !== 0)
        return Ar(
          i[Yu(
            0,
            i.length - 1,
            (r) => Ar(i[r]).start,
            o
          )]
        );
    }, this.getOffsetForAlignment = (o, i, r = 0) => {
      let n = this.getSize(), l = this.getScrollOffset();
      i === "auto" && (i = o >= l + n ? "end" : "start"), i === "center" ? o += (r - n) / 2 : i === "end" && (o -= n);
      let u = this.options.horizontal ? "scrollWidth" : "scrollHeight", d = (this.scrollElement ? "document" in this.scrollElement ? this.scrollElement.
      document.documentElement[u] : this.scrollElement[u] : 0) - n;
      return Math.max(Math.min(d, o), 0);
    }, this.getOffsetForIndex = (o, i = "auto") => {
      o = Math.max(0, Math.min(o, this.options.count - 1));
      let r = this.measurementsCache[o];
      if (!r)
        return;
      let n = this.getSize(), l = this.getScrollOffset();
      if (i === "auto")
        if (r.end >= l + n - this.options.scrollPaddingEnd)
          i = "end";
        else if (r.start <= l + this.options.scrollPaddingStart)
          i = "start";
        else
          return [l, i];
      let u = i === "end" ? r.end + this.options.scrollPaddingEnd : r.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(u, i, r.size),
        i
      ];
    }, this.isDynamicMode = () => this.elementsCache.size > 0, this.cancelScrollToIndex = () => {
      this.scrollToIndexTimeoutId !== null && this.targetWindow && (this.targetWindow.clearTimeout(this.scrollToIndexTimeoutId), this.scrollToIndexTimeoutId =
      null);
    }, this.scrollToOffset = (o, { align: i = "start", behavior: r } = {}) => {
      this.cancelScrollToIndex(), r === "smooth" && this.isDynamicMode() && console.warn(
        "The `smooth` scroll behavior is not fully supported with dynamic size."
      ), this._scrollToOffset(this.getOffsetForAlignment(o, i), {
        adjustments: void 0,
        behavior: r
      });
    }, this.scrollToIndex = (o, { align: i = "auto", behavior: r } = {}) => {
      o = Math.max(0, Math.min(o, this.options.count - 1)), this.cancelScrollToIndex(), r === "smooth" && this.isDynamicMode() && console.warn(
        "The `smooth` scroll behavior is not fully supported with dynamic size."
      );
      let n = this.getOffsetForIndex(o, i);
      if (!n) return;
      let [l, u] = n;
      this._scrollToOffset(l, { adjustments: void 0, behavior: r }), r !== "smooth" && this.isDynamicMode() && this.targetWindow && (this.scrollToIndexTimeoutId =
      this.targetWindow.setTimeout(() => {
        if (this.scrollToIndexTimeoutId = null, this.elementsCache.has(
          this.options.getItemKey(o)
        )) {
          let [d] = Ar(
            this.getOffsetForIndex(o, u)
          );
          Vu(d, this.getScrollOffset()) || this.scrollToIndex(o, { align: u, behavior: r });
        } else
          this.scrollToIndex(o, { align: u, behavior: r });
      }));
    }, this.scrollBy = (o, { behavior: i } = {}) => {
      this.cancelScrollToIndex(), i === "smooth" && this.isDynamicMode() && console.warn(
        "The `smooth` scroll behavior is not fully supported with dynamic size."
      ), this._scrollToOffset(this.getScrollOffset() + o, {
        adjustments: void 0,
        behavior: i
      });
    }, this.getTotalSize = () => {
      var o;
      let i = this.getMeasurements(), r;
      if (i.length === 0)
        r = this.options.paddingStart;
      else if (this.options.lanes === 1)
        r = ((o = i[i.length - 1]) == null ? void 0 : o.end) ?? 0;
      else {
        let n = Array(this.options.lanes).fill(null), l = i.length - 1;
        for (; l >= 0 && n.some((u) => u === null); ) {
          let u = i[l];
          n[u.lane] === null && (n[u.lane] = u.end), l--;
        }
        r = Math.max(...n.filter((u) => u !== null));
      }
      return Math.max(
        r - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    }, this._scrollToOffset = (o, {
      adjustments: i,
      behavior: r
    }) => {
      this.options.scrollToFn(o, { behavior: r, adjustments: i }, this);
    }, this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map(), this.notify(!1);
    }, this.setOptions(t);
  }
};
a(zi, "Virtualizer");
var Dr = zi, Yu = /* @__PURE__ */ a((e, t, o, i) => {
  for (; e <= t; ) {
    let r = (e + t) / 2 | 0, n = o(r);
    if (n < i)
      e = r + 1;
    else if (n > i)
      t = r - 1;
    else
      return r;
  }
  return e > 0 ? e - 1 : 0;
}, "findNearestBinarySearch");
function p0({
  measurements: e,
  outerSize: t,
  scrollOffset: o,
  lanes: i
}) {
  let r = e.length - 1, n = /* @__PURE__ */ a((c) => e[c].start, "getOffset");
  if (e.length <= i)
    return {
      startIndex: 0,
      endIndex: r
    };
  let l = Yu(
    0,
    r,
    n,
    o
  ), u = l;
  if (i === 1)
    for (; u < r && e[u].end < o + t; )
      u++;
  else if (i > 1) {
    let c = Array(i).fill(0);
    for (; u < r && c.some((p) => p < o + t); ) {
      let p = e[u];
      c[p.lane] = p.end, u++;
    }
    let d = Array(i).fill(o + t);
    for (; l >= 0 && d.some((p) => p >= o); ) {
      let p = e[l];
      d[p.lane] = p.start, l--;
    }
    l = Math.max(0, l - l % i), u = Math.min(r, u + (i - 1 - u % i));
  }
  return { startIndex: l, endIndex: u };
}
a(p0, "calculateRange");

// ../node_modules/@tanstack/react-virtual/dist/esm/index.js
var Qu = typeof document < "u" ? Xt : V;
function d0(e) {
  let t = Zt(() => ({}), {})[1], o = {
    ...e,
    onChange: /* @__PURE__ */ a((r, n) => {
      var l;
      n ? Do(t) : t(), (l = e.onChange) == null || l.call(e, r, n);
    }, "onChange")
  }, [i] = K(
    () => new Dr(o)
  );
  return i.setOptions(o), Qu(() => i._didMount(), []), Qu(() => i._willUpdate()), i;
}
a(d0, "useVirtualizerBase");
function Xu(e) {
  return d0({
    observeElementRect: Uu,
    observeElementOffset: Gu,
    scrollToFn: qu,
    ...e
  });
}
a(Xu, "useVirtualizer");

// src/manager/components/sidebar/FIleSearchList.utils.tsx
var Zu = /* @__PURE__ */ a(({
  parentRef: e,
  rowVirtualizer: t,
  selectedItem: o
}) => {
  V(() => {
    let i = /* @__PURE__ */ a((r) => {
      if (!e.current)
        return;
      let n = t.options.count, l = document.activeElement, u = parseInt(l.getAttribute("data-index") || "-1", 10), c = l.tagName === "INPUT",
      d = /* @__PURE__ */ a(() => document.querySelector('[data-index="0"]'), "getFirstElement"), p = /* @__PURE__ */ a(() => document.querySelector(
      `[data-index="${n - 1}"]`), "getLastElement");
      if (r.code === "ArrowDown" && l) {
        if (r.stopPropagation(), c) {
          d()?.focus();
          return;
        }
        if (u === n - 1) {
          Do(() => {
            t.scrollToIndex(0, { align: "start" });
          }), setTimeout(() => {
            d()?.focus();
          }, 100);
          return;
        }
        if (o === u) {
          document.querySelector(
            `[data-index-position="${o}_first"]`
          )?.focus();
          return;
        }
        if (o !== null && l.getAttribute("data-index-position")?.includes("last")) {
          document.querySelector(
            `[data-index="${o + 1}"]`
          )?.focus();
          return;
        }
        l.nextElementSibling?.focus();
      }
      if (r.code === "ArrowUp" && l) {
        if (c) {
          Do(() => {
            t.scrollToIndex(n - 1, { align: "start" });
          }), setTimeout(() => {
            p()?.focus();
          }, 100);
          return;
        }
        if (o !== null && l.getAttribute("data-index-position")?.includes("first")) {
          document.querySelector(
            `[data-index="${o}"]`
          )?.focus();
          return;
        }
        l.previousElementSibling?.focus();
      }
    }, "handleArrowKeys");
    return document.addEventListener("keydown", i, { capture: !0 }), () => {
      document.removeEventListener("keydown", i, { capture: !0 });
    };
  }, [t, o, e]);
}, "useArrowKeyNavigation");

// src/manager/components/sidebar/FileList.tsx
var Ju = x("div")(({ theme: e }) => ({
  marginTop: "-16px",
  // after element which fades out the list
  "&::after": {
    content: '""',
    position: "fixed",
    pointerEvents: "none",
    bottom: 0,
    left: 0,
    right: 0,
    height: "80px",
    background: `linear-gradient(${so(e.barBg, 0)} 10%, ${e.barBg} 80%)`
  }
})), Mr = x("div")(({ theme: e }) => ({
  height: "280px",
  overflow: "auto",
  msOverflowStyle: "none",
  scrollbarWidth: "none",
  position: "relative",
  "::-webkit-scrollbar": {
    display: "none"
  }
})), ec = x("li")(({ theme: e }) => ({
  ":focus-visible": {
    outline: "none",
    ".file-list-item": {
      borderRadius: "4px",
      background: e.base === "dark" ? "rgba(255,255,255,.1)" : e.color.mediumlight,
      "> svg": {
        display: "flex"
      }
    }
  }
})), Lr = x("div")(({ theme: e }) => ({
  display: "flex",
  flexDirection: "column",
  position: "relative"
})), tc = x.div(({ theme: e, selected: t, disabled: o, error: i }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  alignSelf: "stretch",
  padding: "8px 16px",
  cursor: "pointer",
  borderRadius: "4px",
  ...t && {
    borderRadius: "4px",
    background: e.base === "dark" ? "rgba(255,255,255,.1)" : e.color.mediumlight,
    "> svg": {
      display: "flex"
    }
  },
  ...o && {
    cursor: "not-allowed",
    div: {
      color: `${e.color.mediumdark} !important`
    }
  },
  ...i && {
    background: e.base === "light" ? "#00000011" : "#00000033"
  },
  "&:hover": {
    background: i ? "#00000022" : e.base === "dark" ? "rgba(255,255,255,.1)" : e.color.mediumlight,
    "> svg": {
      display: "flex"
    }
  }
})), oc = x("ul")({
  margin: 0,
  padding: "0 0 0 0",
  width: "100%",
  position: "relative"
}), rc = x("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "calc(100% - 50px)"
}), nc = x("div")(({ theme: e, error: t }) => ({
  color: t ? e.color.negativeText : e.color.secondary
})), ic = x("div")(({ theme: e, error: t }) => ({
  color: t ? e.color.negativeText : e.base === "dark" ? e.color.lighter : e.color.darkest,
  fontSize: "14px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  maxWidth: "100%"
})), sc = x("div")(({ theme: e }) => ({
  color: e.color.mediumdark,
  fontSize: "14px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  maxWidth: "100%"
})), ac = x("ul")(({ theme: e }) => ({
  margin: 0,
  padding: 0
})), lc = x("li")(({ theme: e, error: t }) => ({
  padding: "8px 16px 8px 16px",
  marginLeft: "30px",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "14px",
  cursor: "pointer",
  borderRadius: "4px",
  ":focus-visible": {
    outline: "none"
  },
  ...t && {
    background: "#F9ECEC",
    color: e.color.negativeText
  },
  "&:hover,:focus-visible": {
    background: t ? "#F9ECEC" : e.base === "dark" ? "rgba(255, 255, 255, 0.1)" : e.color.mediumlight,
    "> svg": {
      display: "flex"
    }
  },
  "> div > svg": {
    color: t ? e.color.negativeText : e.color.secondary
  }
})), uc = x("div")(({ theme: e }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "calc(100% - 20px)"
})), cc = x("span")(({ theme: e }) => ({
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  maxWidth: "calc(100% - 160px)",
  display: "inline-block"
})), pc = x("span")(({ theme: e }) => ({
  display: "inline-block",
  padding: `1px ${e.appBorderRadius}px`,
  borderRadius: "2px",
  fontSize: "10px",
  color: e.base === "dark" ? e.color.lightest : "#727272",
  backgroundColor: e.base === "dark" ? "rgba(255, 255, 255, 0.1)" : "#F2F4F5"
})), dc = x("div")(({ theme: e }) => ({
  textAlign: "center",
  maxWidth: "334px",
  margin: "16px auto 50px auto",
  fontSize: "14px",
  color: e.base === "dark" ? e.color.lightest : "#000"
})), fc = x("p")(({ theme: e }) => ({
  margin: 0,
  color: e.base === "dark" ? e.color.defaultText : e.color.mediumdark
}));

// src/manager/components/sidebar/FileSearchListSkeleton.tsx
var f0 = x("div")(({ theme: e }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  alignSelf: "stretch",
  padding: "8px 16px"
})), m0 = x("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "100%",
  borderRadius: "3px"
}), h0 = x.div(({ theme: e }) => ({
  width: "14px",
  height: "14px",
  borderRadius: "3px",
  marginTop: "1px",
  background: e.base === "dark" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)",
  animation: `${e.animation.glow} 1.5s ease-in-out infinite`
})), mc = x.div(({ theme: e }) => ({
  height: "16px",
  borderRadius: "3px",
  background: e.base === "dark" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)",
  animation: `${e.animation.glow} 1.5s ease-in-out infinite`,
  width: "100%",
  maxWidth: "100%",
  "+ div": {
    marginTop: "6px"
  }
})), hc = /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(Mr, null, [1, 2, 3].map((e) => /* @__PURE__ */ s.createElement(Lr, { key: e },
/* @__PURE__ */ s.createElement(f0, null, /* @__PURE__ */ s.createElement(h0, null), /* @__PURE__ */ s.createElement(m0, null, /* @__PURE__ */ s.
createElement(mc, { style: { width: "90px" } }), /* @__PURE__ */ s.createElement(mc, { style: { width: "300px" } })))))), "FileSearchListLoa\
dingSkeleton");

// src/manager/components/sidebar/FileSearchList.tsx
var gc = x(En)(({ theme: e }) => ({
  display: "none",
  alignSelf: "center",
  color: e.color.mediumdark
})), g0 = x(_t)(({ theme: e }) => ({
  display: "none",
  alignSelf: "center",
  color: e.color.mediumdark
})), yc = Tt(/* @__PURE__ */ a(function({
  isLoading: t,
  searchResults: o,
  onNewStory: i,
  errorItemId: r
}) {
  let [n, l] = K(null), u = s.useRef(), c = U(() => [...o ?? []].sort((f, y) => {
    let S = f.exportedComponents === null || f.exportedComponents?.length === 0, E = f.storyFileExists, g = y.exportedComponents === null ||
    y.exportedComponents?.length === 0, v = y.storyFileExists;
    return E && !v ? -1 : v && !E || S && !g ? 1 : !S && g ? -1 : 0;
  }), [o]), d = o?.length || 0, p = Xu({
    count: d,
    // @ts-expect-error (non strict)
    getScrollElement: /* @__PURE__ */ a(() => u.current, "getScrollElement"),
    paddingStart: 16,
    paddingEnd: 40,
    estimateSize: /* @__PURE__ */ a(() => 54, "estimateSize"),
    overscan: 2
  });
  Zu({ rowVirtualizer: p, parentRef: u, selectedItem: n });
  let m = A(
    ({ virtualItem: f, searchResult: y, itemId: S }) => {
      y?.exportedComponents?.length > 1 ? l((E) => E === f.index ? null : f.index) : y?.exportedComponents?.length === 1 && i({
        componentExportName: y.exportedComponents[0].name,
        componentFilePath: y.filepath,
        componentIsDefaultExport: y.exportedComponents[0].default,
        selectedItemId: S,
        componentExportCount: 1
      });
    },
    [i]
  ), h = A(
    ({ searchResult: f, component: y, id: S }) => {
      i({
        componentExportName: y.name,
        componentFilePath: f.filepath,
        componentIsDefaultExport: y.default,
        selectedItemId: S,
        // @ts-expect-error (non strict)
        componentExportCount: f.exportedComponents.length
      });
    },
    [i]
  ), b = A(
    ({ virtualItem: f, selected: y, searchResult: S }) => {
      let E = r === S.filepath, g = y === f.index;
      return /* @__PURE__ */ s.createElement(
        Lr,
        {
          "aria-expanded": g,
          "aria-controls": `file-list-export-${f.index}`,
          id: `file-list-item-wrapper-${f.index}`
        },
        /* @__PURE__ */ s.createElement(
          tc,
          {
            className: "file-list-item",
            selected: g,
            error: E,
            disabled: S.exportedComponents === null || S.exportedComponents?.length === 0
          },
          /* @__PURE__ */ s.createElement(nc, { error: E }, /* @__PURE__ */ s.createElement(Qo, null)),
          /* @__PURE__ */ s.createElement(rc, null, /* @__PURE__ */ s.createElement(ic, { error: E }, S.filepath.split("/").at(-1)), /* @__PURE__ */ s.
          createElement(sc, null, S.filepath)),
          g ? /* @__PURE__ */ s.createElement(g0, null) : /* @__PURE__ */ s.createElement(gc, null)
        ),
        S?.exportedComponents?.length > 1 && g && /* @__PURE__ */ s.createElement(
          ac,
          {
            role: "region",
            id: `file-list-export-${f.index}`,
            "aria-labelledby": `file-list-item-wrapper-${f.index}`,
            onClick: (v) => {
              v.stopPropagation();
            },
            onKeyUp: (v) => {
              v.key === "Enter" && v.stopPropagation();
            }
          },
          S.exportedComponents?.map((v, I) => {
            let w = r === `${S.filepath}_${I}`, O = I === 0 ? "first" : (
              // @ts-expect-error (non strict)
              I === S.exportedComponents.length - 1 ? "last" : "middle"
            );
            return /* @__PURE__ */ s.createElement(
              lc,
              {
                tabIndex: 0,
                "data-index-position": `${f.index}_${O}`,
                key: v.name,
                error: w,
                onClick: () => {
                  h({
                    searchResult: S,
                    component: v,
                    id: `${S.filepath}_${I}`
                  });
                },
                onKeyUp: (_) => {
                  _.key === "Enter" && h({
                    searchResult: S,
                    component: v,
                    id: `${S.filepath}_${I}`
                  });
                }
              },
              /* @__PURE__ */ s.createElement(uc, null, /* @__PURE__ */ s.createElement(Qo, null), v.default ? /* @__PURE__ */ s.createElement(
              s.Fragment, null, /* @__PURE__ */ s.createElement(cc, null, S.filepath.split("/").at(-1)?.split(".")?.at(0)), /* @__PURE__ */ s.
              createElement(pc, null, "Default export")) : v.name),
              /* @__PURE__ */ s.createElement(gc, null)
            );
          })
        )
      );
    },
    [h, r]
  );
  return t && (o === null || o?.length === 0) ? /* @__PURE__ */ s.createElement(hc, null) : o?.length === 0 ? /* @__PURE__ */ s.createElement(
  dc, null, /* @__PURE__ */ s.createElement("p", null, "We could not find any file with that name"), /* @__PURE__ */ s.createElement(fc, null,
  "You may want to try using different keywords, check for typos, and adjust your filters")) : c?.length > 0 ? /* @__PURE__ */ s.createElement(
  Ju, null, /* @__PURE__ */ s.createElement(Mr, { ref: u }, /* @__PURE__ */ s.createElement(
    oc,
    {
      style: {
        height: `${p.getTotalSize()}px`
      }
    },
    p.getVirtualItems().map((f) => {
      let y = c[f.index], S = y.exportedComponents === null || y.exportedComponents?.length === 0, E = {};
      return /* @__PURE__ */ s.createElement(
        ec,
        {
          key: f.key,
          "data-index": f.index,
          ref: p.measureElement,
          onClick: () => {
            m({
              virtualItem: f,
              itemId: y.filepath,
              searchResult: y
            });
          },
          onKeyUp: (g) => {
            g.key === "Enter" && m({
              virtualItem: f,
              itemId: y.filepath,
              searchResult: y
            });
          },
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${f.start}px)`
          },
          tabIndex: 0
        },
        S ? /* @__PURE__ */ s.createElement(
          ve,
          {
            ...E,
            style: { width: "100%" },
            hasChrome: !1,
            closeOnOutsideClick: !0,
            tooltip: /* @__PURE__ */ s.createElement(
              rt,
              {
                note: S ? "We can't evaluate exports for this file. You can't create a story for it automatically" : null
              }
            )
          },
          /* @__PURE__ */ s.createElement(
            b,
            {
              searchResult: y,
              selected: n,
              virtualItem: f
            }
          )
        ) : /* @__PURE__ */ s.createElement(
          b,
          {
            ...E,
            key: f.index,
            searchResult: y,
            selected: n,
            virtualItem: f
          }
        )
      );
    })
  ))) : null;
}, "FileSearchList"));

// src/manager/components/sidebar/FileSearchModal.tsx
var y0 = 418, b0 = x(At)(() => ({
  boxShadow: "none",
  background: "transparent",
  overflow: "visible"
})), v0 = x.div(({ theme: e, height: t }) => ({
  backgroundColor: e.background.bar,
  borderRadius: 6,
  boxShadow: "rgba(255, 255, 255, 0.05) 0 0 0 1px inset, rgba(14, 18, 22, 0.35) 0px 10px 18px -10px",
  padding: "16px",
  transition: "height 0.3s",
  height: t ? `${t + 32}px` : "auto",
  overflow: "hidden"
})), x0 = x(At.Content)(({ theme: e }) => ({
  margin: 0,
  color: e.base === "dark" ? e.color.lighter : e.color.mediumdark
})), I0 = x(or.Input)(({ theme: e }) => ({
  paddingLeft: 40,
  paddingRight: 28,
  fontSize: 14,
  height: 40,
  ...e.base === "light" && {
    color: e.color.darkest
  },
  "::placeholder": {
    color: e.color.mediumdark
  },
  "&:invalid:not(:placeholder-shown)": {
    boxShadow: `${e.color.negative} 0 0 0 1px inset`
  },
  "&::-webkit-search-decoration, &::-webkit-search-cancel-button, &::-webkit-search-results-button, &::-webkit-search-results-decoration": {
    display: "none"
  }
})), S0 = x.div({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  position: "relative"
}), w0 = x.div(({ theme: e }) => ({
  position: "absolute",
  top: 0,
  left: 16,
  zIndex: 1,
  pointerEvents: "none",
  color: e.darkest,
  display: "flex",
  alignItems: "center",
  height: "100%"
})), E0 = x.div(({ theme: e }) => ({
  position: "absolute",
  top: 0,
  right: 16,
  zIndex: 1,
  color: e.darkest,
  display: "flex",
  alignItems: "center",
  height: "100%",
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" }
  },
  animation: "spin 1s linear infinite"
})), T0 = x(At.Error)({
  position: "absolute",
  padding: "8px 40px 8px 16px",
  bottom: 0,
  maxHeight: "initial",
  width: "100%",
  div: {
    wordBreak: "break-word"
  },
  "> div": {
    padding: 0
  }
}), C0 = x(bo)({
  position: "absolute",
  top: 4,
  right: -24,
  cursor: "pointer"
}), bc = /* @__PURE__ */ a(({
  open: e,
  onOpenChange: t,
  fileSearchQuery: o,
  setFileSearchQuery: i,
  isLoading: r,
  error: n,
  searchResults: l,
  onCreateNewStory: u,
  setError: c,
  container: d
}) => {
  let [p, m] = Wu(), [h, b] = K(m.height), [, f] = oa(), [y, S] = K(o);
  return V(() => {
    h < m.height && b(m.height);
  }, [m.height, h]), /* @__PURE__ */ s.createElement(
    b0,
    {
      height: y0,
      width: 440,
      open: e,
      onOpenChange: t,
      onEscapeKeyDown: () => {
        t(!1);
      },
      onInteractOutside: () => {
        t(!1);
      },
      container: d
    },
    /* @__PURE__ */ s.createElement(v0, { height: o === "" ? m.height : h }, /* @__PURE__ */ s.createElement(x0, { ref: p }, /* @__PURE__ */ s.
    createElement(At.Header, null, /* @__PURE__ */ s.createElement(At.Title, null, "Add a new story"), /* @__PURE__ */ s.createElement(At.Description,
    null, "We will create a new story for your component")), /* @__PURE__ */ s.createElement(S0, null, /* @__PURE__ */ s.createElement(w0, null,
    /* @__PURE__ */ s.createElement(So, null)), /* @__PURE__ */ s.createElement(
      I0,
      {
        placeholder: "./components/**/*.tsx",
        type: "search",
        required: !0,
        autoFocus: !0,
        value: y,
        onChange: (E) => {
          let g = E.target.value;
          S(g), f(() => {
            i(g);
          });
        }
      }
    ), r && /* @__PURE__ */ s.createElement(E0, null, /* @__PURE__ */ s.createElement(ut, null))), /* @__PURE__ */ s.createElement(
      yc,
      {
        errorItemId: n?.selectedItemId,
        isLoading: r,
        searchResults: l,
        onNewStory: u
      }
    ))),
    n && o !== "" && /* @__PURE__ */ s.createElement(T0, null, /* @__PURE__ */ s.createElement("div", null, n.error), /* @__PURE__ */ s.createElement(
      C0,
      {
        onClick: () => {
          c(null);
        }
      }
    ))
  );
}, "FileSearchModal");

// src/manager/components/sidebar/FileSearchModal.utils.tsx
function vc(e) {
  return Object.keys(e).reduce(
    (o, i) => {
      let r = e[i];
      if (typeof r.control == "object" && "type" in r.control)
        switch (r.control.type) {
          case "object":
            o[i] = {};
            break;
          case "inline-radio":
          case "radio":
          case "inline-check":
          case "check":
          case "select":
          case "multi-select":
            o[i] = r.control.options?.[0];
            break;
          case "color":
            o[i] = "#000000";
            break;
          default:
            break;
        }
      return Nr(r.type, o, i), o;
    },
    {}
  );
}
a(vc, "extractSeededRequiredArgs");
function Nr(e, t, o) {
  if (!(typeof e == "string" || !e.required))
    switch (e.name) {
      case "boolean":
        t[o] = !0;
        break;
      case "number":
        t[o] = 0;
        break;
      case "string":
        t[o] = o;
        break;
      case "array":
        t[o] = [];
        break;
      case "object":
        t[o] = {}, Object.entries(e.value ?? {}).forEach(([i, r]) => {
          Nr(r, t[o], i);
        });
        break;
      case "function":
        t[o] = () => {
        };
        break;
      case "intersection":
        e.value?.every((i) => i.name === "object") && (t[o] = {}, e.value?.forEach((i) => {
          i.name === "object" && Object.entries(i.value ?? {}).forEach(([r, n]) => {
            Nr(n, t[o], r);
          });
        }));
        break;
      case "union":
        e.value?.[0] !== void 0 && Nr(e.value[0], t, o);
        break;
      case "enum":
        e.value?.[0] !== void 0 && (t[o] = e.value?.[0]);
        break;
      case "other":
        typeof e.value == "string" && e.value === "tuple" && (t[o] = []);
        break;
      default:
        break;
    }
}
a(Nr, "setArgType");
async function Fr(e, t, o = 1) {
  if (o > 10)
    throw new Error("We could not select the new story. Please try again.");
  try {
    await e(t);
  } catch {
    return await new Promise((r) => setTimeout(r, 500)), Fr(e, t, o + 1);
  }
}
a(Fr, "trySelectNewStory");

// src/manager/components/sidebar/CreateNewStoryFileModal.tsx
var _0 = /* @__PURE__ */ a((e) => JSON.stringify(e, (t, o) => typeof o == "function" ? "__sb_empty_function_arg__" : o), "stringifyArgs"), xc = /* @__PURE__ */ a(
({ open: e, onOpenChange: t }) => {
  let [o, i] = K(!1), [r, n] = K(""), l = zu(r, 600), u = ta(l), c = q(null), [d, p] = K(
    null
  ), m = oe(), [h, b] = K(null), f = A(
    (g) => {
      m.addNotification({
        id: "create-new-story-file-success",
        content: {
          headline: "Story file created",
          subHeadline: `${g} was created`
        },
        duration: 8e3,
        icon: /* @__PURE__ */ s.createElement(Be, null)
      }), t(!1);
    },
    [m, t]
  ), y = A(() => {
    m.addNotification({
      id: "create-new-story-file-error",
      content: {
        headline: "Story already exists",
        subHeadline: "Successfully navigated to existing story"
      },
      duration: 8e3,
      icon: /* @__PURE__ */ s.createElement(Be, null)
    }), t(!1);
  }, [m, t]), S = A(() => {
    i(!0);
    let g = He.getChannel(), v = /* @__PURE__ */ a((I) => {
      I.id === u && (I.success ? b(I.payload.files) : p({ error: I.error }), g.off(qo, v), i(!1), c.current = null);
    }, "set");
    return g.on(qo, v), u !== "" && c.current !== u ? (c.current = u, g.emit(ca, {
      id: u,
      payload: {}
    })) : (b(null), i(!1)), () => {
      g.off(qo, v);
    };
  }, [u]), E = A(
    async ({
      componentExportName: g,
      componentFilePath: v,
      componentIsDefaultExport: I,
      componentExportCount: w,
      selectedItemId: O
    }) => {
      try {
        let _ = He.getChannel(), k = await Zo(_, la, ua, {
          componentExportName: g,
          componentFilePath: v,
          componentIsDefaultExport: I,
          componentExportCount: w
        });
        p(null);
        let T = k.storyId;
        await Fr(m.selectStory, T);
        try {
          let P = (await Zo(_, na, ia, {
            storyId: T
          })).argTypes, D = vc(P);
          await Zo(
            _,
            da,
            fa,
            {
              args: _0(D),
              importPath: k.storyFilePath,
              csfId: T
            }
          );
        } catch {
        }
        f(g), S();
      } catch (_) {
        switch (_?.payload?.type) {
          case "STORY_FILE_EXISTS":
            let k = _;
            await Fr(m.selectStory, k.payload.kind), y();
            break;
          default:
            p({ selectedItemId: O, error: _?.message });
            break;
        }
      }
    },
    [m?.selectStory, f, S, y]
  );
  return V(() => {
    p(null);
  }, [u]), V(() => S(), [S]), /* @__PURE__ */ s.createElement(
    bc,
    {
      error: d,
      fileSearchQuery: r,
      fileSearchQueryDeferred: u,
      onCreateNewStory: E,
      isLoading: o,
      onOpenChange: t,
      open: e,
      searchResults: h,
      setError: p,
      setFileSearchQuery: n
    }
  );
}, "CreateNewStoryFileModal");

// src/manager/components/sidebar/HighlightStyles.tsx
var Ic = /* @__PURE__ */ a(({ refId: e, itemId: t }) => /* @__PURE__ */ s.createElement(
  eo,
  {
    styles: ({ color: o }) => {
      let i = Te(0.85, o.secondary);
      return {
        [`[data-ref-id="${e}"][data-item-id="${t}"]:not([data-selected="true"])`]: {
          '&[data-nodetype="component"], &[data-nodetype="group"]': {
            background: i,
            "&:hover, &:focus": { background: i }
          },
          '&[data-nodetype="story"], &[data-nodetype="document"]': {
            color: o.defaultText,
            background: i,
            "&:hover, &:focus": { background: i }
          }
        }
      };
    }
  }
), "HighlightStyles");

// src/manager/utils/tree.ts
var co = Ve(Pi(), 1);
var { document: Wi, window: k0 } = se, Rr = /* @__PURE__ */ a((e, t) => !t || t === at ? e : `${t}_${e}`, "createId"), Ec = /* @__PURE__ */ a(
(e, t) => `${Wi.location.pathname}?path=/${e.type}/${Rr(e.id, t)}`, "getLink");
var Sc = (0, co.default)(1e3)((e, t) => t[e]), O0 = (0, co.default)(1e3)((e, t) => {
  let o = Sc(e, t);
  return o && o.type !== "root" ? Sc(o.parent, t) : void 0;
}), Tc = (0, co.default)(1e3)((e, t) => {
  let o = O0(e, t);
  return o ? [o, ...Tc(o.id, t)] : [];
}), Fo = (0, co.default)(1e3)(
  (e, t) => Tc(t, e).map((o) => o.id)
), st = (0, co.default)(1e3)((e, t, o) => {
  let i = e[t];
  return !i || i.type === "story" || i.type === "docs" || !i.children ? [] : i.children.reduce((r, n) => {
    let l = e[n];
    return !l || o && (l.type === "story" || l.type === "docs") || r.push(n, ...st(e, n, o)), r;
  }, []);
});
function Cc(e, t) {
  let o = e.type !== "root" && e.parent ? t.index[e.parent] : null;
  return o ? [...Cc(o, t), o.name] : t.id === at ? [] : [t.title || t.id];
}
a(Cc, "getPath");
var Vi = /* @__PURE__ */ a((e, t) => ({ ...e, refId: t.id, path: Cc(e, t) }), "searchItem");
function _c(e, t, o) {
  let i = t + o % e.length;
  return i < 0 && (i = e.length + i), i >= e.length && (i -= e.length), i;
}
a(_c, "cycle");
var zt = /* @__PURE__ */ a((e, t = !1) => {
  if (!e)
    return;
  let { top: o, bottom: i } = e.getBoundingClientRect();
  if (!o || !i)
    return;
  let r = Wi?.querySelector("#sidebar-bottom-wrapper")?.getBoundingClientRect().top || k0.innerHeight || Wi.documentElement.clientHeight;
  i > r && e.scrollIntoView({ block: t ? "center" : "nearest" });
}, "scrollIntoView"), kc = /* @__PURE__ */ a((e, t, o, i) => {
  switch (!0) {
    case t:
      return "auth";
    case o:
      return "error";
    case e:
      return "loading";
    case i:
      return "empty";
    default:
      return "ready";
  }
}, "getStateType"), Wt = /* @__PURE__ */ a((e, t) => !e || !t ? !1 : e === t ? !0 : Wt(e.parentElement || void 0, t), "isAncestor"), wc = /* @__PURE__ */ a(
(e) => e.replaceAll(/(\s|-|_)/gi, ""), "removeNoiseFromName"), Oc = /* @__PURE__ */ a((e, t) => wc(e) === wc(t), "isStoryHoistable");

// src/manager/components/sidebar/Loader.tsx
var Pc = [0, 0, 1, 1, 2, 3, 3, 3, 1, 1, 1, 2, 2, 2, 3], P0 = x.div(
  {
    cursor: "progress",
    fontSize: 13,
    height: "16px",
    marginTop: 4,
    marginBottom: 4,
    alignItems: "center",
    overflow: "hidden"
  },
  ({ depth: e = 0 }) => ({
    marginLeft: e * 15,
    maxWidth: 85 - e * 5
  }),
  ({ theme: e }) => e.animation.inlineGlow,
  ({ theme: e }) => ({
    background: e.appBorderColor
  })
), Ro = x.div({
  display: "flex",
  flexDirection: "column",
  paddingLeft: 20,
  paddingRight: 20
}), Ac = /* @__PURE__ */ a(({ size: e }) => {
  let t = Math.ceil(e / Pc.length), o = Array.from(Array(t)).fill(Pc).flat().slice(0, e);
  return /* @__PURE__ */ s.createElement(Ee, null, o.map((i, r) => /* @__PURE__ */ s.createElement(P0, { depth: i, key: r })));
}, "Loader");

// src/manager/components/sidebar/RefBlocks.tsx
var { window: Dc } = se, A0 = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  lineHeight: "20px",
  margin: 0
})), ji = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  lineHeight: "20px",
  margin: 0,
  code: {
    fontSize: e.typography.size.s1
  },
  ul: {
    paddingLeft: 20,
    marginTop: 8,
    marginBottom: 8
  }
})), D0 = x.pre(
  {
    width: 420,
    boxSizing: "border-box",
    borderRadius: 8,
    overflow: "auto",
    whiteSpace: "pre"
  },
  ({ theme: e }) => ({
    color: e.color.dark
  })
), Mc = /* @__PURE__ */ a(({ loginUrl: e, id: t }) => {
  let [o, i] = K(!1), r = A(() => {
    Dc.document.location.reload();
  }, []), n = A((l) => {
    l.preventDefault();
    let u = Dc.open(e, `storybook_auth_${t}`, "resizable,scrollbars"), c = setInterval(() => {
      u ? u.closed && (clearInterval(c), i(!0)) : (lr.error("unable to access loginUrl window"), clearInterval(c));
    }, 1e3);
  }, []);
  return /* @__PURE__ */ s.createElement(Ro, null, /* @__PURE__ */ s.createElement(ct, null, o ? /* @__PURE__ */ s.createElement(Ee, null, /* @__PURE__ */ s.
  createElement(ji, null, "Authentication on ", /* @__PURE__ */ s.createElement("strong", null, e), " concluded. Refresh the page to fetch t\
his Storybook."), /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(he, { size: "small", variant: "outline", onClick: r },
  /* @__PURE__ */ s.createElement(ut, null), "Refresh now"))) : /* @__PURE__ */ s.createElement(Ee, null, /* @__PURE__ */ s.createElement(ji,
  null, "Sign in to browse this Storybook."), /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(he, { size: "smal\
l", variant: "outline", onClick: n }, /* @__PURE__ */ s.createElement(xo, null), "Sign in")))));
}, "AuthBlock"), Lc = /* @__PURE__ */ a(({ error: e }) => /* @__PURE__ */ s.createElement(Ro, null, /* @__PURE__ */ s.createElement(ct, null,
/* @__PURE__ */ s.createElement(A0, null, "Oh no! Something went wrong loading this Storybook.", /* @__PURE__ */ s.createElement("br", null),
/* @__PURE__ */ s.createElement(
  ve,
  {
    tooltip: /* @__PURE__ */ s.createElement(D0, null, /* @__PURE__ */ s.createElement(Ta, { error: e }))
  },
  /* @__PURE__ */ s.createElement(Pe, { isButton: !0 }, "View error ", /* @__PURE__ */ s.createElement(_t, null))
), " ", /* @__PURE__ */ s.createElement(Pe, { withArrow: !0, href: "https://storybook.js.org/docs", cancel: !1, target: "_blank" }, "View do\
cs")))), "ErrorBlock"), M0 = x(ct)({
  display: "flex"
}), L0 = x(ct)({
  flex: 1
}), Nc = /* @__PURE__ */ a(({ isMain: e }) => /* @__PURE__ */ s.createElement(Ro, null, /* @__PURE__ */ s.createElement(M0, { col: 1 }, /* @__PURE__ */ s.
createElement(L0, null, /* @__PURE__ */ s.createElement(ji, null, e ? /* @__PURE__ */ s.createElement(s.Fragment, null, "Oh no! Your Storybo\
ok is empty. Possible reasons why:", /* @__PURE__ */ s.createElement("ul", null, /* @__PURE__ */ s.createElement("li", null, "The glob speci\
fied in ", /* @__PURE__ */ s.createElement("code", null, "main.js"), " isn't correct."), /* @__PURE__ */ s.createElement("li", null, "No sto\
ries are defined in your story files."), /* @__PURE__ */ s.createElement("li", null, "You're using filter-functions, and all stories are fil\
tered away.")), " ") : /* @__PURE__ */ s.createElement(s.Fragment, null, "This composed storybook is empty, maybe you're using filter-functi\
ons, and all stories are filtered away."))))), "EmptyBlock"), Fc = /* @__PURE__ */ a(({ isMain: e }) => /* @__PURE__ */ s.createElement(Ro, null,
/* @__PURE__ */ s.createElement(Ac, { size: e ? 17 : 5 })), "LoaderBlock");

// src/manager/components/sidebar/RefIndicator.tsx
var { document: N0, window: F0 } = se, R0 = x.aside(({ theme: e }) => ({
  height: 16,
  display: "flex",
  alignItems: "center",
  "& > * + *": {
    marginLeft: e.layoutMargin
  }
})), B0 = x.button(({ theme: e }) => ({
  height: 20,
  width: 20,
  padding: 0,
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  outline: "none",
  border: "1px solid transparent",
  borderRadius: "100%",
  cursor: "pointer",
  color: e.base === "light" ? Te(0.3, e.color.defaultText) : Te(0.6, e.color.defaultText),
  "&:hover": {
    color: e.barSelectedColor
  },
  "&:focus": {
    color: e.barSelectedColor,
    borderColor: e.color.secondary
  },
  svg: {
    height: 10,
    width: 10,
    transition: "all 150ms ease-out",
    color: "inherit"
  }
})), Vt = x.span(({ theme: e }) => ({
  fontWeight: e.typography.weight.bold
})), jt = x.a(({ theme: e }) => ({
  textDecoration: "none",
  lineHeight: "16px",
  padding: 15,
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  color: e.color.defaultText,
  "&:not(:last-child)": {
    borderBottom: `1px solid ${e.appBorderColor}`
  },
  "&:hover": {
    background: e.background.hoverable,
    color: e.color.darker
  },
  "&:link": {
    color: e.color.darker
  },
  "&:active": {
    color: e.color.darker
  },
  "&:focus": {
    color: e.color.darker
  },
  "& > *": {
    flex: 1
  },
  "& > svg": {
    marginTop: 3,
    width: 16,
    height: 16,
    marginRight: 10,
    flex: "unset"
  }
})), H0 = x.div({
  width: 280,
  boxSizing: "border-box",
  borderRadius: 8,
  overflow: "hidden"
}), z0 = x.div(({ theme: e }) => ({
  display: "flex",
  alignItems: "center",
  fontSize: e.typography.size.s1,
  fontWeight: e.typography.weight.regular,
  color: e.base === "light" ? Te(0.3, e.color.defaultText) : Te(0.6, e.color.defaultText),
  "& > * + *": {
    marginLeft: 4
  },
  svg: {
    height: 10,
    width: 10
  }
})), W0 = /* @__PURE__ */ a(({ url: e, versions: t }) => {
  let o = U(() => {
    let i = Object.entries(t).find(([r, n]) => n === e);
    return i && i[0] ? i[0] : "current";
  }, [e, t]);
  return /* @__PURE__ */ s.createElement(z0, null, /* @__PURE__ */ s.createElement("span", null, o), /* @__PURE__ */ s.createElement(_t, null));
}, "CurrentVersion"), Rc = s.memo(
  ea(
    ({ state: e, ...t }, o) => {
      let i = oe(), r = U(() => Object.values(t.index || {}), [t.index]), n = U(
        () => r.filter((u) => u.type === "component").length,
        [r]
      ), l = U(
        () => r.filter((u) => u.type === "docs" || u.type === "story").length,
        [r]
      );
      return /* @__PURE__ */ s.createElement(R0, { ref: o }, /* @__PURE__ */ s.createElement(
        ve,
        {
          placement: "bottom-start",
          trigger: "click",
          closeOnOutsideClick: !0,
          tooltip: /* @__PURE__ */ s.createElement(H0, null, /* @__PURE__ */ s.createElement(ct, { row: 0 }, e === "loading" && /* @__PURE__ */ s.
          createElement(G0, { url: t.url }), (e === "error" || e === "empty") && /* @__PURE__ */ s.createElement(U0, { url: t.url }), e === "\
ready" && /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(V0, { url: t.url, componentCount: n, leafCount: l }),
          t.sourceUrl && /* @__PURE__ */ s.createElement(j0, { url: t.sourceUrl })), e === "auth" && /* @__PURE__ */ s.createElement(K0, { ...t }),
          t.type === "auto-inject" && e !== "error" && /* @__PURE__ */ s.createElement(q0, null), e !== "loading" && /* @__PURE__ */ s.createElement(
          $0, null)))
        },
        /* @__PURE__ */ s.createElement(B0, { "data-action": "toggle-indicator", "aria-label": "toggle indicator" }, /* @__PURE__ */ s.createElement(
        Xo, null))
      ), t.versions && Object.keys(t.versions).length ? /* @__PURE__ */ s.createElement(
        ve,
        {
          placement: "bottom-start",
          trigger: "click",
          closeOnOutsideClick: !0,
          tooltip: (u) => /* @__PURE__ */ s.createElement(
            ot,
            {
              links: Object.entries(t.versions).map(([c, d]) => ({
                icon: d === t.url ? /* @__PURE__ */ s.createElement(Be, null) : void 0,
                id: c,
                title: c,
                href: d,
                onClick: /* @__PURE__ */ a((p, m) => {
                  p.preventDefault(), i.changeRefVersion(t.id, m.href), u.onHide();
                }, "onClick")
              }))
            }
          )
        },
        /* @__PURE__ */ s.createElement(W0, { url: t.url, versions: t.versions })
      ) : null);
    }
  )
), V0 = /* @__PURE__ */ a(({ url: e, componentCount: t, leafCount: o }) => {
  let i = De();
  return /* @__PURE__ */ s.createElement(jt, { href: e.replace(/\/?$/, "/index.html"), target: "_blank" }, /* @__PURE__ */ s.createElement(Xo,
  { color: i.color.secondary }), /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(Vt, null, "View external Story\
book"), /* @__PURE__ */ s.createElement("div", null, "Explore ", t, " components and ", o, " stories in a new browser tab.")));
}, "ReadyMessage"), j0 = /* @__PURE__ */ a(({ url: e }) => {
  let t = De();
  return /* @__PURE__ */ s.createElement(jt, { href: e, target: "_blank" }, /* @__PURE__ */ s.createElement(zn, { color: t.color.secondary }),
  /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(Vt, null, "View source code")));
}, "SourceCodeMessage"), K0 = /* @__PURE__ */ a(({ loginUrl: e, id: t }) => {
  let o = De(), i = A((r) => {
    r.preventDefault();
    let n = F0.open(e, `storybook_auth_${t}`, "resizable,scrollbars"), l = setInterval(() => {
      n ? n.closed && (clearInterval(l), N0.location.reload()) : clearInterval(l);
    }, 1e3);
  }, []);
  return /* @__PURE__ */ s.createElement(jt, { onClick: i }, /* @__PURE__ */ s.createElement(xo, { color: o.color.gold }), /* @__PURE__ */ s.
  createElement("div", null, /* @__PURE__ */ s.createElement(Vt, null, "Log in required"), /* @__PURE__ */ s.createElement("div", null, "You\
 need to authenticate to view this Storybook's components.")));
}, "LoginRequiredMessage"), $0 = /* @__PURE__ */ a(() => {
  let e = De();
  return /* @__PURE__ */ s.createElement(jt, { href: "https://storybook.js.org/docs/sharing/storybook-composition", target: "_blank" }, /* @__PURE__ */ s.
  createElement(kt, { color: e.color.green }), /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(Vt, null, "Read \
Composition docs"), /* @__PURE__ */ s.createElement("div", null, "Learn how to combine multiple Storybooks into one.")));
}, "ReadDocsMessage"), U0 = /* @__PURE__ */ a(({ url: e }) => {
  let t = De();
  return /* @__PURE__ */ s.createElement(jt, { href: e.replace(/\/?$/, "/index.html"), target: "_blank" }, /* @__PURE__ */ s.createElement(go,
  { color: t.color.negative }), /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(Vt, null, "Something went wrong"),
  /* @__PURE__ */ s.createElement("div", null, "This external Storybook didn't load. Debug it in a new tab now.")));
}, "ErrorOccurredMessage"), G0 = /* @__PURE__ */ a(({ url: e }) => {
  let t = De();
  return /* @__PURE__ */ s.createElement(jt, { href: e.replace(/\/?$/, "/index.html"), target: "_blank" }, /* @__PURE__ */ s.createElement(qn,
  { color: t.color.secondary }), /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(Vt, null, "Please wait"), /* @__PURE__ */ s.
  createElement("div", null, "This Storybook is loading.")));
}, "LoadingMessage"), q0 = /* @__PURE__ */ a(() => {
  let e = De();
  return /* @__PURE__ */ s.createElement(jt, { href: "https://storybook.js.org/docs/sharing/storybook-composition", target: "_blank" }, /* @__PURE__ */ s.
  createElement(Bn, { color: e.color.gold }), /* @__PURE__ */ s.createElement("div", null, /* @__PURE__ */ s.createElement(Vt, null, "Reduce\
 lag"), /* @__PURE__ */ s.createElement("div", null, "Learn how to speed up Composition performance.")));
}, "PerformanceDegradedMessage");

// src/manager/components/sidebar/IconSymbols.tsx
var Y0 = x.svg`
  position: absolute;
  width: 0;
  height: 0;
  display: inline-block;
  shape-rendering: inherit;
  vertical-align: middle;
`, Bc = "icon--group", Hc = "icon--component", zc = "icon--document", Wc = "icon--story", Vc = "icon--success", jc = "icon--error", Kc = "ic\
on--warning", $c = "icon--dot", Uc = /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(Y0, { "data-chromatic": "ignore" }, /* @__PURE__ */ s.
createElement("symbol", { id: Bc }, /* @__PURE__ */ s.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M6.586 3.504l-1.5-1.5H1v9h12v-7.5H6.586zm.414-1L5.793 1.297a1 1 0 00-.707-.293H.5a.5.5 0 00-.5.5v10a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v\
-8.5a.5.5 0 00-.5-.5H7z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ s.createElement("symbol", { id: Hc }, /* @__PURE__ */ s.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M3.5 1.004a2.5 2.5 0 00-2.5 2.5v7a2.5 2.5 0 002.5 2.5h7a2.5 2.5 0 002.5-2.5v-7a2.5 2.5 0 00-2.5-2.5h-7zm8.5 5.5H7.5v-4.5h3a1.5 1.5 0\
 011.5 1.5v3zm0 1v3a1.5 1.5 0 01-1.5 1.5h-3v-4.5H12zm-5.5 4.5v-4.5H2v3a1.5 1.5 0 001.5 1.5h3zM2 6.504h4.5v-4.5h-3a1.5 1.5 0 00-1.5 1.5v3z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ s.createElement("symbol", { id: zc }, /* @__PURE__ */ s.createElement(
  "path",
  {
    d: "M4 5.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zM4.5 7.5a.5.5 0 000 1h5a.5.5 0 000-1h-5zM4 10.5a.5.5 0 01.5-.5h5a.5.5 0 010 \
1h-5a.5.5 0 01-.5-.5z",
    fill: "currentColor"
  }
), /* @__PURE__ */ s.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M1.5 0a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V3.207a.5.5 0 00-.146-.353L10.146.146A.5.5 0 009.793 0H1.5zM2 1h7.5v2a.5.5 0\
 00.5.5h2V13H2V1z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ s.createElement("symbol", { id: Wc }, /* @__PURE__ */ s.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M3.5 0h7a.5.5 0 01.5.5v13a.5.5 0 01-.454.498.462.462 0 01-.371-.118L7 11.159l-3.175 2.72a.46.46 0 01-.379.118A.5.5 0 013 13.5V.5a.5.\
5 0 01.5-.5zM4 12.413l2.664-2.284a.454.454 0 01.377-.128.498.498 0 01.284.12L10 12.412V1H4v11.413z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ s.createElement("symbol", { id: Vc }, /* @__PURE__ */ s.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M10.854 4.146a.5.5 0 010 .708l-5 5a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L5.5 8.793l4.646-4.647a.5.5 0 01.708 0z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ s.createElement("symbol", { id: jc }, /* @__PURE__ */ s.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M7 4a3 3 0 100 6 3 3 0 000-6zM3 7a4 4 0 118 0 4 4 0 01-8 0z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ s.createElement("symbol", { id: Kc }, /* @__PURE__ */ s.createElement(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M7.206 3.044a.498.498 0 01.23.212l3.492 5.985a.494.494 0 01.006.507.497.497 0 01-.443.252H3.51a.499.499 0 01-.437-.76l3.492-5.984a.4\
97.497 0 01.642-.212zM7 4.492L4.37 9h5.26L7 4.492z",
    fill: "currentColor"
  }
)), /* @__PURE__ */ s.createElement("symbol", { id: $c }, /* @__PURE__ */ s.createElement("circle", { cx: "3", cy: "3", r: "3", fill: "curre\
ntColor" }))), "IconSymbols"), Me = /* @__PURE__ */ a(({ type: e }) => e === "group" ? /* @__PURE__ */ s.createElement("use", { xlinkHref: `\
#${Bc}` }) : e === "component" ? /* @__PURE__ */ s.createElement("use", { xlinkHref: `#${Hc}` }) : e === "document" ? /* @__PURE__ */ s.createElement(
"use", { xlinkHref: `#${zc}` }) : e === "story" ? /* @__PURE__ */ s.createElement("use", { xlinkHref: `#${Wc}` }) : e === "success" ? /* @__PURE__ */ s.
createElement("use", { xlinkHref: `#${Vc}` }) : e === "error" ? /* @__PURE__ */ s.createElement("use", { xlinkHref: `#${jc}` }) : e === "war\
ning" ? /* @__PURE__ */ s.createElement("use", { xlinkHref: `#${Kc}` }) : e === "dot" ? /* @__PURE__ */ s.createElement("use", { xlinkHref: `\
#${$c}` }) : null, "UseSymbol");

// src/manager/utils/status.tsx
var Q0 = x(Cn)({
  // specificity hack
  "&&&": {
    width: 6,
    height: 6
  }
}), X0 = x(Q0)(({ theme: { animation: e, color: t, base: o } }) => ({
  // specificity hack
  animation: `${e.glow} 1.5s ease-in-out infinite`,
  color: o === "light" ? t.mediumdark : t.darker
})), Z0 = [
  "status-value:unknown",
  "status-value:pending",
  "status-value:success",
  "status-value:warning",
  "status-value:error"
], Bo = {
  "status-value:unknown": [null, null],
  "status-value:pending": [/* @__PURE__ */ s.createElement(X0, { key: "icon" }), "currentColor"],
  "status-value:success": [
    /* @__PURE__ */ s.createElement("svg", { key: "icon", viewBox: "0 0 14 14", width: "14", height: "14" }, /* @__PURE__ */ s.createElement(
    Me, { type: "success" })),
    "currentColor"
  ],
  "status-value:warning": [
    /* @__PURE__ */ s.createElement("svg", { key: "icon", viewBox: "0 0 14 14", width: "14", height: "14" }, /* @__PURE__ */ s.createElement(
    Me, { type: "warning" })),
    "#A15C20"
  ],
  "status-value:error": [
    /* @__PURE__ */ s.createElement("svg", { key: "icon", viewBox: "0 0 14 14", width: "14", height: "14" }, /* @__PURE__ */ s.createElement(
    Me, { type: "error" })),
    "#D43900"
  ]
}, Ho = /* @__PURE__ */ a((e) => Z0.reduce(
  (t, o) => e.includes(o) ? o : t,
  "status-value:unknown"
), "getMostCriticalStatusValue");
function Br(e, t) {
  return Object.values(e).reduce((o, i) => {
    if (i.type === "group" || i.type === "component") {
      let r = st(e, i.id, !1).map((l) => e[l]).filter((l) => l.type === "story"), n = Ho(
        // @ts-expect-error (non strict)
        r.flatMap((l) => Object.values(t[l.id] || {})).map((l) => l.value)
      );
      n && (o[i.id] = n);
    }
    return o;
  }, {});
}
a(Br, "getGroupStatus");

// src/manager/components/sidebar/StatusButton.tsx
var Gc = /* @__PURE__ */ a(({ theme: e, status: t }) => {
  let o = e.base === "light" ? Te(0.3, e.color.defaultText) : Te(0.6, e.color.defaultText);
  return {
    color: {
      "status-value:pending": o,
      "status-value:success": e.color.positive,
      "status-value:error": e.color.negative,
      "status-value:warning": e.color.warning,
      "status-value:unknown": o
    }[t]
  };
}, "withStatusColor"), qc = x.div(Gc, {
  margin: 3
}), zo = x(ee)(
  Gc,
  ({ theme: e, height: t, width: o }) => ({
    transition: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: o || 28,
    height: t || 28,
    "&:hover": {
      color: e.color.secondary,
      background: e.base === "dark" ? xr(0.3, e.color.secondary) : Po(0.4, e.color.secondary)
    },
    '[data-selected="true"] &': {
      background: e.color.secondary,
      boxShadow: `0 0 5px 5px ${e.color.secondary}`,
      "&:hover": {
        background: Po(0.1, e.color.secondary)
      }
    },
    "&:focus": {
      color: e.color.secondary,
      borderColor: e.color.secondary,
      "&:not(:focus-visible)": {
        borderColor: "transparent"
      }
    }
  }),
  ({ theme: e, selectedItem: t }) => t && {
    "&:hover": {
      boxShadow: `inset 0 0 0 2px ${e.color.secondary}`,
      background: "rgba(255, 255, 255, 0.2)"
    }
  }
);

// src/manager/components/sidebar/ContextMenu.tsx
var J0 = {
  onMouseEnter: /* @__PURE__ */ a(() => {
  }, "onMouseEnter"),
  node: null
}, ex = x(ve)({
  position: "absolute",
  right: 0,
  zIndex: 1
}), tx = x(zo)({
  background: "var(--tree-node-background-hover)",
  boxShadow: "0 0 5px 5px var(--tree-node-background-hover)"
}), Yc = /* @__PURE__ */ a((e, t, o) => {
  let [i, r] = K(0), [n, l] = K(!1), u = U(() => ({
    onMouseEnter: /* @__PURE__ */ a(() => {
      r((p) => p + 1);
    }, "onMouseEnter"),
    onOpen: /* @__PURE__ */ a((p) => {
      p.stopPropagation(), l(!0);
    }, "onOpen"),
    onClose: /* @__PURE__ */ a(() => {
      l(!1);
    }, "onClose")
  }), []), d = U(() => {
    let p = o.getElements(Ce.experimental_TEST_PROVIDER);
    return i ? Qc(p, e) : [];
  }, [o, e, i]).length > 0 || t.length > 0;
  return U(() => globalThis.CONFIG_TYPE !== "DEVELOPMENT" ? J0 : {
    onMouseEnter: u.onMouseEnter,
    node: d ? /* @__PURE__ */ s.createElement(
      ex,
      {
        "data-displayed": n ? "on" : "off",
        closeOnOutsideClick: !0,
        placement: "bottom-end",
        "data-testid": "context-menu",
        onVisibleChange: (p) => {
          p ? l(!0) : u.onClose();
        },
        tooltip: /* @__PURE__ */ s.createElement(ox, { context: e, links: t })
      },
      /* @__PURE__ */ s.createElement(tx, { type: "button", status: "status-value:pending" }, /* @__PURE__ */ s.createElement(On, null))
    ) : null
  }, [e, u, n, d, t]);
}, "useContextMenu"), ox = /* @__PURE__ */ a(({
  context: e,
  links: t,
  ...o
}) => {
  let i = oe().getElements(
    Ce.experimental_TEST_PROVIDER
  ), r = Qc(i, e), l = (Array.isArray(t[0]) ? t : [t]).concat([r]);
  return /* @__PURE__ */ s.createElement(ot, { ...o, links: l });
}, "LiveContextMenu");
function Qc(e, t) {
  return Object.entries(e).map(([o, i]) => {
    if (!i)
      return null;
    let r = i.sidebarContextMenu?.({ context: t });
    return r ? {
      id: o,
      content: r
    } : null;
  }).filter(Boolean);
}
a(Qc, "generateTestProviderLinks");

// src/manager/components/sidebar/StatusContext.tsx
var Ki = Qt({}), Xc = /* @__PURE__ */ a((e) => {
  let { data: t, allStatuses: o, groupStatus: i } = Go(Ki), r = {
    counts: {
      "status-value:pending": 0,
      "status-value:success": 0,
      "status-value:error": 0,
      "status-value:warning": 0,
      "status-value:unknown": 0
    },
    statusesByValue: {
      "status-value:pending": {},
      "status-value:success": {},
      "status-value:error": {},
      "status-value:warning": {},
      "status-value:unknown": {}
    }
  };
  if (t && o && i && ["status-value:pending", "status-value:warning", "status-value:error"].includes(
    i[e.id]
  ))
    for (let n of st(t, e.id, !1))
      for (let l of Object.values(o[n] ?? {}))
        r.counts[l.value]++, r.statusesByValue[l.value][n] ??= [], r.statusesByValue[l.value][n].push(l);
  return r;
}, "useStatusSummary");

// src/manager/components/sidebar/components/CollapseIcon.tsx
var rx = x.div(({ theme: e, isExpanded: t }) => ({
  width: 8,
  height: 8,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: Te(0.4, e.textMutedColor),
  transform: t ? "rotateZ(90deg)" : "none",
  transition: "transform .1s ease-out"
})), Kt = /* @__PURE__ */ a(({ isExpanded: e }) => /* @__PURE__ */ s.createElement(rx, { isExpanded: e }, /* @__PURE__ */ s.createElement("s\
vg", { xmlns: "http://www.w3.org/2000/svg", width: "8", height: "8", fill: "none" }, /* @__PURE__ */ s.createElement(
  "path",
  {
    fill: "#73828C",
    fillRule: "evenodd",
    d: "M1.896 7.146a.5.5 0 1 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 1 0-.708.708L5.043 4 1.896 7.146Z",
    clipRule: "evenodd"
  }
))), "CollapseIcon");

// src/manager/components/sidebar/TreeNode.tsx
var It = x.svg(
  ({ theme: e, type: t }) => ({
    width: 14,
    height: 14,
    flex: "0 0 auto",
    color: t === "group" ? e.base === "dark" ? e.color.primary : e.color.ultraviolet : t === "component" ? e.color.secondary : t === "docume\
nt" ? e.base === "dark" ? e.color.gold : "#ff8300" : t === "story" ? e.color.seafoam : "currentColor"
  })
), Zc = x.button(({ theme: e, depth: t = 0, isExpandable: o = !1 }) => ({
  width: "100%",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "start",
  textAlign: "left",
  paddingLeft: `${(o ? 8 : 22) + t * 18}px`,
  color: "inherit",
  fontSize: `${e.typography.size.s2}px`,
  background: "transparent",
  minHeight: 28,
  borderRadius: 4,
  gap: 6,
  paddingTop: 5,
  paddingBottom: 4
})), Jc = x.a(({ theme: e, depth: t = 0 }) => ({
  width: "100%",
  cursor: "pointer",
  color: "inherit",
  display: "flex",
  gap: 6,
  flex: 1,
  alignItems: "start",
  paddingLeft: `${22 + t * 18}px`,
  paddingTop: 5,
  paddingBottom: 4,
  fontSize: `${e.typography.size.s2}px`,
  textDecoration: "none",
  overflowWrap: "break-word",
  wordWrap: "break-word",
  wordBreak: "break-word"
})), ep = x.div(({ theme: e }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 16,
  marginBottom: 4,
  fontSize: `${e.typography.size.s1 - 1}px`,
  fontWeight: e.typography.weight.bold,
  lineHeight: "16px",
  minHeight: 28,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: e.textMutedColor
})), Hr = x.div({
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 2
}), tp = s.memo(/* @__PURE__ */ a(function({
  children: t,
  isExpanded: o = !1,
  isExpandable: i = !1,
  ...r
}) {
  return /* @__PURE__ */ s.createElement(Zc, { isExpandable: i, tabIndex: -1, ...r }, /* @__PURE__ */ s.createElement(Hr, null, i && /* @__PURE__ */ s.
  createElement(Kt, { isExpanded: o }), /* @__PURE__ */ s.createElement(It, { viewBox: "0 0 14 14", width: "14", height: "14", type: "group" },
  /* @__PURE__ */ s.createElement(Me, { type: "group" }))), t);
}, "GroupNode")), op = s.memo(
  /* @__PURE__ */ a(function({ theme: t, children: o, isExpanded: i, isExpandable: r, isSelected: n, ...l }) {
    return /* @__PURE__ */ s.createElement(Zc, { isExpandable: r, tabIndex: -1, ...l }, /* @__PURE__ */ s.createElement(Hr, null, r && /* @__PURE__ */ s.
    createElement(Kt, { isExpanded: i }), /* @__PURE__ */ s.createElement(It, { viewBox: "0 0 14 14", width: "12", height: "12", type: "comp\
onent" }, /* @__PURE__ */ s.createElement(Me, { type: "component" }))), o);
  }, "ComponentNode")
), rp = s.memo(
  /* @__PURE__ */ a(function({ theme: t, children: o, docsMode: i, ...r }) {
    return /* @__PURE__ */ s.createElement(Jc, { tabIndex: -1, ...r }, /* @__PURE__ */ s.createElement(Hr, null, /* @__PURE__ */ s.createElement(
    It, { viewBox: "0 0 14 14", width: "12", height: "12", type: "document" }, /* @__PURE__ */ s.createElement(Me, { type: "document" }))), o);
  }, "DocumentNode")
), np = s.memo(/* @__PURE__ */ a(function({
  theme: t,
  children: o,
  ...i
}) {
  return /* @__PURE__ */ s.createElement(Jc, { tabIndex: -1, ...i }, /* @__PURE__ */ s.createElement(Hr, null, /* @__PURE__ */ s.createElement(
  It, { viewBox: "0 0 14 14", width: "12", height: "12", type: "story" }, /* @__PURE__ */ s.createElement(Me, { type: "story" }))), o);
}, "StoryNode"));

// ../node_modules/es-toolkit/dist/function/debounce.mjs
function zr(e, t, { signal: o, edges: i } = {}) {
  let r, n = null, l = i != null && i.includes("leading"), u = i == null || i.includes("trailing"), c = /* @__PURE__ */ a(() => {
    n !== null && (e.apply(r, n), r = void 0, n = null);
  }, "invoke"), d = /* @__PURE__ */ a(() => {
    u && c(), b();
  }, "onTimerEnd"), p = null, m = /* @__PURE__ */ a(() => {
    p != null && clearTimeout(p), p = setTimeout(() => {
      p = null, d();
    }, t);
  }, "schedule"), h = /* @__PURE__ */ a(() => {
    p !== null && (clearTimeout(p), p = null);
  }, "cancelTimer"), b = /* @__PURE__ */ a(() => {
    h(), r = void 0, n = null;
  }, "cancel"), f = /* @__PURE__ */ a(() => {
    h(), c();
  }, "flush"), y = /* @__PURE__ */ a(function(...S) {
    if (o?.aborted)
      return;
    r = this, n = S;
    let E = p == null;
    m(), l && E && c();
  }, "debounced");
  return y.schedule = m, y.cancel = b, y.flush = f, o?.addEventListener("abort", b, { once: !0 }), y;
}
a(zr, "debounce");

// ../node_modules/es-toolkit/dist/function/throttle.mjs
function $i(e, t, { signal: o, edges: i = ["leading", "trailing"] } = {}) {
  let r = null, n = zr(e, t, { signal: o, edges: i }), l = /* @__PURE__ */ a(function(...u) {
    r == null ? r = Date.now() : Date.now() - r >= t && (r = Date.now(), n.cancel()), n(...u);
  }, "throttled");
  return l.cancel = n.cancel, l.flush = n.flush, l;
}
a($i, "throttle");

// ../node_modules/es-toolkit/dist/compat/function/debounce.mjs
function Ui(e, t = 0, o = {}) {
  typeof o != "object" && (o = {});
  let { signal: i, leading: r = !1, trailing: n = !0, maxWait: l } = o, u = Array(2);
  r && (u[0] = "leading"), n && (u[1] = "trailing");
  let c, d = null, p = zr(function(...b) {
    c = e.apply(this, b), d = null;
  }, t, { signal: i, edges: u }), m = /* @__PURE__ */ a(function(...b) {
    if (l != null) {
      if (d === null)
        d = Date.now();
      else if (Date.now() - d >= l)
        return c = e.apply(this, b), d = Date.now(), p.cancel(), p.schedule(), c;
    }
    return p.apply(this, b), c;
  }, "debounced"), h = /* @__PURE__ */ a(() => (p.flush(), c), "flush");
  return m.cancel = p.cancel, m.flush = h, m;
}
a(Ui, "debounce");

// src/manager/keybinding.ts
var nx = {
  // event.code => event.key
  Space: " ",
  Slash: "/",
  ArrowLeft: "ArrowLeft",
  ArrowUp: "ArrowUp",
  ArrowRight: "ArrowRight",
  ArrowDown: "ArrowDown",
  Escape: "Escape",
  Enter: "Enter"
}, ix = { alt: !1, ctrl: !1, meta: !1, shift: !1 }, St = /* @__PURE__ */ a((e, t) => {
  let { alt: o, ctrl: i, meta: r, shift: n } = e === !1 ? ix : e;
  return !(typeof o == "boolean" && o !== t.altKey || typeof i == "boolean" && i !== t.ctrlKey || typeof r == "boolean" && r !== t.metaKey ||
  typeof n == "boolean" && n !== t.shiftKey);
}, "matchesModifiers"), $e = /* @__PURE__ */ a((e, t) => t.code ? t.code === e : t.key === nx[e], "matchesKeyCode");

// src/manager/components/sidebar/useExpanded.ts
var { document: Gi } = se, sx = /* @__PURE__ */ a(({
  refId: e,
  data: t,
  initialExpanded: o,
  highlightedRef: i,
  rootIds: r
}) => {
  let n = i.current?.refId === e ? Fo(t, i.current?.itemId) : [];
  return [...r, ...n].reduce(
    // @ts-expect-error (non strict)
    (l, u) => Object.assign(l, { [u]: u in o ? o[u] : !0 }),
    {}
  );
}, "initializeExpanded"), ax = /* @__PURE__ */ a(() => {
}, "noop"), ip = /* @__PURE__ */ a(({
  containerRef: e,
  isBrowsing: t,
  refId: o,
  data: i,
  initialExpanded: r,
  rootIds: n,
  highlightedRef: l,
  setHighlightedItemId: u,
  selectedStoryId: c,
  onSelectStoryId: d
}) => {
  let p = oe(), [m, h] = Zt(
    (g, { ids: v, value: I }) => v.reduce((w, O) => Object.assign(w, { [O]: I }), { ...g }),
    // @ts-expect-error (non strict)
    { refId: o, data: i, highlightedRef: l, rootIds: n, initialExpanded: r },
    sx
  ), b = A(
    (g) => e.current?.querySelector(`[data-item-id="${g}"]`),
    [e]
  ), f = A(
    (g) => {
      u(g.getAttribute("data-item-id")), zt(g);
    },
    [u]
  ), y = A(
    ({ ids: g, value: v }) => {
      if (h({ ids: g, value: v }), g.length === 1) {
        let I = e.current?.querySelector(
          `[data-item-id="${g[0]}"][data-ref-id="${o}"]`
        );
        I && f(I);
      }
    },
    [e, f, o]
  );
  V(() => {
    h({ ids: Fo(i, c), value: !0 });
  }, [i, c]);
  let S = A(() => {
    let g = Object.keys(i).filter((v) => !n.includes(v));
    h({ ids: g, value: !1 });
  }, [i, n]), E = A(() => {
    h({ ids: Object.keys(i), value: !0 });
  }, [i]);
  return V(() => p ? (p.on(ho, S), p.on(In, E), () => {
    p.off(ho, S), p.off(In, E);
  }) : ax, [p, S, E]), V(() => {
    let g = Gi.getElementById("storybook-explorer-menu"), v = $i((I) => {
      let w = l.current?.refId === o && l.current?.itemId;
      if (!t || !e.current || !w || I.repeat || !St(!1, I))
        return;
      let O = $e("Enter", I), _ = $e("Space", I), k = $e("ArrowLeft", I), T = $e("ArrowRight", I);
      if (!(O || _ || k || T))
        return;
      let C = b(w);
      if (!C || C.getAttribute("data-ref-id") !== o)
        return;
      let P = I.target;
      if (!Wt(g, P) && !Wt(P, g))
        return;
      if (P.hasAttribute("data-action")) {
        if (O || _)
          return;
        P.blur();
      }
      let D = C.getAttribute("data-nodetype");
      (O || _) && ["component", "story", "document"].includes(D) && d(w);
      let M = C.getAttribute("aria-expanded");
      if (k) {
        if (M === "true") {
          h({ ids: [w], value: !1 });
          return;
        }
        let F = C.getAttribute("data-parent-id"), Z = F && b(F);
        if (Z && Z.getAttribute("data-highlightable") === "true") {
          f(Z);
          return;
        }
        h({ ids: st(i, w, !0), value: !1 });
        return;
      }
      T && (M === "false" ? y({ ids: [w], value: !0 }) : M === "true" && y({ ids: st(i, w, !0), value: !0 }));
    }, 60);
    return Gi.addEventListener("keydown", v), () => Gi.removeEventListener("keydown", v);
  }, [
    e,
    t,
    o,
    i,
    l,
    u,
    d
  ]), [m, y];
}, "useExpanded");

// src/manager/components/sidebar/Tree.tsx
var lx = x.div((e) => ({
  marginTop: e.hasOrphans ? 20 : 0,
  marginBottom: 20
})), ux = x.button(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  padding: "0px 8px",
  borderRadius: 4,
  transition: "color 150ms, box-shadow 150ms",
  gap: 6,
  alignItems: "center",
  cursor: "pointer",
  height: 28,
  "&:hover, &:focus": {
    outline: "none",
    background: "var(--tree-node-background-hover)"
  }
})), sp = x.div(({ theme: e }) => ({
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  color: e.color.defaultText,
  background: "transparent",
  minHeight: 28,
  borderRadius: 4,
  overflow: "hidden",
  "--tree-node-background-hover": e.background.content,
  [Qe]: {
    "--tree-node-background-hover": e.background.app
  },
  "&:hover, &:focus": {
    "--tree-node-background-hover": e.base === "dark" ? xr(0.35, e.color.secondary) : Po(0.45, e.color.secondary),
    background: "var(--tree-node-background-hover)",
    outline: "none"
  },
  '& [data-displayed="off"]': {
    visibility: "hidden"
  },
  '&:hover [data-displayed="off"]': {
    visibility: "visible"
  },
  '& [data-displayed="on"] + *': {
    visibility: "hidden"
  },
  '&:hover [data-displayed="off"] + *': {
    visibility: "hidden"
  },
  '&[data-selected="true"]': {
    color: e.color.lightest,
    background: e.color.secondary,
    fontWeight: e.typography.weight.bold,
    "&&:hover, &&:focus": {
      "--tree-node-background-hover": e.color.secondary,
      background: "var(--tree-node-background-hover)"
    },
    svg: { color: e.color.lightest }
  },
  a: { color: "currentColor" }
})), cx = x(he)(({ theme: e }) => ({
  display: "none",
  "@media (min-width: 600px)": {
    display: "block",
    fontSize: "10px",
    overflow: "hidden",
    width: 1,
    height: "20px",
    boxSizing: "border-box",
    opacity: 0,
    padding: 0,
    "&:focus": {
      opacity: 1,
      padding: "5px 10px",
      background: "white",
      color: e.color.secondary,
      width: "auto"
    }
  }
})), px = /* @__PURE__ */ a((e) => {
  let t = De();
  return /* @__PURE__ */ s.createElement(Kn, { ...e, color: t.color.positive });
}, "SuccessStatusIcon"), dx = /* @__PURE__ */ a((e) => {
  let t = De();
  return /* @__PURE__ */ s.createElement(jn, { ...e, color: t.color.negative });
}, "ErrorStatusIcon"), fx = /* @__PURE__ */ a((e) => {
  let t = De();
  return /* @__PURE__ */ s.createElement($n, { ...e, color: t.color.warning });
}, "WarnStatusIcon"), mx = /* @__PURE__ */ a((e) => {
  let t = De();
  return /* @__PURE__ */ s.createElement(ut, { ...e, size: 12, color: t.color.defaultText });
}, "PendingStatusIcon"), qi = {
  "status-value:success": /* @__PURE__ */ s.createElement(px, null),
  "status-value:error": /* @__PURE__ */ s.createElement(dx, null),
  "status-value:warning": /* @__PURE__ */ s.createElement(fx, null),
  "status-value:pending": /* @__PURE__ */ s.createElement(mx, null),
  "status-value:unknown": null
};
var ap = [
  "status-value:success",
  "status-value:error",
  "status-value:warning",
  "status-value:pending",
  "status-value:unknown"
], lp = s.memo(/* @__PURE__ */ a(function({
  item: t,
  statuses: o,
  groupStatus: i,
  refId: r,
  docsMode: n,
  isOrphan: l,
  isDisplayed: u,
  isSelected: c,
  isFullyExpanded: d,
  setFullyExpanded: p,
  isExpanded: m,
  setExpanded: h,
  onSelectStoryId: b,
  api: f
}) {
  let { isDesktop: y, isMobile: S, setMobileMenuOpen: E } = ge(), { counts: g, statusesByValue: v } = Xc(t);
  if (!u)
    return null;
  let I = U(() => {
    if (t.type === "story" || t.type === "docs")
      return Object.entries(o).filter(([, _]) => _.sidebarContextMenu !== !1).sort((_, k) => ap.indexOf(_[1].value) - ap.indexOf(k[1].value)).
      map(([_, k]) => ({
        id: _,
        title: k.title,
        description: k.description,
        "aria-label": `Test status for ${k.title}: ${k.value}`,
        icon: qi[k.value],
        onClick: /* @__PURE__ */ a(() => {
          b(t.id), Ot.selectStatuses([k]);
        }, "onClick")
      }));
    if (t.type === "component" || t.type === "group") {
      let _ = [], k = g["status-value:error"], T = g["status-value:warning"];
      return k && _.push({
        id: "errors",
        icon: qi["status-value:error"],
        title: `${k} ${k === 1 ? "story" : "stories"} with errors`,
        onClick: /* @__PURE__ */ a(() => {
          let [C] = Object.entries(v["status-value:error"])[0];
          b(C);
          let P = Object.values(v["status-value:error"]).flat();
          Ot.selectStatuses(P);
        }, "onClick")
      }), T && _.push({
        id: "warnings",
        icon: qi["status-value:warning"],
        title: `${T} ${T === 1 ? "story" : "stories"} with warnings`,
        onClick: /* @__PURE__ */ a(() => {
          let [C] = Object.entries(v["status-value:warning"])[0];
          b(C);
          let P = Object.values(v["status-value:warning"]).flat();
          Ot.selectStatuses(P);
        }, "onClick")
      }), _;
    }
    return [];
  }, [g, t.id, t.type, b, o, v]), w = Rr(t.id, r), O = r === "storybook_internal" ? Yc(t, I, f) : { node: null, onMouseEnter: /* @__PURE__ */ a(
  () => {
  }, "onMouseEnter") };
  if (t.type === "story" || t.type === "docs") {
    let _ = t.type === "docs" ? rp : np, k = Ho(
      Object.values(o || {}).map((P) => P.value)
    ), [T, C] = Bo[k];
    return /* @__PURE__ */ s.createElement(
      sp,
      {
        key: w,
        className: "sidebar-item",
        "data-selected": c,
        "data-ref-id": r,
        "data-item-id": t.id,
        "data-parent-id": t.parent,
        "data-nodetype": t.type === "docs" ? "document" : "story",
        "data-highlightable": u,
        onMouseEnter: O.onMouseEnter
      },
      /* @__PURE__ */ s.createElement(
        _,
        {
          style: c ? {} : { color: C },
          href: Ec(t, r),
          id: w,
          depth: l ? t.depth : t.depth - 1,
          onClick: (P) => {
            P.preventDefault(), b(t.id), S && E(!1);
          },
          ...t.type === "docs" && { docsMode: n }
        },
        t.renderLabel?.(t, f) || t.name
      ),
      c && /* @__PURE__ */ s.createElement(cx, { asChild: !0 }, /* @__PURE__ */ s.createElement("a", { href: "#storybook-preview-wrapper" },
      "Skip to canvas")),
      O.node,
      T ? /* @__PURE__ */ s.createElement(
        zo,
        {
          "aria-label": `Test status: ${k.replace("status-value:", "")}`,
          role: "status",
          type: "button",
          status: k,
          selectedItem: c
        },
        T
      ) : null
    );
  }
  if (t.type === "root")
    return /* @__PURE__ */ s.createElement(
      ep,
      {
        key: w,
        id: w,
        className: "sidebar-subheading",
        "data-ref-id": r,
        "data-item-id": t.id,
        "data-nodetype": "root"
      },
      /* @__PURE__ */ s.createElement(
        ux,
        {
          type: "button",
          "data-action": "collapse-root",
          onClick: (_) => {
            _.preventDefault(), h({ ids: [t.id], value: !m });
          },
          "aria-expanded": m
        },
        /* @__PURE__ */ s.createElement(Kt, { isExpanded: m }),
        t.renderLabel?.(t, f) || t.name
      ),
      m && /* @__PURE__ */ s.createElement(
        ee,
        {
          className: "sidebar-subheading-action",
          "aria-label": d ? "Expand" : "Collapse",
          "data-action": "expand-all",
          "data-expanded": d,
          onClick: (_) => {
            _.preventDefault(), p();
          }
        },
        d ? /* @__PURE__ */ s.createElement(_n, null) : /* @__PURE__ */ s.createElement(Pn, null)
      )
    );
  if (t.type === "component" || t.type === "group") {
    let _ = i?.[t.id], k = _ ? Bo[_][1] : null, T = t.type === "component" ? op : tp;
    return /* @__PURE__ */ s.createElement(
      sp,
      {
        key: w,
        className: "sidebar-item",
        "data-ref-id": r,
        "data-item-id": t.id,
        "data-parent-id": t.parent,
        "data-nodetype": t.type,
        "data-highlightable": u,
        onMouseEnter: O.onMouseEnter
      },
      /* @__PURE__ */ s.createElement(
        T,
        {
          id: w,
          style: k ? { color: k } : {},
          "aria-controls": t.children && t.children[0],
          "aria-expanded": m,
          depth: l ? t.depth : t.depth - 1,
          isComponent: t.type === "component",
          isExpandable: t.children && t.children.length > 0,
          isExpanded: m,
          onClick: (C) => {
            C.preventDefault(), h({ ids: [t.id], value: !m }), t.type === "component" && !m && y && b(t.id);
          },
          onMouseEnter: () => {
            t.type === "component" && f.emit(Ct, {
              ids: [t.children[0]],
              options: { target: r }
            });
          }
        },
        t.renderLabel?.(t, f) || t.name
      ),
      O.node,
      ["status-value:error", "status-value:warning"].includes(_) && /* @__PURE__ */ s.createElement(zo, { type: "button", status: _ }, /* @__PURE__ */ s.
      createElement("svg", { key: "icon", viewBox: "0 0 6 6", width: "6", height: "6", type: "dot" }, /* @__PURE__ */ s.createElement(Me, { type: "\
dot" })))
    );
  }
  return null;
}, "Node")), hx = s.memo(/* @__PURE__ */ a(function({
  setExpanded: t,
  isFullyExpanded: o,
  expandableDescendants: i,
  ...r
}) {
  let n = A(
    () => t({ ids: i, value: !o }),
    [t, o, i]
  );
  return /* @__PURE__ */ s.createElement(
    lp,
    {
      ...r,
      setExpanded: t,
      isFullyExpanded: o,
      setFullyExpanded: n
    }
  );
}, "Root")), up = s.memo(/* @__PURE__ */ a(function({
  isBrowsing: t,
  isMain: o,
  refId: i,
  data: r,
  allStatuses: n,
  docsMode: l,
  highlightedRef: u,
  setHighlightedItemId: c,
  selectedStoryId: d,
  onSelectStoryId: p
}) {
  let m = q(null), h = oe(), [b, f, y] = U(
    () => Object.keys(r).reduce(
      (T, C) => {
        let P = r[C];
        return P.type === "root" ? T[0].push(C) : P.parent || T[1].push(C), P.type === "root" && P.startCollapsed && (T[2][C] = !1), T;
      },
      [[], [], {}]
    ),
    [r]
  ), { expandableDescendants: S } = U(() => [...f, ...b].reduce(
    (T, C) => (T.expandableDescendants[C] = st(r, C, !1).filter(
      (P) => !["story", "docs"].includes(r[P].type)
    ), T),
    { orphansFirst: [], expandableDescendants: {} }
  ), [r, b, f]), E = U(() => Object.keys(r).filter((T) => {
    let C = r[T];
    if (C.type !== "component")
      return !1;
    let { children: P = [], name: D } = C;
    if (P.length !== 1)
      return !1;
    let M = r[P[0]];
    return M.type === "docs" ? !0 : M.type === "story" ? Oc(M.name, D) : !1;
  }), [r]), g = U(
    () => Object.keys(r).filter((T) => !E.includes(T)),
    [E]
  ), v = U(() => E.reduce(
    (T, C) => {
      let { children: P, parent: D, name: M } = r[C], [F] = P;
      if (D) {
        let Z = [...r[D].children];
        Z[Z.indexOf(C)] = F, T[D] = { ...r[D], children: Z };
      }
      return T[F] = {
        ...r[F],
        name: M,
        parent: D,
        depth: r[F].depth - 1
      }, T;
    },
    { ...r }
  ), [r]), I = U(() => g.reduce(
    (T, C) => Object.assign(T, { [C]: Fo(v, C) }),
    {}
  ), [g, v]), [w, O] = ip({
    // @ts-expect-error (non strict)
    containerRef: m,
    isBrowsing: t,
    refId: i,
    data: v,
    initialExpanded: y,
    rootIds: b,
    highlightedRef: u,
    setHighlightedItemId: c,
    selectedStoryId: d,
    onSelectStoryId: p
  }), _ = U(
    () => Br(v, n ?? {}),
    [v, n]
  ), k = U(() => g.map((T) => {
    let C = v[T], P = Rr(T, i);
    if (C.type === "root") {
      let M = S[C.id], F = M.every((Z) => w[Z]);
      return (
        // @ts-expect-error (TODO)
        /* @__PURE__ */ s.createElement(
          hx,
          {
            api: h,
            key: P,
            item: C,
            refId: i,
            collapsedData: v,
            isOrphan: !1,
            isDisplayed: !0,
            isSelected: d === T,
            isExpanded: !!w[T],
            setExpanded: O,
            isFullyExpanded: F,
            expandableDescendants: M,
            onSelectStoryId: p
          }
        )
      );
    }
    let D = !C.parent || I[T].every((M) => w[M]);
    return D === !1 ? null : /* @__PURE__ */ s.createElement(
      lp,
      {
        api: h,
        collapsedData: v,
        key: P,
        item: C,
        statuses: n?.[T] ?? {},
        groupStatus: _,
        refId: i,
        docsMode: l,
        isOrphan: f.some((M) => T === M || T.startsWith(`${M}-`)),
        isDisplayed: D,
        isSelected: d === T,
        isExpanded: !!w[T],
        setExpanded: O,
        onSelectStoryId: p
      }
    );
  }), [
    I,
    h,
    v,
    g,
    l,
    S,
    w,
    _,
    p,
    f,
    i,
    d,
    O,
    n
  ]);
  return /* @__PURE__ */ s.createElement(Ki.Provider, { value: { data: r, allStatuses: n, groupStatus: _ } }, /* @__PURE__ */ s.createElement(
  lx, { ref: m, hasOrphans: o && f.length > 0 }, /* @__PURE__ */ s.createElement(Uc, null), k));
}, "Tree"));

// src/manager/components/sidebar/Refs.tsx
var gx = x.div(({ isMain: e }) => ({
  position: "relative",
  marginTop: e ? void 0 : 0
})), yx = x.div(({ theme: e }) => ({
  fontWeight: e.typography.weight.bold,
  fontSize: e.typography.size.s2,
  // Similar to ListItem.tsx
  textDecoration: "none",
  lineHeight: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "transparent",
  width: "100%",
  marginTop: 20,
  paddingTop: 16,
  paddingBottom: 12,
  borderTop: `1px solid ${e.appBorderColor}`,
  color: e.base === "light" ? e.color.defaultText : Te(0.2, e.color.defaultText)
})), bx = x.div({
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1,
  overflow: "hidden",
  marginLeft: 2
}), vx = x.button(({ theme: e }) => ({
  all: "unset",
  display: "flex",
  padding: "0px 8px",
  gap: 6,
  alignItems: "center",
  cursor: "pointer",
  overflow: "hidden",
  "&:focus": {
    borderColor: e.color.secondary,
    "span:first-of-type": {
      borderLeftColor: e.color.secondary
    }
  }
})), cp = s.memo(/* @__PURE__ */ a(function(t) {
  let { docsOptions: o } = Ne(), i = oe(), {
    filteredIndex: r,
    id: n,
    title: l = n,
    isLoading: u,
    isBrowsing: c,
    selectedStoryId: d,
    highlightedRef: p,
    setHighlighted: m,
    loginUrl: h,
    type: b,
    expanded: f = !0,
    indexError: y,
    previewInitialized: S,
    allStatuses: E
  } = t, g = U(() => r ? Object.keys(r).length : 0, [r]), v = q(null), I = n === at, O = u || (b === "auto-inject" && !S || b === "server-ch\
ecked") || b === "unknown", C = kc(O, !!h && g === 0, !!y, !O && g === 0), [P, D] = K(f);
  V(() => {
    r && d && r[d] && D(!0);
  }, [D, r, d]);
  let M = A(() => D((W) => !W), [D]), F = A(
    (W) => m({ itemId: W, refId: n }),
    [m]
  ), Z = A(
    // @ts-expect-error (non strict)
    (W) => i && i.selectStory(W, void 0, { ref: !I && n }),
    [i, I, n]
  );
  return /* @__PURE__ */ s.createElement(s.Fragment, null, I || /* @__PURE__ */ s.createElement(
    yx,
    {
      "aria-label": `${P ? "Hide" : "Show"} ${l} stories`,
      "aria-expanded": P
    },
    /* @__PURE__ */ s.createElement(vx, { "data-action": "collapse-ref", onClick: M }, /* @__PURE__ */ s.createElement(Kt, { isExpanded: P }),
    /* @__PURE__ */ s.createElement(bx, { title: l }, l)),
    /* @__PURE__ */ s.createElement(Rc, { ...t, state: C, ref: v })
  ), P && /* @__PURE__ */ s.createElement(gx, { "data-title": l, isMain: I }, C === "auth" && /* @__PURE__ */ s.createElement(Mc, { id: n, loginUrl: h }),
  C === "error" && /* @__PURE__ */ s.createElement(Lc, { error: y }), C === "loading" && /* @__PURE__ */ s.createElement(Fc, { isMain: I }),
  C === "empty" && /* @__PURE__ */ s.createElement(Nc, { isMain: I }), C === "ready" && /* @__PURE__ */ s.createElement(
    up,
    {
      allStatuses: E,
      isBrowsing: c,
      isMain: I,
      refId: n,
      data: r,
      docsMode: o.docsMode,
      selectedStoryId: d,
      onSelectStoryId: Z,
      highlightedRef: p,
      setHighlightedItemId: F
    }
  )));
}, "Ref"));

// src/manager/components/sidebar/useHighlighted.ts
var { document: Wr, window: pp } = se, dp = /* @__PURE__ */ a((e) => e ? { itemId: e.storyId, refId: e.refId } : null, "fromSelection"), fp = /* @__PURE__ */ a(
(e, t = {}, o = 1) => {
  let { containerRef: i, center: r = !1, attempts: n = 3, delay: l = 500 } = t, u = (i ? i.current : Wr)?.querySelector(e);
  u ? zt(u, r) : o <= n && setTimeout(fp, l, e, t, o + 1);
}, "scrollToSelector"), mp = /* @__PURE__ */ a(({
  containerRef: e,
  isLoading: t,
  isBrowsing: o,
  selected: i
}) => {
  let r = dp(i), n = q(r), [l, u] = K(r), c = oe(), d = A(
    (m) => {
      n.current = m, u(m);
    },
    [n]
  ), p = A(
    (m, h = !1) => {
      let b = m.getAttribute("data-item-id"), f = m.getAttribute("data-ref-id");
      !b || !f || (d({ itemId: b, refId: f }), zt(m, h));
    },
    [d]
  );
  return V(() => {
    let m = dp(i);
    d(m), m && fp(`[data-item-id="${m.itemId}"][data-ref-id="${m.refId}"]`, {
      containerRef: e,
      center: !0
    });
  }, [e, i, d]), V(() => {
    let m = Wr.getElementById("storybook-explorer-menu"), h, b = /* @__PURE__ */ a((f) => {
      if (t || !o || !e.current || !St(!1, f))
        return;
      let y = $e("ArrowUp", f), S = $e("ArrowDown", f);
      if (!(y || S))
        return;
      let E = pp.requestAnimationFrame(() => {
        pp.cancelAnimationFrame(h), h = E;
        let g = f.target;
        if (!Wt(m, g) && !Wt(g, m))
          return;
        g.hasAttribute("data-action") && g.blur();
        let v = Array.from(
          e.current?.querySelectorAll("[data-highlightable=true]") || []
        ), I = v.findIndex(
          (_) => _.getAttribute("data-item-id") === n.current?.itemId && _.getAttribute("data-ref-id") === n.current?.refId
        ), w = _c(v, I, y ? -1 : 1), O = y ? w === v.length - 1 : w === 0;
        if (p(v[w], O), v[w].getAttribute("data-nodetype") === "component") {
          let { itemId: _, refId: k } = n.current, T = c.resolveStory(_, k === "storybook_internal" ? void 0 : k);
          T.type === "component" && c.emit(Ct, {
            // @ts-expect-error (non strict)
            ids: [T.children[0]],
            options: { target: k }
          });
        }
      });
    }, "navigateTree");
    return Wr.addEventListener("keydown", b), () => Wr.removeEventListener("keydown", b);
  }, [t, o, n, p]), [l, d, n];
}, "useHighlighted");

// src/manager/components/sidebar/Explorer.tsx
var hp = s.memo(/* @__PURE__ */ a(function({
  isLoading: t,
  isBrowsing: o,
  dataset: i,
  selected: r
}) {
  let n = q(null), [l, u, c] = mp({
    containerRef: n,
    isLoading: t,
    isBrowsing: o,
    selected: r
  });
  return /* @__PURE__ */ s.createElement(
    "div",
    {
      ref: n,
      id: "storybook-explorer-tree",
      "data-highlighted-ref-id": l?.refId,
      "data-highlighted-item-id": l?.itemId
    },
    l && /* @__PURE__ */ s.createElement(Ic, { ...l }),
    i.entries.map(([d, p]) => /* @__PURE__ */ s.createElement(
      cp,
      {
        ...p,
        key: d,
        isLoading: t,
        isBrowsing: o,
        selectedStoryId: r?.refId === p.id ? r.storyId : null,
        highlightedRef: c,
        setHighlighted: u
      }
    ))
  );
}, "Explorer"));

// src/manager/components/sidebar/Brand.tsx
var xx = x(ir)(({ theme: e }) => ({
  width: "auto",
  height: "22px !important",
  display: "block",
  color: e.base === "light" ? e.color.defaultText : e.color.lightest
})), Ix = x.img({
  display: "block",
  maxWidth: "150px !important",
  maxHeight: "100px"
}), gp = x.a(({ theme: e }) => ({
  display: "inline-block",
  height: "100%",
  margin: "-3px -4px",
  padding: "2px 3px",
  border: "1px solid transparent",
  borderRadius: 3,
  color: "inherit",
  textDecoration: "none",
  "&:focus": {
    outline: 0,
    borderColor: e.color.secondary
  }
})), yp = wa(({ theme: e }) => {
  let { title: t = "Storybook", url: o = "./", image: i, target: r } = e.brand, n = r || (o === "./" ? "" : "_blank");
  if (i === null)
    return t === null ? null : o ? /* @__PURE__ */ s.createElement(gp, { href: o, target: n, dangerouslySetInnerHTML: { __html: t } }) : /* @__PURE__ */ s.
    createElement("div", { dangerouslySetInnerHTML: { __html: t } });
  let l = i ? /* @__PURE__ */ s.createElement(Ix, { src: i, alt: t }) : /* @__PURE__ */ s.createElement(xx, { alt: t });
  return o ? /* @__PURE__ */ s.createElement(gp, { title: t, href: o, target: n }, l) : /* @__PURE__ */ s.createElement("div", null, l);
});

// src/manager/components/sidebar/Menu.tsx
var Yi = x(ee)(({ highlighted: e, theme: t, isMobile: o }) => ({
  position: "relative",
  overflow: "visible",
  marginTop: 0,
  zIndex: 1,
  ...o && {
    width: 36,
    height: 36
  },
  ...e && {
    "&:before, &:after": {
      content: '""',
      position: "absolute",
      top: 6,
      right: 6,
      width: 5,
      height: 5,
      zIndex: 2,
      borderRadius: "50%",
      background: t.background.app,
      border: `1px solid ${t.background.app}`,
      boxShadow: `0 0 0 2px ${t.background.app}`
    },
    "&:after": {
      background: t.color.positive,
      border: "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: `0 0 0 2px ${t.background.app}`
    },
    "&:hover:after, &:focus-visible:after": {
      boxShadow: `0 0 0 2px ${Te(0.88, t.color.secondary)}`
    }
  }
})), Sx = x.div({
  display: "flex",
  gap: 6
}), wx = /* @__PURE__ */ a(({ menu: e, onClick: t }) => /* @__PURE__ */ s.createElement(ot, { links: e, onClick: t }), "SidebarMenuList"), bp = /* @__PURE__ */ a(
({ menu: e, isHighlighted: t, onClick: o }) => {
  let [i, r] = K(!1), { isMobile: n, setMobileMenuOpen: l } = ge();
  return n ? /* @__PURE__ */ s.createElement(Sx, null, /* @__PURE__ */ s.createElement(
    Yi,
    {
      title: "About Storybook",
      "aria-label": "About Storybook",
      highlighted: !!t,
      active: !1,
      onClick: o,
      isMobile: !0
    },
    /* @__PURE__ */ s.createElement(Yo, null)
  ), /* @__PURE__ */ s.createElement(
    Yi,
    {
      title: "Close menu",
      "aria-label": "Close menu",
      highlighted: !1,
      active: !1,
      onClick: () => l(!1),
      isMobile: !0
    },
    /* @__PURE__ */ s.createElement(je, null)
  )) : /* @__PURE__ */ s.createElement(
    ve,
    {
      placement: "top",
      closeOnOutsideClick: !0,
      tooltip: ({ onHide: u }) => /* @__PURE__ */ s.createElement(wx, { onClick: u, menu: e }),
      onVisibleChange: r
    },
    /* @__PURE__ */ s.createElement(
      Yi,
      {
        title: "Shortcuts",
        "aria-label": "Shortcuts",
        highlighted: !!t,
        active: i,
        size: "medium",
        isMobile: !1
      },
      /* @__PURE__ */ s.createElement(Yo, null)
    )
  );
}, "SidebarMenu");

// src/manager/components/sidebar/Heading.tsx
var Ex = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  fontWeight: e.typography.weight.bold,
  color: e.color.defaultText,
  marginRight: 20,
  display: "flex",
  width: "100%",
  alignItems: "center",
  minHeight: 22,
  "& > * > *": {
    maxWidth: "100%"
  },
  "& > *": {
    maxWidth: "100%",
    height: "auto",
    display: "block",
    flex: "1 1 auto"
  }
})), Tx = x.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "relative",
  minHeight: 42,
  paddingLeft: 8
}), Cx = x(he)(({ theme: e }) => ({
  display: "none",
  "@media (min-width: 600px)": {
    display: "block",
    position: "absolute",
    fontSize: e.typography.size.s1,
    zIndex: 3,
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    wordWrap: "normal",
    opacity: 0,
    transition: "opacity 150ms ease-out",
    "&:focus": {
      width: "100%",
      height: "inherit",
      padding: "10px 15px",
      margin: 0,
      clip: "unset",
      overflow: "unset",
      opacity: 1
    }
  }
})), vp = /* @__PURE__ */ a(({
  menuHighlighted: e = !1,
  menu: t,
  skipLinkHref: o,
  isLoading: i,
  onMenuClick: r,
  ...n
}) => /* @__PURE__ */ s.createElement(Tx, { ...n }, o && /* @__PURE__ */ s.createElement(Cx, { asChild: !0 }, /* @__PURE__ */ s.createElement(
"a", { href: o, tabIndex: 0 }, "Skip to canvas")), /* @__PURE__ */ s.createElement(Ex, null, /* @__PURE__ */ s.createElement(yp, null)), /* @__PURE__ */ s.
createElement(bp, { menu: t, isHighlighted: e, onClick: r })), "Heading");

// ../node_modules/downshift/dist/downshift.esm.js
var Y = Ve(ni());
var Px = Ve(wp());

// ../node_modules/compute-scroll-into-view/dist/index.js
var Ep = /* @__PURE__ */ a((e) => typeof e == "object" && e != null && e.nodeType === 1, "t"), Tp = /* @__PURE__ */ a((e, t) => (!t || e !==
"hidden") && e !== "visible" && e !== "clip", "e"), Zr = /* @__PURE__ */ a((e, t) => {
  if (e.clientHeight < e.scrollHeight || e.clientWidth < e.scrollWidth) {
    let o = getComputedStyle(e, null);
    return Tp(o.overflowY, t) || Tp(o.overflowX, t) || ((i) => {
      let r = ((n) => {
        if (!n.ownerDocument || !n.ownerDocument.defaultView) return null;
        try {
          return n.ownerDocument.defaultView.frameElement;
        } catch {
          return null;
        }
      })(i);
      return !!r && (r.clientHeight < i.scrollHeight || r.clientWidth < i.scrollWidth);
    })(e);
  }
  return !1;
}, "n"), Jr = /* @__PURE__ */ a((e, t, o, i, r, n, l, u) => n < e && l > t || n > e && l < t ? 0 : n <= e && u <= o || l >= t && u >= o ? n -
e - i : l > t && u < o || n < e && u > o ? l - t + r : 0, "o"), Ox = /* @__PURE__ */ a((e) => {
  let t = e.parentElement;
  return t ?? (e.getRootNode().host || null);
}, "l"), Cp = /* @__PURE__ */ a((e, t) => {
  var o, i, r, n;
  if (typeof document > "u") return [];
  let { scrollMode: l, block: u, inline: c, boundary: d, skipOverflowHiddenElements: p } = t, m = typeof d == "function" ? d : (W) => W !== d;
  if (!Ep(e)) throw new TypeError("Invalid target");
  let h = document.scrollingElement || document.documentElement, b = [], f = e;
  for (; Ep(f) && m(f); ) {
    if (f = Ox(f), f === h) {
      b.push(f);
      break;
    }
    f != null && f === document.body && Zr(f) && !Zr(document.documentElement) || f != null && Zr(f, p) && b.push(f);
  }
  let y = (i = (o = window.visualViewport) == null ? void 0 : o.width) != null ? i : innerWidth, S = (n = (r = window.visualViewport) == null ?
  void 0 : r.height) != null ? n : innerHeight, { scrollX: E, scrollY: g } = window, { height: v, width: I, top: w, right: O, bottom: _, left: k } = e.
  getBoundingClientRect(), { top: T, right: C, bottom: P, left: D } = ((W) => {
    let Q = window.getComputedStyle(W);
    return { top: parseFloat(Q.scrollMarginTop) || 0, right: parseFloat(Q.scrollMarginRight) || 0, bottom: parseFloat(Q.scrollMarginBottom) ||
    0, left: parseFloat(Q.scrollMarginLeft) || 0 };
  })(e), M = u === "start" || u === "nearest" ? w - T : u === "end" ? _ + P : w + v / 2 - T + P, F = c === "center" ? k + I / 2 - D + C : c ===
  "end" ? O + C : k - D, Z = [];
  for (let W = 0; W < b.length; W++) {
    let Q = b[W], { height: H, width: G, top: z, right: re, bottom: R, left: B } = Q.getBoundingClientRect();
    if (l === "if-needed" && w >= 0 && k >= 0 && _ <= S && O <= y && (Q === h && !Zr(Q) || w >= z && _ <= R && k >= B && O <= re)) return Z;
    let L = getComputedStyle(Q), $ = parseInt(L.borderLeftWidth, 10), J = parseInt(L.borderTopWidth, 10), ie = parseInt(L.borderRightWidth, 10),
    te = parseInt(L.borderBottomWidth, 10), de = 0, ae = 0, ce = "offsetWidth" in Q ? Q.offsetWidth - Q.clientWidth - $ - ie : 0, ue = "offs\
etHeight" in Q ? Q.offsetHeight - Q.clientHeight - J - te : 0, Ie = "offsetWidth" in Q ? Q.offsetWidth === 0 ? 0 : G / Q.offsetWidth : 0, ye = "\
offsetHeight" in Q ? Q.offsetHeight === 0 ? 0 : H / Q.offsetHeight : 0;
    if (h === Q) de = u === "start" ? M : u === "end" ? M - S : u === "nearest" ? Jr(g, g + S, S, J, te, g + M, g + M + v, v) : M - S / 2, ae =
    c === "start" ? F : c === "center" ? F - y / 2 : c === "end" ? F - y : Jr(E, E + y, y, $, ie, E + F, E + F + I, I), de = Math.max(0, de +
    g), ae = Math.max(0, ae + E);
    else {
      de = u === "start" ? M - z - J : u === "end" ? M - R + te + ue : u === "nearest" ? Jr(z, R, H, J, te + ue, M, M + v, v) : M - (z + H /
      2) + ue / 2, ae = c === "start" ? F - B - $ : c === "center" ? F - (B + G / 2) + ce / 2 : c === "end" ? F - re + ie + ce : Jr(B, re, G,
      $, ie + ce, F, F + I, I);
      let { scrollLeft: Oe, scrollTop: fe } = Q;
      de = ye === 0 ? 0 : Math.max(0, Math.min(fe + de / ye, Q.scrollHeight - H / ye + ue)), ae = Ie === 0 ? 0 : Math.max(0, Math.min(Oe + ae /
      Ie, Q.scrollWidth - G / Ie + ce)), M += fe - de, F += Oe - ae;
    }
    Z.push({ el: Q, top: de, left: ae });
  }
  return Z;
}, "r");

// ../node_modules/tslib/tslib.es6.mjs
var $t = /* @__PURE__ */ a(function() {
  return $t = Object.assign || /* @__PURE__ */ a(function(t) {
    for (var o, i = 1, r = arguments.length; i < r; i++) {
      o = arguments[i];
      for (var n in o) Object.prototype.hasOwnProperty.call(o, n) && (t[n] = o[n]);
    }
    return t;
  }, "__assign"), $t.apply(this, arguments);
}, "__assign");

// ../node_modules/downshift/dist/downshift.esm.js
var Ax = 0;
function _p(e) {
  return typeof e == "function" ? e : Re;
}
a(_p, "cbToCb");
function Re() {
}
a(Re, "noop");
function Lp(e, t) {
  if (e) {
    var o = Cp(e, {
      boundary: t,
      block: "nearest",
      scrollMode: "if-needed"
    });
    o.forEach(function(i) {
      var r = i.el, n = i.top, l = i.left;
      r.scrollTop = n, r.scrollLeft = l;
    });
  }
}
a(Lp, "scrollIntoView");
function kp(e, t, o) {
  var i = e === t || t instanceof o.Node && e.contains && e.contains(t);
  return i;
}
a(kp, "isOrContainsNode");
function fn(e, t) {
  var o;
  function i() {
    o && clearTimeout(o);
  }
  a(i, "cancel");
  function r() {
    for (var n = arguments.length, l = new Array(n), u = 0; u < n; u++)
      l[u] = arguments[u];
    i(), o = setTimeout(function() {
      o = null, e.apply(void 0, l);
    }, t);
  }
  return a(r, "wrapper"), r.cancel = i, r;
}
a(fn, "debounce");
function le() {
  for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++)
    t[o] = arguments[o];
  return function(i) {
    for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), l = 1; l < r; l++)
      n[l - 1] = arguments[l];
    return t.some(function(u) {
      return u && u.apply(void 0, [i].concat(n)), i.preventDownshiftDefault || i.hasOwnProperty("nativeEvent") && i.nativeEvent.preventDownshiftDefault;
    });
  };
}
a(le, "callAllEventHandlers");
function Ze() {
  for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++)
    t[o] = arguments[o];
  return function(i) {
    t.forEach(function(r) {
      typeof r == "function" ? r(i) : r && (r.current = i);
    });
  };
}
a(Ze, "handleRefs");
function Np() {
  return String(Ax++);
}
a(Np, "generateId");
function Dx(e) {
  var t = e.isOpen, o = e.resultCount, i = e.previousResultCount;
  return t ? o ? o !== i ? o + " result" + (o === 1 ? " is" : "s are") + " available, use up and down arrow keys to navigate. Press Enter ke\
y to select." : "" : "No results are available." : "";
}
a(Dx, "getA11yStatusMessage");
function Op(e, t) {
  return e = Array.isArray(e) ? (
    /* istanbul ignore next (preact) */
    e[0]
  ) : e, !e && t ? t : e;
}
a(Op, "unwrapArray");
function Mx(e) {
  return typeof e.type == "string";
}
a(Mx, "isDOMElement");
function Lx(e) {
  return e.props;
}
a(Lx, "getElementProps");
var Nx = ["highlightedIndex", "inputValue", "isOpen", "selectedItem", "type"];
function en(e) {
  e === void 0 && (e = {});
  var t = {};
  return Nx.forEach(function(o) {
    e.hasOwnProperty(o) && (t[o] = e[o]);
  }), t;
}
a(en, "pickState");
function Vo(e, t) {
  return !e || !t ? e : Object.keys(e).reduce(function(o, i) {
    return o[i] = sn(t, i) ? t[i] : e[i], o;
  }, {});
}
a(Vo, "getState");
function sn(e, t) {
  return e[t] !== void 0;
}
a(sn, "isControlledProp");
function po(e) {
  var t = e.key, o = e.keyCode;
  return o >= 37 && o <= 40 && t.indexOf("Arrow") !== 0 ? "Arrow" + t : t;
}
a(po, "normalizeArrowKey");
function Je(e, t, o, i, r) {
  r === void 0 && (r = !1);
  var n = o.length;
  if (n === 0)
    return -1;
  var l = n - 1;
  (typeof e != "number" || e < 0 || e > l) && (e = t > 0 ? -1 : l + 1);
  var u = e + t;
  u < 0 ? u = r ? l : 0 : u > l && (u = r ? 0 : l);
  var c = wt(u, t < 0, o, i, r);
  return c === -1 ? e >= n ? -1 : e : c;
}
a(Je, "getHighlightedIndex");
function wt(e, t, o, i, r) {
  r === void 0 && (r = !1);
  var n = o.length;
  if (t) {
    for (var l = e; l >= 0; l--)
      if (!i(o[l], l))
        return l;
  } else
    for (var u = e; u < n; u++)
      if (!i(o[u], u))
        return u;
  return r ? wt(t ? n - 1 : 0, t, o, i) : -1;
}
a(wt, "getNonDisabledIndex");
function an(e, t, o, i) {
  return i === void 0 && (i = !0), o && t.some(function(r) {
    return r && (kp(r, e, o) || i && kp(r, o.document.activeElement, o));
  });
}
a(an, "targetWithinDownshift");
var Fx = fn(function(e) {
  Fp(e).textContent = "";
}, 500);
function Fp(e) {
  var t = e.getElementById("a11y-status-message");
  return t || (t = e.createElement("div"), t.setAttribute("id", "a11y-status-message"), t.setAttribute("role", "status"), t.setAttribute("ar\
ia-live", "polite"), t.setAttribute("aria-relevant", "additions text"), Object.assign(t.style, {
    border: "0",
    clip: "rect(0 0 0 0)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: "0",
    position: "absolute",
    width: "1px"
  }), e.body.appendChild(t), t);
}
a(Fp, "getStatusDiv");
function Rp(e, t) {
  if (!(!e || !t)) {
    var o = Fp(t);
    o.textContent = e, Fx(t);
  }
}
a(Rp, "setStatus");
function Rx(e) {
  var t = e?.getElementById("a11y-status-message");
  t && t.remove();
}
a(Rx, "cleanupStatusDiv");
var Bp = 0, Hp = 1, zp = 2, tn = 3, on = 4, Wp = 5, Vp = 6, jp = 7, Kp = 8, $p = 9, Up = 10, Gp = 11, qp = 12, Yp = 13, Qp = 14, Xp = 15, Zp = 16,
Bx = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  blurButton: Qp,
  blurInput: Up,
  changeInput: Gp,
  clickButton: Yp,
  clickItem: $p,
  controlledPropUpdatedSelectedItem: Xp,
  itemMouseEnter: zp,
  keyDownArrowDown: on,
  keyDownArrowUp: tn,
  keyDownEnd: Kp,
  keyDownEnter: Vp,
  keyDownEscape: Wp,
  keyDownHome: jp,
  keyDownSpaceButton: qp,
  mouseUp: Hp,
  touchEnd: Zp,
  unknown: Bp
}), Hx = ["refKey", "ref"], zx = ["onClick", "onPress", "onKeyDown", "onKeyUp", "onBlur"], Wx = ["onKeyDown", "onBlur", "onChange", "onInput",
"onChangeText"], Vx = ["refKey", "ref"], jx = ["onMouseMove", "onMouseDown", "onClick", "onPress", "index", "item"], qt = /* @__PURE__ */ function() {
  var e = /* @__PURE__ */ function(t) {
    function o(r) {
      var n;
      n = t.call(this, r) || this, n.id = n.props.id || "downshift-" + Np(), n.menuId = n.props.menuId || n.id + "-menu", n.labelId = n.props.
      labelId || n.id + "-label", n.inputId = n.props.inputId || n.id + "-input", n.getItemId = n.props.getItemId || function(g) {
        return n.id + "-item-" + g;
      }, n.items = [], n.itemCount = null, n.previousResultCount = 0, n.timeoutIds = [], n.internalSetTimeout = function(g, v) {
        var I = setTimeout(function() {
          n.timeoutIds = n.timeoutIds.filter(function(w) {
            return w !== I;
          }), g();
        }, v);
        n.timeoutIds.push(I);
      }, n.setItemCount = function(g) {
        n.itemCount = g;
      }, n.unsetItemCount = function() {
        n.itemCount = null;
      }, n.isItemDisabled = function(g, v) {
        var I = n.getItemNodeFromIndex(v);
        return I && I.hasAttribute("disabled");
      }, n.setHighlightedIndex = function(g, v) {
        g === void 0 && (g = n.props.defaultHighlightedIndex), v === void 0 && (v = {}), v = en(v), n.internalSetState(j({
          highlightedIndex: g
        }, v));
      }, n.clearSelection = function(g) {
        n.internalSetState({
          selectedItem: null,
          inputValue: "",
          highlightedIndex: n.props.defaultHighlightedIndex,
          isOpen: n.props.defaultIsOpen
        }, g);
      }, n.selectItem = function(g, v, I) {
        v = en(v), n.internalSetState(j({
          isOpen: n.props.defaultIsOpen,
          highlightedIndex: n.props.defaultHighlightedIndex,
          selectedItem: g,
          inputValue: n.props.itemToString(g)
        }, v), I);
      }, n.selectItemAtIndex = function(g, v, I) {
        var w = n.items[g];
        w != null && n.selectItem(w, v, I);
      }, n.selectHighlightedItem = function(g, v) {
        return n.selectItemAtIndex(n.getState().highlightedIndex, g, v);
      }, n.internalSetState = function(g, v) {
        var I, w, O = {}, _ = typeof g == "function";
        return !_ && g.hasOwnProperty("inputValue") && n.props.onInputValueChange(g.inputValue, j({}, n.getStateAndHelpers(), g)), n.setState(
        function(k) {
          var T;
          k = n.getState(k);
          var C = _ ? g(k) : g;
          C = n.props.stateReducer(k, C), I = C.hasOwnProperty("selectedItem");
          var P = {};
          return I && C.selectedItem !== k.selectedItem && (w = C.selectedItem), (T = C).type || (T.type = Bp), Object.keys(C).forEach(function(D) {
            k[D] !== C[D] && (O[D] = C[D]), D !== "type" && (C[D], sn(n.props, D) || (P[D] = C[D]));
          }), _ && C.hasOwnProperty("inputValue") && n.props.onInputValueChange(C.inputValue, j({}, n.getStateAndHelpers(), C)), P;
        }, function() {
          _p(v)();
          var k = Object.keys(O).length > 1;
          k && n.props.onStateChange(O, n.getStateAndHelpers()), I && n.props.onSelect(g.selectedItem, n.getStateAndHelpers()), w !== void 0 &&
          n.props.onChange(w, n.getStateAndHelpers()), n.props.onUserAction(O, n.getStateAndHelpers());
        });
      }, n.rootRef = function(g) {
        return n._rootNode = g;
      }, n.getRootProps = function(g, v) {
        var I, w = g === void 0 ? {} : g, O = w.refKey, _ = O === void 0 ? "ref" : O, k = w.ref, T = ke(w, Hx), C = v === void 0 ? {} : v, P = C.
        suppressRefError, D = P === void 0 ? !1 : P;
        n.getRootProps.called = !0, n.getRootProps.refKey = _, n.getRootProps.suppressRefError = D;
        var M = n.getState(), F = M.isOpen;
        return j((I = {}, I[_] = Ze(k, n.rootRef), I.role = "combobox", I["aria-expanded"] = F, I["aria-haspopup"] = "listbox", I["aria-owns"] =
        F ? n.menuId : void 0, I["aria-labelledby"] = n.labelId, I), T);
      }, n.keyDownHandlers = {
        ArrowDown: /* @__PURE__ */ a(function(v) {
          var I = this;
          if (v.preventDefault(), this.getState().isOpen) {
            var w = v.shiftKey ? 5 : 1;
            this.moveHighlightedIndex(w, {
              type: on
            });
          } else
            this.internalSetState({
              isOpen: !0,
              type: on
            }, function() {
              var O = I.getItemCount();
              if (O > 0) {
                var _ = I.getState(), k = _.highlightedIndex, T = Je(k, 1, {
                  length: O
                }, I.isItemDisabled, !0);
                I.setHighlightedIndex(T, {
                  type: on
                });
              }
            });
        }, "ArrowDown"),
        ArrowUp: /* @__PURE__ */ a(function(v) {
          var I = this;
          if (v.preventDefault(), this.getState().isOpen) {
            var w = v.shiftKey ? -5 : -1;
            this.moveHighlightedIndex(w, {
              type: tn
            });
          } else
            this.internalSetState({
              isOpen: !0,
              type: tn
            }, function() {
              var O = I.getItemCount();
              if (O > 0) {
                var _ = I.getState(), k = _.highlightedIndex, T = Je(k, -1, {
                  length: O
                }, I.isItemDisabled, !0);
                I.setHighlightedIndex(T, {
                  type: tn
                });
              }
            });
        }, "ArrowUp"),
        Enter: /* @__PURE__ */ a(function(v) {
          if (v.which !== 229) {
            var I = this.getState(), w = I.isOpen, O = I.highlightedIndex;
            if (w && O != null) {
              v.preventDefault();
              var _ = this.items[O], k = this.getItemNodeFromIndex(O);
              if (_ == null || k && k.hasAttribute("disabled"))
                return;
              this.selectHighlightedItem({
                type: Vp
              });
            }
          }
        }, "Enter"),
        Escape: /* @__PURE__ */ a(function(v) {
          v.preventDefault(), this.reset(j({
            type: Wp
          }, !this.state.isOpen && {
            selectedItem: null,
            inputValue: ""
          }));
        }, "Escape")
      }, n.buttonKeyDownHandlers = j({}, n.keyDownHandlers, {
        " ": /* @__PURE__ */ a(function(v) {
          v.preventDefault(), this.toggleMenu({
            type: qp
          });
        }, "_")
      }), n.inputKeyDownHandlers = j({}, n.keyDownHandlers, {
        Home: /* @__PURE__ */ a(function(v) {
          var I = this.getState(), w = I.isOpen;
          if (w) {
            v.preventDefault();
            var O = this.getItemCount();
            if (!(O <= 0 || !w)) {
              var _ = wt(0, !1, {
                length: O
              }, this.isItemDisabled);
              this.setHighlightedIndex(_, {
                type: jp
              });
            }
          }
        }, "Home"),
        End: /* @__PURE__ */ a(function(v) {
          var I = this.getState(), w = I.isOpen;
          if (w) {
            v.preventDefault();
            var O = this.getItemCount();
            if (!(O <= 0 || !w)) {
              var _ = wt(O - 1, !0, {
                length: O
              }, this.isItemDisabled);
              this.setHighlightedIndex(_, {
                type: Kp
              });
            }
          }
        }, "End")
      }), n.getToggleButtonProps = function(g) {
        var v = g === void 0 ? {} : g, I = v.onClick;
        v.onPress;
        var w = v.onKeyDown, O = v.onKeyUp, _ = v.onBlur, k = ke(v, zx), T = n.getState(), C = T.isOpen, P = {
          onClick: le(I, n.buttonHandleClick),
          onKeyDown: le(w, n.buttonHandleKeyDown),
          onKeyUp: le(O, n.buttonHandleKeyUp),
          onBlur: le(_, n.buttonHandleBlur)
        }, D = k.disabled ? {} : P;
        return j({
          type: "button",
          role: "button",
          "aria-label": C ? "close menu" : "open menu",
          "aria-haspopup": !0,
          "data-toggle": !0
        }, D, k);
      }, n.buttonHandleKeyUp = function(g) {
        g.preventDefault();
      }, n.buttonHandleKeyDown = function(g) {
        var v = po(g);
        n.buttonKeyDownHandlers[v] && n.buttonKeyDownHandlers[v].call(n, g);
      }, n.buttonHandleClick = function(g) {
        if (g.preventDefault(), n.props.environment) {
          var v = n.props.environment.document, I = v.body, w = v.activeElement;
          I && I === w && g.target.focus();
        }
        n.internalSetTimeout(function() {
          return n.toggleMenu({
            type: Yp
          });
        });
      }, n.buttonHandleBlur = function(g) {
        var v = g.target;
        n.internalSetTimeout(function() {
          if (!(n.isMouseDown || !n.props.environment)) {
            var I = n.props.environment.document.activeElement;
            (I == null || I.id !== n.inputId) && I !== v && n.reset({
              type: Qp
            });
          }
        });
      }, n.getLabelProps = function(g) {
        return j({
          htmlFor: n.inputId,
          id: n.labelId
        }, g);
      }, n.getInputProps = function(g) {
        var v = g === void 0 ? {} : g, I = v.onKeyDown, w = v.onBlur, O = v.onChange, _ = v.onInput;
        v.onChangeText;
        var k = ke(v, Wx), T, C = {};
        T = "onChange";
        var P = n.getState(), D = P.inputValue, M = P.isOpen, F = P.highlightedIndex;
        if (!k.disabled) {
          var Z;
          C = (Z = {}, Z[T] = le(O, _, n.inputHandleChange), Z.onKeyDown = le(I, n.inputHandleKeyDown), Z.onBlur = le(w, n.inputHandleBlur),
          Z);
        }
        return j({
          "aria-autocomplete": "list",
          "aria-activedescendant": M && typeof F == "number" && F >= 0 ? n.getItemId(F) : void 0,
          "aria-controls": M ? n.menuId : void 0,
          "aria-labelledby": k && k["aria-label"] ? void 0 : n.labelId,
          // https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
          // revert back since autocomplete="nope" is ignored on latest Chrome and Opera
          autoComplete: "off",
          value: D,
          id: n.inputId
        }, C, k);
      }, n.inputHandleKeyDown = function(g) {
        var v = po(g);
        v && n.inputKeyDownHandlers[v] && n.inputKeyDownHandlers[v].call(n, g);
      }, n.inputHandleChange = function(g) {
        n.internalSetState({
          type: Gp,
          isOpen: !0,
          inputValue: g.target.value,
          highlightedIndex: n.props.defaultHighlightedIndex
        });
      }, n.inputHandleBlur = function() {
        n.internalSetTimeout(function() {
          var g;
          if (!(n.isMouseDown || !n.props.environment)) {
            var v = n.props.environment.document.activeElement, I = (v == null || (g = v.dataset) == null ? void 0 : g.toggle) && n._rootNode &&
            n._rootNode.contains(v);
            I || n.reset({
              type: Up
            });
          }
        });
      }, n.menuRef = function(g) {
        n._menuNode = g;
      }, n.getMenuProps = function(g, v) {
        var I, w = g === void 0 ? {} : g, O = w.refKey, _ = O === void 0 ? "ref" : O, k = w.ref, T = ke(w, Vx), C = v === void 0 ? {} : v, P = C.
        suppressRefError, D = P === void 0 ? !1 : P;
        return n.getMenuProps.called = !0, n.getMenuProps.refKey = _, n.getMenuProps.suppressRefError = D, j((I = {}, I[_] = Ze(k, n.menuRef),
        I.role = "listbox", I["aria-labelledby"] = T && T["aria-label"] ? void 0 : n.labelId, I.id = n.menuId, I), T);
      }, n.getItemProps = function(g) {
        var v, I = g === void 0 ? {} : g, w = I.onMouseMove, O = I.onMouseDown, _ = I.onClick;
        I.onPress;
        var k = I.index, T = I.item, C = T === void 0 ? (
          /* istanbul ignore next */
          void 0
        ) : T, P = ke(I, jx);
        k === void 0 ? (n.items.push(C), k = n.items.indexOf(C)) : n.items[k] = C;
        var D = "onClick", M = _, F = (v = {
          // onMouseMove is used over onMouseEnter here. onMouseMove
          // is only triggered on actual mouse movement while onMouseEnter
          // can fire on DOM changes, interrupting keyboard navigation
          onMouseMove: le(w, function() {
            k !== n.getState().highlightedIndex && (n.setHighlightedIndex(k, {
              type: zp
            }), n.avoidScrolling = !0, n.internalSetTimeout(function() {
              return n.avoidScrolling = !1;
            }, 250));
          }),
          onMouseDown: le(O, function(W) {
            W.preventDefault();
          })
        }, v[D] = le(M, function() {
          n.selectItemAtIndex(k, {
            type: $p
          });
        }), v), Z = P.disabled ? {
          onMouseDown: F.onMouseDown
        } : F;
        return j({
          id: n.getItemId(k),
          role: "option",
          "aria-selected": n.getState().highlightedIndex === k
        }, Z, P);
      }, n.clearItems = function() {
        n.items = [];
      }, n.reset = function(g, v) {
        g === void 0 && (g = {}), g = en(g), n.internalSetState(function(I) {
          var w = I.selectedItem;
          return j({
            isOpen: n.props.defaultIsOpen,
            highlightedIndex: n.props.defaultHighlightedIndex,
            inputValue: n.props.itemToString(w)
          }, g);
        }, v);
      }, n.toggleMenu = function(g, v) {
        g === void 0 && (g = {}), g = en(g), n.internalSetState(function(I) {
          var w = I.isOpen;
          return j({
            isOpen: !w
          }, w && {
            highlightedIndex: n.props.defaultHighlightedIndex
          }, g);
        }, function() {
          var I = n.getState(), w = I.isOpen, O = I.highlightedIndex;
          w && n.getItemCount() > 0 && typeof O == "number" && n.setHighlightedIndex(O, g), _p(v)();
        });
      }, n.openMenu = function(g) {
        n.internalSetState({
          isOpen: !0
        }, g);
      }, n.closeMenu = function(g) {
        n.internalSetState({
          isOpen: !1
        }, g);
      }, n.updateStatus = fn(function() {
        var g;
        if ((g = n.props) != null && (g = g.environment) != null && g.document) {
          var v = n.getState(), I = n.items[v.highlightedIndex], w = n.getItemCount(), O = n.props.getA11yStatusMessage(j({
            itemToString: n.props.itemToString,
            previousResultCount: n.previousResultCount,
            resultCount: w,
            highlightedItem: I
          }, v));
          n.previousResultCount = w, Rp(O, n.props.environment.document);
        }
      }, 200);
      var l = n.props, u = l.defaultHighlightedIndex, c = l.initialHighlightedIndex, d = c === void 0 ? u : c, p = l.defaultIsOpen, m = l.initialIsOpen,
      h = m === void 0 ? p : m, b = l.initialInputValue, f = b === void 0 ? "" : b, y = l.initialSelectedItem, S = y === void 0 ? null : y, E = n.
      getState({
        highlightedIndex: d,
        isOpen: h,
        inputValue: f,
        selectedItem: S
      });
      return E.selectedItem != null && n.props.initialInputValue === void 0 && (E.inputValue = n.props.itemToString(E.selectedItem)), n.state =
      E, n;
    }
    a(o, "Downshift"), no(o, t);
    var i = o.prototype;
    return i.internalClearTimeouts = /* @__PURE__ */ a(function() {
      this.timeoutIds.forEach(function(n) {
        clearTimeout(n);
      }), this.timeoutIds = [];
    }, "internalClearTimeouts"), i.getState = /* @__PURE__ */ a(function(n) {
      return n === void 0 && (n = this.state), Vo(n, this.props);
    }, "getState$1"), i.getItemCount = /* @__PURE__ */ a(function() {
      var n = this.items.length;
      return this.itemCount != null ? n = this.itemCount : this.props.itemCount !== void 0 && (n = this.props.itemCount), n;
    }, "getItemCount"), i.getItemNodeFromIndex = /* @__PURE__ */ a(function(n) {
      return this.props.environment ? this.props.environment.document.getElementById(this.getItemId(n)) : null;
    }, "getItemNodeFromIndex"), i.scrollHighlightedItemIntoView = /* @__PURE__ */ a(function() {
      {
        var n = this.getItemNodeFromIndex(this.getState().highlightedIndex);
        this.props.scrollIntoView(n, this._menuNode);
      }
    }, "scrollHighlightedItemIntoView"), i.moveHighlightedIndex = /* @__PURE__ */ a(function(n, l) {
      var u = this.getItemCount(), c = this.getState(), d = c.highlightedIndex;
      if (u > 0) {
        var p = Je(d, n, {
          length: u
        }, this.isItemDisabled, !0);
        this.setHighlightedIndex(p, l);
      }
    }, "moveHighlightedIndex"), i.getStateAndHelpers = /* @__PURE__ */ a(function() {
      var n = this.getState(), l = n.highlightedIndex, u = n.inputValue, c = n.selectedItem, d = n.isOpen, p = this.props.itemToString, m = this.
      id, h = this.getRootProps, b = this.getToggleButtonProps, f = this.getLabelProps, y = this.getMenuProps, S = this.getInputProps, E = this.
      getItemProps, g = this.openMenu, v = this.closeMenu, I = this.toggleMenu, w = this.selectItem, O = this.selectItemAtIndex, _ = this.selectHighlightedItem,
      k = this.setHighlightedIndex, T = this.clearSelection, C = this.clearItems, P = this.reset, D = this.setItemCount, M = this.unsetItemCount,
      F = this.internalSetState;
      return {
        // prop getters
        getRootProps: h,
        getToggleButtonProps: b,
        getLabelProps: f,
        getMenuProps: y,
        getInputProps: S,
        getItemProps: E,
        // actions
        reset: P,
        openMenu: g,
        closeMenu: v,
        toggleMenu: I,
        selectItem: w,
        selectItemAtIndex: O,
        selectHighlightedItem: _,
        setHighlightedIndex: k,
        clearSelection: T,
        clearItems: C,
        setItemCount: D,
        unsetItemCount: M,
        setState: F,
        // props
        itemToString: p,
        // derived
        id: m,
        // state
        highlightedIndex: l,
        inputValue: u,
        isOpen: d,
        selectedItem: c
      };
    }, "getStateAndHelpers"), i.componentDidMount = /* @__PURE__ */ a(function() {
      var n = this;
      if (!this.props.environment)
        this.cleanup = function() {
          n.internalClearTimeouts();
        };
      else {
        var l = /* @__PURE__ */ a(function() {
          n.isMouseDown = !0;
        }, "onMouseDown"), u = /* @__PURE__ */ a(function(b) {
          n.isMouseDown = !1;
          var f = an(b.target, [n._rootNode, n._menuNode], n.props.environment);
          !f && n.getState().isOpen && n.reset({
            type: Hp
          }, function() {
            return n.props.onOuterClick(n.getStateAndHelpers());
          });
        }, "onMouseUp"), c = /* @__PURE__ */ a(function() {
          n.isTouchMove = !1;
        }, "onTouchStart"), d = /* @__PURE__ */ a(function() {
          n.isTouchMove = !0;
        }, "onTouchMove"), p = /* @__PURE__ */ a(function(b) {
          var f = an(b.target, [n._rootNode, n._menuNode], n.props.environment, !1);
          !n.isTouchMove && !f && n.getState().isOpen && n.reset({
            type: Zp
          }, function() {
            return n.props.onOuterClick(n.getStateAndHelpers());
          });
        }, "onTouchEnd"), m = this.props.environment;
        m.addEventListener("mousedown", l), m.addEventListener("mouseup", u), m.addEventListener("touchstart", c), m.addEventListener("touch\
move", d), m.addEventListener("touchend", p), this.cleanup = function() {
          n.internalClearTimeouts(), n.updateStatus.cancel(), m.removeEventListener("mousedown", l), m.removeEventListener("mouseup", u), m.
          removeEventListener("touchstart", c), m.removeEventListener("touchmove", d), m.removeEventListener("touchend", p);
        };
      }
    }, "componentDidMount"), i.shouldScroll = /* @__PURE__ */ a(function(n, l) {
      var u = this.props.highlightedIndex === void 0 ? this.getState() : this.props, c = u.highlightedIndex, d = l.highlightedIndex === void 0 ?
      n : l, p = d.highlightedIndex, m = c && this.getState().isOpen && !n.isOpen, h = c !== p;
      return m || h;
    }, "shouldScroll"), i.componentDidUpdate = /* @__PURE__ */ a(function(n, l) {
      sn(this.props, "selectedItem") && this.props.selectedItemChanged(n.selectedItem, this.props.selectedItem) && this.internalSetState({
        type: Xp,
        inputValue: this.props.itemToString(this.props.selectedItem)
      }), !this.avoidScrolling && this.shouldScroll(l, n) && this.scrollHighlightedItemIntoView(), this.updateStatus();
    }, "componentDidUpdate"), i.componentWillUnmount = /* @__PURE__ */ a(function() {
      this.cleanup();
    }, "componentWillUnmount"), i.render = /* @__PURE__ */ a(function() {
      var n = Op(this.props.children, Re);
      this.clearItems(), this.getRootProps.called = !1, this.getRootProps.refKey = void 0, this.getRootProps.suppressRefError = void 0, this.
      getMenuProps.called = !1, this.getMenuProps.refKey = void 0, this.getMenuProps.suppressRefError = void 0, this.getLabelProps.called = !1,
      this.getInputProps.called = !1;
      var l = Op(n(this.getStateAndHelpers()));
      if (!l)
        return null;
      if (this.getRootProps.called || this.props.suppressRefError)
        return l;
      if (Mx(l))
        return /* @__PURE__ */ Js(l, this.getRootProps(Lx(l)));
    }, "render"), o;
  }(Le);
  return e.defaultProps = {
    defaultHighlightedIndex: null,
    defaultIsOpen: !1,
    getA11yStatusMessage: Dx,
    itemToString: /* @__PURE__ */ a(function(o) {
      return o == null ? "" : String(o);
    }, "itemToString"),
    onStateChange: Re,
    onInputValueChange: Re,
    onUserAction: Re,
    onChange: Re,
    onSelect: Re,
    onOuterClick: Re,
    selectedItemChanged: /* @__PURE__ */ a(function(o, i) {
      return o !== i;
    }, "selectedItemChanged"),
    environment: (
      /* istanbul ignore next (ssr) */
      typeof window > "u" ? void 0 : window
    ),
    stateReducer: /* @__PURE__ */ a(function(o, i) {
      return i;
    }, "stateReducer"),
    suppressRefError: !1,
    scrollIntoView: Lp
  }, e.stateChangeTypes = Bx, e;
}();
var Jp = {
  highlightedIndex: -1,
  isOpen: !1,
  selectedItem: null,
  inputValue: ""
};
function Kx(e, t, o) {
  var i = e.props, r = e.type, n = {};
  Object.keys(t).forEach(function(l) {
    $x(l, e, t, o), o[l] !== t[l] && (n[l] = o[l]);
  }), i.onStateChange && Object.keys(n).length && i.onStateChange(j({
    type: r
  }, n));
}
a(Kx, "callOnChangeProps");
function $x(e, t, o, i) {
  var r = t.props, n = t.type, l = "on" + es(e) + "Change";
  r[l] && i[e] !== void 0 && i[e] !== o[e] && r[l](j({
    type: n
  }, i));
}
a($x, "invokeOnChangeHandler");
function Ux(e, t) {
  return t.changes;
}
a(Ux, "stateReducer");
var Pp = fn(function(e, t) {
  Rp(e, t);
}, 200), Gx = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u" ? Xt : V, ed = "useId" in s ?
/* @__PURE__ */ a(function(t) {
  var o = t.id, i = t.labelId, r = t.menuId, n = t.getItemId, l = t.toggleButtonId, u = t.inputId, c = "downshift-" + s.useId();
  o || (o = c);
  var d = q({
    labelId: i || o + "-label",
    menuId: r || o + "-menu",
    getItemId: n || function(p) {
      return o + "-item-" + p;
    },
    toggleButtonId: l || o + "-toggle-button",
    inputId: u || o + "-input"
  });
  return d.current;
}, "useElementIds") : /* @__PURE__ */ a(function(t) {
  var o = t.id, i = o === void 0 ? "downshift-" + Np() : o, r = t.labelId, n = t.menuId, l = t.getItemId, u = t.toggleButtonId, c = t.inputId,
  d = q({
    labelId: r || i + "-label",
    menuId: n || i + "-menu",
    getItemId: l || function(p) {
      return i + "-item-" + p;
    },
    toggleButtonId: u || i + "-toggle-button",
    inputId: c || i + "-input"
  });
  return d.current;
}, "useElementIds");
function Ji(e, t, o, i) {
  var r, n;
  if (e === void 0) {
    if (t === void 0)
      throw new Error(i);
    r = o[t], n = t;
  } else
    n = t === void 0 ? o.indexOf(e) : t, r = e;
  return [r, n];
}
a(Ji, "getItemAndIndex");
function qx(e) {
  return /^\S{1}$/.test(e);
}
a(qx, "isAcceptedCharacterKey");
function es(e) {
  return "" + e.slice(0, 1).toUpperCase() + e.slice(1);
}
a(es, "capitalizeString");
function mn(e) {
  var t = q(e);
  return t.current = e, t;
}
a(mn, "useLatestRef");
function td(e, t, o, i) {
  var r = q(), n = q(), l = A(function(b, f) {
    n.current = f, b = Vo(b, f.props);
    var y = e(b, f), S = f.props.stateReducer(b, j({}, f, {
      changes: y
    }));
    return S;
  }, [e]), u = Zt(l, t, o), c = u[0], d = u[1], p = mn(t), m = A(function(b) {
    return d(j({
      props: p.current
    }, b));
  }, [p]), h = n.current;
  return V(function() {
    var b = Vo(r.current, h?.props), f = h && r.current && !i(b, c);
    f && Kx(h, b, c), r.current = c;
  }, [c, h, i]), [c, m];
}
a(td, "useEnhancedReducer");
function od(e, t, o, i) {
  var r = td(e, t, o, i), n = r[0], l = r[1];
  return [Vo(n, t), l];
}
a(od, "useControlledReducer$1");
var Wo = {
  itemToString: /* @__PURE__ */ a(function(t) {
    return t ? String(t) : "";
  }, "itemToString"),
  itemToKey: /* @__PURE__ */ a(function(t) {
    return t;
  }, "itemToKey"),
  stateReducer: Ux,
  scrollIntoView: Lp,
  environment: (
    /* istanbul ignore next (ssr) */
    typeof window > "u" ? void 0 : window
  )
};
function lt(e, t, o) {
  o === void 0 && (o = Jp);
  var i = e["default" + es(t)];
  return i !== void 0 ? i : o[t];
}
a(lt, "getDefaultValue$1");
function Ut(e, t, o) {
  o === void 0 && (o = Jp);
  var i = e[t];
  if (i !== void 0)
    return i;
  var r = e["initial" + es(t)];
  return r !== void 0 ? r : lt(e, t, o);
}
a(Ut, "getInitialValue$1");
function rd(e) {
  var t = Ut(e, "selectedItem"), o = Ut(e, "isOpen"), i = Yx(e), r = Ut(e, "inputValue");
  return {
    highlightedIndex: i < 0 && t && o ? e.items.findIndex(function(n) {
      return e.itemToKey(n) === e.itemToKey(t);
    }) : i,
    isOpen: o,
    selectedItem: t,
    inputValue: r
  };
}
a(rd, "getInitialState$2");
function Gt(e, t, o) {
  var i = e.items, r = e.initialHighlightedIndex, n = e.defaultHighlightedIndex, l = e.isItemDisabled, u = e.itemToKey, c = t.selectedItem, d = t.
  highlightedIndex;
  return i.length === 0 ? -1 : r !== void 0 && d === r && !l(i[r], r) ? r : n !== void 0 && !l(i[n], n) ? n : c ? i.findIndex(function(p) {
    return u(c) === u(p);
  }) : o < 0 && !l(i[i.length - 1], i.length - 1) ? i.length - 1 : o > 0 && !l(i[0], 0) ? 0 : -1;
}
a(Gt, "getHighlightedIndexOnOpen");
function nd(e, t, o) {
  var i = q({
    isMouseDown: !1,
    isTouchMove: !1,
    isTouchEnd: !1
  });
  return V(function() {
    if (!e)
      return Re;
    var r = o.map(function(p) {
      return p.current;
    });
    function n() {
      i.current.isTouchEnd = !1, i.current.isMouseDown = !0;
    }
    a(n, "onMouseDown");
    function l(p) {
      i.current.isMouseDown = !1, an(p.target, r, e) || t();
    }
    a(l, "onMouseUp");
    function u() {
      i.current.isTouchEnd = !1, i.current.isTouchMove = !1;
    }
    a(u, "onTouchStart");
    function c() {
      i.current.isTouchMove = !0;
    }
    a(c, "onTouchMove");
    function d(p) {
      i.current.isTouchEnd = !0, !i.current.isTouchMove && !an(p.target, r, e, !1) && t();
    }
    return a(d, "onTouchEnd"), e.addEventListener("mousedown", n), e.addEventListener("mouseup", l), e.addEventListener("touchstart", u), e.
    addEventListener("touchmove", c), e.addEventListener("touchend", d), /* @__PURE__ */ a(function() {
      e.removeEventListener("mousedown", n), e.removeEventListener("mouseup", l), e.removeEventListener("touchstart", u), e.removeEventListener(
      "touchmove", c), e.removeEventListener("touchend", d);
    }, "cleanup");
  }, [o, e, t]), i.current;
}
a(nd, "useMouseAndTouchTracker");
var ts = /* @__PURE__ */ a(function() {
  return Re;
}, "useGetterPropsCalledChecker");
function os(e, t, o, i) {
  i === void 0 && (i = {});
  var r = i.document, n = hn();
  V(function() {
    if (!(!e || n || !r)) {
      var l = e(t);
      Pp(l, r);
    }
  }, o), V(function() {
    return function() {
      Pp.cancel(), Rx(r);
    };
  }, [r]);
}
a(os, "useA11yMessageStatus");
function id(e) {
  var t = e.highlightedIndex, o = e.isOpen, i = e.itemRefs, r = e.getItemNodeFromIndex, n = e.menuElement, l = e.scrollIntoView, u = q(!0);
  return Gx(function() {
    t < 0 || !o || !Object.keys(i.current).length || (u.current === !1 ? u.current = !0 : l(r(t), n));
  }, [t]), u;
}
a(id, "useScrollIntoView");
var rs = Re;
function ln(e, t, o) {
  var i;
  o === void 0 && (o = !0);
  var r = ((i = e.items) == null ? void 0 : i.length) && t >= 0;
  return j({
    isOpen: !1,
    highlightedIndex: -1
  }, r && j({
    selectedItem: e.items[t],
    isOpen: lt(e, "isOpen"),
    highlightedIndex: lt(e, "highlightedIndex")
  }, o && {
    inputValue: e.itemToString(e.items[t])
  }));
}
a(ln, "getChangesOnSelection");
function sd(e, t) {
  return e.isOpen === t.isOpen && e.inputValue === t.inputValue && e.highlightedIndex === t.highlightedIndex && e.selectedItem === t.selectedItem;
}
a(sd, "isDropdownsStateEqual");
function hn() {
  var e = s.useRef(!0);
  return s.useEffect(function() {
    return e.current = !1, function() {
      e.current = !0;
    };
  }, []), e.current;
}
a(hn, "useIsInitialMount");
function un(e) {
  var t = lt(e, "highlightedIndex");
  return t > -1 && e.isItemDisabled(e.items[t], t) ? -1 : t;
}
a(un, "getDefaultHighlightedIndex");
function Yx(e) {
  var t = Ut(e, "highlightedIndex");
  return t > -1 && e.isItemDisabled(e.items[t], t) ? -1 : t;
}
a(Yx, "getInitialHighlightedIndex");
var rn = {
  environment: Y.default.shape({
    addEventListener: Y.default.func.isRequired,
    removeEventListener: Y.default.func.isRequired,
    document: Y.default.shape({
      createElement: Y.default.func.isRequired,
      getElementById: Y.default.func.isRequired,
      activeElement: Y.default.any.isRequired,
      body: Y.default.any.isRequired
    }).isRequired,
    Node: Y.default.func.isRequired
  }),
  itemToString: Y.default.func,
  itemToKey: Y.default.func,
  stateReducer: Y.default.func
}, ad = j({}, rn, {
  getA11yStatusMessage: Y.default.func,
  highlightedIndex: Y.default.number,
  defaultHighlightedIndex: Y.default.number,
  initialHighlightedIndex: Y.default.number,
  isOpen: Y.default.bool,
  defaultIsOpen: Y.default.bool,
  initialIsOpen: Y.default.bool,
  selectedItem: Y.default.any,
  initialSelectedItem: Y.default.any,
  defaultSelectedItem: Y.default.any,
  id: Y.default.string,
  labelId: Y.default.string,
  menuId: Y.default.string,
  getItemId: Y.default.func,
  toggleButtonId: Y.default.string,
  onSelectedItemChange: Y.default.func,
  onHighlightedIndexChange: Y.default.func,
  onStateChange: Y.default.func,
  onIsOpenChange: Y.default.func,
  scrollIntoView: Y.default.func
});
function ld(e, t, o) {
  var i = t.type, r = t.props, n;
  switch (i) {
    case o.ItemMouseMove:
      n = {
        highlightedIndex: t.disabled ? -1 : t.index
      };
      break;
    case o.MenuMouseLeave:
      n = {
        highlightedIndex: -1
      };
      break;
    case o.ToggleButtonClick:
    case o.FunctionToggleMenu:
      n = {
        isOpen: !e.isOpen,
        highlightedIndex: e.isOpen ? -1 : Gt(r, e, 0)
      };
      break;
    case o.FunctionOpenMenu:
      n = {
        isOpen: !0,
        highlightedIndex: Gt(r, e, 0)
      };
      break;
    case o.FunctionCloseMenu:
      n = {
        isOpen: !1
      };
      break;
    case o.FunctionSetHighlightedIndex:
      n = {
        highlightedIndex: r.isItemDisabled(r.items[t.highlightedIndex], t.highlightedIndex) ? -1 : t.highlightedIndex
      };
      break;
    case o.FunctionSetInputValue:
      n = {
        inputValue: t.inputValue
      };
      break;
    case o.FunctionReset:
      n = {
        highlightedIndex: un(r),
        isOpen: lt(r, "isOpen"),
        selectedItem: lt(r, "selectedItem"),
        inputValue: lt(r, "inputValue")
      };
      break;
    default:
      throw new Error("Reducer called without proper action type.");
  }
  return j({}, e, n);
}
a(ld, "downshiftCommonReducer");
function Qx(e) {
  for (var t = e.keysSoFar, o = e.highlightedIndex, i = e.items, r = e.itemToString, n = e.isItemDisabled, l = t.toLowerCase(), u = 0; u < i.
  length; u++) {
    var c = (u + o + (t.length < 2 ? 1 : 0)) % i.length, d = i[c];
    if (d !== void 0 && r(d).toLowerCase().startsWith(l) && !n(d, c))
      return c;
  }
  return o;
}
a(Qx, "getItemIndexByCharacterKey");
var OR = $t($t({}, ad), { items: Y.default.array.isRequired, isItemDisabled: Y.default.func }), Xx = $t($t({}, Wo), { isItemDisabled: /* @__PURE__ */ a(
function() {
  return !1;
}, "isItemDisabled") }), Zx = Re, nn = 0, ns = 1, is = 2, cn = 3, ss = 4, as = 5, ls = 6, us = 7, cs = 8, ps = 9, ds = 10, pn = 11, ud = 12,
cd = 13, fs = 14, pd = 15, dd = 16, fd = 17, md = 18, ms = 19, Zi = 20, hd = 21, gd = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  FunctionCloseMenu: fd,
  FunctionOpenMenu: dd,
  FunctionReset: hd,
  FunctionSelectItem: ms,
  FunctionSetHighlightedIndex: md,
  FunctionSetInputValue: Zi,
  FunctionToggleMenu: pd,
  ItemClick: fs,
  ItemMouseMove: cd,
  MenuMouseLeave: ud,
  ToggleButtonBlur: pn,
  ToggleButtonClick: nn,
  ToggleButtonKeyDownArrowDown: ns,
  ToggleButtonKeyDownArrowUp: is,
  ToggleButtonKeyDownCharacter: cn,
  ToggleButtonKeyDownEnd: ls,
  ToggleButtonKeyDownEnter: us,
  ToggleButtonKeyDownEscape: ss,
  ToggleButtonKeyDownHome: as,
  ToggleButtonKeyDownPageDown: ds,
  ToggleButtonKeyDownPageUp: ps,
  ToggleButtonKeyDownSpaceButton: cs
});
function Jx(e, t) {
  var o, i = t.type, r = t.props, n = t.altKey, l;
  switch (i) {
    case fs:
      l = {
        isOpen: lt(r, "isOpen"),
        highlightedIndex: un(r),
        selectedItem: r.items[t.index]
      };
      break;
    case cn:
      {
        var u = t.key, c = "" + e.inputValue + u, d = !e.isOpen && e.selectedItem ? r.items.findIndex(function(b) {
          return r.itemToKey(b) === r.itemToKey(e.selectedItem);
        }) : e.highlightedIndex, p = Qx({
          keysSoFar: c,
          highlightedIndex: d,
          items: r.items,
          itemToString: r.itemToString,
          isItemDisabled: r.isItemDisabled
        });
        l = {
          inputValue: c,
          highlightedIndex: p,
          isOpen: !0
        };
      }
      break;
    case ns:
      {
        var m = e.isOpen ? Je(e.highlightedIndex, 1, r.items, r.isItemDisabled) : n && e.selectedItem == null ? -1 : Gt(r, e, 1);
        l = {
          highlightedIndex: m,
          isOpen: !0
        };
      }
      break;
    case is:
      if (e.isOpen && n)
        l = ln(r, e.highlightedIndex, !1);
      else {
        var h = e.isOpen ? Je(e.highlightedIndex, -1, r.items, r.isItemDisabled) : Gt(r, e, -1);
        l = {
          highlightedIndex: h,
          isOpen: !0
        };
      }
      break;
    // only triggered when menu is open.
    case us:
    case cs:
      l = ln(r, e.highlightedIndex, !1);
      break;
    case as:
      l = {
        highlightedIndex: wt(0, !1, r.items, r.isItemDisabled),
        isOpen: !0
      };
      break;
    case ls:
      l = {
        highlightedIndex: wt(r.items.length - 1, !0, r.items, r.isItemDisabled),
        isOpen: !0
      };
      break;
    case ps:
      l = {
        highlightedIndex: Je(e.highlightedIndex, -10, r.items, r.isItemDisabled)
      };
      break;
    case ds:
      l = {
        highlightedIndex: Je(e.highlightedIndex, 10, r.items, r.isItemDisabled)
      };
      break;
    case ss:
      l = {
        isOpen: !1,
        highlightedIndex: -1
      };
      break;
    case pn:
      l = j({
        isOpen: !1,
        highlightedIndex: -1
      }, e.highlightedIndex >= 0 && ((o = r.items) == null ? void 0 : o.length) && {
        selectedItem: r.items[e.highlightedIndex]
      });
      break;
    case ms:
      l = {
        selectedItem: t.selectedItem
      };
      break;
    default:
      return ld(e, t, gd);
  }
  return j({}, e, l);
}
a(Jx, "downshiftSelectReducer");
var eI = ["onClick"], tI = ["onMouseLeave", "refKey", "ref"], oI = ["onBlur", "onClick", "onPress", "onKeyDown", "refKey", "ref"], rI = ["it\
em", "index", "onMouseMove", "onClick", "onMouseDown", "onPress", "refKey", "disabled", "ref"];
yd.stateChangeTypes = gd;
function yd(e) {
  e === void 0 && (e = {}), Zx(e, yd);
  var t = j({}, Xx, e), o = t.scrollIntoView, i = t.environment, r = t.getA11yStatusMessage, n = od(Jx, t, rd, sd), l = n[0], u = n[1], c = l.
  isOpen, d = l.highlightedIndex, p = l.selectedItem, m = l.inputValue, h = q(null), b = q(null), f = q({}), y = q(null), S = ed(t), E = mn(
  {
    state: l,
    props: t
  }), g = A(function(H) {
    return f.current[S.getItemId(H)];
  }, [S]);
  os(r, l, [c, d, p, m], i);
  var v = id({
    menuElement: b.current,
    highlightedIndex: d,
    isOpen: c,
    itemRefs: f,
    scrollIntoView: o,
    getItemNodeFromIndex: g
  });
  V(function() {
    return y.current = fn(function(H) {
      H({
        type: Zi,
        inputValue: ""
      });
    }, 500), function() {
      y.current.cancel();
    };
  }, []), V(function() {
    m && y.current(u);
  }, [u, m]), rs({
    props: t,
    state: l
  }), V(function() {
    var H = Ut(t, "isOpen");
    H && h.current && h.current.focus();
  }, []);
  var I = nd(i, A(/* @__PURE__ */ a(function() {
    E.current.state.isOpen && u({
      type: pn
    });
  }, "handleBlur"), [u, E]), U(function() {
    return [b, h];
  }, [b.current, h.current])), w = ts("getMenuProps", "getToggleButtonProps");
  V(function() {
    c || (f.current = {});
  }, [c]);
  var O = U(function() {
    return {
      ArrowDown: /* @__PURE__ */ a(function(G) {
        G.preventDefault(), u({
          type: ns,
          altKey: G.altKey
        });
      }, "ArrowDown"),
      ArrowUp: /* @__PURE__ */ a(function(G) {
        G.preventDefault(), u({
          type: is,
          altKey: G.altKey
        });
      }, "ArrowUp"),
      Home: /* @__PURE__ */ a(function(G) {
        G.preventDefault(), u({
          type: as
        });
      }, "Home"),
      End: /* @__PURE__ */ a(function(G) {
        G.preventDefault(), u({
          type: ls
        });
      }, "End"),
      Escape: /* @__PURE__ */ a(function() {
        E.current.state.isOpen && u({
          type: ss
        });
      }, "Escape"),
      Enter: /* @__PURE__ */ a(function(G) {
        G.preventDefault(), u({
          type: E.current.state.isOpen ? us : nn
        });
      }, "Enter"),
      PageUp: /* @__PURE__ */ a(function(G) {
        E.current.state.isOpen && (G.preventDefault(), u({
          type: ps
        }));
      }, "PageUp"),
      PageDown: /* @__PURE__ */ a(function(G) {
        E.current.state.isOpen && (G.preventDefault(), u({
          type: ds
        }));
      }, "PageDown"),
      " ": /* @__PURE__ */ a(function(G) {
        G.preventDefault();
        var z = E.current.state;
        if (!z.isOpen) {
          u({
            type: nn
          });
          return;
        }
        z.inputValue ? u({
          type: cn,
          key: " "
        }) : u({
          type: cs
        });
      }, "_")
    };
  }, [u, E]), _ = A(function() {
    u({
      type: pd
    });
  }, [u]), k = A(function() {
    u({
      type: fd
    });
  }, [u]), T = A(function() {
    u({
      type: dd
    });
  }, [u]), C = A(function(H) {
    u({
      type: md,
      highlightedIndex: H
    });
  }, [u]), P = A(function(H) {
    u({
      type: ms,
      selectedItem: H
    });
  }, [u]), D = A(function() {
    u({
      type: hd
    });
  }, [u]), M = A(function(H) {
    u({
      type: Zi,
      inputValue: H
    });
  }, [u]), F = A(function(H) {
    var G = H === void 0 ? {} : H, z = G.onClick, re = ke(G, eI), R = /* @__PURE__ */ a(function() {
      var L;
      (L = h.current) == null || L.focus();
    }, "labelHandleClick");
    return j({
      id: S.labelId,
      htmlFor: S.toggleButtonId,
      onClick: le(z, R)
    }, re);
  }, [S]), Z = A(function(H, G) {
    var z, re = H === void 0 ? {} : H, R = re.onMouseLeave, B = re.refKey, L = B === void 0 ? "ref" : B, $ = re.ref, J = ke(re, tI), ie = G ===
    void 0 ? {} : G, te = ie.suppressRefError, de = te === void 0 ? !1 : te, ae = /* @__PURE__ */ a(function() {
      u({
        type: ud
      });
    }, "menuHandleMouseLeave");
    return w("getMenuProps", de, L, b), j((z = {}, z[L] = Ze($, function(ce) {
      b.current = ce;
    }), z.id = S.menuId, z.role = "listbox", z["aria-labelledby"] = J && J["aria-label"] ? void 0 : "" + S.labelId, z.onMouseLeave = le(R, ae),
    z), J);
  }, [u, w, S]), W = A(function(H, G) {
    var z, re = H === void 0 ? {} : H, R = re.onBlur, B = re.onClick;
    re.onPress;
    var L = re.onKeyDown, $ = re.refKey, J = $ === void 0 ? "ref" : $, ie = re.ref, te = ke(re, oI), de = G === void 0 ? {} : G, ae = de.suppressRefError,
    ce = ae === void 0 ? !1 : ae, ue = E.current.state, Ie = /* @__PURE__ */ a(function() {
      u({
        type: nn
      });
    }, "toggleButtonHandleClick"), ye = /* @__PURE__ */ a(function() {
      ue.isOpen && !I.isMouseDown && u({
        type: pn
      });
    }, "toggleButtonHandleBlur"), Oe = /* @__PURE__ */ a(function(_e) {
      var Ae = po(_e);
      Ae && O[Ae] ? O[Ae](_e) : qx(Ae) && u({
        type: cn,
        key: Ae
      });
    }, "toggleButtonHandleKeyDown"), fe = j((z = {}, z[J] = Ze(ie, function(Se) {
      h.current = Se;
    }), z["aria-activedescendant"] = ue.isOpen && ue.highlightedIndex > -1 ? S.getItemId(ue.highlightedIndex) : "", z["aria-controls"] = S.menuId,
    z["aria-expanded"] = E.current.state.isOpen, z["aria-haspopup"] = "listbox", z["aria-labelledby"] = te && te["aria-label"] ? void 0 : "" +
    S.labelId, z.id = S.toggleButtonId, z.role = "combobox", z.tabIndex = 0, z.onBlur = le(R, ye), z), te);
    return te.disabled || (fe.onClick = le(B, Ie), fe.onKeyDown = le(L, Oe)), w("getToggleButtonProps", ce, J, h), fe;
  }, [u, S, E, I, w, O]), Q = A(function(H) {
    var G, z = H === void 0 ? {} : H, re = z.item, R = z.index, B = z.onMouseMove, L = z.onClick, $ = z.onMouseDown;
    z.onPress;
    var J = z.refKey, ie = J === void 0 ? "ref" : J, te = z.disabled, de = z.ref, ae = ke(z, rI);
    te !== void 0 && console.warn('Passing "disabled" as an argument to getItemProps is not supported anymore. Please use the isItemDisabled\
 prop from useSelect.');
    var ce = E.current, ue = ce.state, Ie = ce.props, ye = Ji(re, R, Ie.items, "Pass either item or index to getItemProps!"), Oe = ye[0], fe = ye[1],
    Se = Ie.isItemDisabled(Oe, fe), _e = /* @__PURE__ */ a(function() {
      I.isTouchEnd || fe === ue.highlightedIndex || (v.current = !1, u({
        type: cd,
        index: fe,
        disabled: Se
      }));
    }, "itemHandleMouseMove"), Ae = /* @__PURE__ */ a(function() {
      u({
        type: fs,
        index: fe
      });
    }, "itemHandleClick"), et = /* @__PURE__ */ a(function(fo) {
      return fo.preventDefault();
    }, "itemHandleMouseDown"), N = j((G = {}, G[ie] = Ze(de, function(Ge) {
      Ge && (f.current[S.getItemId(fe)] = Ge);
    }), G["aria-disabled"] = Se, G["aria-selected"] = Oe === ue.selectedItem, G.id = S.getItemId(fe), G.role = "option", G), ae);
    return Se || (N.onClick = le(L, Ae)), N.onMouseMove = le(B, _e), N.onMouseDown = le($, et), N;
  }, [E, S, I, v, u]);
  return {
    // prop getters.
    getToggleButtonProps: W,
    getLabelProps: F,
    getMenuProps: Z,
    getItemProps: Q,
    // actions.
    toggleMenu: _,
    openMenu: T,
    closeMenu: k,
    setHighlightedIndex: C,
    selectItem: P,
    reset: D,
    setInputValue: M,
    // state.
    highlightedIndex: d,
    isOpen: c,
    selectedItem: p,
    inputValue: m
  };
}
a(yd, "useSelect");
var hs = 0, gs = 1, ys = 2, bs = 3, vs = 4, xs = 5, Is = 6, Ss = 7, ws = 8, dn = 9, Es = 10, bd = 11, vd = 12, Ts = 13, xd = 14, Id = 15, Sd = 16,
wd = 17, Ed = 18, Cs = 19, Td = 20, Cd = 21, _s = 22, _d = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ControlledPropUpdatedSelectedItem: _s,
  FunctionCloseMenu: wd,
  FunctionOpenMenu: Sd,
  FunctionReset: Cd,
  FunctionSelectItem: Cs,
  FunctionSetHighlightedIndex: Ed,
  FunctionSetInputValue: Td,
  FunctionToggleMenu: Id,
  InputBlur: dn,
  InputChange: ws,
  InputClick: Es,
  InputKeyDownArrowDown: hs,
  InputKeyDownArrowUp: gs,
  InputKeyDownEnd: vs,
  InputKeyDownEnter: Ss,
  InputKeyDownEscape: ys,
  InputKeyDownHome: bs,
  InputKeyDownPageDown: Is,
  InputKeyDownPageUp: xs,
  ItemClick: Ts,
  ItemMouseMove: vd,
  MenuMouseLeave: bd,
  ToggleButtonClick: xd
});
function nI(e) {
  var t = rd(e), o = t.selectedItem, i = t.inputValue;
  return i === "" && o && e.defaultInputValue === void 0 && e.initialInputValue === void 0 && e.inputValue === void 0 && (i = e.itemToString(
  o)), j({}, t, {
    inputValue: i
  });
}
a(nI, "getInitialState$1");
var PR = j({}, ad, {
  items: Y.default.array.isRequired,
  isItemDisabled: Y.default.func,
  inputValue: Y.default.string,
  defaultInputValue: Y.default.string,
  initialInputValue: Y.default.string,
  inputId: Y.default.string,
  onInputValueChange: Y.default.func
});
function iI(e, t, o, i) {
  var r = q(), n = td(e, t, o, i), l = n[0], u = n[1], c = hn();
  return V(function() {
    if (sn(t, "selectedItem")) {
      if (!c) {
        var d = t.itemToKey(t.selectedItem) !== t.itemToKey(r.current);
        d && u({
          type: _s,
          inputValue: t.itemToString(t.selectedItem)
        });
      }
      r.current = l.selectedItem === r.current ? t.selectedItem : l.selectedItem;
    }
  }, [l.selectedItem, t.selectedItem]), [Vo(l, t), u];
}
a(iI, "useControlledReducer");
var sI = Re, aI = j({}, Wo, {
  isItemDisabled: /* @__PURE__ */ a(function() {
    return !1;
  }, "isItemDisabled")
});
function lI(e, t) {
  var o, i = t.type, r = t.props, n = t.altKey, l;
  switch (i) {
    case Ts:
      l = {
        isOpen: lt(r, "isOpen"),
        highlightedIndex: un(r),
        selectedItem: r.items[t.index],
        inputValue: r.itemToString(r.items[t.index])
      };
      break;
    case hs:
      e.isOpen ? l = {
        highlightedIndex: Je(e.highlightedIndex, 1, r.items, r.isItemDisabled, !0)
      } : l = {
        highlightedIndex: n && e.selectedItem == null ? -1 : Gt(r, e, 1),
        isOpen: r.items.length >= 0
      };
      break;
    case gs:
      e.isOpen ? n ? l = ln(r, e.highlightedIndex) : l = {
        highlightedIndex: Je(e.highlightedIndex, -1, r.items, r.isItemDisabled, !0)
      } : l = {
        highlightedIndex: Gt(r, e, -1),
        isOpen: r.items.length >= 0
      };
      break;
    case Ss:
      l = ln(r, e.highlightedIndex);
      break;
    case ys:
      l = j({
        isOpen: !1,
        highlightedIndex: -1
      }, !e.isOpen && {
        selectedItem: null,
        inputValue: ""
      });
      break;
    case xs:
      l = {
        highlightedIndex: Je(e.highlightedIndex, -10, r.items, r.isItemDisabled, !0)
      };
      break;
    case Is:
      l = {
        highlightedIndex: Je(e.highlightedIndex, 10, r.items, r.isItemDisabled, !0)
      };
      break;
    case bs:
      l = {
        highlightedIndex: wt(0, !1, r.items, r.isItemDisabled)
      };
      break;
    case vs:
      l = {
        highlightedIndex: wt(r.items.length - 1, !0, r.items, r.isItemDisabled)
      };
      break;
    case dn:
      l = j({
        isOpen: !1,
        highlightedIndex: -1
      }, e.highlightedIndex >= 0 && ((o = r.items) == null ? void 0 : o.length) && t.selectItem && {
        selectedItem: r.items[e.highlightedIndex],
        inputValue: r.itemToString(r.items[e.highlightedIndex])
      });
      break;
    case ws:
      l = {
        isOpen: !0,
        highlightedIndex: un(r),
        inputValue: t.inputValue
      };
      break;
    case Es:
      l = {
        isOpen: !e.isOpen,
        highlightedIndex: e.isOpen ? -1 : Gt(r, e, 0)
      };
      break;
    case Cs:
      l = {
        selectedItem: t.selectedItem,
        inputValue: r.itemToString(t.selectedItem)
      };
      break;
    case _s:
      l = {
        inputValue: t.inputValue
      };
      break;
    default:
      return ld(e, t, _d);
  }
  return j({}, e, l);
}
a(lI, "downshiftUseComboboxReducer");
var uI = ["onMouseLeave", "refKey", "ref"], cI = ["item", "index", "refKey", "ref", "onMouseMove", "onMouseDown", "onClick", "onPress", "dis\
abled"], pI = ["onClick", "onPress", "refKey", "ref"], dI = ["onKeyDown", "onChange", "onInput", "onBlur", "onChangeText", "onClick", "refKe\
y", "ref"];
kd.stateChangeTypes = _d;
function kd(e) {
  e === void 0 && (e = {}), sI(e, kd);
  var t = j({}, aI, e), o = t.items, i = t.scrollIntoView, r = t.environment, n = t.getA11yStatusMessage, l = iI(lI, t, nI, sd), u = l[0], c = l[1],
  d = u.isOpen, p = u.highlightedIndex, m = u.selectedItem, h = u.inputValue, b = q(null), f = q({}), y = q(null), S = q(null), E = hn(), g = ed(
  t), v = q(), I = mn({
    state: u,
    props: t
  }), w = A(function(R) {
    return f.current[g.getItemId(R)];
  }, [g]);
  os(n, u, [d, p, m, h], r);
  var O = id({
    menuElement: b.current,
    highlightedIndex: p,
    isOpen: d,
    itemRefs: f,
    scrollIntoView: i,
    getItemNodeFromIndex: w
  });
  rs({
    props: t,
    state: u
  }), V(function() {
    var R = Ut(t, "isOpen");
    R && y.current && y.current.focus();
  }, []), V(function() {
    E || (v.current = o.length);
  });
  var _ = nd(r, A(/* @__PURE__ */ a(function() {
    I.current.state.isOpen && c({
      type: dn,
      selectItem: !1
    });
  }, "handleBlur"), [c, I]), U(function() {
    return [b, S, y];
  }, [b.current, S.current, y.current])), k = ts("getInputProps", "getMenuProps");
  V(function() {
    d || (f.current = {});
  }, [d]), V(function() {
    var R;
    !d || !(r != null && r.document) || !(y != null && (R = y.current) != null && R.focus) || r.document.activeElement !== y.current && y.current.
    focus();
  }, [d, r]);
  var T = U(function() {
    return {
      ArrowDown: /* @__PURE__ */ a(function(B) {
        B.preventDefault(), c({
          type: hs,
          altKey: B.altKey
        });
      }, "ArrowDown"),
      ArrowUp: /* @__PURE__ */ a(function(B) {
        B.preventDefault(), c({
          type: gs,
          altKey: B.altKey
        });
      }, "ArrowUp"),
      Home: /* @__PURE__ */ a(function(B) {
        I.current.state.isOpen && (B.preventDefault(), c({
          type: bs
        }));
      }, "Home"),
      End: /* @__PURE__ */ a(function(B) {
        I.current.state.isOpen && (B.preventDefault(), c({
          type: vs
        }));
      }, "End"),
      Escape: /* @__PURE__ */ a(function(B) {
        var L = I.current.state;
        (L.isOpen || L.inputValue || L.selectedItem || L.highlightedIndex > -1) && (B.preventDefault(), c({
          type: ys
        }));
      }, "Escape"),
      Enter: /* @__PURE__ */ a(function(B) {
        var L = I.current.state;
        !L.isOpen || B.which === 229 || (B.preventDefault(), c({
          type: Ss
        }));
      }, "Enter"),
      PageUp: /* @__PURE__ */ a(function(B) {
        I.current.state.isOpen && (B.preventDefault(), c({
          type: xs
        }));
      }, "PageUp"),
      PageDown: /* @__PURE__ */ a(function(B) {
        I.current.state.isOpen && (B.preventDefault(), c({
          type: Is
        }));
      }, "PageDown")
    };
  }, [c, I]), C = A(function(R) {
    return j({
      id: g.labelId,
      htmlFor: g.inputId
    }, R);
  }, [g]), P = A(function(R, B) {
    var L, $ = R === void 0 ? {} : R, J = $.onMouseLeave, ie = $.refKey, te = ie === void 0 ? "ref" : ie, de = $.ref, ae = ke($, uI), ce = B ===
    void 0 ? {} : B, ue = ce.suppressRefError, Ie = ue === void 0 ? !1 : ue;
    return k("getMenuProps", Ie, te, b), j((L = {}, L[te] = Ze(de, function(ye) {
      b.current = ye;
    }), L.id = g.menuId, L.role = "listbox", L["aria-labelledby"] = ae && ae["aria-label"] ? void 0 : "" + g.labelId, L.onMouseLeave = le(J,
    function() {
      c({
        type: bd
      });
    }), L), ae);
  }, [c, k, g]), D = A(function(R) {
    var B, L, $ = R === void 0 ? {} : R, J = $.item, ie = $.index, te = $.refKey, de = te === void 0 ? "ref" : te, ae = $.ref, ce = $.onMouseMove,
    ue = $.onMouseDown, Ie = $.onClick;
    $.onPress;
    var ye = $.disabled, Oe = ke($, cI);
    ye !== void 0 && console.warn('Passing "disabled" as an argument to getItemProps is not supported anymore. Please use the isItemDisabled\
 prop from useCombobox.');
    var fe = I.current, Se = fe.props, _e = fe.state, Ae = Ji(J, ie, Se.items, "Pass either item or index to getItemProps!"), et = Ae[0], N = Ae[1],
    Ge = Se.isItemDisabled(et, N), fo = "onClick", $o = Ie, ft = /* @__PURE__ */ a(function() {
      _.isTouchEnd || N === _e.highlightedIndex || (O.current = !1, c({
        type: vd,
        index: N,
        disabled: Ge
      }));
    }, "itemHandleMouseMove"), Et = /* @__PURE__ */ a(function() {
      c({
        type: Ts,
        index: N
      });
    }, "itemHandleClick"), mt = /* @__PURE__ */ a(function(uf) {
      return uf.preventDefault();
    }, "itemHandleMouseDown");
    return j((B = {}, B[de] = Ze(ae, function(qe) {
      qe && (f.current[g.getItemId(N)] = qe);
    }), B["aria-disabled"] = Ge, B["aria-selected"] = N === _e.highlightedIndex, B.id = g.getItemId(N), B.role = "option", B), !Ge && (L = {},
    L[fo] = le($o, Et), L), {
      onMouseMove: le(ce, ft),
      onMouseDown: le(ue, mt)
    }, Oe);
  }, [c, g, I, _, O]), M = A(function(R) {
    var B, L = R === void 0 ? {} : R, $ = L.onClick;
    L.onPress;
    var J = L.refKey, ie = J === void 0 ? "ref" : J, te = L.ref, de = ke(L, pI), ae = I.current.state, ce = /* @__PURE__ */ a(function() {
      c({
        type: xd
      });
    }, "toggleButtonHandleClick");
    return j((B = {}, B[ie] = Ze(te, function(ue) {
      S.current = ue;
    }), B["aria-controls"] = g.menuId, B["aria-expanded"] = ae.isOpen, B.id = g.toggleButtonId, B.tabIndex = -1, B), !de.disabled && j({}, {
      onClick: le($, ce)
    }), de);
  }, [c, I, g]), F = A(function(R, B) {
    var L, $ = R === void 0 ? {} : R, J = $.onKeyDown, ie = $.onChange, te = $.onInput, de = $.onBlur;
    $.onChangeText;
    var ae = $.onClick, ce = $.refKey, ue = ce === void 0 ? "ref" : ce, Ie = $.ref, ye = ke($, dI), Oe = B === void 0 ? {} : B, fe = Oe.suppressRefError,
    Se = fe === void 0 ? !1 : fe;
    k("getInputProps", Se, ue, y);
    var _e = I.current.state, Ae = /* @__PURE__ */ a(function(mt) {
      var qe = po(mt);
      qe && T[qe] && T[qe](mt);
    }, "inputHandleKeyDown"), et = /* @__PURE__ */ a(function(mt) {
      c({
        type: ws,
        inputValue: mt.target.value
      });
    }, "inputHandleChange"), N = /* @__PURE__ */ a(function(mt) {
      if (r != null && r.document && _e.isOpen && !_.isMouseDown) {
        var qe = mt.relatedTarget === null && r.document.activeElement !== r.document.body;
        c({
          type: dn,
          selectItem: !qe
        });
      }
    }, "inputHandleBlur"), Ge = /* @__PURE__ */ a(function() {
      c({
        type: Es
      });
    }, "inputHandleClick"), fo = "onChange", $o = {};
    if (!ye.disabled) {
      var ft;
      $o = (ft = {}, ft[fo] = le(ie, te, et), ft.onKeyDown = le(J, Ae), ft.onBlur = le(de, N), ft.onClick = le(ae, Ge), ft);
    }
    return j((L = {}, L[ue] = Ze(Ie, function(Et) {
      y.current = Et;
    }), L["aria-activedescendant"] = _e.isOpen && _e.highlightedIndex > -1 ? g.getItemId(_e.highlightedIndex) : "", L["aria-autocomplete"] =
    "list", L["aria-controls"] = g.menuId, L["aria-expanded"] = _e.isOpen, L["aria-labelledby"] = ye && ye["aria-label"] ? void 0 : g.labelId,
    L.autoComplete = "off", L.id = g.inputId, L.role = "combobox", L.value = _e.inputValue, L), $o, ye);
  }, [c, g, r, T, I, _, k]), Z = A(function() {
    c({
      type: Id
    });
  }, [c]), W = A(function() {
    c({
      type: wd
    });
  }, [c]), Q = A(function() {
    c({
      type: Sd
    });
  }, [c]), H = A(function(R) {
    c({
      type: Ed,
      highlightedIndex: R
    });
  }, [c]), G = A(function(R) {
    c({
      type: Cs,
      selectedItem: R
    });
  }, [c]), z = A(function(R) {
    c({
      type: Td,
      inputValue: R
    });
  }, [c]), re = A(function() {
    c({
      type: Cd
    });
  }, [c]);
  return {
    // prop getters.
    getItemProps: D,
    getLabelProps: C,
    getMenuProps: P,
    getInputProps: F,
    getToggleButtonProps: M,
    // actions.
    toggleMenu: Z,
    openMenu: Q,
    closeMenu: W,
    setHighlightedIndex: H,
    setInputValue: z,
    selectItem: G,
    reset: re,
    // state.
    highlightedIndex: p,
    isOpen: d,
    selectedItem: m,
    inputValue: h
  };
}
a(kd, "useCombobox");
var Od = {
  activeIndex: -1,
  selectedItems: []
};
function Ap(e, t) {
  return Ut(e, t, Od);
}
a(Ap, "getInitialValue");
function Dp(e, t) {
  return lt(e, t, Od);
}
a(Dp, "getDefaultValue");
function fI(e) {
  var t = Ap(e, "activeIndex"), o = Ap(e, "selectedItems");
  return {
    activeIndex: t,
    selectedItems: o
  };
}
a(fI, "getInitialState");
function Mp(e) {
  if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey)
    return !1;
  var t = e.target;
  return !(t instanceof HTMLInputElement && // if element is a text input
  t.value !== "" && // and we have text in it
  // and cursor is either not at the start or is currently highlighting text.
  (t.selectionStart !== 0 || t.selectionEnd !== 0));
}
a(Mp, "isKeyDownOperationPermitted");
function mI(e, t) {
  return e.selectedItems === t.selectedItems && e.activeIndex === t.activeIndex;
}
a(mI, "isStateEqual");
var AR = {
  stateReducer: rn.stateReducer,
  itemToKey: rn.itemToKey,
  environment: rn.environment,
  selectedItems: Y.default.array,
  initialSelectedItems: Y.default.array,
  defaultSelectedItems: Y.default.array,
  getA11yStatusMessage: Y.default.func,
  activeIndex: Y.default.number,
  initialActiveIndex: Y.default.number,
  defaultActiveIndex: Y.default.number,
  onActiveIndexChange: Y.default.func,
  onSelectedItemsChange: Y.default.func,
  keyNavigationNext: Y.default.string,
  keyNavigationPrevious: Y.default.string
}, hI = {
  itemToKey: Wo.itemToKey,
  stateReducer: Wo.stateReducer,
  environment: Wo.environment,
  keyNavigationNext: "ArrowRight",
  keyNavigationPrevious: "ArrowLeft"
}, gI = Re, ks = 0, Os = 1, Ps = 2, As = 3, Ds = 4, Ms = 5, Ls = 6, Ns = 7, Fs = 8, Rs = 9, Bs = 10, Hs = 11, zs = 12, yI = /* @__PURE__ */ Object.
freeze({
  __proto__: null,
  DropdownClick: Ns,
  DropdownKeyDownBackspace: Ls,
  DropdownKeyDownNavigationPrevious: Ms,
  FunctionAddSelectedItem: Fs,
  FunctionRemoveSelectedItem: Rs,
  FunctionReset: zs,
  FunctionSetActiveIndex: Hs,
  FunctionSetSelectedItems: Bs,
  SelectedItemClick: ks,
  SelectedItemKeyDownBackspace: Ps,
  SelectedItemKeyDownDelete: Os,
  SelectedItemKeyDownNavigationNext: As,
  SelectedItemKeyDownNavigationPrevious: Ds
});
function bI(e, t) {
  var o = t.type, i = t.index, r = t.props, n = t.selectedItem, l = e.activeIndex, u = e.selectedItems, c;
  switch (o) {
    case ks:
      c = {
        activeIndex: i
      };
      break;
    case Ds:
      c = {
        activeIndex: l - 1 < 0 ? 0 : l - 1
      };
      break;
    case As:
      c = {
        activeIndex: l + 1 >= u.length ? -1 : l + 1
      };
      break;
    case Ps:
    case Os: {
      if (l < 0)
        break;
      var d = l;
      u.length === 1 ? d = -1 : l === u.length - 1 && (d = u.length - 2), c = j({
        selectedItems: [].concat(u.slice(0, l), u.slice(l + 1))
      }, {
        activeIndex: d
      });
      break;
    }
    case Ms:
      c = {
        activeIndex: u.length - 1
      };
      break;
    case Ls:
      c = {
        selectedItems: u.slice(0, u.length - 1)
      };
      break;
    case Fs:
      c = {
        selectedItems: [].concat(u, [n])
      };
      break;
    case Ns:
      c = {
        activeIndex: -1
      };
      break;
    case Rs: {
      var p = l, m = u.findIndex(function(f) {
        return r.itemToKey(f) === r.itemToKey(n);
      });
      if (m < 0)
        break;
      u.length === 1 ? p = -1 : m === u.length - 1 && (p = u.length - 2), c = {
        selectedItems: [].concat(u.slice(0, m), u.slice(m + 1)),
        activeIndex: p
      };
      break;
    }
    case Bs: {
      var h = t.selectedItems;
      c = {
        selectedItems: h
      };
      break;
    }
    case Hs: {
      var b = t.activeIndex;
      c = {
        activeIndex: b
      };
      break;
    }
    case zs:
      c = {
        activeIndex: Dp(r, "activeIndex"),
        selectedItems: Dp(r, "selectedItems")
      };
      break;
    default:
      throw new Error("Reducer called without proper action type.");
  }
  return j({}, e, c);
}
a(bI, "downshiftMultipleSelectionReducer");
var vI = ["refKey", "ref", "onClick", "onKeyDown", "selectedItem", "index"], xI = ["refKey", "ref", "onKeyDown", "onClick", "preventKeyActio\
n"];
Pd.stateChangeTypes = yI;
function Pd(e) {
  e === void 0 && (e = {}), gI(e, Pd);
  var t = j({}, hI, e), o = t.getA11yStatusMessage, i = t.environment, r = t.keyNavigationNext, n = t.keyNavigationPrevious, l = od(bI, t, fI,
  mI), u = l[0], c = l[1], d = u.activeIndex, p = u.selectedItems, m = hn(), h = q(null), b = q();
  b.current = [];
  var f = mn({
    state: u,
    props: t
  });
  os(o, u, [d, p], i), V(function() {
    m || (d === -1 && h.current ? h.current.focus() : b.current[d] && b.current[d].focus());
  }, [d]), rs({
    props: t,
    state: u
  });
  var y = ts("getDropdownProps"), S = U(function() {
    var T;
    return T = {}, T[n] = function() {
      c({
        type: Ds
      });
    }, T[r] = function() {
      c({
        type: As
      });
    }, T.Delete = /* @__PURE__ */ a(function() {
      c({
        type: Os
      });
    }, "Delete"), T.Backspace = /* @__PURE__ */ a(function() {
      c({
        type: Ps
      });
    }, "Backspace"), T;
  }, [c, r, n]), E = U(function() {
    var T;
    return T = {}, T[n] = function(C) {
      Mp(C) && c({
        type: Ms
      });
    }, T.Backspace = /* @__PURE__ */ a(function(P) {
      Mp(P) && c({
        type: Ls
      });
    }, "Backspace"), T;
  }, [c, n]), g = A(function(T) {
    var C, P = T === void 0 ? {} : T, D = P.refKey, M = D === void 0 ? "ref" : D, F = P.ref, Z = P.onClick, W = P.onKeyDown, Q = P.selectedItem,
    H = P.index, G = ke(P, vI), z = f.current.state, re = Ji(Q, H, z.selectedItems, "Pass either item or index to getSelectedItemProps!"), R = re[1],
    B = R > -1 && R === z.activeIndex, L = /* @__PURE__ */ a(function() {
      c({
        type: ks,
        index: R
      });
    }, "selectedItemHandleClick"), $ = /* @__PURE__ */ a(function(ie) {
      var te = po(ie);
      te && S[te] && S[te](ie);
    }, "selectedItemHandleKeyDown");
    return j((C = {}, C[M] = Ze(F, function(J) {
      J && b.current.push(J);
    }), C.tabIndex = B ? 0 : -1, C.onClick = le(Z, L), C.onKeyDown = le(W, $), C), G);
  }, [c, f, S]), v = A(function(T, C) {
    var P, D = T === void 0 ? {} : T, M = D.refKey, F = M === void 0 ? "ref" : M, Z = D.ref, W = D.onKeyDown, Q = D.onClick, H = D.preventKeyAction,
    G = H === void 0 ? !1 : H, z = ke(D, xI), re = C === void 0 ? {} : C, R = re.suppressRefError, B = R === void 0 ? !1 : R;
    y("getDropdownProps", B, F, h);
    var L = /* @__PURE__ */ a(function(ie) {
      var te = po(ie);
      te && E[te] && E[te](ie);
    }, "dropdownHandleKeyDown"), $ = /* @__PURE__ */ a(function() {
      c({
        type: Ns
      });
    }, "dropdownHandleClick");
    return j((P = {}, P[F] = Ze(Z, function(J) {
      J && (h.current = J);
    }), P), !G && {
      onKeyDown: le(W, L),
      onClick: le(Q, $)
    }, z);
  }, [c, E, y]), I = A(function(T) {
    c({
      type: Fs,
      selectedItem: T
    });
  }, [c]), w = A(function(T) {
    c({
      type: Rs,
      selectedItem: T
    });
  }, [c]), O = A(function(T) {
    c({
      type: Bs,
      selectedItems: T
    });
  }, [c]), _ = A(function(T) {
    c({
      type: Hs,
      activeIndex: T
    });
  }, [c]), k = A(function() {
    c({
      type: zs
    });
  }, [c]);
  return {
    getSelectedItemProps: g,
    getDropdownProps: v,
    addSelectedItem: I,
    removeSelectedItem: w,
    setSelectedItems: O,
    setActiveIndex: _,
    reset: k,
    selectedItems: p,
    activeIndex: d
  };
}
a(Pd, "useMultipleSelection");

// src/manager/components/sidebar/Search.tsx
var Dd = Ve(Ad(), 1);

// src/manager/components/sidebar/types.ts
function Ko(e) {
  return !!(e && e.showAll);
}
a(Ko, "isExpandType");
function Vs(e) {
  return !!(e && e.item);
}
a(Vs, "isSearchResult");

// src/manager/components/sidebar/Search.tsx
var { document: II } = se, js = 50, SI = {
  shouldSort: !0,
  tokenize: !0,
  findAllMatches: !0,
  includeScore: !0,
  includeMatches: !0,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    { name: "name", weight: 0.7 },
    { name: "path", weight: 0.3 }
  ]
}, wI = x.div({
  display: "flex",
  flexDirection: "row",
  columnGap: 6
}), EI = x.label({
  position: "absolute",
  left: -1e4,
  top: "auto",
  width: 1,
  height: 1,
  overflow: "hidden"
}), TI = x.div(({ theme: e, isMobile: t }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: t ? 4 : 2,
  flexGrow: 1,
  height: t ? 36 : 32,
  width: "100%",
  boxShadow: `${e.button.border} 0 0 0 1px inset`,
  borderRadius: e.appBorderRadius + 2,
  "&:has(input:focus), &:has(input:active)": {
    boxShadow: `${e.color.secondary} 0 0 0 1px inset`,
    background: e.background.app
  }
})), CI = x.div(({ theme: e, onClick: t }) => ({
  cursor: t ? "pointer" : "default",
  flex: "0 0 28px",
  height: "100%",
  pointerEvents: t ? "auto" : "none",
  color: e.textMutedColor,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
})), _I = x.input(({ theme: e, isMobile: t }) => ({
  appearance: "none",
  height: 28,
  width: "100%",
  padding: 0,
  border: 0,
  background: "transparent",
  fontSize: t ? "16px" : `${e.typography.size.s1 + 1}px`,
  fontFamily: "inherit",
  transition: "all 150ms",
  color: e.color.defaultText,
  outline: 0,
  "&::placeholder": {
    color: e.textMutedColor,
    opacity: 1
  },
  "&:valid ~ code, &:focus ~ code": {
    display: "none"
  },
  "&:invalid ~ svg": {
    display: "none"
  },
  "&:valid ~ svg": {
    display: "block"
  },
  "&::-ms-clear": {
    display: "none"
  },
  "&::-webkit-search-decoration, &::-webkit-search-cancel-button, &::-webkit-search-results-button, &::-webkit-search-results-decoration": {
    display: "none"
  }
})), kI = x.code(({ theme: e }) => ({
  margin: 5,
  marginTop: 6,
  height: 16,
  lineHeight: "16px",
  textAlign: "center",
  fontSize: "11px",
  color: e.base === "light" ? e.color.dark : e.textMutedColor,
  userSelect: "none",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  gap: 4,
  flexShrink: 0
})), OI = x.span({
  fontSize: "14px"
}), PI = x.div({
  display: "flex",
  alignItems: "center",
  gap: 2
}), AI = x.div({ outline: 0 }), Md = s.memo(/* @__PURE__ */ a(function({
  children: t,
  dataset: o,
  enableShortcuts: i = !0,
  getLastViewed: r,
  initialQuery: n = "",
  searchBarContent: l,
  searchFieldContent: u
}) {
  let c = oe(), d = q(null), [p, m] = K("Find components"), [h, b] = K(!1), f = c ? Ye(c.getShortcutKeys().search) : "/", y = A(() => {
    let w = o.entries.reduce((O, [_, { index: k, allStatuses: T }]) => {
      let C = Br(k || {}, T ?? {});
      return k && O.push(
        ...Object.values(k).map((P) => {
          let D = T?.[P.id], M = D ? Ho(Object.values(D).map((F) => F.value)) : null;
          return {
            ...Vi(P, o.hash[_]),
            status: M ?? C[P.id] ?? null
          };
        })
      ), O;
    }, []);
    return new Dd.default(w, SI);
  }, [o]), S = A(
    (w) => {
      let O = y();
      if (!w)
        return [];
      let _ = [], k = /* @__PURE__ */ new Set(), T = O.search(w).filter(({ item: C }) => !(C.type === "component" || C.type === "docs" || C.
      type === "story") || // @ts-expect-error (non strict)
      k.has(C.parent) ? !1 : (k.add(C.id), !0));
      return T.length && (_ = T.slice(0, h ? 1e3 : js), T.length > js && !h && _.push({
        showAll: /* @__PURE__ */ a(() => b(!0), "showAll"),
        totalCount: T.length,
        moreCount: T.length - js
      })), _;
    },
    [h, y]
  ), E = A(
    (w) => {
      if (Vs(w)) {
        let { id: O, refId: _ } = w.item;
        c?.selectStory(O, void 0, { ref: _ !== at && _ }), d.current.blur(), b(!1);
        return;
      }
      Ko(w) && w.showAll();
    },
    [c]
  ), g = A((w, O) => {
    b(!1);
  }, []), v = A(
    (w, O) => {
      switch (O.type) {
        case qt.stateChangeTypes.blurInput:
          return {
            ...O,
            // Prevent clearing the input on blur
            inputValue: w.inputValue,
            // Return to the tree view after selecting an item
            isOpen: w.inputValue && !w.selectedItem
          };
        case qt.stateChangeTypes.mouseUp:
          return w;
        case qt.stateChangeTypes.keyDownEscape:
          return w.inputValue ? { ...O, inputValue: "", isOpen: !0, selectedItem: null } : { ...O, isOpen: !1, selectedItem: null };
        case qt.stateChangeTypes.clickItem:
        case qt.stateChangeTypes.keyDownEnter:
          return Vs(O.selectedItem) ? { ...O, inputValue: w.inputValue } : Ko(O.selectedItem) ? w : O;
        default:
          return O;
      }
    },
    []
  ), { isMobile: I } = ge();
  return (
    // @ts-expect-error (non strict)
    /* @__PURE__ */ s.createElement(
      qt,
      {
        initialInputValue: n,
        stateReducer: v,
        itemToString: (w) => w?.item?.name || "",
        scrollIntoView: (w) => zt(w),
        onSelect: E,
        onInputValueChange: g
      },
      ({
        isOpen: w,
        openMenu: O,
        closeMenu: _,
        inputValue: k,
        clearSelection: T,
        getInputProps: C,
        getItemProps: P,
        getLabelProps: D,
        getMenuProps: M,
        getRootProps: F,
        highlightedIndex: Z
      }) => {
        let W = k ? k.trim() : "", Q = W ? S(W) : [], H = !W && r();
        H && H.length && (Q = H.reduce((R, { storyId: B, refId: L }) => {
          let $ = o.hash[L];
          if ($ && $.index && $.index[B]) {
            let J = $.index[B], ie = J.type === "story" ? $.index[J.parent] : J;
            R.some((te) => te.item.refId === L && te.item.id === ie.id) || R.push({ item: Vi(ie, o.hash[L]), matches: [], score: 0 });
          }
          return R;
        }, []));
        let G = "storybook-explorer-searchfield", z = C({
          id: G,
          ref: d,
          required: !0,
          type: "search",
          placeholder: p,
          onFocus: /* @__PURE__ */ a(() => {
            O(), m("Type to find...");
          }, "onFocus"),
          onBlur: /* @__PURE__ */ a(() => m("Find components"), "onBlur"),
          onKeyDown: /* @__PURE__ */ a((R) => {
            R.key === "Escape" && k.length === 0 && d.current.blur();
          }, "onKeyDown")
        }), re = D({
          htmlFor: G
        });
        return /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(EI, { ...re }, "Search for components"), /* @__PURE__ */ s.
        createElement(wI, null, /* @__PURE__ */ s.createElement(
          TI,
          {
            ...F({ refKey: "" }, { suppressRefError: !0 }),
            isMobile: I,
            className: "search-field"
          },
          /* @__PURE__ */ s.createElement(CI, null, /* @__PURE__ */ s.createElement(So, null)),
          /* @__PURE__ */ s.createElement(_I, { ...z, isMobile: I }),
          !I && i && !w && /* @__PURE__ */ s.createElement(kI, null, f === "\u2318 K" ? /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.
          createElement(OI, null, "\u2318"), "K") : f),
          /* @__PURE__ */ s.createElement(PI, null, w && /* @__PURE__ */ s.createElement(ee, { onClick: () => T() }, /* @__PURE__ */ s.createElement(
          je, null)), u)
        ), l), /* @__PURE__ */ s.createElement(AI, { tabIndex: 0, id: "storybook-explorer-menu" }, t({
          query: W,
          results: Q,
          isBrowsing: !w && II.activeElement !== d.current,
          closeMenu: _,
          getMenuProps: M,
          getItemProps: P,
          highlightedIndex: Z
        })));
      }
    )
  );
}, "Search"));

// src/manager/components/sidebar/SearchResults.tsx
var { document: Ld } = se, DI = x.ol({
  listStyle: "none",
  margin: 0,
  padding: 0
}), MI = x.li(({ theme: e, isHighlighted: t }) => ({
  width: "100%",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  textAlign: "left",
  color: "inherit",
  fontSize: `${e.typography.size.s2}px`,
  background: t ? e.background.hoverable : "transparent",
  minHeight: 28,
  borderRadius: 4,
  gap: 6,
  paddingTop: 7,
  paddingBottom: 7,
  paddingLeft: 8,
  paddingRight: 8,
  "&:hover, &:focus": {
    background: Te(0.93, e.color.secondary),
    outline: "none"
  }
})), LI = x.div({
  marginTop: 2
}), NI = x.div({
  flex: 1,
  display: "flex",
  flexDirection: "column"
}), FI = x.div(({ theme: e }) => ({
  marginTop: 20,
  textAlign: "center",
  fontSize: `${e.typography.size.s2}px`,
  lineHeight: "18px",
  color: e.color.defaultText,
  small: {
    color: e.textMutedColor,
    fontSize: `${e.typography.size.s1}px`
  }
})), RI = x.mark(({ theme: e }) => ({
  background: "transparent",
  color: e.color.secondary
})), BI = x.div({
  marginTop: 8
}), HI = x.div(({ theme: e }) => ({
  display: "flex",
  justifyContent: "space-between",
  fontSize: `${e.typography.size.s1 - 1}px`,
  fontWeight: e.typography.weight.bold,
  minHeight: 28,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: e.textMutedColor,
  marginTop: 16,
  marginBottom: 4,
  alignItems: "center",
  ".search-result-recentlyOpened-clear": {
    visibility: "hidden"
  },
  "&:hover": {
    ".search-result-recentlyOpened-clear": {
      visibility: "visible"
    }
  }
})), Nd = s.memo(/* @__PURE__ */ a(function({
  children: t,
  match: o
}) {
  if (!o)
    return t;
  let { value: i, indices: r } = o, { nodes: n } = r.reduce(
    ({ cursor: l, nodes: u }, [c, d], p, { length: m }) => (u.push(/* @__PURE__ */ s.createElement("span", { key: `${p}-1` }, i.slice(l, c))),
    u.push(/* @__PURE__ */ s.createElement(RI, { key: `${p}-2` }, i.slice(c, d + 1))), p === m - 1 && u.push(/* @__PURE__ */ s.createElement(
    "span", { key: `${p}-3` }, i.slice(d + 1))), { cursor: d + 1, nodes: u }),
    { cursor: 0, nodes: [] }
  );
  return /* @__PURE__ */ s.createElement("span", null, n);
}, "Highlight")), zI = x.div(({ theme: e }) => ({
  display: "grid",
  justifyContent: "start",
  gridAutoColumns: "auto",
  gridAutoFlow: "column",
  "& > span": {
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
})), WI = x.div(({ theme: e }) => ({
  display: "grid",
  justifyContent: "start",
  gridAutoColumns: "auto",
  gridAutoFlow: "column",
  fontSize: `${e.typography.size.s1 - 1}px`,
  "& > span": {
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  "& > span + span": {
    "&:before": {
      content: "' / '"
    }
  }
})), VI = s.memo(/* @__PURE__ */ a(function({ item: t, matches: o, onClick: i, ...r }) {
  let n = A(
    (p) => {
      p.preventDefault(), i?.(p);
    },
    [i]
  ), l = oe();
  V(() => {
    l && r.isHighlighted && t.type === "component" && l.emit(Ct, { ids: [t.children[0]] }, { options: { target: t.refId } });
  }, [r.isHighlighted, t]);
  let u = o.find((p) => p.key === "name"), c = o.filter((p) => p.key === "path"), [d] = t.status ? Bo[t.status] : [];
  return /* @__PURE__ */ s.createElement(MI, { ...r, onClick: n }, /* @__PURE__ */ s.createElement(LI, null, t.type === "component" && /* @__PURE__ */ s.
  createElement(It, { viewBox: "0 0 14 14", width: "14", height: "14", type: "component" }, /* @__PURE__ */ s.createElement(Me, { type: "com\
ponent" })), t.type === "story" && /* @__PURE__ */ s.createElement(It, { viewBox: "0 0 14 14", width: "14", height: "14", type: "story" }, /* @__PURE__ */ s.
  createElement(Me, { type: "story" })), !(t.type === "component" || t.type === "story") && /* @__PURE__ */ s.createElement(It, { viewBox: "\
0 0 14 14", width: "14", height: "14", type: "document" }, /* @__PURE__ */ s.createElement(Me, { type: "document" }))), /* @__PURE__ */ s.createElement(
  NI, { className: "search-result-item--label" }, /* @__PURE__ */ s.createElement(zI, null, /* @__PURE__ */ s.createElement(Nd, { match: u },
  t.name)), /* @__PURE__ */ s.createElement(WI, null, t.path.map((p, m) => /* @__PURE__ */ s.createElement("span", { key: m }, /* @__PURE__ */ s.
  createElement(Nd, { match: c.find((h) => h.arrayIndex === m) }, p))))), t.status ? /* @__PURE__ */ s.createElement(qc, { status: t.status },
  d) : null);
}, "Result")), Fd = s.memo(/* @__PURE__ */ a(function({
  query: t,
  results: o,
  closeMenu: i,
  getMenuProps: r,
  getItemProps: n,
  highlightedIndex: l,
  isLoading: u = !1,
  enableShortcuts: c = !0,
  clearLastViewed: d
}) {
  let p = oe();
  V(() => {
    let b = /* @__PURE__ */ a((f) => {
      if (!(!c || u || f.repeat) && St(!1, f) && $e("Escape", f)) {
        if (f.target?.id === "storybook-explorer-searchfield")
          return;
        f.preventDefault(), i();
      }
    }, "handleEscape");
    return Ld.addEventListener("keydown", b), () => Ld.removeEventListener("keydown", b);
  }, [i, c, u]);
  let m = A((b) => {
    if (!p)
      return;
    let f = b.currentTarget, y = f.getAttribute("data-id"), S = f.getAttribute("data-refid"), E = p.resolveStory(y, S === "storybook_interna\
l" ? void 0 : S);
    E?.type === "component" && p.emit(Ct, {
      // @ts-expect-error (TODO)
      ids: [E.isLeaf ? E.id : E.children[0]],
      options: { target: S }
    });
  }, []), h = /* @__PURE__ */ a(() => {
    d(), i();
  }, "handleClearLastViewed");
  return /* @__PURE__ */ s.createElement(DI, { ...r(), key: "results-list" }, o.length > 0 && !t && /* @__PURE__ */ s.createElement(HI, { className: "\
search-result-recentlyOpened" }, "Recently opened", /* @__PURE__ */ s.createElement(
    ee,
    {
      className: "search-result-recentlyOpened-clear",
      onClick: h
    },
    /* @__PURE__ */ s.createElement(Yn, null)
  )), o.length === 0 && t && /* @__PURE__ */ s.createElement("li", null, /* @__PURE__ */ s.createElement(FI, null, /* @__PURE__ */ s.createElement(
  "strong", null, "No components found"), /* @__PURE__ */ s.createElement("br", null), /* @__PURE__ */ s.createElement("small", null, "Find \
components by name or path."))), o.map((b, f) => {
    if (Ko(b)) {
      let E = { ...o, ...n({ key: f, index: f, item: b }) }, { key: g, ...v } = E;
      return /* @__PURE__ */ s.createElement(BI, { key: "search-result-expand" }, /* @__PURE__ */ s.createElement(he, { key: g, ...v, size: "\
small" }, "Show ", b.moreCount, " more results"));
    }
    let { item: y } = b, S = `${y.refId}::${y.id}`;
    return /* @__PURE__ */ s.createElement(
      VI,
      {
        ...b,
        ...n({ key: S, index: f, item: b }),
        isHighlighted: l === f,
        key: S,
        "data-id": b.item.id,
        "data-refid": b.item.refId,
        onMouseOver: m,
        className: "search-result-item"
      }
    );
  }));
}, "SearchResults"));

// src/manager/components/sidebar/TestingModule.tsx
var Ks = 500, jI = Pt({
  "0%": { transform: "rotate(0deg)" },
  "10%": { transform: "rotate(10deg)" },
  "40%": { transform: "rotate(170deg)" },
  "50%": { transform: "rotate(180deg)" },
  "60%": { transform: "rotate(190deg)" },
  "90%": { transform: "rotate(350deg)" },
  "100%": { transform: "rotate(360deg)" }
}), KI = x.div(({ crashed: e, failed: t, running: o, updated: i, theme: r }) => ({
  position: "relative",
  lineHeight: "16px",
  width: "100%",
  padding: 1,
  overflow: "hidden",
  backgroundColor: `var(--sb-sidebar-bottom-card-background, ${r.background.content})`,
  borderRadius: `var(--sb-sidebar-bottom-card-border-radius, ${r.appBorderRadius + 1}px)`,
  boxShadow: `inset 0 0 0 1px ${e && !o ? r.color.negative : i ? r.color.positive : r.appBorderColor}, var(--sb-sidebar-bottom-card-box-shad\
ow, 0 1px 2px 0 rgba(0, 0, 0, 0.05), 0px -5px 20px 10px ${r.background.app})`,
  transition: "box-shadow 1s",
  "&:after": {
    content: '""',
    display: o ? "block" : "none",
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: "calc(max(100vw, 100vh) * -0.5)",
    marginTop: "calc(max(100vw, 100vh) * -0.5)",
    height: "max(100vw, 100vh)",
    width: "max(100vw, 100vh)",
    animation: `${jI} 3s linear infinite`,
    background: t ? (
      // Hardcoded colors to prevent themes from messing with them (orange+gold, secondary+seafoam)
      "conic-gradient(transparent 90deg, #FC521F 150deg, #FFAE00 210deg, transparent 270deg)"
    ) : "conic-gradient(transparent 90deg, #029CFD 150deg, #37D5D3 210deg, transparent 270deg)",
    opacity: 1,
    willChange: "auto"
  }
})), $I = x.div(({ theme: e }) => ({
  position: "relative",
  zIndex: 1,
  borderRadius: e.appBorderRadius,
  backgroundColor: e.background.content,
  display: "flex",
  flexDirection: "column-reverse",
  "&:hover #testing-module-collapse-toggle": {
    opacity: 1
  }
})), UI = x.div(({ theme: e }) => ({
  overflow: "hidden",
  willChange: "auto",
  boxShadow: `inset 0 -1px 0 ${e.appBorderColor}`
})), GI = x.div({
  display: "flex",
  flexDirection: "column"
}), qI = x.div(({ onClick: e }) => ({
  display: "flex",
  width: "100%",
  cursor: e ? "pointer" : "default",
  userSelect: "none",
  alignItems: "center",
  justifyContent: "space-between",
  overflow: "hidden",
  padding: 4,
  gap: 4
})), YI = x.div({
  display: "flex",
  flexBasis: "100%",
  containerType: "inline-size"
}), QI = x.div({
  display: "flex",
  justifyContent: "flex-end",
  gap: 4
}), XI = x(he)({
  opacity: 0,
  transition: "opacity 250ms",
  willChange: "auto",
  "&:focus, &:hover": {
    opacity: 1
  }
}), ZI = x(he)({
  // 90px is the width of the button when the label is visible
  "@container (max-width: 90px)": {
    span: {
      display: "none"
    }
  }
}), Rd = x(he)(
  { minWidth: 28 },
  ({ active: e, status: t, theme: o }) => !e && (o.base === "light" ? {
    background: {
      negative: o.background.negative,
      warning: o.background.warning
    }[t],
    color: {
      negative: o.color.negativeText,
      warning: o.color.warningText
    }[t]
  } : {
    background: {
      negative: `${o.color.negative}22`,
      warning: `${o.color.warning}22`
    }[t],
    color: {
      negative: o.color.negative,
      warning: o.color.warning
    }[t]
  })
), JI = x.div(({ theme: e }) => ({
  padding: 4,
  "&:not(:last-child)": {
    boxShadow: `inset 0 -1px 0 ${e.appBorderColor}`
  }
})), Bd = /* @__PURE__ */ a(({
  registeredTestProviders: e,
  testProviderStates: t,
  hasStatuses: o,
  clearStatuses: i,
  onRunAll: r,
  errorCount: n,
  errorsActive: l,
  setErrorsActive: u,
  warningCount: c,
  warningsActive: d,
  setWarningsActive: p
}) => {
  let m = q(null), h = q(null), [b, f] = K(Ks), [y, S] = K(!0), [E, g] = K(!1), [v, I] = K(!1), w = q();
  V(() => {
    let C = Jt.onSettingsChanged(() => {
      I(!0), clearTimeout(w.current), w.current = setTimeout(() => {
        I(!1);
      }, 1e3);
    });
    return () => {
      C(), clearTimeout(w.current);
    };
  }, []), V(() => {
    if (h.current) {
      f(h.current?.getBoundingClientRect().height || Ks);
      let C = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          if (h.current && !y) {
            let P = h.current?.getBoundingClientRect().height || Ks;
            f(P);
          }
        });
      });
      return C.observe(h.current), () => C.disconnect();
    }
  }, [y]);
  let O = A((C, P) => {
    C?.stopPropagation(), g(!0), S((D) => P ?? !D), m.current && clearTimeout(m.current), m.current = setTimeout(() => {
      g(!1);
    }, 250);
  }, []), _ = Object.values(t).some(
    (C) => C === "test-provider-state:running"
  ), k = Object.values(t).some(
    (C) => C === "test-provider-state:crashed"
  ), T = Object.values(e).length > 0;
  return V(() => {
    k && y && O(void 0, !1);
  }, [k, y, O]), !T && (!n || !c) ? null : /* @__PURE__ */ s.createElement(
    KI,
    {
      id: "storybook-testing-module",
      running: _,
      crashed: k,
      failed: n > 0,
      updated: v,
      "data-updated": v
    },
    /* @__PURE__ */ s.createElement($I, null, /* @__PURE__ */ s.createElement(qI, { ...T ? { onClick: /* @__PURE__ */ a((C) => O(C), "onClic\
k") } : {} }, /* @__PURE__ */ s.createElement(YI, null, T && /* @__PURE__ */ s.createElement(
      ve,
      {
        hasChrome: !1,
        tooltip: /* @__PURE__ */ s.createElement(rt, { note: _ ? "Running tests..." : "Start all tests" }),
        trigger: "hover"
      },
      /* @__PURE__ */ s.createElement(
        ZI,
        {
          size: "medium",
          variant: "ghost",
          padding: "small",
          onClick: (C) => {
            C.stopPropagation(), r();
          },
          disabled: _
        },
        /* @__PURE__ */ s.createElement(Wn, null),
        /* @__PURE__ */ s.createElement("span", null, _ ? "Running..." : "Run tests")
      )
    )), /* @__PURE__ */ s.createElement(QI, null, T && /* @__PURE__ */ s.createElement(
      ve,
      {
        hasChrome: !1,
        tooltip: /* @__PURE__ */ s.createElement(
          rt,
          {
            note: y ? "Expand testing module" : "Collapse testing module"
          }
        ),
        trigger: "hover"
      },
      /* @__PURE__ */ s.createElement(
        XI,
        {
          size: "medium",
          variant: "ghost",
          padding: "small",
          onClick: (C) => O(C),
          id: "testing-module-collapse-toggle",
          "aria-label": y ? "Expand testing module" : "Collapse testing module"
        },
        /* @__PURE__ */ s.createElement(
          Tn,
          {
            style: {
              transform: y ? "none" : "rotate(180deg)",
              transition: "transform 250ms",
              willChange: "auto"
            }
          }
        )
      )
    ), n > 0 && /* @__PURE__ */ s.createElement(
      ve,
      {
        hasChrome: !1,
        tooltip: /* @__PURE__ */ s.createElement(rt, { note: "Toggle errors" }),
        trigger: "hover"
      },
      /* @__PURE__ */ s.createElement(
        Rd,
        {
          id: "errors-found-filter",
          size: "medium",
          variant: "ghost",
          padding: n < 10 ? "medium" : "small",
          status: "negative",
          active: l,
          onClick: (C) => {
            C.stopPropagation(), u(!l);
          },
          "aria-label": "Toggle errors"
        },
        n < 1e3 ? n : "999+"
      )
    ), c > 0 && /* @__PURE__ */ s.createElement(
      ve,
      {
        hasChrome: !1,
        tooltip: /* @__PURE__ */ s.createElement(rt, { note: "Toggle warnings" }),
        trigger: "hover"
      },
      /* @__PURE__ */ s.createElement(
        Rd,
        {
          id: "warnings-found-filter",
          size: "medium",
          variant: "ghost",
          padding: c < 10 ? "medium" : "small",
          status: "warning",
          active: d,
          onClick: (C) => {
            C.stopPropagation(), p(!d);
          },
          "aria-label": "Toggle warnings"
        },
        c < 1e3 ? c : "999+"
      )
    ), o && /* @__PURE__ */ s.createElement(
      ve,
      {
        hasChrome: !1,
        tooltip: /* @__PURE__ */ s.createElement(
          rt,
          {
            note: _ ? "Can't clear statuses while tests are running" : "Clear all statuses"
          }
        ),
        trigger: "hover"
      },
      /* @__PURE__ */ s.createElement(
        ee,
        {
          id: "clear-statuses",
          size: "medium",
          onClick: (C) => {
            C.stopPropagation(), i();
          },
          disabled: _,
          "aria-label": _ ? "Can't clear statuses while tests are running" : "Clear all statuses"
        },
        /* @__PURE__ */ s.createElement(Gn, null)
      )
    ))), T && /* @__PURE__ */ s.createElement(
      UI,
      {
        "data-testid": "collapse",
        ...y && { inert: "" },
        style: {
          transition: E ? "max-height 250ms" : "max-height 0ms",
          display: T ? "block" : "none",
          maxHeight: y ? 0 : b
        }
      },
      /* @__PURE__ */ s.createElement(GI, { ref: h }, Object.values(e).map((C) => {
        let { render: P, id: D } = C;
        return P ? /* @__PURE__ */ s.createElement(JI, { key: D, "data-module-id": D }, /* @__PURE__ */ s.createElement(P, null)) : (Fa.warn(
          `No render function found for test provider with id '${D}', skipping...`
        ), null);
      }))
    ))
  );
}, "TestingModule");

// src/manager/components/sidebar/SidebarBottom.tsx
var eS = "sidebar-bottom-spacer", tS = "sidebar-bottom-wrapper", oS = /* @__PURE__ */ a(() => !0, "filterNone"), rS = /* @__PURE__ */ a(({ statuses: e = {} }) => Object.
values(e).some(({ value: t }) => t === "status-value:warning"), "filterWarn"), nS = /* @__PURE__ */ a(({ statuses: e = {} }) => Object.values(
e).some(({ value: t }) => t === "status-value:error"), "filterError"), iS = /* @__PURE__ */ a(({ statuses: e = {} }) => Object.values(e).some(
  ({ value: t }) => ["status-value:warning", "status-value:error"].includes(t)
), "filterBoth"), sS = /* @__PURE__ */ a((e = !1, t = !1) => e && t ? iS : e ? rS : t ? nS : oS, "getFilter"), aS = x.div({
  pointerEvents: "none"
}), lS = x.div(({ theme: e }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "12px 0",
  margin: "0 12px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  color: e.color.defaultText,
  fontSize: e.typography.size.s1,
  overflow: "hidden",
  "&:empty": {
    display: "none"
  },
  // Integrators can use these to style their custom additions
  "--sb-sidebar-bottom-card-background": e.background.content,
  "--sb-sidebar-bottom-card-border": `1px solid ${e.appBorderColor}`,
  "--sb-sidebar-bottom-card-border-radius": `${e.appBorderRadius + 1}px`,
  "--sb-sidebar-bottom-card-box-shadow": `0 1px 2px 0 rgba(0, 0, 0, 0.05), 0px -5px 20px 10px ${e.background.app}`
})), uS = /* @__PURE__ */ a(({
  api: e,
  notifications: t = [],
  errorCount: o,
  warningCount: i,
  hasStatuses: r,
  isDevelopment: n,
  testProviderStates: l,
  registeredTestProviders: u,
  onRunAll: c
}) => {
  let d = q(null), p = q(null), [m, h] = K(!1), [b, f] = K(!1);
  return V(() => {
    if (d.current && p.current) {
      let y = new ResizeObserver(() => {
        d.current && p.current && (d.current.style.height = `${p.current.scrollHeight}px`);
      });
      return y.observe(p.current), () => y.disconnect();
    }
  }, []), V(() => {
    let y = sS(i > 0 && m, o > 0 && b);
    e.experimental_setFilter("sidebar-bottom-filter", y);
  }, [e, i, o, m, b]), !i && !o && Object.values(u).length === 0 && t.length === 0 ? null : /* @__PURE__ */ s.createElement(Ee, null, /* @__PURE__ */ s.
  createElement(aS, { id: eS, ref: d }), /* @__PURE__ */ s.createElement(lS, { id: tS, ref: p }, /* @__PURE__ */ s.createElement(Ir, { notifications: t,
  clearNotification: e.clearNotification }), n && /* @__PURE__ */ s.createElement(
    Bd,
    {
      registeredTestProviders: u,
      testProviderStates: l,
      onRunAll: /* @__PURE__ */ a(() => {
        c(), f(!1), h(!1);
      }, "onRunAll"),
      hasStatuses: r,
      clearStatuses: /* @__PURE__ */ a(() => {
        Ot.unset(), Jt.clearAll(), f(!1), h(!1);
      }, "clearStatuses"),
      errorCount: o,
      errorsActive: b,
      setErrorsActive: f,
      warningCount: i,
      warningsActive: m,
      setWarningsActive: h
    }
  )));
}, "SidebarBottomBase"), Hd = /* @__PURE__ */ a(({ isDevelopment: e }) => {
  let t = oe(), o = t.getElements(Ce.experimental_TEST_PROVIDER), { notifications: i } = Ne(), { hasStatuses: r, errorCount: n, warningCount: l } = Eo(
  (c) => Object.values(c).reduce(
    (d, p) => (Object.values(p).forEach((m) => {
      d.hasStatuses = !0, m.value === "status-value:error" && (d.errorCount += 1), m.value === "status-value:warning" && (d.warningCount += 1);
    }), d),
    { errorCount: 0, warningCount: 0, hasStatuses: !1 }
  )), u = ti();
  return /* @__PURE__ */ s.createElement(
    uS,
    {
      api: t,
      notifications: i,
      hasStatuses: r,
      errorCount: n,
      warningCount: l,
      isDevelopment: e,
      testProviderStates: u,
      registeredTestProviders: o,
      onRunAll: Jt.runAll
    }
  );
}, "SidebarBottom");

// src/manager/components/sidebar/TagsFilterPanel.tsx
var cS = /* @__PURE__ */ new Set(["play-fn"]), pS = x.div({
  minWidth: 180,
  maxWidth: 220
}), zd = /* @__PURE__ */ a(({
  api: e,
  allTags: t,
  selectedTags: o,
  toggleTag: i,
  isDevelopment: r
}) => {
  let n = t.filter((c) => !cS.has(c)), l = e.getDocsUrl({ subpath: "writing-stories/tags#filtering-by-custom-tags" }), u = [
    t.map((c) => {
      let d = o.includes(c), p = `tag-${c}`;
      return {
        id: p,
        title: c,
        right: /* @__PURE__ */ s.createElement(
          "input",
          {
            type: "checkbox",
            id: p,
            name: p,
            value: c,
            checked: d,
            onChange: () => {
            }
          }
        ),
        onClick: /* @__PURE__ */ a(() => i(c), "onClick")
      };
    })
  ];
  return t.length === 0 && u.push([
    {
      id: "no-tags",
      title: "There are no tags. Use tags to organize and filter your Storybook.",
      isIndented: !1
    }
  ]), n.length === 0 && r && u.push([
    {
      id: "tags-docs",
      title: "Learn how to add tags",
      icon: /* @__PURE__ */ s.createElement(tt, null),
      href: l
    }
  ]), /* @__PURE__ */ s.createElement(pS, null, /* @__PURE__ */ s.createElement(ot, { links: u }));
}, "TagsFilterPanel");

// src/manager/components/sidebar/TagsFilter.tsx
var dS = "tags-filter", fS = /* @__PURE__ */ new Set([
  "dev",
  "docs-only",
  "test-only",
  "autodocs",
  "test",
  "attached-mdx",
  "unattached-mdx"
]), mS = x.div({
  position: "relative"
}), hS = x(tr)(({ theme: e }) => ({
  position: "absolute",
  top: 7,
  right: 7,
  transform: "translate(50%, -50%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 3,
  height: 6,
  minWidth: 6,
  lineHeight: "px",
  boxShadow: `${e.barSelectedColor} 0 0 0 1px inset`,
  fontSize: e.typography.size.s1 - 1,
  background: e.color.secondary,
  color: e.color.lightest
})), Wd = /* @__PURE__ */ a(({
  api: e,
  indexJson: t,
  initialSelectedTags: o = [],
  isDevelopment: i
}) => {
  let [r, n] = K(o), [l, u] = K(!1), c = r.length > 0;
  V(() => {
    e.experimental_setFilter(dS, (b) => r.length === 0 ? !0 : r.some((f) => b.tags?.includes(f)));
  }, [e, r]);
  let d = Object.values(t.entries).reduce((b, f) => (f.tags?.forEach((y) => {
    fS.has(y) || b.add(y);
  }), b), /* @__PURE__ */ new Set()), p = A(
    (b) => {
      r.includes(b) ? n(r.filter((f) => f !== b)) : n([...r, b]);
    },
    [r, n]
  ), m = A(
    (b) => {
      b.preventDefault(), u(!l);
    },
    [l, u]
  );
  if (d.size === 0 && !i)
    return null;
  let h = Array.from(d);
  return h.sort(), /* @__PURE__ */ s.createElement(
    ve,
    {
      placement: "bottom",
      trigger: "click",
      onVisibleChange: u,
      tooltip: () => /* @__PURE__ */ s.createElement(
        zd,
        {
          api: e,
          allTags: h,
          selectedTags: r,
          toggleTag: p,
          isDevelopment: i
        }
      ),
      closeOnOutsideClick: !0
    },
    /* @__PURE__ */ s.createElement(mS, null, /* @__PURE__ */ s.createElement(ee, { key: "tags", title: "Tag filters", active: c, onClick: m },
    /* @__PURE__ */ s.createElement(Nn, null)), r.length > 0 && /* @__PURE__ */ s.createElement(hS, null))
  );
}, "TagsFilter");

// src/manager/components/sidebar/useLastViewed.ts
var bn = Ve(Vd(), 1);
var jd = Ui((e) => bn.default.set("lastViewedStoryIds", e), 1e3), Kd = /* @__PURE__ */ a((e) => {
  let t = U(() => {
    let r = bn.default.get("lastViewedStoryIds");
    return !r || !Array.isArray(r) ? [] : r.some((n) => typeof n == "object" && n.storyId && n.refId) ? r : [];
  }, [bn.default]), o = q(t), i = A(
    (r) => {
      let n = o.current, l = n.findIndex(
        ({ storyId: u, refId: c }) => u === r.storyId && c === r.refId
      );
      l !== 0 && (l === -1 ? o.current = [r, ...n] : o.current = [r, ...n.slice(0, l), ...n.slice(l + 1)], jd(o.current));
    },
    [o]
  );
  return V(() => {
    e && i(e);
  }, [e]), {
    getLastViewed: A(() => o.current, [o]),
    clearLastViewed: A(() => {
      o.current = o.current.slice(0, 1), jd(o.current);
    }, [o])
  };
}, "useLastViewed");

// src/manager/components/sidebar/Sidebar.tsx
var at = "storybook_internal", gS = x.nav(({ theme: e }) => ({
  position: "absolute",
  zIndex: 1,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: e.background.content,
  [Qe]: {
    background: e.background.app
  }
})), yS = x(ct)({
  paddingLeft: 12,
  paddingRight: 12,
  paddingBottom: 20,
  paddingTop: 16,
  flex: 1
}), bS = x(rt)({
  margin: 0
}), vS = x(ee)(({ theme: e, isMobile: t }) => ({
  color: e.color.mediumdark,
  width: t ? 36 : 32,
  height: t ? 36 : 32,
  borderRadius: e.appBorderRadius + 2
})), xS = s.memo(/* @__PURE__ */ a(function({
  children: t,
  condition: o
}) {
  let [i, r] = s.Children.toArray(t);
  return /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement("div", { style: { display: o ? "block" : "none" } },
  i), /* @__PURE__ */ s.createElement("div", { style: { display: o ? "none" : "block" } }, r));
}, "Swap")), IS = /* @__PURE__ */ a((e, t, o, i, r) => {
  let n = U(
    () => ({
      [at]: {
        index: e,
        filteredIndex: e,
        indexError: t,
        previewInitialized: o,
        allStatuses: i,
        title: null,
        id: at,
        url: "iframe.html"
      },
      ...r
    }),
    [r, e, t, o, i]
  );
  return U(() => ({ hash: n, entries: Object.entries(n) }), [n]);
}, "useCombination"), SS = se.STORYBOOK_RENDERER === "react", $d = s.memo(/* @__PURE__ */ a(function({
  // @ts-expect-error (non strict)
  storyId: t = null,
  refId: o = at,
  index: i,
  indexJson: r,
  indexError: n,
  allStatuses: l,
  previewInitialized: u,
  menu: c,
  menuHighlighted: d = !1,
  enableShortcuts: p = !0,
  isDevelopment: m = se.CONFIG_TYPE === "DEVELOPMENT",
  refs: h = {},
  onMenuClick: b,
  showCreateStoryButton: f = m && SS
}) {
  let [y, S] = K(!1), E = U(() => t && { storyId: t, refId: o }, [t, o]), g = IS(i, n, u, l, h), v = !i && !n, I = Kd(E), { isMobile: w } = ge(),
  O = oe();
  return /* @__PURE__ */ s.createElement(gS, { className: "container sidebar-container", "aria-label": "Global" }, /* @__PURE__ */ s.createElement(
  nr, { vertical: !0, offset: 3, scrollbarSize: 6 }, /* @__PURE__ */ s.createElement(yS, { row: 1.6 }, /* @__PURE__ */ s.createElement(
    vp,
    {
      className: "sidebar-header",
      menuHighlighted: d,
      menu: c,
      skipLinkHref: "#storybook-preview-wrapper",
      isLoading: v,
      onMenuClick: b
    }
  ), /* @__PURE__ */ s.createElement(
    Md,
    {
      dataset: g,
      enableShortcuts: p,
      searchBarContent: f && /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(
        ve,
        {
          trigger: "hover",
          hasChrome: !1,
          tooltip: /* @__PURE__ */ s.createElement(bS, { note: "Create a new story" })
        },
        /* @__PURE__ */ s.createElement(
          vS,
          {
            "aria-label": "Create a new story",
            isMobile: w,
            onClick: () => {
              S(!0);
            },
            variant: "outline"
          },
          /* @__PURE__ */ s.createElement(Vn, null)
        )
      ), /* @__PURE__ */ s.createElement(
        xc,
        {
          open: y,
          onOpenChange: S
        }
      )),
      searchFieldContent: r && /* @__PURE__ */ s.createElement(Wd, { api: O, indexJson: r, isDevelopment: m }),
      ...I
    },
    ({
      query: _,
      results: k,
      isBrowsing: T,
      closeMenu: C,
      getMenuProps: P,
      getItemProps: D,
      highlightedIndex: M
    }) => /* @__PURE__ */ s.createElement(xS, { condition: T }, /* @__PURE__ */ s.createElement(
      hp,
      {
        dataset: g,
        selected: E,
        isLoading: v,
        isBrowsing: T
      }
    ), /* @__PURE__ */ s.createElement(
      Fd,
      {
        query: _,
        results: k,
        closeMenu: C,
        getMenuProps: P,
        getItemProps: D,
        highlightedIndex: M,
        enableShortcuts: p,
        isLoading: v,
        clearLastViewed: I.clearLastViewed
      }
    ))
  )), w || v ? null : /* @__PURE__ */ s.createElement(Hd, { isDevelopment: m })));
}, "Sidebar"));

// src/manager/container/Menu.tsx
var wS = {
  storySearchField: "storybook-explorer-searchfield",
  storyListMenu: "storybook-explorer-menu",
  storyPanelRoot: "storybook-panel-root"
}, ES = x.span(({ theme: e }) => ({
  display: "inline-block",
  height: 16,
  lineHeight: "16px",
  textAlign: "center",
  fontSize: "11px",
  background: e.base === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
  color: e.base === "light" ? e.color.dark : e.textMutedColor,
  borderRadius: 2,
  userSelect: "none",
  pointerEvents: "none",
  padding: "0 6px"
})), TS = x.code({
  padding: 0,
  verticalAlign: "middle",
  "& + &": {
    marginLeft: 6
  }
}), We = /* @__PURE__ */ a(({ keys: e }) => /* @__PURE__ */ s.createElement(ES, null, e.map((t) => /* @__PURE__ */ s.createElement(TS, { key: t },
Ye([t])))), "Shortcut"), Ud = /* @__PURE__ */ a((e, t, o, i, r, n, l) => {
  let u = t.getShortcutKeys(), c = U(
    () => ({
      id: "about",
      title: "About your Storybook",
      onClick: /* @__PURE__ */ a(() => t.changeSettingsTab("about"), "onClick"),
      icon: /* @__PURE__ */ s.createElement(Rn, null)
    }),
    [t]
  ), d = U(() => ({
    id: "documentation",
    title: "Documentation",
    href: t.getDocsUrl({ versioned: !0, renderer: !0 }),
    icon: /* @__PURE__ */ s.createElement(tt, null)
  }), [t]), p = e.whatsNewData?.status === "SUCCESS" && !e.disableWhatsNewNotifications, m = t.isWhatsNewUnread(), h = U(
    () => ({
      id: "whats-new",
      title: "What's new?",
      onClick: /* @__PURE__ */ a(() => t.changeSettingsTab("whats-new"), "onClick"),
      right: p && m && /* @__PURE__ */ s.createElement(tr, { status: "positive" }, "Check it out"),
      icon: /* @__PURE__ */ s.createElement(Qn, null)
    }),
    [t, p, m]
  ), b = U(
    () => ({
      id: "shortcuts",
      title: "Keyboard shortcuts",
      onClick: /* @__PURE__ */ a(() => t.changeSettingsTab("shortcuts"), "onClick"),
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.shortcutsPage }) : null,
      icon: /* @__PURE__ */ s.createElement(kn, null)
    }),
    [t, l, u.shortcutsPage]
  ), f = U(
    () => ({
      id: "S",
      title: "Show sidebar",
      onClick: /* @__PURE__ */ a(() => t.toggleNav(), "onClick"),
      active: n,
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.toggleNav }) : null,
      icon: n ? /* @__PURE__ */ s.createElement(Be, null) : null
    }),
    [t, l, u, n]
  ), y = U(
    () => ({
      id: "T",
      title: "Show toolbar",
      onClick: /* @__PURE__ */ a(() => t.toggleToolbar(), "onClick"),
      active: o,
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.toolbar }) : null,
      icon: o ? /* @__PURE__ */ s.createElement(Be, null) : null
    }),
    [t, l, u, o]
  ), S = U(
    () => ({
      id: "A",
      title: "Show addons panel",
      onClick: /* @__PURE__ */ a(() => t.togglePanel(), "onClick"),
      active: r,
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.togglePanel }) : null,
      icon: r ? /* @__PURE__ */ s.createElement(Be, null) : null
    }),
    [t, l, u, r]
  ), E = U(
    () => ({
      id: "D",
      title: "Change addons orientation",
      onClick: /* @__PURE__ */ a(() => t.togglePanelPosition(), "onClick"),
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.panelPosition }) : null
    }),
    [t, l, u]
  ), g = U(
    () => ({
      id: "F",
      title: "Go full screen",
      onClick: /* @__PURE__ */ a(() => t.toggleFullscreen(), "onClick"),
      active: i,
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.fullScreen }) : null,
      icon: i ? /* @__PURE__ */ s.createElement(Be, null) : null
    }),
    [t, l, u, i]
  ), v = U(
    () => ({
      id: "/",
      title: "Search",
      onClick: /* @__PURE__ */ a(() => t.focusOnUIElement(wS.storySearchField), "onClick"),
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.search }) : null
    }),
    [t, l, u]
  ), I = U(
    () => ({
      id: "up",
      title: "Previous component",
      onClick: /* @__PURE__ */ a(() => t.jumpToComponent(-1), "onClick"),
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.prevComponent }) : null
    }),
    [t, l, u]
  ), w = U(
    () => ({
      id: "down",
      title: "Next component",
      onClick: /* @__PURE__ */ a(() => t.jumpToComponent(1), "onClick"),
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.nextComponent }) : null
    }),
    [t, l, u]
  ), O = U(
    () => ({
      id: "prev",
      title: "Previous story",
      onClick: /* @__PURE__ */ a(() => t.jumpToStory(-1), "onClick"),
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.prevStory }) : null
    }),
    [t, l, u]
  ), _ = U(
    () => ({
      id: "next",
      title: "Next story",
      onClick: /* @__PURE__ */ a(() => t.jumpToStory(1), "onClick"),
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.nextStory }) : null
    }),
    [t, l, u]
  ), k = U(
    () => ({
      id: "collapse",
      title: "Collapse all",
      onClick: /* @__PURE__ */ a(() => t.emit(ho), "onClick"),
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: u.collapseAll }) : null
    }),
    [t, l, u]
  ), T = A(() => {
    let C = t.getAddonsShortcuts(), P = u;
    return Object.entries(C).filter(([D, { showInMenu: M }]) => M).map(([D, { label: M, action: F }]) => ({
      id: D,
      title: M,
      onClick: /* @__PURE__ */ a(() => F(), "onClick"),
      right: l ? /* @__PURE__ */ s.createElement(We, { keys: P[D] }) : null
    }));
  }, [t, l, u]);
  return U(
    () => [
      [
        c,
        ...e.whatsNewData?.status === "SUCCESS" ? [h] : [],
        d,
        ...l ? [b] : []
      ],
      [
        f,
        y,
        S,
        E,
        g,
        v,
        I,
        w,
        O,
        _,
        k
      ],
      T()
    ],
    [
      c,
      e,
      h,
      d,
      b,
      f,
      y,
      S,
      E,
      g,
      v,
      I,
      w,
      O,
      _,
      k,
      T,
      l
    ]
  );
}, "useMenu");

// src/manager/container/Sidebar.tsx
var CS = s.memo(/* @__PURE__ */ a(function({ onMenuClick: t }) {
  return /* @__PURE__ */ s.createElement(me, { filter: /* @__PURE__ */ a(({ state: i, api: r }) => {
    let {
      ui: { name: n, url: l, enableShortcuts: u },
      viewMode: c,
      storyId: d,
      refId: p,
      layout: { showToolbar: m },
      // FIXME: This is the actual `index.json` index where the `index` below
      // is actually the stories hash. We should fix this up and make it consistent.
      internal_index: h,
      filteredIndex: b,
      indexError: f,
      previewInitialized: y,
      refs: S
    } = i, E = Ud(
      i,
      r,
      m,
      r.getIsFullscreen(),
      r.getIsPanelShown(),
      r.getIsNavShown(),
      u
    ), g = i.whatsNewData?.status === "SUCCESS" && !i.disableWhatsNewNotifications;
    return {
      title: n,
      url: l,
      indexJson: h,
      index: b,
      indexError: f,
      previewInitialized: y,
      refs: S,
      storyId: d,
      refId: p,
      viewMode: c,
      menu: E,
      menuHighlighted: g && r.isWhatsNewUnread(),
      enableShortcuts: u
    };
  }, "mapper") }, (i) => {
    let r = Eo();
    return /* @__PURE__ */ s.createElement($d, { ...i, allStatuses: r, onMenuClick: t });
  });
}, "Sideber")), Gd = CS;

// src/manager/App.tsx
var qd = /* @__PURE__ */ a(({ managerLayoutState: e, setManagerLayoutState: t, pages: o, hasTab: i }) => {
  let { setMobileAboutOpen: r } = ge();
  return /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(eo, { styles: Ia }), /* @__PURE__ */ s.createElement(
    Ul,
    {
      hasTab: i,
      managerLayoutState: e,
      setManagerLayoutState: t,
      slotMain: /* @__PURE__ */ s.createElement(Hu, { id: "main", withLoader: !0 }),
      slotSidebar: /* @__PURE__ */ s.createElement(Gd, { onMenuClick: () => r((n) => !n) }),
      slotPanel: /* @__PURE__ */ s.createElement(Yl, null),
      slotPages: o.map(({ id: n, render: l }) => /* @__PURE__ */ s.createElement(l, { key: n }))
    }
  ));
}, "App");

// src/manager/provider.ts
var $s = class $s {
  getElements(t) {
    throw new Error("Provider.getElements() is not implemented!");
  }
  handleAPI(t) {
    throw new Error("Provider.handleAPI() is not implemented!");
  }
  getConfig() {
    return console.error("Provider.getConfig() is not implemented!"), {};
  }
};
a($s, "Provider");
var Yt = $s;

// src/manager/settings/About.tsx
var _S = x.div({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  marginTop: 40
}), kS = x.header({
  marginBottom: 32,
  alignItems: "center",
  display: "flex",
  "> svg": {
    height: 48,
    width: "auto",
    marginRight: 8
  }
}), OS = x.div(({ theme: e }) => ({
  marginBottom: 24,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: e.base === "light" ? e.color.dark : e.color.lightest,
  fontWeight: e.typography.weight.regular,
  fontSize: e.typography.size.s2
})), PS = x.div({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 24,
  marginTop: 24,
  gap: 16
}), Yd = x(Pe)(({ theme: e }) => ({
  "&&": {
    fontWeight: e.typography.weight.bold,
    color: e.base === "light" ? e.color.dark : e.color.light
  },
  "&:hover": {
    color: e.base === "light" ? e.color.darkest : e.color.lightest
  }
})), Qd = /* @__PURE__ */ a(({ onNavigateToWhatsNew: e }) => /* @__PURE__ */ s.createElement(_S, null, /* @__PURE__ */ s.createElement(kS, null,
/* @__PURE__ */ s.createElement(ir, { alt: "Storybook" })), /* @__PURE__ */ s.createElement(Sr, { onNavigateToWhatsNew: e }), /* @__PURE__ */ s.
createElement(OS, null, /* @__PURE__ */ s.createElement(PS, null, /* @__PURE__ */ s.createElement(he, { asChild: !0 }, /* @__PURE__ */ s.createElement(
"a", { href: "https://github.com/storybookjs/storybook" }, /* @__PURE__ */ s.createElement(vo, null), "GitHub")), /* @__PURE__ */ s.createElement(
he, { asChild: !0 }, /* @__PURE__ */ s.createElement("a", { href: "https://storybook.js.org/docs" }, /* @__PURE__ */ s.createElement(kt, { style: {
display: "inline", marginRight: 5 } }), "Documentation"))), /* @__PURE__ */ s.createElement("div", null, "Open source software maintained by",
" ", /* @__PURE__ */ s.createElement(Yd, { href: "https://www.chromatic.com/" }, "Chromatic"), " and the", " ", /* @__PURE__ */ s.createElement(
Yd, { href: "https://github.com/storybookjs/storybook/graphs/contributors" }, "Storybook Community")))), "AboutScreen");

// src/manager/settings/AboutPage.tsx
var Gs = class Gs extends Le {
  componentDidMount() {
    let { api: t, notificationId: o } = this.props;
    t.clearNotification(o);
  }
  render() {
    let { children: t } = this.props;
    return t;
  }
};
a(Gs, "NotificationClearer");
var Us = Gs, Xd = /* @__PURE__ */ a(() => {
  let e = oe(), t = Ne(), o = A(() => {
    e.changeSettingsTab("whats-new");
  }, [e]);
  return /* @__PURE__ */ s.createElement(Us, { api: e, notificationId: "update" }, /* @__PURE__ */ s.createElement(
    Qd,
    {
      onNavigateToWhatsNew: t.whatsNewData?.status === "SUCCESS" ? o : void 0
    }
  ));
}, "AboutPage");

// src/manager/settings/SettingsFooter.tsx
var AS = x.div(({ theme: e }) => ({
  display: "flex",
  paddingTop: 20,
  marginTop: 20,
  borderTop: `1px solid ${e.appBorderColor}`,
  fontWeight: e.typography.weight.bold,
  "& > * + *": {
    marginLeft: 20
  }
})), DS = /* @__PURE__ */ a((e) => /* @__PURE__ */ s.createElement(AS, { ...e }, /* @__PURE__ */ s.createElement(Pe, { secondary: !0, href: "\
https://storybook.js.org", cancel: !1, target: "_blank" }, "Docs"), /* @__PURE__ */ s.createElement(Pe, { secondary: !0, href: "https://gith\
ub.com/storybookjs/storybook", cancel: !1, target: "_blank" }, "GitHub"), /* @__PURE__ */ s.createElement(
  Pe,
  {
    secondary: !0,
    href: "https://storybook.js.org/community#support",
    cancel: !1,
    target: "_blank"
  },
  "Support"
)), "SettingsFooter"), Zd = DS;

// src/manager/settings/shortcuts.tsx
var MS = x.header(({ theme: e }) => ({
  marginBottom: 20,
  fontSize: e.typography.size.m3,
  fontWeight: e.typography.weight.bold,
  alignItems: "center",
  display: "flex"
})), Jd = x.div(({ theme: e }) => ({
  fontWeight: e.typography.weight.bold
})), LS = x.div({
  alignSelf: "flex-end",
  display: "grid",
  margin: "10px 0",
  gridTemplateColumns: "1fr 1fr 12px",
  "& > *:last-of-type": {
    gridColumn: "2 / 2",
    justifySelf: "flex-end",
    gridRow: "1"
  }
}), NS = x.div(({ theme: e }) => ({
  padding: "6px 0",
  borderTop: `1px solid ${e.appBorderColor}`,
  display: "grid",
  gridTemplateColumns: "1fr 1fr 0px"
})), FS = x.div({
  display: "grid",
  gridTemplateColumns: "1fr",
  gridAutoRows: "minmax(auto, auto)",
  marginBottom: 20
}), RS = x.div({
  alignSelf: "center"
}), BS = x(or.Input)(
  ({ valid: e, theme: t }) => e === "error" ? {
    animation: `${t.animation.jiggle} 700ms ease-out`
  } : {},
  {
    display: "flex",
    width: 80,
    flexDirection: "column",
    justifySelf: "flex-end",
    paddingLeft: 4,
    paddingRight: 4,
    textAlign: "center"
  }
), HS = Pt`
0%,100% { opacity: 0; }
  50% { opacity: 1; }
`, zS = x(Be)(
  ({ valid: e, theme: t }) => e === "valid" ? {
    color: t.color.positive,
    animation: `${HS} 2s ease forwards`
  } : {
    opacity: 0
  },
  {
    alignSelf: "center",
    display: "flex",
    marginLeft: 10,
    height: 14,
    width: 14
  }
), WS = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  padding: "3rem 20px",
  maxWidth: 600,
  margin: "0 auto"
})), VS = {
  fullScreen: "Go full screen",
  togglePanel: "Toggle addons",
  panelPosition: "Toggle addons orientation",
  toggleNav: "Toggle sidebar",
  toolbar: "Toggle canvas toolbar",
  search: "Focus search",
  focusNav: "Focus sidebar",
  focusIframe: "Focus canvas",
  focusPanel: "Focus addons",
  prevComponent: "Previous component",
  nextComponent: "Next component",
  prevStory: "Previous story",
  nextStory: "Next story",
  shortcutsPage: "Go to shortcuts page",
  aboutPage: "Go to about page",
  collapseAll: "Collapse all items on sidebar",
  expandAll: "Expand all items on sidebar",
  remount: "Remount component"
}, jS = ["escape"];
function qs(e) {
  return Object.entries(e).reduce(
    // @ts-expect-error (non strict)
    (t, [o, i]) => jS.includes(o) ? t : { ...t, [o]: { shortcut: i, error: !1 } },
    {}
  );
}
a(qs, "toShortcutState");
var Ys = class Ys extends Le {
  constructor(o) {
    super(o);
    this.onKeyDown = /* @__PURE__ */ a((o) => {
      let { activeFeature: i, shortcutKeys: r } = this.state;
      if (o.key === "Backspace")
        return this.restoreDefault();
      let n = ga(o);
      if (!n)
        return !1;
      let l = !!Object.entries(r).find(
        ([u, { shortcut: c }]) => u !== i && c && ya(n, c)
      );
      return this.setState({
        shortcutKeys: { ...r, [i]: { shortcut: n, error: l } }
      });
    }, "onKeyDown");
    this.onFocus = /* @__PURE__ */ a((o) => () => {
      let { shortcutKeys: i } = this.state;
      this.setState({
        activeFeature: o,
        shortcutKeys: {
          ...i,
          [o]: { shortcut: null, error: !1 }
        }
      });
    }, "onFocus");
    this.onBlur = /* @__PURE__ */ a(async () => {
      let { shortcutKeys: o, activeFeature: i } = this.state;
      if (o[i]) {
        let { shortcut: r, error: n } = o[i];
        return !r || n ? this.restoreDefault() : this.saveShortcut();
      }
      return !1;
    }, "onBlur");
    this.saveShortcut = /* @__PURE__ */ a(async () => {
      let { activeFeature: o, shortcutKeys: i } = this.state, { setShortcut: r } = this.props;
      await r(o, i[o].shortcut), this.setState({ successField: o });
    }, "saveShortcut");
    this.restoreDefaults = /* @__PURE__ */ a(async () => {
      let { restoreAllDefaultShortcuts: o } = this.props, i = await o();
      return this.setState({ shortcutKeys: qs(i) });
    }, "restoreDefaults");
    this.restoreDefault = /* @__PURE__ */ a(async () => {
      let { activeFeature: o, shortcutKeys: i } = this.state, { restoreDefaultShortcut: r } = this.props, n = await r(o);
      return this.setState({
        shortcutKeys: {
          ...i,
          ...qs({ [o]: n })
        }
      });
    }, "restoreDefault");
    this.displaySuccessMessage = /* @__PURE__ */ a((o) => {
      let { successField: i, shortcutKeys: r } = this.state;
      return o === i && r[o].error === !1 ? "valid" : void 0;
    }, "displaySuccessMessage");
    this.displayError = /* @__PURE__ */ a((o) => {
      let { activeFeature: i, shortcutKeys: r } = this.state;
      return o === i && r[o].error === !0 ? "error" : void 0;
    }, "displayError");
    this.renderKeyInput = /* @__PURE__ */ a(() => {
      let { shortcutKeys: o, addonsShortcutLabels: i } = this.state;
      return Object.entries(o).map(([n, { shortcut: l }]) => /* @__PURE__ */ s.createElement(NS, { key: n }, /* @__PURE__ */ s.createElement(
      RS, null, VS[n] || i[n]), /* @__PURE__ */ s.createElement(
        BS,
        {
          spellCheck: "false",
          valid: this.displayError(n),
          className: "modalInput",
          onBlur: this.onBlur,
          onFocus: this.onFocus(n),
          onKeyDown: this.onKeyDown,
          value: l ? Ye(l) : "",
          placeholder: "Type keys",
          readOnly: !0
        }
      ), /* @__PURE__ */ s.createElement(zS, { valid: this.displaySuccessMessage(n) })));
    }, "renderKeyInput");
    this.renderKeyForm = /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(FS, null, /* @__PURE__ */ s.createElement(LS, null, /* @__PURE__ */ s.
    createElement(Jd, null, "Commands"), /* @__PURE__ */ s.createElement(Jd, null, "Shortcut")), this.renderKeyInput()), "renderKeyForm");
    this.state = {
      // @ts-expect-error (non strict)
      activeFeature: void 0,
      // @ts-expect-error (non strict)
      successField: void 0,
      // The initial shortcutKeys that come from props are the defaults/what was saved
      // As the user interacts with the page, the state stores the temporary, unsaved shortcuts
      // This object also includes the error attached to each shortcut
      // @ts-expect-error (non strict)
      shortcutKeys: qs(o.shortcutKeys),
      addonsShortcutLabels: o.addonsShortcutLabels
    };
  }
  render() {
    let o = this.renderKeyForm();
    return /* @__PURE__ */ s.createElement(WS, null, /* @__PURE__ */ s.createElement(MS, null, "Keyboard shortcuts"), o, /* @__PURE__ */ s.createElement(
      he,
      {
        variant: "outline",
        size: "small",
        id: "restoreDefaultsHotkeys",
        onClick: this.restoreDefaults
      },
      "Restore defaults"
    ), /* @__PURE__ */ s.createElement(Zd, null));
  }
};
a(Ys, "ShortcutsScreen");
var vn = Ys;

// src/manager/settings/ShortcutsPage.tsx
var ef = /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(me, null, ({
  api: {
    getShortcutKeys: e,
    getAddonsShortcutLabels: t,
    setShortcut: o,
    restoreDefaultShortcut: i,
    restoreAllDefaultShortcuts: r
  }
}) => /* @__PURE__ */ s.createElement(
  vn,
  {
    shortcutKeys: e(),
    addonsShortcutLabels: t(),
    setShortcut: o,
    restoreDefaultShortcut: i,
    restoreAllDefaultShortcuts: r
  }
)), "ShortcutsPage");

// src/manager/settings/whats_new.tsx
var tf = x.div({
  top: "50%",
  position: "absolute",
  transform: "translateY(-50%)",
  width: "100%",
  textAlign: "center"
}), KS = x.div({
  position: "relative",
  height: "32px"
}), of = x.div(({ theme: e }) => ({
  paddingTop: "12px",
  color: e.textMutedColor,
  maxWidth: "295px",
  margin: "0 auto",
  fontSize: `${e.typography.size.s1}px`,
  lineHeight: "16px"
})), $S = x.div(({ theme: e }) => ({
  position: "absolute",
  width: "100%",
  bottom: "40px",
  background: e.background.bar,
  fontSize: "13px",
  borderTop: "1px solid",
  borderColor: e.appBorderColor,
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
})), US = /* @__PURE__ */ a(({
  isNotificationsEnabled: e,
  onToggleNotifications: t,
  onCopyLink: o
}) => {
  let i = De(), [r, n] = K("Copy Link"), l = /* @__PURE__ */ a(() => {
    o(), n("Copied!"), setTimeout(() => n("Copy Link"), 4e3);
  }, "copyLink");
  return /* @__PURE__ */ s.createElement($S, null, /* @__PURE__ */ s.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
  /* @__PURE__ */ s.createElement(Fn, { color: i.color.mediumdark }), /* @__PURE__ */ s.createElement("div", null, "Share this with your tea\
m."), /* @__PURE__ */ s.createElement(he, { onClick: l, size: "small", variant: "ghost" }, r)), e ? /* @__PURE__ */ s.createElement(he, { size: "\
small", variant: "ghost", onClick: t }, /* @__PURE__ */ s.createElement(Dn, null), "Hide notifications") : /* @__PURE__ */ s.createElement(he,
  { size: "small", variant: "ghost", onClick: t }, /* @__PURE__ */ s.createElement(Mn, null), "Show notifications"));
}, "WhatsNewFooter"), GS = x.iframe(
  {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: 0,
    margin: 0,
    padding: 0,
    width: "100%",
    height: "calc(100% - 80px)",
    background: "white"
  },
  ({ isLoaded: e }) => ({ visibility: e ? "visible" : "hidden" })
), qS = x((e) => /* @__PURE__ */ s.createElement(go, { ...e }))(({ theme: e }) => ({
  color: e.textMutedColor,
  width: 32,
  height: 32,
  margin: "0 auto"
})), YS = /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(tf, null, /* @__PURE__ */ s.createElement(KS, null, /* @__PURE__ */ s.createElement(
rr, null)), /* @__PURE__ */ s.createElement(of, null, "Loading...")), "WhatsNewLoader"), QS = /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(
tf, null, /* @__PURE__ */ s.createElement(qS, null), /* @__PURE__ */ s.createElement(of, null, "The page couldn't be loaded. Check your inte\
rnet connection and try again.")), "MaxWaitTimeMessaging"), XS = /* @__PURE__ */ a(({
  didHitMaxWaitTime: e,
  isLoaded: t,
  onLoad: o,
  url: i,
  onCopyLink: r,
  onToggleNotifications: n,
  isNotificationsEnabled: l
}) => /* @__PURE__ */ s.createElement(Ee, null, !t && !e && /* @__PURE__ */ s.createElement(YS, null), e ? /* @__PURE__ */ s.createElement(QS,
null) : /* @__PURE__ */ s.createElement(s.Fragment, null, /* @__PURE__ */ s.createElement(GS, { isLoaded: t, onLoad: o, src: i, title: "What\
's new?" }), /* @__PURE__ */ s.createElement(
  US,
  {
    isNotificationsEnabled: l,
    onToggleNotifications: n,
    onCopyLink: r
  }
))), "PureWhatsNewScreen"), ZS = 1e4, rf = /* @__PURE__ */ a(() => {
  let e = oe(), t = Ne(), { whatsNewData: o } = t, [i, r] = K(!1), [n, l] = K(!1);
  if (V(() => {
    let c = setTimeout(() => !i && l(!0), ZS);
    return () => clearTimeout(c);
  }, [i]), o?.status !== "SUCCESS")
    return null;
  let u = !o.disableWhatsNewNotifications;
  return /* @__PURE__ */ s.createElement(
    XS,
    {
      didHitMaxWaitTime: n,
      isLoaded: i,
      onLoad: () => {
        e.whatsNewHasBeenRead(), r(!0);
      },
      url: o.url,
      isNotificationsEnabled: u,
      onCopyLink: () => {
        navigator.clipboard?.writeText(o.blogUrl ?? o.url);
      },
      onToggleNotifications: () => {
        u ? se.confirm("All update notifications will no longer be shown. Are you sure?") && e.toggleWhatsNewNotifications() : e.toggleWhatsNewNotifications();
      }
    }
  );
}, "WhatsNewScreen");

// src/manager/settings/whats_new_page.tsx
var nf = /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(rf, null), "WhatsNewPage");

// src/manager/settings/index.tsx
var { document: sf } = se, JS = x.div(({ theme: e }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: 40,
  boxShadow: `${e.appBorderColor}  0 -1px 0 0 inset`,
  background: e.barBg,
  paddingRight: 8
})), Qs = s.memo(/* @__PURE__ */ a(function({
  changeTab: t,
  id: o,
  title: i
}) {
  return /* @__PURE__ */ s.createElement(pr, null, ({ path: r }) => {
    let n = r.includes(`settings/${o}`);
    return /* @__PURE__ */ s.createElement(
      ar,
      {
        id: `tabbutton-${o}`,
        className: ["tabbutton"].concat(n ? ["tabbutton-active"] : []).join(" "),
        type: "button",
        key: "id",
        active: n,
        onClick: () => t(o),
        role: "tab"
      },
      i
    );
  });
}, "TabBarButton")), ew = x(nr)(({ theme: e }) => ({
  background: e.background.content
})), tw = /* @__PURE__ */ a(({ changeTab: e, onClose: t, enableShortcuts: o = !0, enableWhatsNew: i }) => (s.useEffect(() => {
  let r = /* @__PURE__ */ a((n) => {
    !o || n.repeat || St(!1, n) && $e("Escape", n) && (n.preventDefault(), t());
  }, "handleEscape");
  return sf.addEventListener("keydown", r), () => sf.removeEventListener("keydown", r);
}, [o, t]), /* @__PURE__ */ s.createElement(Ee, null, /* @__PURE__ */ s.createElement(JS, { className: "sb-bar" }, /* @__PURE__ */ s.createElement(
sr, { role: "tablist" }, /* @__PURE__ */ s.createElement(Qs, { id: "about", title: "About", changeTab: e }), i && /* @__PURE__ */ s.createElement(
Qs, { id: "whats-new", title: "What's new?", changeTab: e }), /* @__PURE__ */ s.createElement(Qs, { id: "shortcuts", title: "Keyboard shortc\
uts", changeTab: e })), /* @__PURE__ */ s.createElement(
  ee,
  {
    onClick: (r) => (r.preventDefault(), t()),
    title: "Close settings page"
  },
  /* @__PURE__ */ s.createElement(je, null)
)), /* @__PURE__ */ s.createElement(ew, { vertical: !0, horizontal: !1 }, /* @__PURE__ */ s.createElement(To, { path: "about" }, /* @__PURE__ */ s.
createElement(Xd, { key: "about" })), /* @__PURE__ */ s.createElement(To, { path: "whats-new" }, /* @__PURE__ */ s.createElement(nf, { key: "\
whats-new" })), /* @__PURE__ */ s.createElement(To, { path: "shortcuts" }, /* @__PURE__ */ s.createElement(ef, { key: "shortcuts" }))))), "P\
ages"), ow = /* @__PURE__ */ a(() => {
  let e = oe(), t = Ne(), o = /* @__PURE__ */ a((i) => e.changeSettingsTab(i), "changeTab");
  return /* @__PURE__ */ s.createElement(
    tw,
    {
      enableWhatsNew: t.whatsNewData?.status === "SUCCESS",
      enableShortcuts: t.ui.enableShortcuts,
      changeTab: o,
      onClose: e.closeSettings
    }
  );
}, "SettingsPages"), af = {
  id: "settings",
  url: "/settings/",
  title: "Settings",
  type: be.experimental_PAGE,
  render: /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(To, { path: "/settings/", startsWith: !0 }, /* @__PURE__ */ s.createElement(
  ow, null)), "render")
};

// src/manager/index.tsx
oi.displayName = "ThemeProvider";
yt.displayName = "HelmetProvider";
var rw = /* @__PURE__ */ a(({ provider: e }) => /* @__PURE__ */ s.createElement(yt, { key: "helmet.Provider" }, /* @__PURE__ */ s.createElement(
ja, { key: "location.provider" }, /* @__PURE__ */ s.createElement(nw, { provider: e }))), "Root"), nw = /* @__PURE__ */ a(({ provider: e }) => {
  let t = $a();
  return /* @__PURE__ */ s.createElement(pr, { key: "location.consumer" }, (o) => /* @__PURE__ */ s.createElement(
    ha,
    {
      key: "manager",
      provider: e,
      ...o,
      navigate: t,
      docsOptions: se?.DOCS_OPTIONS || {}
    },
    (i) => {
      let { state: r, api: n } = i, l = A(
        (c) => {
          n.setSizes(c);
        },
        [n]
      ), u = U(
        () => [af, ...Object.values(n.getElements(be.experimental_PAGE))],
        [Object.keys(n.getElements(be.experimental_PAGE)).join()]
      );
      return /* @__PURE__ */ s.createElement(oi, { key: "theme.provider", theme: Sa(r.theme) }, /* @__PURE__ */ s.createElement(yl, null, /* @__PURE__ */ s.
      createElement(
        qd,
        {
          key: "app",
          pages: u,
          managerLayoutState: {
            ...r.layout,
            viewMode: r.viewMode
          },
          hasTab: !!n.getQueryParam("tab"),
          setManagerLayoutState: l
        }
      )));
    }
  ));
}, "Main");
function lf(e, t) {
  if (!(t instanceof Yt))
    throw new Va();
  Wa(e).render(/* @__PURE__ */ s.createElement(rw, { key: "root", provider: t }));
}
a(lf, "renderStorybookUI");

// src/manager/runtime.tsx
var iw = "CORE/WS_DISCONNECTED";
He.register(
  gt,
  () => He.add(gt, {
    title: gt,
    type: be.TOOL,
    match: /* @__PURE__ */ a(({ tabId: e }) => !e, "match"),
    render: /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(za, null), "render")
  })
);
var Zs = class Zs extends Yt {
  constructor() {
    super();
    this.wsDisconnected = !1;
    let o = ra({ page: "manager" });
    He.setChannel(o), o.emit(sa), this.addons = He, this.channel = o, se.__STORYBOOK_ADDONS_CHANNEL__ = o;
  }
  getElements(o) {
    return this.addons.getElements(o);
  }
  getConfig() {
    return this.addons.getConfig();
  }
  handleAPI(o) {
    this.addons.loadAddons(o), this.channel.on(aa, (i) => {
      this.wsDisconnected = !0, o.addNotification({
        id: iw,
        content: {
          headline: i.code === 3008 ? "Server timed out" : "Connection lost",
          subHeadline: "Please restart your Storybook server and reload the page"
        },
        icon: /* @__PURE__ */ s.createElement(Ln, { color: xa.negative }),
        link: void 0
      });
    });
  }
};
a(Zs, "ReactProvider");
var Xs = Zs, { document: sw } = se, aw = sw.getElementById("root");
setTimeout(() => {
  lf(aw, new Xs());
}, 0);
