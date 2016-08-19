/*
The MIT License (MIT)

Copyright (c) 2016 Shopify Inc.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/* version: v0.2.1-20ca83 */
(function() {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})();

;(function (self) {
/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.1.0
 */

(function() {
    "use strict";
    function lib$rsvp$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$rsvp$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$rsvp$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$rsvp$utils$$_isArray;
    if (!Array.isArray) {
      lib$rsvp$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$rsvp$utils$$_isArray = Array.isArray;
    }

    var lib$rsvp$utils$$isArray = lib$rsvp$utils$$_isArray;

    var lib$rsvp$utils$$now = Date.now || function() { return new Date().getTime(); };

    function lib$rsvp$utils$$F() { }

    var lib$rsvp$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      lib$rsvp$utils$$F.prototype = o;
      return new lib$rsvp$utils$$F();
    });
    function lib$rsvp$events$$indexOf(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i] === callback) { return i; }
      }

      return -1;
    }

    function lib$rsvp$events$$callbacksFor(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    }

    var lib$rsvp$events$$default = {

      /**
        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
        Example:

        ```javascript
        var object = {};

        RSVP.EventTarget.mixin(object);

        object.on('finished', function(event) {
          // handle event
        });

        object.trigger('finished', { detail: value });
        ```

        `EventTarget.mixin` also works with prototypes:

        ```javascript
        var Person = function() {};
        RSVP.EventTarget.mixin(Person.prototype);

        var yehuda = new Person();
        var tom = new Person();

        yehuda.on('poke', function(event) {
          console.log('Yehuda says OW');
        });

        tom.on('poke', function(event) {
          console.log('Tom says OW');
        });

        yehuda.trigger('poke');
        tom.trigger('poke');
        ```

        @method mixin
        @for RSVP.EventTarget
        @private
        @param {Object} object object to extend with EventTarget methods
      */
      'mixin': function(object) {
        object['on']      = this['on'];
        object['off']     = this['off'];
        object['trigger'] = this['trigger'];
        object._promiseCallbacks = undefined;
        return object;
      },

      /**
        Registers a callback to be executed when `eventName` is triggered

        ```javascript
        object.on('event', function(eventInfo){
          // handle the event
        });

        object.trigger('event');
        ```

        @method on
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
      */
      'on': function(eventName, callback) {
        if (typeof callback !== 'function') {
          throw new TypeError('Callback must be a function');
        }

        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks;

        callbacks = allCallbacks[eventName];

        if (!callbacks) {
          callbacks = allCallbacks[eventName] = [];
        }

        if (lib$rsvp$events$$indexOf(callbacks, callback) === -1) {
          callbacks.push(callback);
        }
      },

      /**
        You can use `off` to stop firing a particular callback for an event:

        ```javascript
        function doStuff() { // do stuff! }
        object.on('stuff', doStuff);

        object.trigger('stuff'); // doStuff will be called

        // Unregister ONLY the doStuff callback
        object.off('stuff', doStuff);
        object.trigger('stuff'); // doStuff will NOT be called
        ```

        If you don't pass a `callback` argument to `off`, ALL callbacks for the
        event will not be executed when the event fires. For example:

        ```javascript
        var callback1 = function(){};
        var callback2 = function(){};

        object.on('stuff', callback1);
        object.on('stuff', callback2);

        object.trigger('stuff'); // callback1 and callback2 will be executed.

        object.off('stuff');
        object.trigger('stuff'); // callback1 and callback2 will not be executed!
        ```

        @method off
        @for RSVP.EventTarget
        @private
        @param {String} eventName event to stop listening to
        @param {Function} callback optional argument. If given, only the function
        given will be removed from the event's callback queue. If no `callback`
        argument is given, all callbacks will be removed from the event's callback
        queue.
      */
      'off': function(eventName, callback) {
        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, index;

        if (!callback) {
          allCallbacks[eventName] = [];
          return;
        }

        callbacks = allCallbacks[eventName];

        index = lib$rsvp$events$$indexOf(callbacks, callback);

        if (index !== -1) { callbacks.splice(index, 1); }
      },

      /**
        Use `trigger` to fire custom events. For example:

        ```javascript
        object.on('foo', function(){
          console.log('foo event happened!');
        });
        object.trigger('foo');
        // 'foo event happened!' logged to the console
        ```

        You can also pass a value as a second argument to `trigger` that will be
        passed as an argument to all event listeners for the event:

        ```javascript
        object.on('foo', function(value){
          console.log(value.name);
        });

        object.trigger('foo', { name: 'bar' });
        // 'bar' logged to the console
        ```

        @method trigger
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to be triggered
        @param {*} options optional value to be passed to any event handlers for
        the given `eventName`
      */
      'trigger': function(eventName, options, label) {
        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, callback;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callback = callbacks[i];

            callback(options, label);
          }
        }
      }
    };

    var lib$rsvp$config$$config = {
      instrument: false
    };

    lib$rsvp$events$$default['mixin'](lib$rsvp$config$$config);

    function lib$rsvp$config$$configure(name, value) {
      if (name === 'onerror') {
        // handle for legacy users that expect the actual
        // error to be passed to their function added via
        // `RSVP.configure('onerror', someFunctionHere);`
        lib$rsvp$config$$config['on']('error', value);
        return;
      }

      if (arguments.length === 2) {
        lib$rsvp$config$$config[name] = value;
      } else {
        return lib$rsvp$config$$config[name];
      }
    }

    var lib$rsvp$instrument$$queue = [];

    function lib$rsvp$instrument$$scheduleFlush() {
      setTimeout(function() {
        var entry;
        for (var i = 0; i < lib$rsvp$instrument$$queue.length; i++) {
          entry = lib$rsvp$instrument$$queue[i];

          var payload = entry.payload;

          payload.guid = payload.key + payload.id;
          payload.childGuid = payload.key + payload.childId;
          if (payload.error) {
            payload.stack = payload.error.stack;
          }

          lib$rsvp$config$$config['trigger'](entry.name, entry.payload);
        }
        lib$rsvp$instrument$$queue.length = 0;
      }, 50);
    }

    function lib$rsvp$instrument$$instrument(eventName, promise, child) {
      if (1 === lib$rsvp$instrument$$queue.push({
        name: eventName,
        payload: {
          key: promise._guidKey,
          id:  promise._id,
          eventName: eventName,
          detail: promise._result,
          childId: child && child._id,
          label: promise._label,
          timeStamp: lib$rsvp$utils$$now(),
          error: lib$rsvp$config$$config["instrument-with-stack"] ? new Error(promise._label) : null
        }})) {
          lib$rsvp$instrument$$scheduleFlush();
        }
      }
    var lib$rsvp$instrument$$default = lib$rsvp$instrument$$instrument;

    function  lib$rsvp$$internal$$withOwnPromise() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$rsvp$$internal$$noop() {}

    var lib$rsvp$$internal$$PENDING   = void 0;
    var lib$rsvp$$internal$$FULFILLED = 1;
    var lib$rsvp$$internal$$REJECTED  = 2;

    var lib$rsvp$$internal$$GET_THEN_ERROR = new lib$rsvp$$internal$$ErrorObject();

    function lib$rsvp$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$rsvp$$internal$$GET_THEN_ERROR.error = error;
        return lib$rsvp$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$rsvp$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$rsvp$$internal$$handleForeignThenable(promise, thenable, then) {
      lib$rsvp$config$$config.async(function(promise) {
        var sealed = false;
        var error = lib$rsvp$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$rsvp$$internal$$resolve(promise, value);
          } else {
            lib$rsvp$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$rsvp$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$rsvp$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$rsvp$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$rsvp$$internal$$FULFILLED) {
        lib$rsvp$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$rsvp$$internal$$REJECTED) {
        thenable._onError = null;
        lib$rsvp$$internal$$reject(promise, thenable._result);
      } else {
        lib$rsvp$$internal$$subscribe(thenable, undefined, function(value) {
          if (thenable !== value) {
            lib$rsvp$$internal$$resolve(promise, value);
          } else {
            lib$rsvp$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          lib$rsvp$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$rsvp$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$rsvp$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$rsvp$$internal$$getThen(maybeThenable);

        if (then === lib$rsvp$$internal$$GET_THEN_ERROR) {
          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$rsvp$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$rsvp$utils$$isFunction(then)) {
          lib$rsvp$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$rsvp$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$rsvp$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$rsvp$$internal$$fulfill(promise, value);
      } else if (lib$rsvp$utils$$objectOrFunction(value)) {
        lib$rsvp$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$rsvp$$internal$$fulfill(promise, value);
      }
    }

    function lib$rsvp$$internal$$publishRejection(promise) {
      if (promise._onError) {
        promise._onError(promise._result);
      }

      lib$rsvp$$internal$$publish(promise);
    }

    function lib$rsvp$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$rsvp$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
        if (lib$rsvp$config$$config.instrument) {
          lib$rsvp$instrument$$default('fulfilled', promise);
        }
      } else {
        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, promise);
      }
    }

    function lib$rsvp$$internal$$reject(promise, reason) {
      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }
      promise._state = lib$rsvp$$internal$$REJECTED;
      promise._result = reason;
      lib$rsvp$config$$config.async(lib$rsvp$$internal$$publishRejection, promise);
    }

    function lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onError = null;

      subscribers[length] = child;
      subscribers[length + lib$rsvp$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$rsvp$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, parent);
      }
    }

    function lib$rsvp$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (lib$rsvp$config$$config.instrument) {
        lib$rsvp$instrument$$default(settled === lib$rsvp$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);
      }

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$rsvp$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$rsvp$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$rsvp$$internal$$TRY_CATCH_ERROR = new lib$rsvp$$internal$$ErrorObject();

    function lib$rsvp$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$rsvp$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$rsvp$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$rsvp$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$rsvp$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$rsvp$$internal$$tryCatch(callback, detail);

        if (value === lib$rsvp$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$withOwnPromise());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$rsvp$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$rsvp$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$rsvp$$internal$$reject(promise, error);
      } else if (settled === lib$rsvp$$internal$$FULFILLED) {
        lib$rsvp$$internal$$fulfill(promise, value);
      } else if (settled === lib$rsvp$$internal$$REJECTED) {
        lib$rsvp$$internal$$reject(promise, value);
      }
    }

    function lib$rsvp$$internal$$initializePromise(promise, resolver) {
      var resolved = false;
      try {
        resolver(function resolvePromise(value){
          if (resolved) { return; }
          resolved = true;
          lib$rsvp$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          if (resolved) { return; }
          resolved = true;
          lib$rsvp$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$rsvp$$internal$$reject(promise, e);
      }
    }

    function lib$rsvp$enumerator$$makeSettledResult(state, position, value) {
      if (state === lib$rsvp$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
         return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function lib$rsvp$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$rsvp$$internal$$noop, label);
      enumerator._abortOnReject = abortOnReject;

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$rsvp$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$rsvp$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$rsvp$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    var lib$rsvp$enumerator$$default = lib$rsvp$enumerator$$Enumerator;

    lib$rsvp$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$rsvp$utils$$isArray(input);
    };

    lib$rsvp$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$rsvp$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    lib$rsvp$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;
      var length     = enumerator.length;
      var promise    = enumerator.promise;
      var input      = enumerator._input;

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;
      if (lib$rsvp$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$rsvp$$internal$$PENDING) {
          entry._onError = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = enumerator._makeResult(lib$rsvp$$internal$$FULFILLED, i, entry);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$rsvp$$internal$$PENDING) {
        enumerator._remaining--;

        if (enumerator._abortOnReject && state === lib$rsvp$$internal$$REJECTED) {
          lib$rsvp$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = enumerator._makeResult(state, i, value);
        }
      }

      if (enumerator._remaining === 0) {
        lib$rsvp$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    lib$rsvp$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$rsvp$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$rsvp$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$rsvp$$internal$$REJECTED, i, reason);
      });
    };
    function lib$rsvp$promise$all$$all(entries, label) {
      return new lib$rsvp$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    }
    var lib$rsvp$promise$all$$default = lib$rsvp$promise$all$$all;
    function lib$rsvp$promise$race$$race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$rsvp$$internal$$noop, label);

      if (!lib$rsvp$utils$$isArray(entries)) {
        lib$rsvp$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$rsvp$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$rsvp$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        lib$rsvp$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$rsvp$promise$race$$default = lib$rsvp$promise$race$$race;
    function lib$rsvp$promise$resolve$$resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$rsvp$$internal$$noop, label);
      lib$rsvp$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$rsvp$promise$resolve$$default = lib$rsvp$promise$resolve$$resolve;
    function lib$rsvp$promise$reject$$reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$rsvp$$internal$$noop, label);
      lib$rsvp$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$rsvp$promise$reject$$default = lib$rsvp$promise$reject$$reject;

    var lib$rsvp$promise$$guidKey = 'rsvp_' + lib$rsvp$utils$$now() + '-';
    var lib$rsvp$promise$$counter = 0;

    function lib$rsvp$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$rsvp$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    function lib$rsvp$promise$$Promise(resolver, label) {
      var promise = this;

      promise._id = lib$rsvp$promise$$counter++;
      promise._label = label;
      promise._state = undefined;
      promise._result = undefined;
      promise._subscribers = [];

      if (lib$rsvp$config$$config.instrument) {
        lib$rsvp$instrument$$default('created', promise);
      }

      if (lib$rsvp$$internal$$noop !== resolver) {
        if (!lib$rsvp$utils$$isFunction(resolver)) {
          lib$rsvp$promise$$needsResolver();
        }

        if (!(promise instanceof lib$rsvp$promise$$Promise)) {
          lib$rsvp$promise$$needsNew();
        }

        lib$rsvp$$internal$$initializePromise(promise, resolver);
      }
    }

    var lib$rsvp$promise$$default = lib$rsvp$promise$$Promise;

    // deprecated
    lib$rsvp$promise$$Promise.cast = lib$rsvp$promise$resolve$$default;
    lib$rsvp$promise$$Promise.all = lib$rsvp$promise$all$$default;
    lib$rsvp$promise$$Promise.race = lib$rsvp$promise$race$$default;
    lib$rsvp$promise$$Promise.resolve = lib$rsvp$promise$resolve$$default;
    lib$rsvp$promise$$Promise.reject = lib$rsvp$promise$reject$$default;

    lib$rsvp$promise$$Promise.prototype = {
      constructor: lib$rsvp$promise$$Promise,

      _guidKey: lib$rsvp$promise$$guidKey,

      _onError: function (reason) {
        var promise = this;
        lib$rsvp$config$$config.after(function() {
          if (promise._onError) {
            lib$rsvp$config$$config['trigger']('error', reason, promise._label);
          }
        });
      },

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfillment
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection, label) {
        var parent = this;
        var state = parent._state;

        if (state === lib$rsvp$$internal$$FULFILLED && !onFulfillment || state === lib$rsvp$$internal$$REJECTED && !onRejection) {
          if (lib$rsvp$config$$config.instrument) {
            lib$rsvp$instrument$$default('chained', parent, parent);
          }
          return parent;
        }

        parent._onError = null;

        var child = new parent.constructor(lib$rsvp$$internal$$noop, label);
        var result = parent._result;

        if (lib$rsvp$config$$config.instrument) {
          lib$rsvp$instrument$$default('chained', parent, child);
        }

        if (state) {
          var callback = arguments[state - 1];
          lib$rsvp$config$$config.async(function(){
            lib$rsvp$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection, label) {
        return this.then(undefined, onRejection, label);
      },

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves

      Synchronous example:

      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }

      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```

      Asynchronous example:

      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```

      @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'finally': function(callback, label) {
        var promise = this;
        var constructor = promise.constructor;

        return promise.then(function(value) {
          return constructor.resolve(callback()).then(function(){
            return value;
          });
        }, function(reason) {
          return constructor.resolve(callback()).then(function(){
            throw reason;
          });
        }, label);
      }
    };

    function lib$rsvp$all$settled$$AllSettled(Constructor, entries, label) {
      this._superConstructor(Constructor, entries, false /* don't abort on reject */, label);
    }

    lib$rsvp$all$settled$$AllSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
    lib$rsvp$all$settled$$AllSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$all$settled$$AllSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;
    lib$rsvp$all$settled$$AllSettled.prototype._validationError = function() {
      return new Error('allSettled must be called with an array');
    };

    function lib$rsvp$all$settled$$allSettled(entries, label) {
      return new lib$rsvp$all$settled$$AllSettled(lib$rsvp$promise$$default, entries, label).promise;
    }
    var lib$rsvp$all$settled$$default = lib$rsvp$all$settled$$allSettled;
    function lib$rsvp$all$$all(array, label) {
      return lib$rsvp$promise$$default.all(array, label);
    }
    var lib$rsvp$all$$default = lib$rsvp$all$$all;
    var lib$rsvp$asap$$len = 0;
    var lib$rsvp$asap$$toString = {}.toString;
    var lib$rsvp$asap$$vertxNext;
    function lib$rsvp$asap$$asap(callback, arg) {
      lib$rsvp$asap$$queue[lib$rsvp$asap$$len] = callback;
      lib$rsvp$asap$$queue[lib$rsvp$asap$$len + 1] = arg;
      lib$rsvp$asap$$len += 2;
      if (lib$rsvp$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        lib$rsvp$asap$$scheduleFlush();
      }
    }

    var lib$rsvp$asap$$default = lib$rsvp$asap$$asap;

    var lib$rsvp$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$rsvp$asap$$browserGlobal = lib$rsvp$asap$$browserWindow || {};
    var lib$rsvp$asap$$BrowserMutationObserver = lib$rsvp$asap$$browserGlobal.MutationObserver || lib$rsvp$asap$$browserGlobal.WebKitMutationObserver;
    var lib$rsvp$asap$$isNode = typeof self === 'undefined' &&
      typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$rsvp$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$rsvp$asap$$flush);
      };
    }

    // vertx
    function lib$rsvp$asap$$useVertxTimer() {
      return function() {
        lib$rsvp$asap$$vertxNext(lib$rsvp$asap$$flush);
      };
    }

    function lib$rsvp$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$rsvp$asap$$BrowserMutationObserver(lib$rsvp$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$rsvp$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$rsvp$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$rsvp$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$rsvp$asap$$flush, 1);
      };
    }

    var lib$rsvp$asap$$queue = new Array(1000);
    function lib$rsvp$asap$$flush() {
      for (var i = 0; i < lib$rsvp$asap$$len; i+=2) {
        var callback = lib$rsvp$asap$$queue[i];
        var arg = lib$rsvp$asap$$queue[i+1];

        callback(arg);

        lib$rsvp$asap$$queue[i] = undefined;
        lib$rsvp$asap$$queue[i+1] = undefined;
      }

      lib$rsvp$asap$$len = 0;
    }

    function lib$rsvp$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$rsvp$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$rsvp$asap$$useVertxTimer();
      } catch(e) {
        return lib$rsvp$asap$$useSetTimeout();
      }
    }

    var lib$rsvp$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$rsvp$asap$$isNode) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useNextTick();
    } else if (lib$rsvp$asap$$BrowserMutationObserver) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMutationObserver();
    } else if (lib$rsvp$asap$$isWorker) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMessageChannel();
    } else if (lib$rsvp$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$attemptVertex();
    } else {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useSetTimeout();
    }
    function lib$rsvp$defer$$defer(label) {
      var deferred = {};

      deferred['promise'] = new lib$rsvp$promise$$default(function(resolve, reject) {
        deferred['resolve'] = resolve;
        deferred['reject'] = reject;
      }, label);

      return deferred;
    }
    var lib$rsvp$defer$$default = lib$rsvp$defer$$defer;
    function lib$rsvp$filter$$filter(promises, filterFn, label) {
      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!lib$rsvp$utils$$isFunction(filterFn)) {
          throw new TypeError("You must pass a function as filter's second argument.");
        }

        var length = values.length;
        var filtered = new Array(length);

        for (var i = 0; i < length; i++) {
          filtered[i] = filterFn(values[i]);
        }

        return lib$rsvp$promise$$default.all(filtered, label).then(function(filtered) {
          var results = new Array(length);
          var newLength = 0;

          for (var i = 0; i < length; i++) {
            if (filtered[i]) {
              results[newLength] = values[i];
              newLength++;
            }
          }

          results.length = newLength;

          return results;
        });
      });
    }
    var lib$rsvp$filter$$default = lib$rsvp$filter$$filter;

    function lib$rsvp$promise$hash$$PromiseHash(Constructor, object, label) {
      this._superConstructor(Constructor, object, true, label);
    }

    var lib$rsvp$promise$hash$$default = lib$rsvp$promise$hash$$PromiseHash;

    lib$rsvp$promise$hash$$PromiseHash.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
    lib$rsvp$promise$hash$$PromiseHash.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$promise$hash$$PromiseHash.prototype._init = function() {
      this._result = {};
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._validateInput = function(input) {
      return input && typeof input === 'object';
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._validationError = function() {
      return new Error('Promise.hash must be called with an object');
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._enumerate = function() {
      var enumerator = this;
      var promise    = enumerator.promise;
      var input      = enumerator._input;
      var results    = [];

      for (var key in input) {
        if (promise._state === lib$rsvp$$internal$$PENDING && Object.prototype.hasOwnProperty.call(input, key)) {
          results.push({
            position: key,
            entry: input[key]
          });
        }
      }

      var length = results.length;
      enumerator._remaining = length;
      var result;

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        result = results[i];
        enumerator._eachEntry(result.entry, result.position);
      }
    };

    function lib$rsvp$hash$settled$$HashSettled(Constructor, object, label) {
      this._superConstructor(Constructor, object, false, label);
    }

    lib$rsvp$hash$settled$$HashSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$promise$hash$$default.prototype);
    lib$rsvp$hash$settled$$HashSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$hash$settled$$HashSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;

    lib$rsvp$hash$settled$$HashSettled.prototype._validationError = function() {
      return new Error('hashSettled must be called with an object');
    };

    function lib$rsvp$hash$settled$$hashSettled(object, label) {
      return new lib$rsvp$hash$settled$$HashSettled(lib$rsvp$promise$$default, object, label).promise;
    }
    var lib$rsvp$hash$settled$$default = lib$rsvp$hash$settled$$hashSettled;
    function lib$rsvp$hash$$hash(object, label) {
      return new lib$rsvp$promise$hash$$default(lib$rsvp$promise$$default, object, label).promise;
    }
    var lib$rsvp$hash$$default = lib$rsvp$hash$$hash;
    function lib$rsvp$map$$map(promises, mapFn, label) {
      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!lib$rsvp$utils$$isFunction(mapFn)) {
          throw new TypeError("You must pass a function as map's second argument.");
        }

        var length = values.length;
        var results = new Array(length);

        for (var i = 0; i < length; i++) {
          results[i] = mapFn(values[i]);
        }

        return lib$rsvp$promise$$default.all(results, label);
      });
    }
    var lib$rsvp$map$$default = lib$rsvp$map$$map;

    function lib$rsvp$node$$Result() {
      this.value = undefined;
    }

    var lib$rsvp$node$$ERROR = new lib$rsvp$node$$Result();
    var lib$rsvp$node$$GET_THEN_ERROR = new lib$rsvp$node$$Result();

    function lib$rsvp$node$$getThen(obj) {
      try {
       return obj.then;
      } catch(error) {
        lib$rsvp$node$$ERROR.value= error;
        return lib$rsvp$node$$ERROR;
      }
    }


    function lib$rsvp$node$$tryApply(f, s, a) {
      try {
        f.apply(s, a);
      } catch(error) {
        lib$rsvp$node$$ERROR.value = error;
        return lib$rsvp$node$$ERROR;
      }
    }

    function lib$rsvp$node$$makeObject(_, argumentNames) {
      var obj = {};
      var name;
      var i;
      var length = _.length;
      var args = new Array(length);

      for (var x = 0; x < length; x++) {
        args[x] = _[x];
      }

      for (i = 0; i < argumentNames.length; i++) {
        name = argumentNames[i];
        obj[name] = args[i + 1];
      }

      return obj;
    }

    function lib$rsvp$node$$arrayResult(_) {
      var length = _.length;
      var args = new Array(length - 1);

      for (var i = 1; i < length; i++) {
        args[i - 1] = _[i];
      }

      return args;
    }

    function lib$rsvp$node$$wrapThenable(then, promise) {
      return {
        then: function(onFulFillment, onRejection) {
          return then.call(promise, onFulFillment, onRejection);
        }
      };
    }

    function lib$rsvp$node$$denodeify(nodeFunc, options) {
      var fn = function() {
        var self = this;
        var l = arguments.length;
        var args = new Array(l + 1);
        var arg;
        var promiseInput = false;

        for (var i = 0; i < l; ++i) {
          arg = arguments[i];

          if (!promiseInput) {
            // TODO: clean this up
            promiseInput = lib$rsvp$node$$needsPromiseInput(arg);
            if (promiseInput === lib$rsvp$node$$GET_THEN_ERROR) {
              var p = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);
              lib$rsvp$$internal$$reject(p, lib$rsvp$node$$GET_THEN_ERROR.value);
              return p;
            } else if (promiseInput && promiseInput !== true) {
              arg = lib$rsvp$node$$wrapThenable(promiseInput, arg);
            }
          }
          args[i] = arg;
        }

        var promise = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);

        args[l] = function(err, val) {
          if (err)
            lib$rsvp$$internal$$reject(promise, err);
          else if (options === undefined)
            lib$rsvp$$internal$$resolve(promise, val);
          else if (options === true)
            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$arrayResult(arguments));
          else if (lib$rsvp$utils$$isArray(options))
            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$makeObject(arguments, options));
          else
            lib$rsvp$$internal$$resolve(promise, val);
        };

        if (promiseInput) {
          return lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);
        } else {
          return lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);
        }
      };

      fn.__proto__ = nodeFunc;

      return fn;
    }

    var lib$rsvp$node$$default = lib$rsvp$node$$denodeify;

    function lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {
      var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
      if (result === lib$rsvp$node$$ERROR) {
        lib$rsvp$$internal$$reject(promise, result.value);
      }
      return promise;
    }

    function lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self){
      return lib$rsvp$promise$$default.all(args).then(function(args){
        var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
        if (result === lib$rsvp$node$$ERROR) {
          lib$rsvp$$internal$$reject(promise, result.value);
        }
        return promise;
      });
    }

    function lib$rsvp$node$$needsPromiseInput(arg) {
      if (arg && typeof arg === 'object') {
        if (arg.constructor === lib$rsvp$promise$$default) {
          return true;
        } else {
          return lib$rsvp$node$$getThen(arg);
        }
      } else {
        return false;
      }
    }
    var lib$rsvp$platform$$platform;

    /* global self */
    if (typeof self === 'object') {
      lib$rsvp$platform$$platform = self;

    /* global global */
    } else if (typeof global === 'object') {
      lib$rsvp$platform$$platform = global;
    } else {
      throw new Error('no global: `self` or `global` found');
    }

    var lib$rsvp$platform$$default = lib$rsvp$platform$$platform;
    function lib$rsvp$race$$race(array, label) {
      return lib$rsvp$promise$$default.race(array, label);
    }
    var lib$rsvp$race$$default = lib$rsvp$race$$race;
    function lib$rsvp$reject$$reject(reason, label) {
      return lib$rsvp$promise$$default.reject(reason, label);
    }
    var lib$rsvp$reject$$default = lib$rsvp$reject$$reject;
    function lib$rsvp$resolve$$resolve(value, label) {
      return lib$rsvp$promise$$default.resolve(value, label);
    }
    var lib$rsvp$resolve$$default = lib$rsvp$resolve$$resolve;
    function lib$rsvp$rethrow$$rethrow(reason) {
      setTimeout(function() {
        throw reason;
      });
      throw reason;
    }
    var lib$rsvp$rethrow$$default = lib$rsvp$rethrow$$rethrow;

    // defaults
    lib$rsvp$config$$config.async = lib$rsvp$asap$$default;
    lib$rsvp$config$$config.after = function(cb) {
      setTimeout(cb, 0);
    };
    var lib$rsvp$$cast = lib$rsvp$resolve$$default;
    function lib$rsvp$$async(callback, arg) {
      lib$rsvp$config$$config.async(callback, arg);
    }

    function lib$rsvp$$on() {
      lib$rsvp$config$$config['on'].apply(lib$rsvp$config$$config, arguments);
    }

    function lib$rsvp$$off() {
      lib$rsvp$config$$config['off'].apply(lib$rsvp$config$$config, arguments);
    }

    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
    if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
      var lib$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];
      lib$rsvp$config$$configure('instrument', true);
      for (var lib$rsvp$$eventName in lib$rsvp$$callbacks) {
        if (lib$rsvp$$callbacks.hasOwnProperty(lib$rsvp$$eventName)) {
          lib$rsvp$$on(lib$rsvp$$eventName, lib$rsvp$$callbacks[lib$rsvp$$eventName]);
        }
      }
    }

    var lib$rsvp$umd$$RSVP = {
      'race': lib$rsvp$race$$default,
      'Promise': lib$rsvp$promise$$default,
      'allSettled': lib$rsvp$all$settled$$default,
      'hash': lib$rsvp$hash$$default,
      'hashSettled': lib$rsvp$hash$settled$$default,
      'denodeify': lib$rsvp$node$$default,
      'on': lib$rsvp$$on,
      'off': lib$rsvp$$off,
      'map': lib$rsvp$map$$default,
      'filter': lib$rsvp$filter$$default,
      'resolve': lib$rsvp$resolve$$default,
      'reject': lib$rsvp$reject$$default,
      'all': lib$rsvp$all$$default,
      'rethrow': lib$rsvp$rethrow$$default,
      'defer': lib$rsvp$defer$$default,
      'EventTarget': lib$rsvp$events$$default,
      'configure': lib$rsvp$config$$configure,
      'async': lib$rsvp$$async
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$rsvp$umd$$RSVP; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$rsvp$umd$$RSVP;
    } else if (typeof lib$rsvp$platform$$default !== 'undefined') {
      lib$rsvp$platform$$default['RSVP'] = lib$rsvp$umd$$RSVP;
    }
}).call(this);


if (self.Promise === undefined) {
  self.Promise = RSVP.Promise;
}}(window));

;(function () {

  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    var str = String(input);
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      str.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    var str = String(input).replace(/=+$/, '');
    if (str.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = str.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ajax = require('../ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _version = require('../version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ListingsAdapter = _coreObject2.default.extend({
  ajax: _ajax2.default,

  constructor: function constructor(config) {
    this.config = config;
  },


  get base64ApiKey() {
    return btoa(this.config.apiKey);
  },

  get baseUrl() {
    var _config = this.config;
    var domain = _config.domain;
    var appId = _config.appId;


    return 'https://' + domain + '/api/apps/' + appId;
  },

  get headers() {
    return {
      Authorization: 'Basic ' + this.base64ApiKey,
      'Content-Type': 'application/json',
      'X-SDK-Variant': 'javascript',
      'X-SDK-Version': _version2.default

    };
  },

  pathForType: function pathForType(type) {
    return '/' + type.slice(0, -1) + '_listings';
  },
  buildUrl: function buildUrl(singleOrMultiple, type, idOrQuery) {
    switch (singleOrMultiple) {
      case 'multiple':
        return this.buildMultipleUrl(type, idOrQuery);
      case 'single':
        return this.buildSingleUrl(type, idOrQuery);
      default:
        return '';
    }
  },
  buildMultipleUrl: function buildMultipleUrl(type) {
    var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var url = '' + this.baseUrl + this.pathForType(type);
    var paramNames = Object.keys(query);

    if (paramNames.length > 0) {
      var queryString = paramNames.map(function (key) {
        var value = void 0;

        if (Array.isArray(query[key])) {
          value = query[key].join(',');
        } else {
          value = query[key];
        }

        return key + '=' + encodeURIComponent(value);
      }).join('&');

      return url + '?' + queryString;
    }

    return url;
  },
  buildSingleUrl: function buildSingleUrl(type, id) {
    return '' + this.baseUrl + this.pathForType(type) + '/' + id;
  },
  fetchMultiple: function fetchMultiple() /* type, [query] */{
    var url = this.buildUrl.apply(this, ['multiple'].concat(Array.prototype.slice.call(arguments)));

    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
      return response.json;
    });
  },
  fetchSingle: function fetchSingle() /* type, id */{
    var url = this.buildUrl.apply(this, ['single'].concat(Array.prototype.slice.call(arguments)));

    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
      return response.json;
    });
  }
});

exports.default = ListingsAdapter;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _setGuidFor = require('../metal/set-guid-for');

var _setGuidFor2 = _interopRequireDefault(_setGuidFor);

var _store = require('../store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LocalStorageAdapter = _coreObject2.default.extend({
  constructor: function constructor() {
    this.store = new _store2.default();
  },
  idKeyForType: function idKeyForType() /* type */{
    return _setGuidFor.GUID_KEY;
  },
  fetchSingle: function fetchSingle(type, id) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var value = _this.store.getItem(_this.storageKey(type, id));

      if (value === null) {
        reject(new Error(type + '#' + id + ' not found'));

        return;
      }

      resolve(value);
    });
  },
  create: function create(type, payload) {
    var _this2 = this;

    return new Promise(function (resolve) {
      var id = _this2.identify(payload);

      _this2.store.setItem(_this2.storageKey(type, id), payload);
      resolve(payload);
    });
  },
  update: function update(type, id, payload) {
    var _this3 = this;

    return new Promise(function (resolve) {
      _this3.store.setItem(_this3.storageKey(type, id), payload);
      resolve(payload);
    });
  },
  storageKey: function storageKey(type, id) {
    return type + '.' + id;
  },
  identify: function identify(payload) {
    var keys = Object.keys(payload);

    if (keys.length === 1 && _typeof(payload[keys[0]]) === 'object') {
      return (0, _setGuidFor2.default)(payload[keys[0]]);
    }

    return (0, _setGuidFor2.default)(payload);
  }
});

exports.default = LocalStorageAdapter;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ajax;

var _ie9Ajax = require('./ie9-ajax');

var _ie9Ajax2 = _interopRequireDefault(_ie9Ajax);

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  var error = new Error(response.statusText);

  error.status = response.status;
  error.response = response;
  throw error;
}

function parseResponse(response) {
  return response.json().then(function (json) {
    return { json: json, originalResponse: response, isJSON: true };
  }).catch(function () {
    var responseClone = response.clone();

    return responseClone.text().then(function (text) {
      return { text: text, originalResponse: responseClone, isText: true };
    });
  });
}

function ajax(method, url) {
  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  if (_global2.default.XDomainRequest) {
    return _ie9Ajax2.default.apply(undefined, arguments);
  }

  opts.method = method;
  opts.mode = 'cors';

  return fetch(url, opts).then(checkStatus).then(parseResponse);
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module shopify-buy
 * @submodule config
 */

var Config = _coreObject2.default.extend({
  /**
   * @class Config
   * @constructor
   * @param {Object} attrs An object of required config data.
   * @param {String} attrs.apiKey Your api client's public token
   * @param {String} attrs.appId The app whose listings the client will be
   * using. If you are just modifying a buy button, the buy-button's app id is
   * 6. Otherwise, obtain the app id of the app you're modifying or extending.
   * @param {String} attrs.domain Your shop's full domain. (i.e. `craftedgoods.myshopify.com`)
   */
  constructor: function constructor(attrs) {
    var _this = this;

    Object.keys(this.deprecatedProperties).forEach(function (key) {
      if (attrs.hasOwnProperty(key)) {
        var transformName = _this.deprecatedProperties[key];
        var transform = _this[transformName];

        transform(attrs[key], attrs);
      }
    });
    this.requiredProperties.forEach(function (key) {
      if (!attrs.hasOwnProperty(key)) {
        throw new Error('new Config() requires the option \'' + key + '\'');
      } else {
        _this[key] = attrs[key];
      }
    });
  },


  /**
   * An object with keys for deprecated properties and values as functions that
   * will transform the value into a usable value. A depracation transform should
   * have the value signature function(deprecated_value, config_to_be_transformed)
   * @attribute deprecatedProperties
   * @default { myShopifyDomain: this.transformMyShopifyDomain }
   * @type Object
   * @private
   */
  deprecatedProperties: {
    myShopifyDomain: 'transformMyShopifyDomain'
  },

  /**
   * Transform the myShopifyDomain config to a domain config.
   * @method transformMyShopifyDomain
   * @static
   * @private
   * @param {String} subdomain The original subdomain on myshopify.com
   * @param {Object} attrs. The config attributes to be transformed to a
   * non-deprecated state.
   * @return {Object} the transformed config attributes.
   */
  transformMyShopifyDomain: function transformMyShopifyDomain(subdomain, attrs) {
    _logger2.default.warn('Config - ', 'myShopifyDomain is deprecated, please use domain and provide the full shop domain.');
    attrs.domain = subdomain + '.myshopify.com';
  },


  /**
   * Properties that must be set on initializations
   * @attribute requiredProperties
   * @default ['apiKey', 'appId', 'myShopifyDomain']
   * @type Array
   * @private
   */
  requiredProperties: ['apiKey', 'appId', 'domain'],

  /**
   * The apiKey for authenticating against shopify. This is your api client's
   * public api token. Not the shared secret. Set during initialation.
   * @attribute apiKey
   * @default ''
   * @type String
   * @public
   */
  apiKey: '',

  /**
   * @attribute appId
   * @default ''
   * @type String
   * @public
   */
  appId: '',

  /**
   * The domain that all the api requests will go to
   * @attribute domain
   * @default ''
   * @type String
   * @public
   */
  domain: '',

  /**
   * The subdomain of myshopify.io that all the api requests will go to
   * @attribute myShopifyDomain
   * @default ''
   * @type String
   * @public
   * @deprecated Use `config.domain` instead.
   */
  myShopifyDomain: ''
});

exports.default = Config;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function authToUrl(url, opts) {
  var authorization = void 0;

  if (opts.headers) {
    Object.keys(opts.headers).forEach(function (key) {
      if (key.toLowerCase() === 'authorization') {
        authorization = opts.headers[key];
      }
    });
  }

  if (authorization) {
    var hashedKey = authorization.split(' ').slice(-1)[0];

    try {
      var plainKey = atob(hashedKey);

      var newUrl = void 0;

      if (url.indexOf('?') > -1) {
        newUrl = url + '&_x_http_authorization=' + plainKey;
      } else {
        newUrl = url + '?_x_http_authorization=' + plainKey;
      }

      return newUrl;
    } catch (e) {
      // atob choked on non-encoded data. Therefore, not a form of auth we
      // support.
      //
      // NOOP
      //
    }
  }

  /* eslint newline-before-return: 0 */
  return url;
}

function ie9Ajax(method, url, opts) {
  return new Promise(function (resolve, reject) {
    var xdr = new XDomainRequest();

    xdr.onload = function () {
      try {
        var json = JSON.parse(xdr.responseText);

        resolve({ json: json, originalResponse: xdr, isJSON: true });
      } catch (e) {
        resolve({ text: xdr.responseText, originalResponse: xdr, isText: true });
      }
    };

    function handleError() {
      reject(new Error('There was an error with the XDR'));
    }

    xdr.onerror = handleError;
    xdr.ontimeout = handleError;

    xdr.open(method, authToUrl(url, opts));
    xdr.send(opts.data);
  });
}

exports.default = ie9Ajax;
'use strict';

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

var _isNodeLikeEnvironment = require('./metal/is-node-like-environment');

var _isNodeLikeEnvironment2 = _interopRequireDefault(_isNodeLikeEnvironment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global Buffer */

var btoa = _global2.default.btoa;

if (!btoa && (0, _isNodeLikeEnvironment2.default)()) {
  _global2.default.btoa = function (string) {
    return new Buffer(string).toString('base64');
  };
}
'use strict';

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

var _isNodeLikeEnvironment = require('./metal/is-node-like-environment');

var _isNodeLikeEnvironment2 = _interopRequireDefault(_isNodeLikeEnvironment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals require */

var fetch = _global2.default.fetch;

if (!fetch && (0, _isNodeLikeEnvironment2.default)()) {
  /* this indirection is needed because babel throws errors when
   * transpiling require('node-fetch') using `amd` plugin with babel6
   */
  var localRequire = require;

  _global2.default.fetch = localRequire('node-fetch');
  _global2.default.Response = _global2.default.fetch.Response;
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapConsole = undefined;

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function wrapConsole(logCommand) {
  var logMethod = function logMethod() {
    /* eslint-disable no-console */
    if (console[logCommand]) {
      var _console;

      (_console = console)[logCommand].apply(_console, arguments);
    } else {
      var _console2;

      (_console2 = console).log.apply(_console2, arguments);
    }
    /* eslint-enable no-console */
  };

  return function () {
    var args = [].concat(Array.prototype.slice.call(arguments));

    args.unshift('[JS-BUY-SDK]: ');
    logMethod.apply(undefined, _toConsumableArray(args));
  };
}

var Logger = _coreObject2.default.extend({
  /**
   * Wrapper around the console log so in the future we can have better dev output.
   * Also allows us to disable output in production.
   * @class Logger
   * @constructor
   */
  constructor: function constructor() {},

  debug: wrapConsole('debug'),
  info: wrapConsole('info'),
  warn: wrapConsole('warn'),
  error: wrapConsole('error')
});

exports.wrapConsole = wrapConsole;
exports.default = new Logger();
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint no-undefined: 0 */

var assign = void 0;

if (typeof Object.assign === 'function') {
  assign = Object.assign;
} else {
  assign = function assign(target) {
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = Object(target);

    var propertyObjects = [].slice.call(arguments, 1);

    if (propertyObjects.length > 0) {
      propertyObjects.forEach(function (source) {
        if (source !== undefined && source !== null) {
          var nextKey = void 0;

          for (nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      });
    }

    return output;
  };
}

exports.default = assign;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = require('./create-class');

var _createClass2 = _interopRequireDefault(_createClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CoreObject = (0, _createClass2.default)({
  constructor: function constructor() {},


  static: {
    extend: function extend(subClassProps) {
      return (0, _createClass2.default)(subClassProps, this);
    }
  }
});

exports.default = CoreObject;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('./assign');

var _assign2 = _interopRequireDefault(_assign);

var _includes = require('./includes');

var _includes2 = _interopRequireDefault(_includes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function wrap(func, superFunc) {
  function superWrapper() {
    var originalSuper = this.super;

    this.super = function () {
      return superFunc.apply(this, arguments);
    };

    var ret = func.apply(this, arguments);

    this.super = originalSuper;

    return ret;
  }

  superWrapper.wrappedFunction = func;

  return superWrapper;
}

function defineProperties(names, proto, destination) {
  var parentProto = Object.getPrototypeOf(destination);

  names.forEach(function (name) {
    var descriptor = Object.getOwnPropertyDescriptor(proto, name);
    var parentDescriptor = parentProto.hasOwnProperty(name) && Object.getOwnPropertyDescriptor(parentProto, name);

    if (typeof parentDescriptor.value === 'function' && typeof descriptor.value === 'function') {
      var wrappedFunction = wrap(descriptor.value, parentDescriptor.value);

      Object.defineProperty(destination, name, { value: wrappedFunction });
    } else {
      Object.defineProperty(destination, name, descriptor);
    }
  });
}

function createClass(props) {
  var parent = arguments.length <= 1 || arguments[1] === undefined ? Object : arguments[1];

  var Constructor = wrap(props.constructor, parent);
  var instancePropertyNames = Object.getOwnPropertyNames(props).filter(function (key) {
    return !(0, _includes2.default)(['constructor', 'static'], key);
  });

  (0, _assign2.default)(Constructor, parent);

  Constructor.prototype = Object.create(parent.prototype);
  defineProperties(instancePropertyNames, props, Constructor.prototype);
  Constructor.prototype.constructor = Constructor;

  var staticProps = props.static;

  if (staticProps) {
    var staticPropertyNames = Object.getOwnPropertyNames(staticProps);

    defineProperties(staticPropertyNames, staticProps, Constructor);
  }

  return Constructor;
}

exports.default = createClass;
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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var includes = void 0;

if (!Array.prototype.includes) {
  includes = function includes(array, searchElement) {
    var ObjectifiedArray = Object(array);
    var length = parseInt(ObjectifiedArray.length, 10) || 0;

    if (length === 0) {
      return false;
    }

    var startIndex = parseInt(arguments[1], 10) || 0;
    var index = void 0;

    if (startIndex >= 0) {
      index = startIndex;
    } else {
      index = length + startIndex;

      if (index < 0) {
        index = 0;
      }
    }

    while (index < length) {
      var currentElement = ObjectifiedArray[index];

      /* eslint no-self-compare:0 */
      if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
        // NaN !== NaN
        return true;
      }
      index++;
    }

    return false;
  };
} else {
  includes = function includes(array) {
    var args = [].slice.call(arguments, 1);

    return Array.prototype.includes.apply(array, args);
  };
}

exports.default = includes;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isNodeLikeEnvironment;
function isNodeLikeEnvironment() {
  var windowAbsent = typeof window === 'undefined';
  var requirePresent = typeof require === 'function';

  return windowAbsent && requirePresent;
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/* eslint no-undefined: 0 complexity: 0 */

var GUID_KEY = 'shopify-buy-uuid';

var GUID_PREFIX = 'shopify-buy.' + Date.now();

var GUID_DESC = {
  writable: true,
  configurable: true,
  enumerable: true,
  value: null
};

var uuidSeed = 0;

function uuid() {
  return ++uuidSeed;
}

var numberCache = {};
var stringCache = {};

function setGuidFor(obj) {
  if (obj && obj[GUID_KEY]) {
    return obj[GUID_KEY];
  }

  if (obj === undefined) {
    return '(undefined)';
  }

  if (obj === null) {
    return '(null)';
  }

  var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
  var id = void 0;

  switch (type) {
    case 'number':
      id = numberCache[obj];

      if (!id) {
        id = numberCache[obj] = 'nu' + obj;
      }

      break;

    case 'string':
      id = stringCache[obj];

      if (!id) {
        id = stringCache[obj] = 'st' + uuid();
      }

      break;

    case 'boolean':
      if (obj) {
        id = '(true)';
      } else {
        id = '(false)';
      }

      break;

    default:
      if (obj === Object) {
        id = '(Object)';
        break;
      }

      if (obj === Array) {
        id = '(Array)';
        break;
      }

      id = GUID_PREFIX + '.' + uuid();

      if (obj[GUID_KEY] === null) {
        obj[GUID_KEY] = id;
      } else {
        GUID_DESC.value = id;
        Object.defineProperty(obj, GUID_KEY, GUID_DESC);
      }
  }

  return id;
}

exports.default = setGuidFor;
exports.GUID_KEY = GUID_KEY;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (array) {
  return array.reduce(function (uniqueArray, item) {
    if (uniqueArray.indexOf(item) < 0) {
      uniqueArray.push(item);
    }

    return uniqueArray;
  }, []);
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseModel = _coreObject2.default.extend({
  constructor: function constructor() {
    var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var metaAttrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.attrs = attrs;

    (0, _assign2.default)(this, metaAttrs);
  },

  attrs: null,
  serializer: null,
  adapter: null,
  shopClient: null
});

exports.default = BaseModel;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _setGuidFor = require('../metal/set-guid-for');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CartLineItem = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  get id() {
    return this.attrs[_setGuidFor.GUID_KEY];
  },

  get variant_id() {
    return this.attrs.variant_id;
  },

  get product_id() {
    return this.attrs.product_id;
  },

  get image() {
    return this.attrs.image;
  },

  get title() {
    return this.attrs.title;
  },

  get quantity() {
    return this.attrs.quantity;
  },

  set quantity(value) {
    var parsedValue = parseInt(value, 10);

    if (parsedValue < 0) {
      throw new Error('Quantities must be positive');
    } else if (parsedValue !== parseFloat(value)) {
      /* incidentally, this covers all NaN values, because NaN !== Nan */
      throw new Error('Quantities must be whole numbers');
    }

    this.attrs.quantity = parsedValue;

    return this.attrs.quantity;
  },

  get properties() {
    return this.attrs.properties || {};
  },

  set properties(value) {
    this.attrs.properties = value || {};

    return value;
  },

  get variant_title() {
    return this.attrs.variant_title;
  },

  get price() {
    return this.attrs.price;
  },

  get compare_at_price() {
    return this.attrs.compare_at_price;
  },

  get line_price() {
    return (this.quantity * parseFloat(this.price)).toFixed(2);
  },

  get grams() {
    return this.attrs.grams;
  }
});

exports.default = CartLineItem;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _cartLineItemModel = require('./cart-line-item-model');

var _cartLineItemModel2 = _interopRequireDefault(_cartLineItemModel);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _setGuidFor = require('../metal/set-guid-for');

var _setGuidFor2 = _interopRequireDefault(_setGuidFor);

var _global = require('../metal/global');

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function objectsEqual(one, two) {
  if (one === two) {
    return true;
  }

  return Object.keys(one).every(function (key) {
    if (one[key] instanceof Date) {
      return one[key].toString() === two[key].toString();
    } else if (_typeof(one[key]) === 'object') {
      return objectsEqual(one[key], two[key]);
    }

    return one[key] === two[key];
  });
}

var CartModel = _baseModel2.default.extend({

  /**
    * Class for cart model
    * @class CartModel
    * @constructor
  */
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  /**
    * get ID for current cart
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs[_setGuidFor.GUID_KEY];
  },

  /**
    * Get current line items for cart
    * @property lineItems
    * @type {Array}
  */
  get lineItems() {
    return (this.attrs.line_items || []).map(function (item) {
      return new _cartLineItemModel2.default(item);
    });
  },

  /**
    * Gets the sum quantity of each line item
    * @property lineItemCount
    * @type {Number}
  */
  get lineItemCount() {
    return this.lineItems.reduce(function (total, item) {
      return total + item.quantity;
    }, 0);
  },

  /**
    * Get current subtotal price for all line items
    * @property subtotal
    * @type {String}
  */
  get subtotal() {
    var subtotal = this.lineItems.reduce(function (runningTotal, lineItem) {
      return runningTotal + parseFloat(lineItem.line_price);
    }, 0);

    return subtotal.toFixed(2);
  },

  /**
    * Get checkout URL for current cart
    * @property checkoutUrl
    * @type {String}
  */
  get checkoutUrl() {
    var config = this.config;
    var baseUrl = 'https://' + config.domain + '/cart';

    var variantPath = this.lineItems.map(function (item) {
      return item.variant_id + ':' + item.quantity;
    });

    var query = 'api_key=' + config.apiKey;

    if (typeof _global2.default.ga === 'function') {
      var linkerParam = void 0;

      _global2.default.ga(function (tracker) {
        linkerParam = tracker.get('linkerParam');
      });

      if (linkerParam) {
        query += '&' + linkerParam;
      }
    }

    return baseUrl + '/' + variantPath + '?' + query;
  },

  /**
    * Add items to cart. Updates cart's `lineItems`
    * ```javascript
    * cart.addVariants({variant: variantObject, quantity: 1}).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @method addVariants
    * @param {Object} item - One or more variants
    * @param {Object} item.variant - variant object
    * @param {Number} item.quantity - quantity
    * @param {Object} [nextItem...] - further lineItems may be passed
    * @public
    * @return {Promise|CartModel} - updated cart instance.
  */
  addVariants: function addVariants() {
    var newLineItems = [].concat(Array.prototype.slice.call(arguments)).map(function (item) {
      var lineItem = {
        image: item.variant.image,
        variant_id: item.variant.id,
        product_id: item.variant.productId,
        title: item.variant.productTitle,
        quantity: parseInt(item.quantity, 10),
        properties: item.properties || {},
        variant_title: item.variant.title,
        price: item.variant.price,
        compare_at_price: item.variant.compareAtPrice,
        grams: item.variant.grams
      };

      (0, _setGuidFor2.default)(lineItem);

      return lineItem;
    });
    var existingLineItems = this.attrs.line_items;

    existingLineItems.push.apply(existingLineItems, _toConsumableArray(newLineItems));

    var dedupedLineItems = existingLineItems.reduce(function (itemAcc, item) {
      var matchingItem = itemAcc.filter(function (existingItem) {
        return existingItem.variant_id === item.variant_id && objectsEqual(existingItem.properties, item.properties);
      })[0];

      if (matchingItem) {
        matchingItem.quantity = matchingItem.quantity + item.quantity;
      } else {
        itemAcc.push(item);
      }

      return itemAcc;
    }, []);

    // Users may pass negative numbers and remove items. This ensures there's no
    // item with a quantity of zero or less.
    this.attrs.line_items = dedupedLineItems.reduce(function (itemAcc, item) {
      if (item.quantity >= 1) {
        itemAcc.push(item);
      }

      return itemAcc;
    }, []);

    return this.updateModel();
  },


  /**
    * Update line item quantity
    * ```javascript
    * cart.updateLineItem(123, 2).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @method updateLineItem
    * @param {Number} id - line item ID
    * @param {Number} quantity - new quantity for line item
    * @throws {Error} if line item with ID is not in cart.
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  updateLineItem: function updateLineItem(id, quantity) {
    if (quantity < 1) {
      return this.removeLineItem(id);
    }

    var lineItem = this.lineItems.filter(function (item) {
      return item.id === id;
    })[0];

    if (lineItem) {
      lineItem.quantity = quantity;

      return this.updateModel();
    }

    return new Promise(function (resolve, reject) {
      reject(new Error('line item with id: ' + id + ' not found in cart#' + this.id));
    });
  },


  /**
    * Remove line item from cart
    * @method removeLineItem
    * @param {Number} id - line item ID
    * @throws {Error} if line item with ID is not in cart.
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  removeLineItem: function removeLineItem(id) {
    var oldLength = this.lineItems.length;
    var newLineItems = this.lineItems.filter(function (item) {
      return item.id !== id;
    });
    var newLength = newLineItems.length;

    if (newLength < oldLength) {
      this.attrs.line_items = newLineItems.map(function (item) {
        return item.attrs;
      });

      return this.updateModel();
    }

    return new Promise(function (resolve, reject) {
      reject(new Error('line item with id: ' + id + ' not found in cart#' + this.id));
    });
  },


  /**
    * Remove all line items from cart
    * @method clearLineItems
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  clearLineItems: function clearLineItems() {
    this.attrs.line_items = [];

    return this.updateModel();
  },


  /**
    * force update of cart model on server
    * @method updateModel
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  updateModel: function updateModel() {
    var _this = this;

    return this.shopClient.update('carts', this).then(function (updateCart) {
      (0, _assign2.default)(_this.attrs, updateCart.attrs);

      return _this;
    });
  }
});

exports.default = CartModel;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NO_IMAGE_URI = undefined;

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _productOptionModel = require('./product-option-model');

var _productOptionModel2 = _interopRequireDefault(_productOptionModel);

var _productVariantModel = require('./product-variant-model');

var _productVariantModel2 = _interopRequireDefault(_productVariantModel);

var _uniq = require('../metal/uniq');

var _uniq2 = _interopRequireDefault(_uniq);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NO_IMAGE_URI = 'https://widgets.shopifyapps.com/assets/no-image.svg';

/**
   * Class for products returned by fetch('product')
   * @class ProductModel
   * @constructor
 */
var ProductModel = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  /**
    * Product unique ID
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs.product_id;
  },

  /**
    * Product title
    * @property title
    * @type {String}
  */
  get title() {
    return this.attrs.title;
  },

  /**
    * Product description. The exposes the `body_html` property on the listings API
    * @property description
    * @type {String}
  */
  get description() {
    return this.attrs.body_html;
  },

  /**
    * All images associated with product.
    * @property images
    * @type {Array} array of image objects.
  */
  get images() {
    return this.attrs.images;
  },

  get memoized() {
    this._memoized = this._memoized || {};

    return this._memoized;
  },

  /**
     *  Get array of options with nested values. Useful for creating UI for selecting options.
     *
     * ```javascript
     *  var elements = product.options.map(function(option) {
     *    return '<select name="' + option.name + '">' + option.values.map(function(value) {
     *      return '<option value="' + value + '">' + value + '</option>';
     *    }) + '</select>';
     *  });
     * ```
     *
     * @attribute options
     * @type {Array|Option}
   */
  get options() {
    if (this.memoized.options) {
      return this.memoized.options;
    }

    var baseOptions = this.attrs.options;
    var variants = this.variants;

    this.memoized.options = baseOptions.map(function (option) {
      var name = option.name;

      var dupedValues = variants.reduce(function (valueList, variant) {
        var optionValueForOption = variant.optionValues.filter(function (optionValue) {
          return optionValue.name === option.name;
        })[0];

        valueList.push(optionValueForOption.value);

        return valueList;
      }, []);

      var values = (0, _uniq2.default)(dupedValues);

      return new _productOptionModel2.default({ name: name, values: values });
    });

    return this.memoized.options;
  },

  /**
    * All variants of a product.
    * @property variants
    * @type {Array|ProductVariantModel} array of ProductVariantModel instances.
  */
  get variants() {
    var _this = this;

    return this.attrs.variants.map(function (variant) {
      return new _productVariantModel2.default({ variant: variant, product: _this }, { config: _this.config });
    });
  },

  /**
    * Retrieve currently selected option values.
    * @attribute selections
    * @type {Option}
  */
  get selections() {
    return this.options.map(function (option) {
      return option.selected;
    });
  },

  /**
    * Retrieve variant for currently selected options
    * @attribute selectedVariant
    * @type {Object}
  */
  get selectedVariant() {
    var variantTitle = this.selections.join(' / ');

    return this.variants.filter(function (variant) {
      return variant.title === variantTitle;
    })[0] || null;
  },

  /**
    * Retrieve image for currently selected variantImage
    * @attribute selectedVariantImage
    * @type {Object}
  */
  get selectedVariantImage() {
    if (!this.selectedVariant) {
      return null;
    }

    return this.selectedVariant.image;
  }
});

exports.default = ProductModel;
exports.NO_IMAGE_URI = NO_IMAGE_URI;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _includes = require('../metal/includes');

var _includes2 = _interopRequireDefault(_includes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * Class for product option
  * @class Option
  * @constructor
*/
var ProductOptionModel = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);

    this.selected = this.values[0];
  },


  /**
    * name of option (ex. "Size", "Color")
    * @property name
    * @type String
  */
  get name() {
    return this.attrs.name;
  },

  /**
    * possible values for selection
    * @property values
    * @type Array
  */
  get values() {
    return this.attrs.values;
  },

  /**
    * get/set selected option value (ex. "Large"). Setting this will update the
    * selected value on the model. Throws {Error} if setting selected to value that does not exist for option
    * @property selected
    * @type String
  */
  get selected() {
    return this._selected;
  },

  set selected(value) {
    if ((0, _includes2.default)(this.values, value)) {
      this._selected = value;
    } else {
      throw new Error('Invalid option selection for ' + this.name + '.');
    }

    return value;
  }
});

exports.default = ProductOptionModel;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * Model for product variant
  * @class ProductVariantModel
  * @constructor
*/
var ProductVariantModel = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  /**
    * Variant unique ID
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs.variant.id;
  },

  /**
    * ID of product variant belongs to
    * @property productId
    * @type {String}
  */
  get productId() {
    return this.attrs.product.id;
  },

  /**
    * Title of variant
    * @property title
    * @type {String}
  */
  get title() {
    return this.attrs.variant.title;
  },

  /**
    * Title of product variant belongs to
    * @property productTitle
    * @type {String}
  */
  get productTitle() {
    return this.attrs.product.title;
  },

  /**
    * <a href="https://docs.shopify.com/manual/products/promoting-marketing/sales">
    * Compare at</a> price for variant formatted as currency.
    * @property compareAtPrice
    * @type {String}
  */
  get compareAtPrice() {
    return this.attrs.variant.compare_at_price;
  },

  /**
    * Price of variant, formatted as currency
    * @property price
    * @type {String}
  */
  get price() {
    return this.attrs.variant.price;
  },

  /**
    * Variant weight in grams
    * @property grams
    * @type {Number}
  */
  get grams() {
    return this.attrs.variant.grams;
  },

  /**
    * Option values associated with this variant, ex {name: "color", value: "Blue"}
    * @property optionValues
    * @type {Array|Object}
  */
  get optionValues() {
    return this.attrs.variant.option_values;
  },

  /**
    * Variant in stock (always true if inventory tracking is disabled)
    * @property available
    * @type {Boolean}
  */
  get available() {
    return this.attrs.variant.available;
  },

  /**
    * Image for variant
    * @property image
    * @type {Object}
  */
  get image() {
    var id = this.id;
    var images = this.attrs.product.images;

    var primaryImage = images[0];
    var variantImage = images.filter(function (image) {
      return image.variant_ids.indexOf(id) !== -1;
    })[0];

    return variantImage || primaryImage;
  },

  /**
    * Image variants available for a variant, ex [ {"name":"pico","dimension":"16x16","src":"https://cdn.shopify.com/image-two_pico.jpg"} ]
    * See <a href="https://help.shopify.com/themes/liquid/filters/url-filters#size-parameters"> for list of available variants.</a>
    * @property imageVariant
    * @type {Array}
  */
  get imageVariants() {
    var image = this.image;

    if (!image) {
      return [];
    }

    var src = this.image.src;
    var extensionIndex = src.lastIndexOf('.');
    var pathAndBasename = src.slice(0, extensionIndex);
    var extension = src.slice(extensionIndex);
    var variants = [{ name: 'pico', dimension: '16x16' }, { name: 'icon', dimension: '32x32' }, { name: 'thumb', dimension: '50x50' }, { name: 'small', dimension: '100x100' }, { name: 'compact', dimension: '160x160' }, { name: 'medium', dimension: '240x240' }, { name: 'large', dimension: '480x480' }, { name: 'grande', dimension: '600x600' }, { name: '1024x1024', dimension: '1024x1024' }, { name: '2048x2048', dimension: '2048x2048' }];

    variants.forEach(function (variant) {
      variant.src = pathAndBasename + '_' + variant.name + extension;
    });

    return variants;
  },

  /**
    * Checkout URL for purchasing variant with quantity.
    * @method checkoutUrl
    * @param {Number} [quantity = 1] quantity of variant
    * @public
    * @return {String} Checkout URL
  */
  checkoutUrl: function checkoutUrl() {
    var quantity = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

    var config = this.config;
    var baseUrl = 'https://' + config.domain + '/cart';

    var variantPath = this.id + ':' + parseInt(quantity, 10);

    var query = 'api_key=' + config.apiKey;

    return baseUrl + '/' + variantPath + '?' + query;
  }
});

exports.default = ProductVariantModel;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _setGuidFor = require('../metal/set-guid-for');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReferenceModel = _baseModel2.default.extend({

  /**
    * Class for reference model
    * @class ReferenceModel
    * @constructor
  */
  constructor: function constructor(attrs) {
    if (Object.keys(attrs).indexOf('referenceId') < 0) {
      throw new Error('Missing key referenceId of reference. References to null are not allowed');
    }

    this.super.apply(this, arguments);
  },


  /**
    * get the ID for current reference (not what it refers to, but its own unique identifier)
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs[_setGuidFor.GUID_KEY];
  },

  get referenceId() {
    return this.attrs.referenceId;
  },
  set referenceId(value) {
    this.attrs.referenceId = value;

    return value;
  }

});

exports.default = ReferenceModel;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _cartModel = require('../models/cart-model');

var _cartModel2 = _interopRequireDefault(_cartModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CartSerializer = _coreObject2.default.extend({
  constructor: function constructor(config) {
    this.config = config;
  },
  rootKeyForType: function rootKeyForType(type) {
    return type.slice(0, -1);
  },
  modelForType: function modelForType() /* type */{
    return _cartModel2.default;
  },
  deserializeSingle: function deserializeSingle(type) {
    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var modelAttrs = singlePayload[this.rootKeyForType(type)];
    var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

    return model;
  },
  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
    var Model = this.modelForType(type);

    metaAttrs.config = this.config;

    return new Model(attrs, metaAttrs);
  },
  serialize: function serialize(type, model) {
    var root = this.rootKeyForType(type);
    var payload = {};
    var attrs = (0, _assign2.default)({}, model.attrs);

    payload[root] = attrs;

    delete attrs.attributes;

    Object.keys(attrs).forEach(function (key) {
      var value = attrs[key];

      if (value === null || typeof value === 'string' && value.length === 0) {
        delete attrs[key];
      }
    });

    return payload;
  }
});

exports.default = CartSerializer;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _baseModel = require('../models/base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _productModel = require('../models/product-model');

var _productModel2 = _interopRequireDefault(_productModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ListingsSerializer = _coreObject2.default.extend({
  constructor: function constructor(config) {
    this.config = config;
  },
  rootKeyForType: function rootKeyForType(type) {
    return type.slice(0, -1) + '_listing';
  },


  models: {
    collections: _baseModel2.default,
    products: _productModel2.default
  },

  modelForType: function modelForType(type) {
    return this.models[type];
  },
  deserializeSingle: function deserializeSingle(type) {
    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var modelAttrs = singlePayload[this.rootKeyForType(type)];
    var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

    return model;
  },
  deserializeMultiple: function deserializeMultiple(type) {
    var _this = this;

    var collectionPayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var models = collectionPayload[this.rootKeyForType(type) + 's'];

    return models.map(function (attrs) {
      var model = _this.modelFromAttrs(type, attrs, metaAttrs);

      return model;
    });
  },
  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
    var Model = this.modelForType(type);

    metaAttrs.config = this.config;

    return new Model(attrs, metaAttrs);
  }
});

exports.default = ListingsSerializer;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _referenceModel = require('../models/reference-model');

var _referenceModel2 = _interopRequireDefault(_referenceModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReferenceSerializer = _coreObject2.default.extend({
  constructor: function constructor(config) {
    this.config = config;
  },
  modelForType: function modelForType() /* type */{
    return _referenceModel2.default;
  },
  deserializeSingle: function deserializeSingle(type) {
    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var Model = this.modelForType(type);

    return new Model(singlePayload, metaAttrs);
  },
  serialize: function serialize(type, model) {
    var attrs = (0, _assign2.default)({}, model.attrs);

    return attrs;
  }
});

exports.default = ReferenceSerializer;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _listingsSerializer = require('./serializers/listings-serializer');

var _listingsSerializer2 = _interopRequireDefault(_listingsSerializer);

var _listingsAdapter = require('./adapters/listings-adapter');

var _listingsAdapter2 = _interopRequireDefault(_listingsAdapter);

var _cartSerializer = require('./serializers/cart-serializer');

var _cartSerializer2 = _interopRequireDefault(_cartSerializer);

var _referenceSerializer = require('./serializers/reference-serializer');

var _referenceSerializer2 = _interopRequireDefault(_referenceSerializer);

var _localStorageAdapter = require('./adapters/local-storage-adapter');

var _localStorageAdapter2 = _interopRequireDefault(_localStorageAdapter);

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _assign = require('./metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _setGuidFor = require('./metal/set-guid-for');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module shopify-buy
 * @submodule shop-client
 */

function fetchFactory(fetchType, type) {
  var func = void 0;

  switch (fetchType) {
    case 'all':
      func = function func() {
        return this.fetchAll(type);
      };
      break;
    case 'one':
      func = function func() {
        return this.fetch.apply(this, [type].concat(Array.prototype.slice.call(arguments)));
      };
      break;
    case 'query':
      func = function func() {
        return this.fetchQuery.apply(this, [type].concat(Array.prototype.slice.call(arguments)));
      };
      break;
  }

  return func;
}

var ShopClient = _coreObject2.default.extend({
  /**
   * @class ShopClient
   * @constructor
   * @param {Config} [config] Config data to be used throughout all API
   * interaction
   */
  constructor: function constructor(config) {
    this.config = config;

    this.serializers = {
      products: _listingsSerializer2.default,
      collections: _listingsSerializer2.default,
      carts: _cartSerializer2.default,
      references: _referenceSerializer2.default
    };

    this.adapters = {
      products: _listingsAdapter2.default,
      collections: _listingsAdapter2.default,
      carts: _localStorageAdapter2.default,
      references: _localStorageAdapter2.default
    };
  },


  config: null,

  /**
   * @attribute
   * @default {
   *  products: ListingsAdapter,
   *  collections: ListingsAdapter,
   *  carts: CartAdapter
   * }
   * @type Object
   * @protected
   */
  // Prevent leaky state
  get serializers() {
    return (0, _assign2.default)({}, this.shadowedSerializers);
  },

  set serializers(values) {
    this.shadowedSerializers = (0, _assign2.default)({}, values);
  },

  get adapters() {
    return (0, _assign2.default)({}, this.shadowedAdapters);
  },

  set adapters(values) {
    this.shadowedAdapters = (0, _assign2.default)({}, values);
  },

  /**
   * Fetch all of a `type`, returning a promise.
   *
   * ```javascript
   * client.fetchAll('products').then(products => {
   *   // do things with products
   * });
   * ```
   *
   * @method fetchAll
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @return {Promise|Array} a promise resolving with an array of `type`
   */
  fetchAll: function fetchAll(type) {
    var _this = this;

    var adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type).then(function (payload) {
      return _this.deserialize(type, payload, adapter, null, { multiple: true });
    });
  },


  /**
   * Fetch one of a `type`, returning a promise.
   *
   * ```javascript
   * client.fetch('products', 123).then(product => {
   *   // do things with the product
   * });
   * ```
   *
   * @method fetch
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} a promise resolving with a single instance of
   * `type` expressed as a `BaseModel`.
   */
  fetch: function fetch(type, id) {
    var _this2 = this;

    var adapter = new this.adapters[type](this.config);

    return adapter.fetchSingle(type, id).then(function (payload) {
      return _this2.deserialize(type, payload, adapter, null, { single: true });
    });
  },


  /**
   * Fetch many of a `type`, that match `query`
   *
   * ```javascript
   * client.fetchQuery('products', { collection_id: 456 }).then(products => {
   *   // do things with the products
   * });
   * ```
   *
   * @method fetchQuery
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} query a query sent to the api server.
   * @return {Promise|Array} a promise resolving with an array of `type`.
   */
  fetchQuery: function fetchQuery(type, query) {
    var _this3 = this;

    var adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type, query).then(function (payload) {
      return _this3.deserialize(type, payload, adapter, null, { multiple: true });
    });
  },


  /**
   * Create an instance of `type`, optionally including `modelAttrs`.
   *
   * ```javascript
   * client.create('carts', { line_items: [ ... ] }).then(cart => {
   *   // do things with the cart.
   * });
   * ```
   *
   * @method create
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} [modelAttrs={}] attributes representing the internal state
   * of the model to be persisted.
   * @return {Promise|CartModel} a promise resolving with a single instance of
   * `type`
   */
  create: function create(type) {
    var _this4 = this;

    var modelAttrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var adapter = new this.adapters[type](this.config);
    var serializer = new this.serializers[type](this.config);
    var Model = serializer.modelForType(type);
    var model = new Model(modelAttrs, { shopClient: this });
    var attrs = serializer.serialize(type, model);

    return adapter.create(type, attrs).then(function (payload) {
      return _this4.deserialize(type, payload, adapter, serializer, { single: true });
    });
  },


  /**
   * Create an instance of `type`, optionally including `attrs`.
   *
   * ```javascript
   * client.create('carts', { line_items: [ ... ] }).then(cart => {
   *   // do things with the cart.
   * });
   * ```
   *
   * @method update
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {BaseModel} updatedModel The model that represents new state to
   * to persist.
   * @return {Promise|CartModel} a promise resolving with a single instance of
   * `type`
   */
  update: function update(type, updatedModel) {
    var _this5 = this;

    var adapter = updatedModel.adapter;
    var serializer = updatedModel.serializer;
    var serializedModel = serializer.serialize(type, updatedModel);
    var id = updatedModel.attrs[adapter.idKeyForType(type)];

    return adapter.update(type, id, serializedModel).then(function (payload) {
      return _this5.deserialize(type, payload, adapter, serializer, { single: true });
    });
  },


  /**
   * Proxy to serializer's deserialize.
   *
   * @method deserialize
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} payload The raw payload returned by the adapter.
   * @param {BaseAdapter} adapter The adapter that yielded the payload.
   * @param {BaseSerializer} existingSerializer The serializer to attach. If
   * none is passed, then `this.deserialize` will create one for the type.
   * @param {Object} opts Options that determine which deserialization method to
   * use.
   * @param {Boolean} opts.multiple true when the payload represents multiple
   * models
   * @param {Boolean} opts.single true when the payload represents one model.
   * @return {BaseModel} an instance of `type` reified into a model.
   */
  deserialize: function deserialize(type, payload, adapter, existingSerializer) {
    var opts = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

    var serializer = existingSerializer || new this.serializers[type](this.config);
    var meta = { shopClient: this, adapter: adapter, serializer: serializer, type: type };
    var serializedPayload = void 0;

    if (opts.multiple) {
      serializedPayload = serializer.deserializeMultiple(type, payload, meta);
    } else {
      serializedPayload = serializer.deserializeSingle(type, payload, meta);
    }

    return serializedPayload;
  },


  /**
    * Creates a {{#crossLink "CartModel"}}CartModel{{/crossLink}} instance, optionally including `attrs`.
    *
    * ```javascript
    * client.createCart().then(cart => {
    *   // do something with cart
    * });
    * ```
    *
    * @param {Object}[attrs={}] attributes representing the internal state of the cart to be persisted to localStorage.
    * @method createCart
    * @public
    * @return {Promise|CartModel} - new cart instance.
  */
  createCart: function createCart() {
    var userAttrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var baseAttrs = {
      line_items: []
    };
    var attrs = {};

    (0, _assign2.default)(attrs, baseAttrs);
    (0, _assign2.default)(attrs, userAttrs);

    return this.create('carts', attrs);
  },


  /**
    * Updates an existing {{#crossLink "CartModel"}}CartModel{{/crossLink}} instance and persists it to localStorage.
    *
    * ```javascript
    * client.createCart().then(cart => {
    *   cart.lineItems = [
    *     // ...
    *   ];
    *   client.updateCart(cart);
    * });
    * ```
    *
    * @param {Object}[attrs={}] attributes representing the internal state of the cart to be persisted to localStorage.
    * @method updateCart
    * @public
    * @return {Promise|CartModel} - updated cart instance.
  */
  updateCart: function updateCart(updatedCart) {
    return this.update('carts', updatedCart);
  },


  /**
   * Retrieve a previously created cart by its key.
   *
   * ```javascript
   * client.fetchCart('shopify-buy.1459804699118.2').then(cart => {
   *   console.log(cart); // The retrieved cart
   * });
   *
   * @method fetchCart
   * @public
   * @param {String} id The cart's unique identifier
   * @return {Promise|CartModel} The cart model.
   *
   */
  fetchCart: fetchFactory('one', 'carts'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchAll('products');
   * ```
   *
   * @method fetchAllProducts
   * @private
   * @return {Promise|Array} The product models.
   */
  fetchAllProducts: fetchFactory('all', 'products'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchAll('collections');
   * ```
   *
   * @method fetchAllCollections
   * @private
   * @return {Promise|Array} The collection models.
   */
  fetchAllCollections: fetchFactory('all', 'collections'),

  /**
   * Fetch one product by its ID.
   *
   * ```javascript
   * client.fetchProduct(123).then(product => {
   *   console.log(product); // The product with an ID of 123
   * });
   * ```
   *
   * @method fetchProduct
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The product model with the specified ID.
   */
  fetchProduct: fetchFactory('one', 'products'),

  /**
   * Fetch one collection by its ID.
   *
   * ```javascript
   * client.fetchCollection(123).then(collection => {
   *   console.log(collection); // The collection with an ID of 123
   * });
   * ```
   *
   * @method fetchCollection
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The collection model with the specified ID.
   */
  fetchCollection: fetchFactory('one', 'collections'),

  /**
   * Fetches a list of products matching a specified query.
   *
   * ```javascript
   * client.fetchQueryProducts({ collection_id: 123, tag: ['hats'] }).then(products => {
   *   console.log(products); // An array of products in collection `123` having the tag `hats`
   * });
   * ```
   * @method fetchQueryProducts
   * @public
   * @param {Object} query A query sent to the api server containing one or more of:
   *   @param {String|Number} [query.collection_id] The ID of a collection to retrieve products from
   *   @param {Array} [query.tag] A list of tags to filter the products by. Accepts up to 10 tags.
   *   @param {Array} [query.product_ids] A list of product IDs to retrieve
   *   @param {String|Number} [query.page=1] The page offset number of the current lookup (based on the `limit`)
   *   @param {String|Number} [query.limit=50] The number of products to retrieve per page
   *   @param {String} [query.handle] The handle of the product to look up
   *   @param {String} [query.updated_at_min] Products updated since the supplied timestamp (format: 2008-12-31 03:00)
   * @return {Promise|Array} The product models.
   */
  fetchQueryProducts: fetchFactory('query', 'products'),

  /**
   * Fetches a list of collections matching a specified query.
   *
   * ```javascript
   * client.fetchQueryCollections({page: 2, limit: 20}).then(collections => {
   *   console.log(collections); // An array of collection resources
   * });
   * ```
   *
   * @method fetchQueryCollections
   * @public
   * @param {Object} query a query sent to the api server.
   *   @param {String|Number} [query.page=1] the page offset number of the current lookup (based on the `limit`)
   *   @param {String|Number} [query.limit=50] the number of collections to retrieve per page
   * @return {Promise|Array} The collection models.
   */
  fetchQueryCollections: fetchFactory('query', 'collections'),

  /**
   * This method looks up a reference in localStorage to the most recent cart.
   * If one is not found, creates one. If the cart the reference points to
   * doesn't exist, create one and store the new reference.
   *
   * ```javascript
   * client.fetchRecentCart().then(cart => {
   *  // do stuff with the cart
   * });
   * ```
   *
   * @method fetchRecentCart
   * @public
   * @return {Promise|CartModel} The cart.
   */
  fetchRecentCart: function fetchRecentCart() {
    var _this6 = this;

    return this.fetch('references', this.config.domain + '.recent-cart').then(function (reference) {
      var cartId = reference.referenceId;

      return _this6.fetchCart(cartId);
    }).catch(function () {
      return _this6.createCart().then(function (cart) {
        var refAttrs = {
          referenceId: cart.id
        };

        refAttrs[_setGuidFor.GUID_KEY] = _this6.config.domain + '.recent-cart';

        _this6.create('references', refAttrs);

        return cart;
      });
    });
  }
});

exports.default = ShopClient;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

var _shopClient = require('./shop-client');

var _shopClient2 = _interopRequireDefault(_shopClient);

require('./isomorphic-fetch');

require('./isomorphic-btoa');

var _productModel = require('./models/product-model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module shopify-buy
 * @submodule shopify
 */

/**
 * This namespace contains all globally accessible classes
 * @class ShopifyBuy
 * @static
 */
var Shopify = {
  ShopClient: _shopClient2.default,
  Config: _config2.default,
  version: _version2.default,
  NO_IMAGE_URI: _productModel.NO_IMAGE_URI,

  /**
   * Create a ShopClient. This is the main entry point to the SDK.
   *
   * ```javascript
   * const client = ShopifyBuy.buildClient({
   *   apiKey: 'abc123',
   *   appId: 123456,
   *   myShopifyDomain: 'myshop',
   *   domain: 'myshop.myshopify.com'
   * });
   * ```
   *
   * @method buildClient
   * @for ShopifyBuy
   * @static
   * @public
   * @param {Object} configAttrs An object of required config data.
   * @param {String} configAttrs.apiKey Your api client's public token.
   * @param {String} configAttrs.appId The app whose listings the client will be
   * using. If you are just modifying a buy button, the buy-button's app id is
   * 6. Otherwise, obtain the app id of the app you're modifying or extending.
   * @param {String} configAttrs.domain You shop's full `myshopify.com` domain.
   * @return {ShopClient} a client for the shop using your api credentials.
   */
  buildClient: function buildClient() {
    var configAttrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var config = new this.Config(configAttrs);

    return new this.ShopClient(config);
  }
};

exports.default = Shopify;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Store = _coreObject2.default.extend({
  constructor: function constructor() {
    this.localStorageAvailable = this.storageAvailable('localStorage');
    this.cache = {};
  },
  setItem: function setItem(key, value) {
    if (this.localStorageAvailable) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      this.cache[key] = value;
    }

    return value;
  },
  getItem: function getItem(key) {
    if (this.localStorageAvailable) {
      var stringValue = localStorage.getItem(key);

      try {
        return JSON.parse(stringValue);
      } catch (e) {
        return null;
      }
    } else {
      return this.cache[key] || null;
    }
  },
  storageAvailable: function storageAvailable(type) {
    try {
      var storage = _global2.default[type];
      var x = '__storage_test__';

      storage.setItem(x, x);
      storage.removeItem(x);

      return true;
    } catch (e) {
      return false;
    }
  }
});

exports.default = Store;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var version = 'v0.2.1-20ca83';

/**
 * @module shopify-buy
 * @submodule version
 */

exports.default = version;//# sourceMappingURL=shopify-buy.polyfilled.commonjs.map