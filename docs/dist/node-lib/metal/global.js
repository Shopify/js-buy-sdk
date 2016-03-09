'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global global */

var globalNamespace = void 0;

if (typeof global === 'undefined') {
  globalNamespace = window;
} else {
  globalNamespace = global;
}

exports.default = globalNamespace;