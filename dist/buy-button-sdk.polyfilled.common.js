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

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _slice = Array.prototype.slice;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ajax = require('../ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var _metalCoreObject = require('../metal/core-object');

var _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);

var CheckoutAdapter = _metalCoreObject2['default'].extend(Object.defineProperties({
  ajax: _ajax2['default'],

  constructor: function constructor(config) {
    this.config = config;
  },

  idKeyForType: function idKeyForType() {
    return 'token';
  },

  pathForType: function pathForType(type) {
    return '/' + type;
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

    var url = '' + this.baseUrl + this.pathForType(type) + '.json';
    var paramNames = Object.keys(query);

    if (paramNames.length > 0) {
      throw new Error('Querying checkouts is not allowed');
    }

    return url;
  },

  buildSingleUrl: function buildSingleUrl(type, id) {
    return '' + this.baseUrl + this.pathForType(type) + '/' + id + '.json';
  },

  fetchSingle: function fetchSingle() /* type, id */{
    var url = this.buildUrl.apply(this, ['single'].concat(_slice.call(arguments)));

    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
      return response.json;
    });
  },

  create: function create(type, payload) {
    var url = this.buildUrl('multiple', type);

    return this.ajax('POST', url, { headers: this.headers, body: JSON.stringify(payload) }).then(function (response) {
      return response.json;
    });
  },

  update: function update(type, id, payload) {
    var url = this.buildUrl('single', type, id);

    return this.ajax('PATCH', url, { headers: this.headers, body: JSON.stringify(payload) }).then(function (response) {
      return response.json;
    });
  }
}, {
  base64ApiKey: {
    get: function get() {
      return btoa(this.config.apiKey);
    },
    configurable: true,
    enumerable: true
  },
  baseUrl: {
    get: function get() {
      var myShopifyDomain = this.config.myShopifyDomain;

      return 'https://' + myShopifyDomain + '.myshopify.com/anywhere';
    },
    configurable: true,
    enumerable: true
  },
  headers: {
    get: function get() {
      return {
        Authorization: 'Basic ' + this.base64ApiKey,
        'Content-Type': 'application/json'
      };
    },
    configurable: true,
    enumerable: true
  }
}));

exports['default'] = CheckoutAdapter;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _slice = Array.prototype.slice;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ajax = require('../ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var _metalCoreObject = require('../metal/core-object');

var _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);

var PublicationAdapter = _metalCoreObject2['default'].extend(Object.defineProperties({
  ajax: _ajax2['default'],

  constructor: function constructor(config) {
    this.config = config;
  },

  idKeyForType: function idKeyForType(type) {
    return type.slice(0, -1) + '_ids';
  },

  pathForType: function pathForType(type) {
    return '/' + type.slice(0, -1) + '_publications.json';
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
        var value = undefined;

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
    var key = this.idKeyForType(type);
    var opts = {};

    opts[key] = [id];

    return this.buildMultipleUrl(type, opts);
  },

  fetchMultiple: function fetchMultiple() /* type, [query] */{
    var url = this.buildUrl.apply(this, ['multiple'].concat(_slice.call(arguments)));

    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
      return response.json;
    });
  },

  fetchSingle: function fetchSingle() /* type, id */{
    var url = this.buildUrl.apply(this, ['single'].concat(_slice.call(arguments)));

    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
      return response.json;
    });
  }
}, {
  base64ApiKey: {
    get: function get() {
      return btoa(this.config.apiKey);
    },
    configurable: true,
    enumerable: true
  },
  baseUrl: {
    get: function get() {
      var _config = this.config;
      var myShopifyDomain = _config.myShopifyDomain;
      var channelId = _config.channelId;

      return 'https://' + myShopifyDomain + '.myshopify.com/api/channels/' + channelId;
    },
    configurable: true,
    enumerable: true
  },
  headers: {
    get: function get() {
      return {
        Authorization: 'Basic ' + this.base64ApiKey,
        'Content-Type': 'application/json'
      };
    },
    configurable: true,
    enumerable: true
  }
}));

exports['default'] = PublicationAdapter;
module.exports = exports['default'];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ajax;
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
  })["catch"](function () {
    var responseClone = response.clone();

    return responseClone.text().then(function (text) {
      return { text: text, originalResponse: responseClone, isText: true };
    });
  });
}

function ajax(method, url) {
  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  opts.method = method;

  return fetch(url, opts).then(checkStatus).then(parseResponse);
}

module.exports = exports["default"];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _metalCoreObject = require('./metal/core-object');

var _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);

/**
 * @module js-buy-sdk
 * @submodule config
 */

var Config = _metalCoreObject2['default'].extend({
  /**
   * @class Config
   * @constructor
   * @param {Object} attrs A hash of required config data.
   * @param {String} attrs.apiKey Your api client's public token
   * @param {String} attrs.channelId The channel from which to read
   * publications. Visit `<your-shops-domain>/admin/channels.json` while
   * authenticated to see a list of available channels.
   * @param {String} attrs.myShopifyDomain You shop's `myshopify.com` domain.
   */
  constructor: function constructor(attrs) {
    var _this = this;

    this.requiredProperties.forEach(function (key) {
      if (!attrs.hasOwnProperty(key)) {
        throw new Error('new Config() requires the option \'' + key + '\'');
      } else {
        _this[key] = attrs[key];
      }
    });
  },

  /**
   * The apiKey for authenticating against shopify. This is your api client's
   * public api token. Not the shared secret. Set during initialation.
   * @attribute requiredProperties
   * @default ['apiKey', 'channelId', 'myShopifyDomain']
   * @type Array
   * @private
   */
  requiredProperties: ['apiKey', 'channelId', 'myShopifyDomain'],

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
   * @attribute channelId
   * @default ''
   * @type String
   * @public
   */
  channelId: '',

  /**
   * @attribute myShopifyDomain
   * @default ''
   * @type String
   * @public
   */
  myShopifyDomain: ''
});

exports['default'] = Config;
module.exports = exports['default'];
/* global global, require, Buffer */

'use strict';

var globalNamespace = undefined;

if (typeof global === 'undefined') {
  globalNamespace = window;
} else {
  globalNamespace = global;
}

var btoa = globalNamespace.btoa;

function isNode() {
  var windowAbsent = typeof window === 'undefined';
  var requirePresent = typeof require === 'function';

  return windowAbsent && requirePresent;
}

if (!btoa && isNode()) {
  globalNamespace.btoa = function (string) {
    return new Buffer(string).toString('base64');
  };
}
/* global global, require */

'use strict';

var globalNamespace = undefined;

if (typeof global === 'undefined') {
  globalNamespace = window;
} else {
  globalNamespace = global;
}

var fetch = globalNamespace.fetch;

function isNode() {
  var windowAbsent = typeof window === 'undefined';
  var requirePresent = typeof require === 'function';

  return windowAbsent && requirePresent;
}

if (!fetch && isNode()) {
  globalNamespace.fetch = require('node-fetch');
  globalNamespace.Response = globalNamespace.fetch.Response;
}
/* eslint no-undefined: 0 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var assign = undefined;

if (typeof Object.assign === 'function') {
  assign = Object.assign;
} else {
  assign = function (target) {
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = Object(target);

    var propertyObjects = [].slice.call(arguments, 1);

    if (propertyObjects.length > 0) {
      propertyObjects.forEach(function (source) {
        if (source !== undefined && source !== null) {
          var nextKey = undefined;

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

exports['default'] = assign;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _createClass = require('./create-class');

var _createClass2 = _interopRequireDefault(_createClass);

var CoreObject = (0, _createClass2['default'])({
  constructor: function constructor() {},

  'static': {
    extend: function extend(subClassProps) {
      return (0, _createClass2['default'])(subClassProps, this);
    }
  }
});

exports['default'] = CoreObject;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assign = require('./assign');

var _assign2 = _interopRequireDefault(_assign);

var _includes = require('./includes');

var _includes2 = _interopRequireDefault(_includes);

function wrap(func, superFunc) {
  function superWrapper() {
    var originalSuper = this['super'];

    this['super'] = function () {
      return superFunc.apply(this, arguments);
    };

    var ret = func.apply(this, arguments);

    this['super'] = originalSuper;

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
    return !(0, _includes2['default'])(['constructor', 'static'], key);
  });

  (0, _assign2['default'])(Constructor, parent);

  Constructor.prototype = Object.create(parent.prototype);
  defineProperties(instancePropertyNames, props, Constructor.prototype);
  Constructor.prototype.constructor = Constructor;

  var staticProps = props['static'];

  if (staticProps) {
    var staticPropertyNames = Object.getOwnPropertyNames(staticProps);

    defineProperties(staticPropertyNames, staticProps, Constructor);
  }

  return Constructor;
}

exports['default'] = createClass;
module.exports = exports['default'];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var includes = undefined;

if (!Array.prototype.includes) {
  includes = function (array, searchElement) {
    var ObjectifiedArray = Object(array);
    var length = parseInt(ObjectifiedArray.length, 10) || 0;

    if (length === 0) {
      return false;
    }

    var startIndex = parseInt(arguments[1], 10) || 0;
    var index = undefined;

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
  includes = function (array) {
    var args = [].slice.call(arguments, 1);

    return Array.prototype.includes.apply(array, args);
  };
}

exports["default"] = includes;
module.exports = exports["default"];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (array) {
  return array.reduce(function (uniqueArray, item) {
    if (uniqueArray.indexOf(item) < 0) {
      uniqueArray.push(item);
    }

    return uniqueArray;
  }, []);
};

module.exports = exports["default"];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _metalCoreObject = require('../metal/core-object');

var _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);

var _metalAssign = require('../metal/assign');

var _metalAssign2 = _interopRequireDefault(_metalAssign);

var BaseModel = _metalCoreObject2['default'].extend({
  constructor: function constructor() {
    var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var metaAttrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.attrs = attrs;

    (0, _metalAssign2['default'])(this, metaAttrs);
  },
  attrs: null,
  serializer: null,
  adapter: null,
  shopClient: null
});

exports['default'] = BaseModel;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var CartModel = _baseModel2['default'].extend({
  constructor: function constructor() {
    this['super'].apply(this, arguments);
  }
});

exports['default'] = CartModel;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _metalCoreObject = require('../metal/core-object');

var _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);

var _metalUniq = require('../metal/uniq');

var _metalUniq2 = _interopRequireDefault(_metalUniq);

var _metalIncludes = require('../metal/includes');

var _metalIncludes2 = _interopRequireDefault(_metalIncludes);

var Option = _metalCoreObject2['default'].extend(Object.defineProperties({
  constructor: function constructor(name, values) {
    this.name = name;
    this.values = values;
    this.selected = values[0];
  },

  name: '',

  values: []

}, {
  selected: {
    get: function get() {
      return this._selected;
    },
    set: function set(value) {
      if ((0, _metalIncludes2['default'])(this.values, value)) {
        this._selected = value;
      } else {
        throw new Error('Invalid option selection for ' + this.name + '.');
      }

      return value;
    },
    configurable: true,
    enumerable: true
  }
}));

var ProductModel = _baseModel2['default'].extend(Object.defineProperties({
  constructor: function constructor() {
    this['super'].apply(this, arguments);
  }

}, {
  memoized: {
    get: function get() {
      this._memoized = this._memoized || {};

      return this._memoized;
    },
    configurable: true,
    enumerable: true
  },
  options: {
    get: function get() {
      if (this.memoized.options) {
        return this.memoized.options;
      }

      var baseOptions = this.attrs.options;
      var variants = this.attrs.variants;

      this.memoized.options = baseOptions.map(function (option) {
        var name = option.name;

        var dupedValues = variants.reduce(function (valueList, variant) {
          var optionValueForOption = variant.option_values.filter(function (optionValue) {
            return optionValue.name === option.name;
          })[0];

          valueList.push(optionValueForOption.value);

          return valueList;
        }, []);

        var values = (0, _metalUniq2['default'])(dupedValues);

        return new Option(name, values);
      });

      return this.memoized.options;
    },
    configurable: true,
    enumerable: true
  },
  selections: {
    get: function get() {
      return this.options.map(function (option) {
        return option.selected;
      });
    },
    configurable: true,
    enumerable: true
  },
  selectedVariant: {
    get: function get() {
      var variantTitle = this.selections.join(' / ');

      return this.attrs.variants.filter(function (variant) {
        return variant.title === variantTitle;
      })[0];
    },
    configurable: true,
    enumerable: true
  },
  selectedVariantImage: {
    get: function get() {
      var selectedVariantId = this.selectedVariant.id;
      var images = this.attrs.images;
      var primaryImage = images[0];
      var variantImage = images.filter(function (image) {
        return image.variant_ids.indexOf(selectedVariantId) !== -1;
      })[0];

      return variantImage || primaryImage;
    },
    configurable: true,
    enumerable: true
  }
}));

exports['default'] = ProductModel;
module.exports = exports['default'];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var RSVP = window.RSVP;
var Promise = RSVP.Promise;

exports.RSVP = RSVP;
exports.Promise = Promise;
exports["default"] = Promise;
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _metalCoreObject = require('../metal/core-object');

var _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);

var _metalAssign = require('../metal/assign');

var _metalAssign2 = _interopRequireDefault(_metalAssign);

var _modelsCheckoutModel = require('../models/checkout-model');

var _modelsCheckoutModel2 = _interopRequireDefault(_modelsCheckoutModel);

var CheckoutSerializer = _metalCoreObject2['default'].extend({
  constructor: function constructor() {},

  rootKeyForType: function rootKeyForType(type) {
    return type.slice(0, -1);
  },

  modelForType: function modelForType() /* type */{
    return _modelsCheckoutModel2['default'];
  },

  deserializeSingle: function deserializeSingle(type, singlePayload, metaAttrs) {
    var modelAttrs = singlePayload[this.rootKeyForType(type)];
    var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

    return model;
  },

  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
    var Model = this.modelForType(type);

    return new Model(attrs, metaAttrs);
  },

  serialize: function serialize(type, model) {
    var root = this.rootKeyForType(type);
    var payload = {};
    var attrs = (0, _metalAssign2['default'])({}, model.attrs);

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

exports['default'] = CheckoutSerializer;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _metalCoreObject = require('../metal/core-object');

var _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);

var _modelsBaseModel = require('../models/base-model');

var _modelsBaseModel2 = _interopRequireDefault(_modelsBaseModel);

var _modelsProductModel = require('../models/product-model');

var _modelsProductModel2 = _interopRequireDefault(_modelsProductModel);

var PublicationSerializer = _metalCoreObject2['default'].extend({
  constructor: function constructor() {},

  rootKeyForType: function rootKeyForType(type) {
    return type.slice(0, -1) + '_publications';
  },

  models: {
    collections: _modelsBaseModel2['default'],
    products: _modelsProductModel2['default']
  },

  modelForType: function modelForType(type) {
    return this.models[type];
  },

  deserializeSingle: function deserializeSingle(type, singlePayload, metaAttrs) {
    var models = singlePayload[this.rootKeyForType(type)];
    var model = this.modelFromAttrs(type, models[0], metaAttrs);

    return model;
  },

  deserializeMultiple: function deserializeMultiple(type, collectionPayload, metaAttrs) {
    var _this = this;

    var models = collectionPayload[this.rootKeyForType(type)];

    return models.map(function (attrs) {
      var model = _this.modelFromAttrs(type, attrs, metaAttrs);

      return model;
    });
  },

  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
    var Model = this.modelForType(type);

    return new Model(attrs, metaAttrs);
  }
});

exports['default'] = PublicationSerializer;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _slice = Array.prototype.slice;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _serializersPublicationSerializer = require('./serializers/publication-serializer');

var _serializersPublicationSerializer2 = _interopRequireDefault(_serializersPublicationSerializer);

var _adaptersPublicationAdapter = require('./adapters/publication-adapter');

var _adaptersPublicationAdapter2 = _interopRequireDefault(_adaptersPublicationAdapter);

var _serializersCheckoutSerializer = require('./serializers/checkout-serializer');

var _serializersCheckoutSerializer2 = _interopRequireDefault(_serializersCheckoutSerializer);

var _adaptersCheckoutAdapter = require('./adapters/checkout-adapter');

var _adaptersCheckoutAdapter2 = _interopRequireDefault(_adaptersCheckoutAdapter);

var _metalCoreObject = require('./metal/core-object');

var _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);

var _metalAssign = require('./metal/assign');

var _metalAssign2 = _interopRequireDefault(_metalAssign);

/**
 * @module js-buy-sdk
 * @submodule shop-client
 */

function fetchFactory(fetchType, type) {
  var func = undefined;

  switch (fetchType) {
    case 'all':
      func = function () {
        return this.fetchAll(type);
      };
      break;
    case 'one':
      func = function () {
        return this.fetch.apply(this, [type].concat(_slice.call(arguments)));
      };
      break;
    case 'query':
      func = function () {
        return this.fetchQuery.apply(this, [type].concat(_slice.call(arguments)));
      };
      break;
  }

  return func;
}

var ShopClient = _metalCoreObject2['default'].extend(Object.defineProperties({
  /**
   * @class ShopClient
   * @constructor
   * @param {Config} [config] Config data to be used throughout all API
   * interaction
   */
  constructor: function constructor(config) {
    this.config = config;

    this.serializers = {
      products: _serializersPublicationSerializer2['default'],
      collections: _serializersPublicationSerializer2['default'],
      checkouts: _serializersCheckoutSerializer2['default']
    };

    this.adapters = {
      products: _adaptersPublicationAdapter2['default'],
      collections: _adaptersPublicationAdapter2['default'],
      checkouts: _adaptersCheckoutAdapter2['default']
    };
  },

  config: null,

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
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @return {Promise|Array} a promise resolving with an array of `type`
   */
  fetchAll: function fetchAll(type) {
    var _this = this;

    var adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type).then(function (payload) {
      return _this.deserialize(type, payload, adapter, { multiple: true });
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
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} a promise resolving with a single instance of
   * `type` expressed as a `BaseModel`.
   */
  fetch: function fetch(type, id) {
    var _this2 = this;

    var adapter = new this.adapters[type](this.config);

    return adapter.fetchSingle(type, id).then(function (payload) {
      return _this2.deserialize(type, payload, adapter, { single: true });
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
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} query a query sent to the api server.
   * @return {Promise|Array} a promise resolving with an array of `type`.
   */
  fetchQuery: function fetchQuery(type, query) {
    var _this3 = this;

    var adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type, query).then(function (payload) {
      return _this3.deserialize(type, payload, adapter, { multiple: true });
    });
  },

  /**
   * Create an instance of `type`, optionally including `attrs`.
   *
   * ```javascript
   * client.create('checkouts', { line_items: [ ... ] }).then(checkout => {
   *   // do things with the checkout.
   * });
   * ```
   *
   * @method create
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} [attrs={}] attributes to send to the server for creation.
   * @return {Promise|CartModel} a promise resolving with a single instance of
   * `type`
   */
  create: function create(type) {
    var _this4 = this;

    var attrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var adapter = new this.adapters[type](this.config);

    return adapter.create(type, attrs).then(function (payload) {
      return _this4.deserialize(type, payload, adapter, { single: true });
    });
  },

  /**
   * Create an instance of `type`, optionally including `attrs`.
   *
   * ```javascript
   * client.create('checkouts', { line_items: [ ... ] }).then(checkout => {
   *   // do things with the checkout.
   * });
   * ```
   *
   * @method update
   * @public
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {BaseModel} updatedModel The model that represents new state to
   * to persist to the server.
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
      var meta = { shopClient: _this5, adapter: adapter, serializer: serializer, type: type };

      return serializer.deserializeSingle(type, payload, meta);
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
   * @param {Object} opts Options that determine which deserialization method to
   * use.
   * @param {Boolean} opts.multiple true when the payload represents multiple
   * models
   * @param {Boolean} opts.single true when the payload represents one model.
   * @return {BaseModel} an instance of `type` reified into a model.
   */
  deserialize: function deserialize(type, payload, adapter) {
    var opts = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    var serializer = new this.serializers[type](this.config);
    var meta = { shopClient: this, adapter: adapter, serializer: serializer, type: type };
    var serializedPayload = undefined;

    if (opts.multiple) {
      serializedPayload = serializer.deserializeMultiple(type, payload, meta);
    } else {
      serializedPayload = serializer.deserializeSingle(type, payload, meta);
    }

    return serializedPayload;
  },

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchAll('products');
   * ```
   *
   * @method fetchAllProducts
   * @public
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
   * @public
   * @return {Promise|Array} The collection models.
   */
  fetchAllCollections: fetchFactory('all', 'collections'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetch:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetch('products', 123);
   * ```
   *
   * @method fetchProduct
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The product model.
   */
  fetchProduct: fetchFactory('one', 'products'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetch:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetch('collections', 123);
   * ```
   *
   * @method fetchCollection
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The collection model.
   */
  fetchCollection: fetchFactory('one', 'collections'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchQuery:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchQuery('products', { query: 'options' });
   * ```
   *
   * @method fetchQueryProducts
   * @public
   * @param {Object} query a query sent to the api server.
   * @return {Promise|Array} The product models.
   */
  fetchQueryProducts: fetchFactory('query', 'products'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchQuery:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchQuery('collections', { query: 'options' });
   * ```
   *
   * @method fetchQueryCollections
   * @public
   * @param {Object} query a query sent to the api server.
   * @return {Promise|Array} The collection models.
   */
  fetchQueryCollections: fetchFactory('query', 'collections')
}, {
  serializers: { // Prevent leaky state

    get: function get() {
      return (0, _metalAssign2['default'])({}, this.shadowedSerializers);
    },
    set: function set(values) {
      this.shadowedSerializers = (0, _metalAssign2['default'])({}, values);
    },
    configurable: true,
    enumerable: true
  },
  adapters: {
    get: function get() {
      return (0, _metalAssign2['default'])({}, this.shadowedAdapters);
    },
    set: function set(values) {
      this.shadowedAdapters = (0, _metalAssign2['default'])({}, values);
    },
    configurable: true,
    enumerable: true
  }
}));

exports['default'] = ShopClient;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _shopClient = require('./shop-client');

var _shopClient2 = _interopRequireDefault(_shopClient);

require('./isomorphic-fetch');

require('./isomorphic-btoa');

/**
 * @module js-buy-sdk
 * @submodule shopify
 */

/**
 * This namespace contains all globally accessible classes
 * @class ShopifyBuy
 * @static
 */
var Shopify = {
  ShopClient: _shopClient2['default'],
  Config: _config2['default'],

  /**
   * Create a ShopClient. This is the main entry point to the SDK.
   *
   * ```javascript
   * const client = ShopifyBuy.buildClient({
   *   apiKey: 'abc123',
   *   channelId: 123456,
   *   myShopifyDomain: 'myshop'
   * });
   * ```
   *
   * @method buildClient
   * @for ShopifyBuy
   * @static
   * @public
   * @param {Object} configAttrs A hash of required config data.
   * @param {String} configAttrs.apiKey Your api client's public token.
   * @param {String} configAttrs.channelId The channel from which to read
   * publications. Visit `<your-shops-domain>/admin/channels.json` while
   * authenticated to see a list of available channels.
   * @param {String} configAttrs.myShopifyDomain You shop's `myshopify.com`
   * domain.
   * @return {ShopClient} a client for the shop using your api credentials.
   */
  buildClient: function buildClient() {
    var configAttrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var config = new this.Config(configAttrs);

    return new this.ShopClient(config);
  }
};

exports['default'] = Shopify;
module.exports = exports['default'];
{"version":3,"sources":["adapters/checkout-adapter.js","adapters/publication-adapter.js","ajax.js","config.js","isomorphic-btoa.js","isomorphic-fetch.js","metal/assign.js","metal/core-object.js","metal/create-class.js","metal/includes.js","metal/uniq.js","models/base-model.js","models/checkout-model.js","models/product-model.js","promise.js","serializers/checkout-serializer.js","serializers/publication-serializer.js","shop-client.js","shopify.js"],"sourcesContent":["'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\nvar _slice = Array.prototype.slice;\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _ajax = require('../ajax');\n\nvar _ajax2 = _interopRequireDefault(_ajax);\n\nvar _metalCoreObject = require('../metal/core-object');\n\nvar _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);\n\nvar CheckoutAdapter = _metalCoreObject2['default'].extend(Object.defineProperties({\n  ajax: _ajax2['default'],\n\n  constructor: function constructor(config) {\n    this.config = config;\n  },\n\n  idKeyForType: function idKeyForType() {\n    return 'token';\n  },\n\n  pathForType: function pathForType(type) {\n    return '/' + type;\n  },\n\n  buildUrl: function buildUrl(singleOrMultiple, type, idOrQuery) {\n    switch (singleOrMultiple) {\n      case 'multiple':\n        return this.buildMultipleUrl(type, idOrQuery);\n      case 'single':\n        return this.buildSingleUrl(type, idOrQuery);\n      default:\n        return '';\n    }\n  },\n\n  buildMultipleUrl: function buildMultipleUrl(type) {\n    var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];\n\n    var url = '' + this.baseUrl + this.pathForType(type) + '.json';\n    var paramNames = Object.keys(query);\n\n    if (paramNames.length > 0) {\n      throw new Error('Querying checkouts is not allowed');\n    }\n\n    return url;\n  },\n\n  buildSingleUrl: function buildSingleUrl(type, id) {\n    return '' + this.baseUrl + this.pathForType(type) + '/' + id + '.json';\n  },\n\n  fetchSingle: function fetchSingle() /* type, id */{\n    var url = this.buildUrl.apply(this, ['single'].concat(_slice.call(arguments)));\n\n    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {\n      return response.json;\n    });\n  },\n\n  create: function create(type, payload) {\n    var url = this.buildUrl('multiple', type);\n\n    return this.ajax('POST', url, { headers: this.headers, body: JSON.stringify(payload) }).then(function (response) {\n      return response.json;\n    });\n  },\n\n  update: function update(type, id, payload) {\n    var url = this.buildUrl('single', type, id);\n\n    return this.ajax('PATCH', url, { headers: this.headers, body: JSON.stringify(payload) }).then(function (response) {\n      return response.json;\n    });\n  }\n}, {\n  base64ApiKey: {\n    get: function get() {\n      return btoa(this.config.apiKey);\n    },\n    configurable: true,\n    enumerable: true\n  },\n  baseUrl: {\n    get: function get() {\n      var myShopifyDomain = this.config.myShopifyDomain;\n\n      return 'https://' + myShopifyDomain + '.myshopify.com/anywhere';\n    },\n    configurable: true,\n    enumerable: true\n  },\n  headers: {\n    get: function get() {\n      return {\n        Authorization: 'Basic ' + this.base64ApiKey,\n        'Content-Type': 'application/json'\n      };\n    },\n    configurable: true,\n    enumerable: true\n  }\n}));\n\nexports['default'] = CheckoutAdapter;\nmodule.exports = exports['default'];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\nvar _slice = Array.prototype.slice;\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _ajax = require('../ajax');\n\nvar _ajax2 = _interopRequireDefault(_ajax);\n\nvar _metalCoreObject = require('../metal/core-object');\n\nvar _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);\n\nvar PublicationAdapter = _metalCoreObject2['default'].extend(Object.defineProperties({\n  ajax: _ajax2['default'],\n\n  constructor: function constructor(config) {\n    this.config = config;\n  },\n\n  idKeyForType: function idKeyForType(type) {\n    return type.slice(0, -1) + '_ids';\n  },\n\n  pathForType: function pathForType(type) {\n    return '/' + type.slice(0, -1) + '_publications.json';\n  },\n\n  buildUrl: function buildUrl(singleOrMultiple, type, idOrQuery) {\n    switch (singleOrMultiple) {\n      case 'multiple':\n        return this.buildMultipleUrl(type, idOrQuery);\n      case 'single':\n        return this.buildSingleUrl(type, idOrQuery);\n      default:\n        return '';\n    }\n  },\n\n  buildMultipleUrl: function buildMultipleUrl(type) {\n    var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];\n\n    var url = '' + this.baseUrl + this.pathForType(type);\n    var paramNames = Object.keys(query);\n\n    if (paramNames.length > 0) {\n      var queryString = paramNames.map(function (key) {\n        var value = undefined;\n\n        if (Array.isArray(query[key])) {\n          value = query[key].join(',');\n        } else {\n          value = query[key];\n        }\n\n        return key + '=' + encodeURIComponent(value);\n      }).join('&');\n\n      return url + '?' + queryString;\n    }\n\n    return url;\n  },\n\n  buildSingleUrl: function buildSingleUrl(type, id) {\n    var key = this.idKeyForType(type);\n    var opts = {};\n\n    opts[key] = [id];\n\n    return this.buildMultipleUrl(type, opts);\n  },\n\n  fetchMultiple: function fetchMultiple() /* type, [query] */{\n    var url = this.buildUrl.apply(this, ['multiple'].concat(_slice.call(arguments)));\n\n    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {\n      return response.json;\n    });\n  },\n\n  fetchSingle: function fetchSingle() /* type, id */{\n    var url = this.buildUrl.apply(this, ['single'].concat(_slice.call(arguments)));\n\n    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {\n      return response.json;\n    });\n  }\n}, {\n  base64ApiKey: {\n    get: function get() {\n      return btoa(this.config.apiKey);\n    },\n    configurable: true,\n    enumerable: true\n  },\n  baseUrl: {\n    get: function get() {\n      var _config = this.config;\n      var myShopifyDomain = _config.myShopifyDomain;\n      var channelId = _config.channelId;\n\n      return 'https://' + myShopifyDomain + '.myshopify.com/api/channels/' + channelId;\n    },\n    configurable: true,\n    enumerable: true\n  },\n  headers: {\n    get: function get() {\n      return {\n        Authorization: 'Basic ' + this.base64ApiKey,\n        'Content-Type': 'application/json'\n      };\n    },\n    configurable: true,\n    enumerable: true\n  }\n}));\n\nexports['default'] = PublicationAdapter;\nmodule.exports = exports['default'];","\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = ajax;\nfunction checkStatus(response) {\n  if (response.status >= 200 && response.status < 300) {\n    return response;\n  }\n\n  var error = new Error(response.statusText);\n\n  error.status = response.status;\n  error.response = response;\n  throw error;\n}\n\nfunction parseResponse(response) {\n  return response.json().then(function (json) {\n    return { json: json, originalResponse: response, isJSON: true };\n  })[\"catch\"](function () {\n    var responseClone = response.clone();\n\n    return responseClone.text().then(function (text) {\n      return { text: text, originalResponse: responseClone, isText: true };\n    });\n  });\n}\n\nfunction ajax(method, url) {\n  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];\n\n  opts.method = method;\n\n  return fetch(url, opts).then(checkStatus).then(parseResponse);\n}\n\nmodule.exports = exports[\"default\"];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _metalCoreObject = require('./metal/core-object');\n\nvar _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);\n\n/**\n * @module js-buy-sdk\n * @submodule config\n */\n\nvar Config = _metalCoreObject2['default'].extend({\n  /**\n   * @class Config\n   * @constructor\n   * @param {Object} attrs A hash of required config data.\n   * @param {String} attrs.apiKey Your api client's public token\n   * @param {String} attrs.channelId The channel from which to read\n   * publications. Visit `<your-shops-domain>/admin/channels.json` while\n   * authenticated to see a list of available channels.\n   * @param {String} attrs.myShopifyDomain You shop's `myshopify.com` domain.\n   */\n  constructor: function constructor(attrs) {\n    var _this = this;\n\n    this.requiredProperties.forEach(function (key) {\n      if (!attrs.hasOwnProperty(key)) {\n        throw new Error('new Config() requires the option \\'' + key + '\\'');\n      } else {\n        _this[key] = attrs[key];\n      }\n    });\n  },\n\n  /**\n   * The apiKey for authenticating against shopify. This is your api client's\n   * public api token. Not the shared secret. Set during initialation.\n   * @attribute requiredProperties\n   * @default ['apiKey', 'channelId', 'myShopifyDomain']\n   * @type Array\n   * @private\n   */\n  requiredProperties: ['apiKey', 'channelId', 'myShopifyDomain'],\n\n  /**\n   * The apiKey for authenticating against shopify. This is your api client's\n   * public api token. Not the shared secret. Set during initialation.\n   * @attribute apiKey\n   * @default ''\n   * @type String\n   * @public\n   */\n  apiKey: '',\n\n  /**\n   * @attribute channelId\n   * @default ''\n   * @type String\n   * @public\n   */\n  channelId: '',\n\n  /**\n   * @attribute myShopifyDomain\n   * @default ''\n   * @type String\n   * @public\n   */\n  myShopifyDomain: ''\n});\n\nexports['default'] = Config;\nmodule.exports = exports['default'];","/* global global, require, Buffer */\n\n'use strict';\n\nvar globalNamespace = undefined;\n\nif (typeof global === 'undefined') {\n  globalNamespace = window;\n} else {\n  globalNamespace = global;\n}\n\nvar btoa = globalNamespace.btoa;\n\nfunction isNode() {\n  var windowAbsent = typeof window === 'undefined';\n  var requirePresent = typeof require === 'function';\n\n  return windowAbsent && requirePresent;\n}\n\nif (!btoa && isNode()) {\n  globalNamespace.btoa = function (string) {\n    return new Buffer(string).toString('base64');\n  };\n}","/* global global, require */\n\n'use strict';\n\nvar globalNamespace = undefined;\n\nif (typeof global === 'undefined') {\n  globalNamespace = window;\n} else {\n  globalNamespace = global;\n}\n\nvar fetch = globalNamespace.fetch;\n\nfunction isNode() {\n  var windowAbsent = typeof window === 'undefined';\n  var requirePresent = typeof require === 'function';\n\n  return windowAbsent && requirePresent;\n}\n\nif (!fetch && isNode()) {\n  globalNamespace.fetch = require('node-fetch');\n  globalNamespace.Response = globalNamespace.fetch.Response;\n}","/* eslint no-undefined: 0 */\n\n'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\nvar assign = undefined;\n\nif (typeof Object.assign === 'function') {\n  assign = Object.assign;\n} else {\n  assign = function (target) {\n    if (target === undefined || target === null) {\n      throw new TypeError('Cannot convert undefined or null to object');\n    }\n\n    var output = Object(target);\n\n    var propertyObjects = [].slice.call(arguments, 1);\n\n    if (propertyObjects.length > 0) {\n      propertyObjects.forEach(function (source) {\n        if (source !== undefined && source !== null) {\n          var nextKey = undefined;\n\n          for (nextKey in source) {\n            if (source.hasOwnProperty(nextKey)) {\n              output[nextKey] = source[nextKey];\n            }\n          }\n        }\n      });\n    }\n\n    return output;\n  };\n}\n\nexports['default'] = assign;\nmodule.exports = exports['default'];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _createClass = require('./create-class');\n\nvar _createClass2 = _interopRequireDefault(_createClass);\n\nvar CoreObject = (0, _createClass2['default'])({\n  constructor: function constructor() {},\n\n  'static': {\n    extend: function extend(subClassProps) {\n      return (0, _createClass2['default'])(subClassProps, this);\n    }\n  }\n});\n\nexports['default'] = CoreObject;\nmodule.exports = exports['default'];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _assign = require('./assign');\n\nvar _assign2 = _interopRequireDefault(_assign);\n\nvar _includes = require('./includes');\n\nvar _includes2 = _interopRequireDefault(_includes);\n\nfunction wrap(func, superFunc) {\n  function superWrapper() {\n    var originalSuper = this['super'];\n\n    this['super'] = function () {\n      return superFunc.apply(this, arguments);\n    };\n\n    var ret = func.apply(this, arguments);\n\n    this['super'] = originalSuper;\n\n    return ret;\n  }\n\n  superWrapper.wrappedFunction = func;\n\n  return superWrapper;\n}\n\nfunction defineProperties(names, proto, destination) {\n  var parentProto = Object.getPrototypeOf(destination);\n\n  names.forEach(function (name) {\n    var descriptor = Object.getOwnPropertyDescriptor(proto, name);\n    var parentDescriptor = parentProto.hasOwnProperty(name) && Object.getOwnPropertyDescriptor(parentProto, name);\n\n    if (typeof parentDescriptor.value === 'function' && typeof descriptor.value === 'function') {\n      var wrappedFunction = wrap(descriptor.value, parentDescriptor.value);\n\n      Object.defineProperty(destination, name, { value: wrappedFunction });\n    } else {\n      Object.defineProperty(destination, name, descriptor);\n    }\n  });\n}\n\nfunction createClass(props) {\n  var parent = arguments.length <= 1 || arguments[1] === undefined ? Object : arguments[1];\n\n  var Constructor = wrap(props.constructor, parent);\n  var instancePropertyNames = Object.getOwnPropertyNames(props).filter(function (key) {\n    return !(0, _includes2['default'])(['constructor', 'static'], key);\n  });\n\n  (0, _assign2['default'])(Constructor, parent);\n\n  Constructor.prototype = Object.create(parent.prototype);\n  defineProperties(instancePropertyNames, props, Constructor.prototype);\n  Constructor.prototype.constructor = Constructor;\n\n  var staticProps = props['static'];\n\n  if (staticProps) {\n    var staticPropertyNames = Object.getOwnPropertyNames(staticProps);\n\n    defineProperties(staticPropertyNames, staticProps, Constructor);\n  }\n\n  return Constructor;\n}\n\nexports['default'] = createClass;\nmodule.exports = exports['default'];","\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nvar includes = undefined;\n\nif (!Array.prototype.includes) {\n  includes = function (array, searchElement) {\n    var ObjectifiedArray = Object(array);\n    var length = parseInt(ObjectifiedArray.length, 10) || 0;\n\n    if (length === 0) {\n      return false;\n    }\n\n    var startIndex = parseInt(arguments[1], 10) || 0;\n    var index = undefined;\n\n    if (startIndex >= 0) {\n      index = startIndex;\n    } else {\n      index = length + startIndex;\n\n      if (index < 0) {\n        index = 0;\n      }\n    }\n\n    while (index < length) {\n      var currentElement = ObjectifiedArray[index];\n\n      /* eslint no-self-compare:0 */\n      if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {\n        // NaN !== NaN\n        return true;\n      }\n      index++;\n    }\n\n    return false;\n  };\n} else {\n  includes = function (array) {\n    var args = [].slice.call(arguments, 1);\n\n    return Array.prototype.includes.apply(array, args);\n  };\n}\n\nexports[\"default\"] = includes;\nmodule.exports = exports[\"default\"];","\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nexports[\"default\"] = function (array) {\n  return array.reduce(function (uniqueArray, item) {\n    if (uniqueArray.indexOf(item) < 0) {\n      uniqueArray.push(item);\n    }\n\n    return uniqueArray;\n  }, []);\n};\n\nmodule.exports = exports[\"default\"];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _metalCoreObject = require('../metal/core-object');\n\nvar _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);\n\nvar _metalAssign = require('../metal/assign');\n\nvar _metalAssign2 = _interopRequireDefault(_metalAssign);\n\nvar BaseModel = _metalCoreObject2['default'].extend({\n  constructor: function constructor() {\n    var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];\n    var metaAttrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];\n\n    this.attrs = attrs;\n\n    (0, _metalAssign2['default'])(this, metaAttrs);\n  },\n  attrs: null,\n  serializer: null,\n  adapter: null,\n  shopClient: null\n});\n\nexports['default'] = BaseModel;\nmodule.exports = exports['default'];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _baseModel = require('./base-model');\n\nvar _baseModel2 = _interopRequireDefault(_baseModel);\n\nvar CartModel = _baseModel2['default'].extend({\n  constructor: function constructor() {\n    this['super'].apply(this, arguments);\n  }\n});\n\nexports['default'] = CartModel;\nmodule.exports = exports['default'];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _baseModel = require('./base-model');\n\nvar _baseModel2 = _interopRequireDefault(_baseModel);\n\nvar _metalCoreObject = require('../metal/core-object');\n\nvar _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);\n\nvar _metalUniq = require('../metal/uniq');\n\nvar _metalUniq2 = _interopRequireDefault(_metalUniq);\n\nvar _metalIncludes = require('../metal/includes');\n\nvar _metalIncludes2 = _interopRequireDefault(_metalIncludes);\n\nvar Option = _metalCoreObject2['default'].extend(Object.defineProperties({\n  constructor: function constructor(name, values) {\n    this.name = name;\n    this.values = values;\n    this.selected = values[0];\n  },\n\n  name: '',\n\n  values: []\n\n}, {\n  selected: {\n    get: function get() {\n      return this._selected;\n    },\n    set: function set(value) {\n      if ((0, _metalIncludes2['default'])(this.values, value)) {\n        this._selected = value;\n      } else {\n        throw new Error('Invalid option selection for ' + this.name + '.');\n      }\n\n      return value;\n    },\n    configurable: true,\n    enumerable: true\n  }\n}));\n\nvar ProductModel = _baseModel2['default'].extend(Object.defineProperties({\n  constructor: function constructor() {\n    this['super'].apply(this, arguments);\n  }\n\n}, {\n  memoized: {\n    get: function get() {\n      this._memoized = this._memoized || {};\n\n      return this._memoized;\n    },\n    configurable: true,\n    enumerable: true\n  },\n  options: {\n    get: function get() {\n      if (this.memoized.options) {\n        return this.memoized.options;\n      }\n\n      var baseOptions = this.attrs.options;\n      var variants = this.attrs.variants;\n\n      this.memoized.options = baseOptions.map(function (option) {\n        var name = option.name;\n\n        var dupedValues = variants.reduce(function (valueList, variant) {\n          var optionValueForOption = variant.option_values.filter(function (optionValue) {\n            return optionValue.name === option.name;\n          })[0];\n\n          valueList.push(optionValueForOption.value);\n\n          return valueList;\n        }, []);\n\n        var values = (0, _metalUniq2['default'])(dupedValues);\n\n        return new Option(name, values);\n      });\n\n      return this.memoized.options;\n    },\n    configurable: true,\n    enumerable: true\n  },\n  selections: {\n    get: function get() {\n      return this.options.map(function (option) {\n        return option.selected;\n      });\n    },\n    configurable: true,\n    enumerable: true\n  },\n  selectedVariant: {\n    get: function get() {\n      var variantTitle = this.selections.join(' / ');\n\n      return this.attrs.variants.filter(function (variant) {\n        return variant.title === variantTitle;\n      })[0];\n    },\n    configurable: true,\n    enumerable: true\n  },\n  selectedVariantImage: {\n    get: function get() {\n      var selectedVariantId = this.selectedVariant.id;\n      var images = this.attrs.images;\n      var primaryImage = images[0];\n      var variantImage = images.filter(function (image) {\n        return image.variant_ids.indexOf(selectedVariantId) !== -1;\n      })[0];\n\n      return variantImage || primaryImage;\n    },\n    configurable: true,\n    enumerable: true\n  }\n}));\n\nexports['default'] = ProductModel;\nmodule.exports = exports['default'];","\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nvar RSVP = window.RSVP;\nvar Promise = RSVP.Promise;\n\nexports.RSVP = RSVP;\nexports.Promise = Promise;\nexports[\"default\"] = Promise;","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _metalCoreObject = require('../metal/core-object');\n\nvar _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);\n\nvar _metalAssign = require('../metal/assign');\n\nvar _metalAssign2 = _interopRequireDefault(_metalAssign);\n\nvar _modelsCheckoutModel = require('../models/checkout-model');\n\nvar _modelsCheckoutModel2 = _interopRequireDefault(_modelsCheckoutModel);\n\nvar CheckoutSerializer = _metalCoreObject2['default'].extend({\n  constructor: function constructor() {},\n\n  rootKeyForType: function rootKeyForType(type) {\n    return type.slice(0, -1);\n  },\n\n  modelForType: function modelForType() /* type */{\n    return _modelsCheckoutModel2['default'];\n  },\n\n  deserializeSingle: function deserializeSingle(type, singlePayload, metaAttrs) {\n    var modelAttrs = singlePayload[this.rootKeyForType(type)];\n    var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);\n\n    return model;\n  },\n\n  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {\n    var Model = this.modelForType(type);\n\n    return new Model(attrs, metaAttrs);\n  },\n\n  serialize: function serialize(type, model) {\n    var root = this.rootKeyForType(type);\n    var payload = {};\n    var attrs = (0, _metalAssign2['default'])({}, model.attrs);\n\n    payload[root] = attrs;\n\n    delete attrs.attributes;\n\n    Object.keys(attrs).forEach(function (key) {\n      var value = attrs[key];\n\n      if (value === null || typeof value === 'string' && value.length === 0) {\n        delete attrs[key];\n      }\n    });\n\n    return payload;\n  }\n});\n\nexports['default'] = CheckoutSerializer;\nmodule.exports = exports['default'];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _metalCoreObject = require('../metal/core-object');\n\nvar _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);\n\nvar _modelsBaseModel = require('../models/base-model');\n\nvar _modelsBaseModel2 = _interopRequireDefault(_modelsBaseModel);\n\nvar _modelsProductModel = require('../models/product-model');\n\nvar _modelsProductModel2 = _interopRequireDefault(_modelsProductModel);\n\nvar PublicationSerializer = _metalCoreObject2['default'].extend({\n  constructor: function constructor() {},\n\n  rootKeyForType: function rootKeyForType(type) {\n    return type.slice(0, -1) + '_publications';\n  },\n\n  models: {\n    collections: _modelsBaseModel2['default'],\n    products: _modelsProductModel2['default']\n  },\n\n  modelForType: function modelForType(type) {\n    return this.models[type];\n  },\n\n  deserializeSingle: function deserializeSingle(type, singlePayload, metaAttrs) {\n    var models = singlePayload[this.rootKeyForType(type)];\n    var model = this.modelFromAttrs(type, models[0], metaAttrs);\n\n    return model;\n  },\n\n  deserializeMultiple: function deserializeMultiple(type, collectionPayload, metaAttrs) {\n    var _this = this;\n\n    var models = collectionPayload[this.rootKeyForType(type)];\n\n    return models.map(function (attrs) {\n      var model = _this.modelFromAttrs(type, attrs, metaAttrs);\n\n      return model;\n    });\n  },\n\n  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {\n    var Model = this.modelForType(type);\n\n    return new Model(attrs, metaAttrs);\n  }\n});\n\nexports['default'] = PublicationSerializer;\nmodule.exports = exports['default'];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\nvar _slice = Array.prototype.slice;\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _serializersPublicationSerializer = require('./serializers/publication-serializer');\n\nvar _serializersPublicationSerializer2 = _interopRequireDefault(_serializersPublicationSerializer);\n\nvar _adaptersPublicationAdapter = require('./adapters/publication-adapter');\n\nvar _adaptersPublicationAdapter2 = _interopRequireDefault(_adaptersPublicationAdapter);\n\nvar _serializersCheckoutSerializer = require('./serializers/checkout-serializer');\n\nvar _serializersCheckoutSerializer2 = _interopRequireDefault(_serializersCheckoutSerializer);\n\nvar _adaptersCheckoutAdapter = require('./adapters/checkout-adapter');\n\nvar _adaptersCheckoutAdapter2 = _interopRequireDefault(_adaptersCheckoutAdapter);\n\nvar _metalCoreObject = require('./metal/core-object');\n\nvar _metalCoreObject2 = _interopRequireDefault(_metalCoreObject);\n\nvar _metalAssign = require('./metal/assign');\n\nvar _metalAssign2 = _interopRequireDefault(_metalAssign);\n\n/**\n * @module js-buy-sdk\n * @submodule shop-client\n */\n\nfunction fetchFactory(fetchType, type) {\n  var func = undefined;\n\n  switch (fetchType) {\n    case 'all':\n      func = function () {\n        return this.fetchAll(type);\n      };\n      break;\n    case 'one':\n      func = function () {\n        return this.fetch.apply(this, [type].concat(_slice.call(arguments)));\n      };\n      break;\n    case 'query':\n      func = function () {\n        return this.fetchQuery.apply(this, [type].concat(_slice.call(arguments)));\n      };\n      break;\n  }\n\n  return func;\n}\n\nvar ShopClient = _metalCoreObject2['default'].extend(Object.defineProperties({\n  /**\n   * @class ShopClient\n   * @constructor\n   * @param {Config} [config] Config data to be used throughout all API\n   * interaction\n   */\n  constructor: function constructor(config) {\n    this.config = config;\n\n    this.serializers = {\n      products: _serializersPublicationSerializer2['default'],\n      collections: _serializersPublicationSerializer2['default'],\n      checkouts: _serializersCheckoutSerializer2['default']\n    };\n\n    this.adapters = {\n      products: _adaptersPublicationAdapter2['default'],\n      collections: _adaptersPublicationAdapter2['default'],\n      checkouts: _adaptersCheckoutAdapter2['default']\n    };\n  },\n\n  config: null,\n\n  /**\n   * Fetch all of a `type`, returning a promise.\n   *\n   * ```javascript\n   * client.fetchAll('products').then(products => {\n   *   // do things with products\n   * });\n   * ```\n   *\n   * @method fetchAll\n   * @public\n   * @param {String} type The pluralized name of the type, in lower case.\n   * @return {Promise|Array} a promise resolving with an array of `type`\n   */\n  fetchAll: function fetchAll(type) {\n    var _this = this;\n\n    var adapter = new this.adapters[type](this.config);\n\n    return adapter.fetchMultiple(type).then(function (payload) {\n      return _this.deserialize(type, payload, adapter, { multiple: true });\n    });\n  },\n\n  /**\n   * Fetch one of a `type`, returning a promise.\n   *\n   * ```javascript\n   * client.fetch('products', 123).then(product => {\n   *   // do things with the product\n   * });\n   * ```\n   *\n   * @method fetch\n   * @public\n   * @param {String} type The pluralized name of the type, in lower case.\n   * @param {String|Number} id a unique identifier\n   * @return {Promise|BaseModel} a promise resolving with a single instance of\n   * `type` expressed as a `BaseModel`.\n   */\n  fetch: function fetch(type, id) {\n    var _this2 = this;\n\n    var adapter = new this.adapters[type](this.config);\n\n    return adapter.fetchSingle(type, id).then(function (payload) {\n      return _this2.deserialize(type, payload, adapter, { single: true });\n    });\n  },\n\n  /**\n   * Fetch many of a `type`, that match `query`\n   *\n   * ```javascript\n   * client.fetchQuery('products', { collection_id: 456 }).then(products => {\n   *   // do things with the products\n   * });\n   * ```\n   *\n   * @method fetchQuery\n   * @public\n   * @param {String} type The pluralized name of the type, in lower case.\n   * @param {Object} query a query sent to the api server.\n   * @return {Promise|Array} a promise resolving with an array of `type`.\n   */\n  fetchQuery: function fetchQuery(type, query) {\n    var _this3 = this;\n\n    var adapter = new this.adapters[type](this.config);\n\n    return adapter.fetchMultiple(type, query).then(function (payload) {\n      return _this3.deserialize(type, payload, adapter, { multiple: true });\n    });\n  },\n\n  /**\n   * Create an instance of `type`, optionally including `attrs`.\n   *\n   * ```javascript\n   * client.create('checkouts', { line_items: [ ... ] }).then(checkout => {\n   *   // do things with the checkout.\n   * });\n   * ```\n   *\n   * @method create\n   * @public\n   * @param {String} type The pluralized name of the type, in lower case.\n   * @param {Object} [attrs={}] attributes to send to the server for creation.\n   * @return {Promise|CartModel} a promise resolving with a single instance of\n   * `type`\n   */\n  create: function create(type) {\n    var _this4 = this;\n\n    var attrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];\n\n    var adapter = new this.adapters[type](this.config);\n\n    return adapter.create(type, attrs).then(function (payload) {\n      return _this4.deserialize(type, payload, adapter, { single: true });\n    });\n  },\n\n  /**\n   * Create an instance of `type`, optionally including `attrs`.\n   *\n   * ```javascript\n   * client.create('checkouts', { line_items: [ ... ] }).then(checkout => {\n   *   // do things with the checkout.\n   * });\n   * ```\n   *\n   * @method update\n   * @public\n   * @param {String} type The pluralized name of the type, in lower case.\n   * @param {BaseModel} updatedModel The model that represents new state to\n   * to persist to the server.\n   * @return {Promise|CartModel} a promise resolving with a single instance of\n   * `type`\n   */\n  update: function update(type, updatedModel) {\n    var _this5 = this;\n\n    var adapter = updatedModel.adapter;\n    var serializer = updatedModel.serializer;\n    var serializedModel = serializer.serialize(type, updatedModel);\n    var id = updatedModel.attrs[adapter.idKeyForType(type)];\n\n    return adapter.update(type, id, serializedModel).then(function (payload) {\n      var meta = { shopClient: _this5, adapter: adapter, serializer: serializer, type: type };\n\n      return serializer.deserializeSingle(type, payload, meta);\n    });\n  },\n\n  /**\n   * Proxy to serializer's deserialize.\n   *\n   * @method deserialize\n   * @private\n   * @param {String} type The pluralized name of the type, in lower case.\n   * @param {Object} payload The raw payload returned by the adapter.\n   * @param {BaseAdapter} adapter The adapter that yielded the payload.\n   * @param {Object} opts Options that determine which deserialization method to\n   * use.\n   * @param {Boolean} opts.multiple true when the payload represents multiple\n   * models\n   * @param {Boolean} opts.single true when the payload represents one model.\n   * @return {BaseModel} an instance of `type` reified into a model.\n   */\n  deserialize: function deserialize(type, payload, adapter) {\n    var opts = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];\n\n    var serializer = new this.serializers[type](this.config);\n    var meta = { shopClient: this, adapter: adapter, serializer: serializer, type: type };\n    var serializedPayload = undefined;\n\n    if (opts.multiple) {\n      serializedPayload = serializer.deserializeMultiple(type, payload, meta);\n    } else {\n      serializedPayload = serializer.deserializeSingle(type, payload, meta);\n    }\n\n    return serializedPayload;\n  },\n\n  /**\n   * Convenience wrapper for {{#crossLink \"ShopClient/fetchAll:method\"}}\n   * {{/crossLink}}. Equivalent to:\n   *\n   * ```javascript\n   * client.fetchAll('products');\n   * ```\n   *\n   * @method fetchAllProducts\n   * @public\n   * @return {Promise|Array} The product models.\n   */\n  fetchAllProducts: fetchFactory('all', 'products'),\n\n  /**\n   * Convenience wrapper for {{#crossLink \"ShopClient/fetchAll:method\"}}\n   * {{/crossLink}}. Equivalent to:\n   *\n   * ```javascript\n   * client.fetchAll('collections');\n   * ```\n   *\n   * @method fetchAllCollections\n   * @public\n   * @return {Promise|Array} The collection models.\n   */\n  fetchAllCollections: fetchFactory('all', 'collections'),\n\n  /**\n   * Convenience wrapper for {{#crossLink \"ShopClient/fetch:method\"}}\n   * {{/crossLink}}. Equivalent to:\n   *\n   * ```javascript\n   * client.fetch('products', 123);\n   * ```\n   *\n   * @method fetchProduct\n   * @public\n   * @param {String|Number} id a unique identifier\n   * @return {Promise|BaseModel} The product model.\n   */\n  fetchProduct: fetchFactory('one', 'products'),\n\n  /**\n   * Convenience wrapper for {{#crossLink \"ShopClient/fetch:method\"}}\n   * {{/crossLink}}. Equivalent to:\n   *\n   * ```javascript\n   * client.fetch('collections', 123);\n   * ```\n   *\n   * @method fetchCollection\n   * @public\n   * @param {String|Number} id a unique identifier\n   * @return {Promise|BaseModel} The collection model.\n   */\n  fetchCollection: fetchFactory('one', 'collections'),\n\n  /**\n   * Convenience wrapper for {{#crossLink \"ShopClient/fetchQuery:method\"}}\n   * {{/crossLink}}. Equivalent to:\n   *\n   * ```javascript\n   * client.fetchQuery('products', { query: 'options' });\n   * ```\n   *\n   * @method fetchQueryProducts\n   * @public\n   * @param {Object} query a query sent to the api server.\n   * @return {Promise|Array} The product models.\n   */\n  fetchQueryProducts: fetchFactory('query', 'products'),\n\n  /**\n   * Convenience wrapper for {{#crossLink \"ShopClient/fetchQuery:method\"}}\n   * {{/crossLink}}. Equivalent to:\n   *\n   * ```javascript\n   * client.fetchQuery('collections', { query: 'options' });\n   * ```\n   *\n   * @method fetchQueryCollections\n   * @public\n   * @param {Object} query a query sent to the api server.\n   * @return {Promise|Array} The collection models.\n   */\n  fetchQueryCollections: fetchFactory('query', 'collections')\n}, {\n  serializers: { // Prevent leaky state\n\n    get: function get() {\n      return (0, _metalAssign2['default'])({}, this.shadowedSerializers);\n    },\n    set: function set(values) {\n      this.shadowedSerializers = (0, _metalAssign2['default'])({}, values);\n    },\n    configurable: true,\n    enumerable: true\n  },\n  adapters: {\n    get: function get() {\n      return (0, _metalAssign2['default'])({}, this.shadowedAdapters);\n    },\n    set: function set(values) {\n      this.shadowedAdapters = (0, _metalAssign2['default'])({}, values);\n    },\n    configurable: true,\n    enumerable: true\n  }\n}));\n\nexports['default'] = ShopClient;\nmodule.exports = exports['default'];","'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _config = require('./config');\n\nvar _config2 = _interopRequireDefault(_config);\n\nvar _shopClient = require('./shop-client');\n\nvar _shopClient2 = _interopRequireDefault(_shopClient);\n\nrequire('./isomorphic-fetch');\n\nrequire('./isomorphic-btoa');\n\n/**\n * @module js-buy-sdk\n * @submodule shopify\n */\n\n/**\n * This namespace contains all globally accessible classes\n * @class ShopifyBuy\n * @static\n */\nvar Shopify = {\n  ShopClient: _shopClient2['default'],\n  Config: _config2['default'],\n\n  /**\n   * Create a ShopClient. This is the main entry point to the SDK.\n   *\n   * ```javascript\n   * const client = ShopifyBuy.buildClient({\n   *   apiKey: 'abc123',\n   *   channelId: 123456,\n   *   myShopifyDomain: 'myshop'\n   * });\n   * ```\n   *\n   * @method buildClient\n   * @for ShopifyBuy\n   * @static\n   * @public\n   * @param {Object} configAttrs A hash of required config data.\n   * @param {String} configAttrs.apiKey Your api client's public token.\n   * @param {String} configAttrs.channelId The channel from which to read\n   * publications. Visit `<your-shops-domain>/admin/channels.json` while\n   * authenticated to see a list of available channels.\n   * @param {String} configAttrs.myShopifyDomain You shop's `myshopify.com`\n   * domain.\n   * @return {ShopClient} a client for the shop using your api credentials.\n   */\n  buildClient: function buildClient() {\n    var configAttrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];\n\n    var config = new this.Config(configAttrs);\n\n    return new this.ShopClient(config);\n  }\n};\n\nexports['default'] = Shopify;\nmodule.exports = exports['default'];"],"names":[],"mappings":"AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AChHA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AC3HA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACrCA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AC7EA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACxBA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACvBA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACvCA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACtBA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AC9EA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AClDA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACfA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AC/BA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AClBA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACzIA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACTA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;ACjEA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AC9DA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;AC5WA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;","file":"buy-button-sdk.common.js"}
{"version":3,"sources":["fetch.js","rsvp.js"],"sourcesContent":["(function() {\n  'use strict';\n\n  if (self.fetch) {\n    return\n  }\n\n  function normalizeName(name) {\n    if (typeof name !== 'string') {\n      name = String(name)\n    }\n    if (/[^a-z0-9\\-#$%&'*+.\\^_`|~]/i.test(name)) {\n      throw new TypeError('Invalid character in header field name')\n    }\n    return name.toLowerCase()\n  }\n\n  function normalizeValue(value) {\n    if (typeof value !== 'string') {\n      value = String(value)\n    }\n    return value\n  }\n\n  function Headers(headers) {\n    this.map = {}\n\n    if (headers instanceof Headers) {\n      headers.forEach(function(value, name) {\n        this.append(name, value)\n      }, this)\n\n    } else if (headers) {\n      Object.getOwnPropertyNames(headers).forEach(function(name) {\n        this.append(name, headers[name])\n      }, this)\n    }\n  }\n\n  Headers.prototype.append = function(name, value) {\n    name = normalizeName(name)\n    value = normalizeValue(value)\n    var list = this.map[name]\n    if (!list) {\n      list = []\n      this.map[name] = list\n    }\n    list.push(value)\n  }\n\n  Headers.prototype['delete'] = function(name) {\n    delete this.map[normalizeName(name)]\n  }\n\n  Headers.prototype.get = function(name) {\n    var values = this.map[normalizeName(name)]\n    return values ? values[0] : null\n  }\n\n  Headers.prototype.getAll = function(name) {\n    return this.map[normalizeName(name)] || []\n  }\n\n  Headers.prototype.has = function(name) {\n    return this.map.hasOwnProperty(normalizeName(name))\n  }\n\n  Headers.prototype.set = function(name, value) {\n    this.map[normalizeName(name)] = [normalizeValue(value)]\n  }\n\n  Headers.prototype.forEach = function(callback, thisArg) {\n    Object.getOwnPropertyNames(this.map).forEach(function(name) {\n      this.map[name].forEach(function(value) {\n        callback.call(thisArg, value, name, this)\n      }, this)\n    }, this)\n  }\n\n  function consumed(body) {\n    if (body.bodyUsed) {\n      return Promise.reject(new TypeError('Already read'))\n    }\n    body.bodyUsed = true\n  }\n\n  function fileReaderReady(reader) {\n    return new Promise(function(resolve, reject) {\n      reader.onload = function() {\n        resolve(reader.result)\n      }\n      reader.onerror = function() {\n        reject(reader.error)\n      }\n    })\n  }\n\n  function readBlobAsArrayBuffer(blob) {\n    var reader = new FileReader()\n    reader.readAsArrayBuffer(blob)\n    return fileReaderReady(reader)\n  }\n\n  function readBlobAsText(blob) {\n    var reader = new FileReader()\n    reader.readAsText(blob)\n    return fileReaderReady(reader)\n  }\n\n  var support = {\n    blob: 'FileReader' in self && 'Blob' in self && (function() {\n      try {\n        new Blob();\n        return true\n      } catch(e) {\n        return false\n      }\n    })(),\n    formData: 'FormData' in self,\n    arrayBuffer: 'ArrayBuffer' in self\n  }\n\n  function Body() {\n    this.bodyUsed = false\n\n\n    this._initBody = function(body) {\n      this._bodyInit = body\n      if (typeof body === 'string') {\n        this._bodyText = body\n      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {\n        this._bodyBlob = body\n      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {\n        this._bodyFormData = body\n      } else if (!body) {\n        this._bodyText = ''\n      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {\n        // Only support ArrayBuffers for POST method.\n        // Receiving ArrayBuffers happens via Blobs, instead.\n      } else {\n        throw new Error('unsupported BodyInit type')\n      }\n    }\n\n    if (support.blob) {\n      this.blob = function() {\n        var rejected = consumed(this)\n        if (rejected) {\n          return rejected\n        }\n\n        if (this._bodyBlob) {\n          return Promise.resolve(this._bodyBlob)\n        } else if (this._bodyFormData) {\n          throw new Error('could not read FormData body as blob')\n        } else {\n          return Promise.resolve(new Blob([this._bodyText]))\n        }\n      }\n\n      this.arrayBuffer = function() {\n        return this.blob().then(readBlobAsArrayBuffer)\n      }\n\n      this.text = function() {\n        var rejected = consumed(this)\n        if (rejected) {\n          return rejected\n        }\n\n        if (this._bodyBlob) {\n          return readBlobAsText(this._bodyBlob)\n        } else if (this._bodyFormData) {\n          throw new Error('could not read FormData body as text')\n        } else {\n          return Promise.resolve(this._bodyText)\n        }\n      }\n    } else {\n      this.text = function() {\n        var rejected = consumed(this)\n        return rejected ? rejected : Promise.resolve(this._bodyText)\n      }\n    }\n\n    if (support.formData) {\n      this.formData = function() {\n        return this.text().then(decode)\n      }\n    }\n\n    this.json = function() {\n      return this.text().then(JSON.parse)\n    }\n\n    return this\n  }\n\n  // HTTP methods whose capitalization should be normalized\n  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']\n\n  function normalizeMethod(method) {\n    var upcased = method.toUpperCase()\n    return (methods.indexOf(upcased) > -1) ? upcased : method\n  }\n\n  function Request(input, options) {\n    options = options || {}\n    var body = options.body\n    if (Request.prototype.isPrototypeOf(input)) {\n      if (input.bodyUsed) {\n        throw new TypeError('Already read')\n      }\n      this.url = input.url\n      this.credentials = input.credentials\n      if (!options.headers) {\n        this.headers = new Headers(input.headers)\n      }\n      this.method = input.method\n      this.mode = input.mode\n      if (!body) {\n        body = input._bodyInit\n        input.bodyUsed = true\n      }\n    } else {\n      this.url = input\n    }\n\n    this.credentials = options.credentials || this.credentials || 'omit'\n    if (options.headers || !this.headers) {\n      this.headers = new Headers(options.headers)\n    }\n    this.method = normalizeMethod(options.method || this.method || 'GET')\n    this.mode = options.mode || this.mode || null\n    this.referrer = null\n\n    if ((this.method === 'GET' || this.method === 'HEAD') && body) {\n      throw new TypeError('Body not allowed for GET or HEAD requests')\n    }\n    this._initBody(body)\n  }\n\n  Request.prototype.clone = function() {\n    return new Request(this)\n  }\n\n  function decode(body) {\n    var form = new FormData()\n    body.trim().split('&').forEach(function(bytes) {\n      if (bytes) {\n        var split = bytes.split('=')\n        var name = split.shift().replace(/\\+/g, ' ')\n        var value = split.join('=').replace(/\\+/g, ' ')\n        form.append(decodeURIComponent(name), decodeURIComponent(value))\n      }\n    })\n    return form\n  }\n\n  function headers(xhr) {\n    var head = new Headers()\n    var pairs = xhr.getAllResponseHeaders().trim().split('\\n')\n    pairs.forEach(function(header) {\n      var split = header.trim().split(':')\n      var key = split.shift().trim()\n      var value = split.join(':').trim()\n      head.append(key, value)\n    })\n    return head\n  }\n\n  Body.call(Request.prototype)\n\n  function Response(bodyInit, options) {\n    if (!options) {\n      options = {}\n    }\n\n    this._initBody(bodyInit)\n    this.type = 'default'\n    this.status = options.status\n    this.ok = this.status >= 200 && this.status < 300\n    this.statusText = options.statusText\n    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)\n    this.url = options.url || ''\n  }\n\n  Body.call(Response.prototype)\n\n  Response.prototype.clone = function() {\n    return new Response(this._bodyInit, {\n      status: this.status,\n      statusText: this.statusText,\n      headers: new Headers(this.headers),\n      url: this.url\n    })\n  }\n\n  Response.error = function() {\n    var response = new Response(null, {status: 0, statusText: ''})\n    response.type = 'error'\n    return response\n  }\n\n  var redirectStatuses = [301, 302, 303, 307, 308]\n\n  Response.redirect = function(url, status) {\n    if (redirectStatuses.indexOf(status) === -1) {\n      throw new RangeError('Invalid status code')\n    }\n\n    return new Response(null, {status: status, headers: {location: url}})\n  }\n\n  self.Headers = Headers;\n  self.Request = Request;\n  self.Response = Response;\n\n  self.fetch = function(input, init) {\n    return new Promise(function(resolve, reject) {\n      var request\n      if (Request.prototype.isPrototypeOf(input) && !init) {\n        request = input\n      } else {\n        request = new Request(input, init)\n      }\n\n      var xhr = new XMLHttpRequest()\n\n      function responseURL() {\n        if ('responseURL' in xhr) {\n          return xhr.responseURL\n        }\n\n        // Avoid security warnings on getResponseHeader when not allowed by CORS\n        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {\n          return xhr.getResponseHeader('X-Request-URL')\n        }\n\n        return;\n      }\n\n      xhr.onload = function() {\n        var status = (xhr.status === 1223) ? 204 : xhr.status\n        if (status < 100 || status > 599) {\n          reject(new TypeError('Network request failed'))\n          return\n        }\n        var options = {\n          status: status,\n          statusText: xhr.statusText,\n          headers: headers(xhr),\n          url: responseURL()\n        }\n        var body = 'response' in xhr ? xhr.response : xhr.responseText;\n        resolve(new Response(body, options))\n      }\n\n      xhr.onerror = function() {\n        reject(new TypeError('Network request failed'))\n      }\n\n      xhr.open(request.method, request.url, true)\n\n      if (request.credentials === 'include') {\n        xhr.withCredentials = true\n      }\n\n      if ('responseType' in xhr && support.blob) {\n        xhr.responseType = 'blob'\n      }\n\n      request.headers.forEach(function(value, name) {\n        xhr.setRequestHeader(name, value)\n      })\n\n      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)\n    })\n  }\n  self.fetch.polyfill = true\n})();\n","/*!\n * @overview RSVP - a tiny implementation of Promises/A+.\n * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors\n * @license   Licensed under MIT license\n *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE\n * @version   3.1.0\n */\n\n(function() {\n    \"use strict\";\n    function lib$rsvp$utils$$objectOrFunction(x) {\n      return typeof x === 'function' || (typeof x === 'object' && x !== null);\n    }\n\n    function lib$rsvp$utils$$isFunction(x) {\n      return typeof x === 'function';\n    }\n\n    function lib$rsvp$utils$$isMaybeThenable(x) {\n      return typeof x === 'object' && x !== null;\n    }\n\n    var lib$rsvp$utils$$_isArray;\n    if (!Array.isArray) {\n      lib$rsvp$utils$$_isArray = function (x) {\n        return Object.prototype.toString.call(x) === '[object Array]';\n      };\n    } else {\n      lib$rsvp$utils$$_isArray = Array.isArray;\n    }\n\n    var lib$rsvp$utils$$isArray = lib$rsvp$utils$$_isArray;\n\n    var lib$rsvp$utils$$now = Date.now || function() { return new Date().getTime(); };\n\n    function lib$rsvp$utils$$F() { }\n\n    var lib$rsvp$utils$$o_create = (Object.create || function (o) {\n      if (arguments.length > 1) {\n        throw new Error('Second argument not supported');\n      }\n      if (typeof o !== 'object') {\n        throw new TypeError('Argument must be an object');\n      }\n      lib$rsvp$utils$$F.prototype = o;\n      return new lib$rsvp$utils$$F();\n    });\n    function lib$rsvp$events$$indexOf(callbacks, callback) {\n      for (var i=0, l=callbacks.length; i<l; i++) {\n        if (callbacks[i] === callback) { return i; }\n      }\n\n      return -1;\n    }\n\n    function lib$rsvp$events$$callbacksFor(object) {\n      var callbacks = object._promiseCallbacks;\n\n      if (!callbacks) {\n        callbacks = object._promiseCallbacks = {};\n      }\n\n      return callbacks;\n    }\n\n    var lib$rsvp$events$$default = {\n\n      /**\n        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For\n        Example:\n\n        ```javascript\n        var object = {};\n\n        RSVP.EventTarget.mixin(object);\n\n        object.on('finished', function(event) {\n          // handle event\n        });\n\n        object.trigger('finished', { detail: value });\n        ```\n\n        `EventTarget.mixin` also works with prototypes:\n\n        ```javascript\n        var Person = function() {};\n        RSVP.EventTarget.mixin(Person.prototype);\n\n        var yehuda = new Person();\n        var tom = new Person();\n\n        yehuda.on('poke', function(event) {\n          console.log('Yehuda says OW');\n        });\n\n        tom.on('poke', function(event) {\n          console.log('Tom says OW');\n        });\n\n        yehuda.trigger('poke');\n        tom.trigger('poke');\n        ```\n\n        @method mixin\n        @for RSVP.EventTarget\n        @private\n        @param {Object} object object to extend with EventTarget methods\n      */\n      'mixin': function(object) {\n        object['on']      = this['on'];\n        object['off']     = this['off'];\n        object['trigger'] = this['trigger'];\n        object._promiseCallbacks = undefined;\n        return object;\n      },\n\n      /**\n        Registers a callback to be executed when `eventName` is triggered\n\n        ```javascript\n        object.on('event', function(eventInfo){\n          // handle the event\n        });\n\n        object.trigger('event');\n        ```\n\n        @method on\n        @for RSVP.EventTarget\n        @private\n        @param {String} eventName name of the event to listen for\n        @param {Function} callback function to be called when the event is triggered.\n      */\n      'on': function(eventName, callback) {\n        if (typeof callback !== 'function') {\n          throw new TypeError('Callback must be a function');\n        }\n\n        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks;\n\n        callbacks = allCallbacks[eventName];\n\n        if (!callbacks) {\n          callbacks = allCallbacks[eventName] = [];\n        }\n\n        if (lib$rsvp$events$$indexOf(callbacks, callback) === -1) {\n          callbacks.push(callback);\n        }\n      },\n\n      /**\n        You can use `off` to stop firing a particular callback for an event:\n\n        ```javascript\n        function doStuff() { // do stuff! }\n        object.on('stuff', doStuff);\n\n        object.trigger('stuff'); // doStuff will be called\n\n        // Unregister ONLY the doStuff callback\n        object.off('stuff', doStuff);\n        object.trigger('stuff'); // doStuff will NOT be called\n        ```\n\n        If you don't pass a `callback` argument to `off`, ALL callbacks for the\n        event will not be executed when the event fires. For example:\n\n        ```javascript\n        var callback1 = function(){};\n        var callback2 = function(){};\n\n        object.on('stuff', callback1);\n        object.on('stuff', callback2);\n\n        object.trigger('stuff'); // callback1 and callback2 will be executed.\n\n        object.off('stuff');\n        object.trigger('stuff'); // callback1 and callback2 will not be executed!\n        ```\n\n        @method off\n        @for RSVP.EventTarget\n        @private\n        @param {String} eventName event to stop listening to\n        @param {Function} callback optional argument. If given, only the function\n        given will be removed from the event's callback queue. If no `callback`\n        argument is given, all callbacks will be removed from the event's callback\n        queue.\n      */\n      'off': function(eventName, callback) {\n        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, index;\n\n        if (!callback) {\n          allCallbacks[eventName] = [];\n          return;\n        }\n\n        callbacks = allCallbacks[eventName];\n\n        index = lib$rsvp$events$$indexOf(callbacks, callback);\n\n        if (index !== -1) { callbacks.splice(index, 1); }\n      },\n\n      /**\n        Use `trigger` to fire custom events. For example:\n\n        ```javascript\n        object.on('foo', function(){\n          console.log('foo event happened!');\n        });\n        object.trigger('foo');\n        // 'foo event happened!' logged to the console\n        ```\n\n        You can also pass a value as a second argument to `trigger` that will be\n        passed as an argument to all event listeners for the event:\n\n        ```javascript\n        object.on('foo', function(value){\n          console.log(value.name);\n        });\n\n        object.trigger('foo', { name: 'bar' });\n        // 'bar' logged to the console\n        ```\n\n        @method trigger\n        @for RSVP.EventTarget\n        @private\n        @param {String} eventName name of the event to be triggered\n        @param {*} options optional value to be passed to any event handlers for\n        the given `eventName`\n      */\n      'trigger': function(eventName, options, label) {\n        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, callback;\n\n        if (callbacks = allCallbacks[eventName]) {\n          // Don't cache the callbacks.length since it may grow\n          for (var i=0; i<callbacks.length; i++) {\n            callback = callbacks[i];\n\n            callback(options, label);\n          }\n        }\n      }\n    };\n\n    var lib$rsvp$config$$config = {\n      instrument: false\n    };\n\n    lib$rsvp$events$$default['mixin'](lib$rsvp$config$$config);\n\n    function lib$rsvp$config$$configure(name, value) {\n      if (name === 'onerror') {\n        // handle for legacy users that expect the actual\n        // error to be passed to their function added via\n        // `RSVP.configure('onerror', someFunctionHere);`\n        lib$rsvp$config$$config['on']('error', value);\n        return;\n      }\n\n      if (arguments.length === 2) {\n        lib$rsvp$config$$config[name] = value;\n      } else {\n        return lib$rsvp$config$$config[name];\n      }\n    }\n\n    var lib$rsvp$instrument$$queue = [];\n\n    function lib$rsvp$instrument$$scheduleFlush() {\n      setTimeout(function() {\n        var entry;\n        for (var i = 0; i < lib$rsvp$instrument$$queue.length; i++) {\n          entry = lib$rsvp$instrument$$queue[i];\n\n          var payload = entry.payload;\n\n          payload.guid = payload.key + payload.id;\n          payload.childGuid = payload.key + payload.childId;\n          if (payload.error) {\n            payload.stack = payload.error.stack;\n          }\n\n          lib$rsvp$config$$config['trigger'](entry.name, entry.payload);\n        }\n        lib$rsvp$instrument$$queue.length = 0;\n      }, 50);\n    }\n\n    function lib$rsvp$instrument$$instrument(eventName, promise, child) {\n      if (1 === lib$rsvp$instrument$$queue.push({\n        name: eventName,\n        payload: {\n          key: promise._guidKey,\n          id:  promise._id,\n          eventName: eventName,\n          detail: promise._result,\n          childId: child && child._id,\n          label: promise._label,\n          timeStamp: lib$rsvp$utils$$now(),\n          error: lib$rsvp$config$$config[\"instrument-with-stack\"] ? new Error(promise._label) : null\n        }})) {\n          lib$rsvp$instrument$$scheduleFlush();\n        }\n      }\n    var lib$rsvp$instrument$$default = lib$rsvp$instrument$$instrument;\n\n    function  lib$rsvp$$internal$$withOwnPromise() {\n      return new TypeError('A promises callback cannot return that same promise.');\n    }\n\n    function lib$rsvp$$internal$$noop() {}\n\n    var lib$rsvp$$internal$$PENDING   = void 0;\n    var lib$rsvp$$internal$$FULFILLED = 1;\n    var lib$rsvp$$internal$$REJECTED  = 2;\n\n    var lib$rsvp$$internal$$GET_THEN_ERROR = new lib$rsvp$$internal$$ErrorObject();\n\n    function lib$rsvp$$internal$$getThen(promise) {\n      try {\n        return promise.then;\n      } catch(error) {\n        lib$rsvp$$internal$$GET_THEN_ERROR.error = error;\n        return lib$rsvp$$internal$$GET_THEN_ERROR;\n      }\n    }\n\n    function lib$rsvp$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {\n      try {\n        then.call(value, fulfillmentHandler, rejectionHandler);\n      } catch(e) {\n        return e;\n      }\n    }\n\n    function lib$rsvp$$internal$$handleForeignThenable(promise, thenable, then) {\n      lib$rsvp$config$$config.async(function(promise) {\n        var sealed = false;\n        var error = lib$rsvp$$internal$$tryThen(then, thenable, function(value) {\n          if (sealed) { return; }\n          sealed = true;\n          if (thenable !== value) {\n            lib$rsvp$$internal$$resolve(promise, value);\n          } else {\n            lib$rsvp$$internal$$fulfill(promise, value);\n          }\n        }, function(reason) {\n          if (sealed) { return; }\n          sealed = true;\n\n          lib$rsvp$$internal$$reject(promise, reason);\n        }, 'Settle: ' + (promise._label || ' unknown promise'));\n\n        if (!sealed && error) {\n          sealed = true;\n          lib$rsvp$$internal$$reject(promise, error);\n        }\n      }, promise);\n    }\n\n    function lib$rsvp$$internal$$handleOwnThenable(promise, thenable) {\n      if (thenable._state === lib$rsvp$$internal$$FULFILLED) {\n        lib$rsvp$$internal$$fulfill(promise, thenable._result);\n      } else if (thenable._state === lib$rsvp$$internal$$REJECTED) {\n        thenable._onError = null;\n        lib$rsvp$$internal$$reject(promise, thenable._result);\n      } else {\n        lib$rsvp$$internal$$subscribe(thenable, undefined, function(value) {\n          if (thenable !== value) {\n            lib$rsvp$$internal$$resolve(promise, value);\n          } else {\n            lib$rsvp$$internal$$fulfill(promise, value);\n          }\n        }, function(reason) {\n          lib$rsvp$$internal$$reject(promise, reason);\n        });\n      }\n    }\n\n    function lib$rsvp$$internal$$handleMaybeThenable(promise, maybeThenable) {\n      if (maybeThenable.constructor === promise.constructor) {\n        lib$rsvp$$internal$$handleOwnThenable(promise, maybeThenable);\n      } else {\n        var then = lib$rsvp$$internal$$getThen(maybeThenable);\n\n        if (then === lib$rsvp$$internal$$GET_THEN_ERROR) {\n          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$GET_THEN_ERROR.error);\n        } else if (then === undefined) {\n          lib$rsvp$$internal$$fulfill(promise, maybeThenable);\n        } else if (lib$rsvp$utils$$isFunction(then)) {\n          lib$rsvp$$internal$$handleForeignThenable(promise, maybeThenable, then);\n        } else {\n          lib$rsvp$$internal$$fulfill(promise, maybeThenable);\n        }\n      }\n    }\n\n    function lib$rsvp$$internal$$resolve(promise, value) {\n      if (promise === value) {\n        lib$rsvp$$internal$$fulfill(promise, value);\n      } else if (lib$rsvp$utils$$objectOrFunction(value)) {\n        lib$rsvp$$internal$$handleMaybeThenable(promise, value);\n      } else {\n        lib$rsvp$$internal$$fulfill(promise, value);\n      }\n    }\n\n    function lib$rsvp$$internal$$publishRejection(promise) {\n      if (promise._onError) {\n        promise._onError(promise._result);\n      }\n\n      lib$rsvp$$internal$$publish(promise);\n    }\n\n    function lib$rsvp$$internal$$fulfill(promise, value) {\n      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }\n\n      promise._result = value;\n      promise._state = lib$rsvp$$internal$$FULFILLED;\n\n      if (promise._subscribers.length === 0) {\n        if (lib$rsvp$config$$config.instrument) {\n          lib$rsvp$instrument$$default('fulfilled', promise);\n        }\n      } else {\n        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, promise);\n      }\n    }\n\n    function lib$rsvp$$internal$$reject(promise, reason) {\n      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }\n      promise._state = lib$rsvp$$internal$$REJECTED;\n      promise._result = reason;\n      lib$rsvp$config$$config.async(lib$rsvp$$internal$$publishRejection, promise);\n    }\n\n    function lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection) {\n      var subscribers = parent._subscribers;\n      var length = subscribers.length;\n\n      parent._onError = null;\n\n      subscribers[length] = child;\n      subscribers[length + lib$rsvp$$internal$$FULFILLED] = onFulfillment;\n      subscribers[length + lib$rsvp$$internal$$REJECTED]  = onRejection;\n\n      if (length === 0 && parent._state) {\n        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, parent);\n      }\n    }\n\n    function lib$rsvp$$internal$$publish(promise) {\n      var subscribers = promise._subscribers;\n      var settled = promise._state;\n\n      if (lib$rsvp$config$$config.instrument) {\n        lib$rsvp$instrument$$default(settled === lib$rsvp$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);\n      }\n\n      if (subscribers.length === 0) { return; }\n\n      var child, callback, detail = promise._result;\n\n      for (var i = 0; i < subscribers.length; i += 3) {\n        child = subscribers[i];\n        callback = subscribers[i + settled];\n\n        if (child) {\n          lib$rsvp$$internal$$invokeCallback(settled, child, callback, detail);\n        } else {\n          callback(detail);\n        }\n      }\n\n      promise._subscribers.length = 0;\n    }\n\n    function lib$rsvp$$internal$$ErrorObject() {\n      this.error = null;\n    }\n\n    var lib$rsvp$$internal$$TRY_CATCH_ERROR = new lib$rsvp$$internal$$ErrorObject();\n\n    function lib$rsvp$$internal$$tryCatch(callback, detail) {\n      try {\n        return callback(detail);\n      } catch(e) {\n        lib$rsvp$$internal$$TRY_CATCH_ERROR.error = e;\n        return lib$rsvp$$internal$$TRY_CATCH_ERROR;\n      }\n    }\n\n    function lib$rsvp$$internal$$invokeCallback(settled, promise, callback, detail) {\n      var hasCallback = lib$rsvp$utils$$isFunction(callback),\n          value, error, succeeded, failed;\n\n      if (hasCallback) {\n        value = lib$rsvp$$internal$$tryCatch(callback, detail);\n\n        if (value === lib$rsvp$$internal$$TRY_CATCH_ERROR) {\n          failed = true;\n          error = value.error;\n          value = null;\n        } else {\n          succeeded = true;\n        }\n\n        if (promise === value) {\n          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$withOwnPromise());\n          return;\n        }\n\n      } else {\n        value = detail;\n        succeeded = true;\n      }\n\n      if (promise._state !== lib$rsvp$$internal$$PENDING) {\n        // noop\n      } else if (hasCallback && succeeded) {\n        lib$rsvp$$internal$$resolve(promise, value);\n      } else if (failed) {\n        lib$rsvp$$internal$$reject(promise, error);\n      } else if (settled === lib$rsvp$$internal$$FULFILLED) {\n        lib$rsvp$$internal$$fulfill(promise, value);\n      } else if (settled === lib$rsvp$$internal$$REJECTED) {\n        lib$rsvp$$internal$$reject(promise, value);\n      }\n    }\n\n    function lib$rsvp$$internal$$initializePromise(promise, resolver) {\n      var resolved = false;\n      try {\n        resolver(function resolvePromise(value){\n          if (resolved) { return; }\n          resolved = true;\n          lib$rsvp$$internal$$resolve(promise, value);\n        }, function rejectPromise(reason) {\n          if (resolved) { return; }\n          resolved = true;\n          lib$rsvp$$internal$$reject(promise, reason);\n        });\n      } catch(e) {\n        lib$rsvp$$internal$$reject(promise, e);\n      }\n    }\n\n    function lib$rsvp$enumerator$$makeSettledResult(state, position, value) {\n      if (state === lib$rsvp$$internal$$FULFILLED) {\n        return {\n          state: 'fulfilled',\n          value: value\n        };\n      } else {\n         return {\n          state: 'rejected',\n          reason: value\n        };\n      }\n    }\n\n    function lib$rsvp$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {\n      var enumerator = this;\n\n      enumerator._instanceConstructor = Constructor;\n      enumerator.promise = new Constructor(lib$rsvp$$internal$$noop, label);\n      enumerator._abortOnReject = abortOnReject;\n\n      if (enumerator._validateInput(input)) {\n        enumerator._input     = input;\n        enumerator.length     = input.length;\n        enumerator._remaining = input.length;\n\n        enumerator._init();\n\n        if (enumerator.length === 0) {\n          lib$rsvp$$internal$$fulfill(enumerator.promise, enumerator._result);\n        } else {\n          enumerator.length = enumerator.length || 0;\n          enumerator._enumerate();\n          if (enumerator._remaining === 0) {\n            lib$rsvp$$internal$$fulfill(enumerator.promise, enumerator._result);\n          }\n        }\n      } else {\n        lib$rsvp$$internal$$reject(enumerator.promise, enumerator._validationError());\n      }\n    }\n\n    var lib$rsvp$enumerator$$default = lib$rsvp$enumerator$$Enumerator;\n\n    lib$rsvp$enumerator$$Enumerator.prototype._validateInput = function(input) {\n      return lib$rsvp$utils$$isArray(input);\n    };\n\n    lib$rsvp$enumerator$$Enumerator.prototype._validationError = function() {\n      return new Error('Array Methods must be provided an Array');\n    };\n\n    lib$rsvp$enumerator$$Enumerator.prototype._init = function() {\n      this._result = new Array(this.length);\n    };\n\n    lib$rsvp$enumerator$$Enumerator.prototype._enumerate = function() {\n      var enumerator = this;\n      var length     = enumerator.length;\n      var promise    = enumerator.promise;\n      var input      = enumerator._input;\n\n      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {\n        enumerator._eachEntry(input[i], i);\n      }\n    };\n\n    lib$rsvp$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {\n      var enumerator = this;\n      var c = enumerator._instanceConstructor;\n      if (lib$rsvp$utils$$isMaybeThenable(entry)) {\n        if (entry.constructor === c && entry._state !== lib$rsvp$$internal$$PENDING) {\n          entry._onError = null;\n          enumerator._settledAt(entry._state, i, entry._result);\n        } else {\n          enumerator._willSettleAt(c.resolve(entry), i);\n        }\n      } else {\n        enumerator._remaining--;\n        enumerator._result[i] = enumerator._makeResult(lib$rsvp$$internal$$FULFILLED, i, entry);\n      }\n    };\n\n    lib$rsvp$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {\n      var enumerator = this;\n      var promise = enumerator.promise;\n\n      if (promise._state === lib$rsvp$$internal$$PENDING) {\n        enumerator._remaining--;\n\n        if (enumerator._abortOnReject && state === lib$rsvp$$internal$$REJECTED) {\n          lib$rsvp$$internal$$reject(promise, value);\n        } else {\n          enumerator._result[i] = enumerator._makeResult(state, i, value);\n        }\n      }\n\n      if (enumerator._remaining === 0) {\n        lib$rsvp$$internal$$fulfill(promise, enumerator._result);\n      }\n    };\n\n    lib$rsvp$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {\n      return value;\n    };\n\n    lib$rsvp$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {\n      var enumerator = this;\n\n      lib$rsvp$$internal$$subscribe(promise, undefined, function(value) {\n        enumerator._settledAt(lib$rsvp$$internal$$FULFILLED, i, value);\n      }, function(reason) {\n        enumerator._settledAt(lib$rsvp$$internal$$REJECTED, i, reason);\n      });\n    };\n    function lib$rsvp$promise$all$$all(entries, label) {\n      return new lib$rsvp$enumerator$$default(this, entries, true /* abort on reject */, label).promise;\n    }\n    var lib$rsvp$promise$all$$default = lib$rsvp$promise$all$$all;\n    function lib$rsvp$promise$race$$race(entries, label) {\n      /*jshint validthis:true */\n      var Constructor = this;\n\n      var promise = new Constructor(lib$rsvp$$internal$$noop, label);\n\n      if (!lib$rsvp$utils$$isArray(entries)) {\n        lib$rsvp$$internal$$reject(promise, new TypeError('You must pass an array to race.'));\n        return promise;\n      }\n\n      var length = entries.length;\n\n      function onFulfillment(value) {\n        lib$rsvp$$internal$$resolve(promise, value);\n      }\n\n      function onRejection(reason) {\n        lib$rsvp$$internal$$reject(promise, reason);\n      }\n\n      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {\n        lib$rsvp$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);\n      }\n\n      return promise;\n    }\n    var lib$rsvp$promise$race$$default = lib$rsvp$promise$race$$race;\n    function lib$rsvp$promise$resolve$$resolve(object, label) {\n      /*jshint validthis:true */\n      var Constructor = this;\n\n      if (object && typeof object === 'object' && object.constructor === Constructor) {\n        return object;\n      }\n\n      var promise = new Constructor(lib$rsvp$$internal$$noop, label);\n      lib$rsvp$$internal$$resolve(promise, object);\n      return promise;\n    }\n    var lib$rsvp$promise$resolve$$default = lib$rsvp$promise$resolve$$resolve;\n    function lib$rsvp$promise$reject$$reject(reason, label) {\n      /*jshint validthis:true */\n      var Constructor = this;\n      var promise = new Constructor(lib$rsvp$$internal$$noop, label);\n      lib$rsvp$$internal$$reject(promise, reason);\n      return promise;\n    }\n    var lib$rsvp$promise$reject$$default = lib$rsvp$promise$reject$$reject;\n\n    var lib$rsvp$promise$$guidKey = 'rsvp_' + lib$rsvp$utils$$now() + '-';\n    var lib$rsvp$promise$$counter = 0;\n\n    function lib$rsvp$promise$$needsResolver() {\n      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');\n    }\n\n    function lib$rsvp$promise$$needsNew() {\n      throw new TypeError(\"Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.\");\n    }\n\n    function lib$rsvp$promise$$Promise(resolver, label) {\n      var promise = this;\n\n      promise._id = lib$rsvp$promise$$counter++;\n      promise._label = label;\n      promise._state = undefined;\n      promise._result = undefined;\n      promise._subscribers = [];\n\n      if (lib$rsvp$config$$config.instrument) {\n        lib$rsvp$instrument$$default('created', promise);\n      }\n\n      if (lib$rsvp$$internal$$noop !== resolver) {\n        if (!lib$rsvp$utils$$isFunction(resolver)) {\n          lib$rsvp$promise$$needsResolver();\n        }\n\n        if (!(promise instanceof lib$rsvp$promise$$Promise)) {\n          lib$rsvp$promise$$needsNew();\n        }\n\n        lib$rsvp$$internal$$initializePromise(promise, resolver);\n      }\n    }\n\n    var lib$rsvp$promise$$default = lib$rsvp$promise$$Promise;\n\n    // deprecated\n    lib$rsvp$promise$$Promise.cast = lib$rsvp$promise$resolve$$default;\n    lib$rsvp$promise$$Promise.all = lib$rsvp$promise$all$$default;\n    lib$rsvp$promise$$Promise.race = lib$rsvp$promise$race$$default;\n    lib$rsvp$promise$$Promise.resolve = lib$rsvp$promise$resolve$$default;\n    lib$rsvp$promise$$Promise.reject = lib$rsvp$promise$reject$$default;\n\n    lib$rsvp$promise$$Promise.prototype = {\n      constructor: lib$rsvp$promise$$Promise,\n\n      _guidKey: lib$rsvp$promise$$guidKey,\n\n      _onError: function (reason) {\n        var promise = this;\n        lib$rsvp$config$$config.after(function() {\n          if (promise._onError) {\n            lib$rsvp$config$$config['trigger']('error', reason, promise._label);\n          }\n        });\n      },\n\n    /**\n      The primary way of interacting with a promise is through its `then` method,\n      which registers callbacks to receive either a promise's eventual value or the\n      reason why the promise cannot be fulfilled.\n\n      ```js\n      findUser().then(function(user){\n        // user is available\n      }, function(reason){\n        // user is unavailable, and you are given the reason why\n      });\n      ```\n\n      Chaining\n      --------\n\n      The return value of `then` is itself a promise.  This second, 'downstream'\n      promise is resolved with the return value of the first promise's fulfillment\n      or rejection handler, or rejected if the handler throws an exception.\n\n      ```js\n      findUser().then(function (user) {\n        return user.name;\n      }, function (reason) {\n        return 'default name';\n      }).then(function (userName) {\n        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it\n        // will be `'default name'`\n      });\n\n      findUser().then(function (user) {\n        throw new Error('Found user, but still unhappy');\n      }, function (reason) {\n        throw new Error('`findUser` rejected and we're unhappy');\n      }).then(function (value) {\n        // never reached\n      }, function (reason) {\n        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.\n        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.\n      });\n      ```\n      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.\n\n      ```js\n      findUser().then(function (user) {\n        throw new PedagogicalException('Upstream error');\n      }).then(function (value) {\n        // never reached\n      }).then(function (value) {\n        // never reached\n      }, function (reason) {\n        // The `PedgagocialException` is propagated all the way down to here\n      });\n      ```\n\n      Assimilation\n      ------------\n\n      Sometimes the value you want to propagate to a downstream promise can only be\n      retrieved asynchronously. This can be achieved by returning a promise in the\n      fulfillment or rejection handler. The downstream promise will then be pending\n      until the returned promise is settled. This is called *assimilation*.\n\n      ```js\n      findUser().then(function (user) {\n        return findCommentsByAuthor(user);\n      }).then(function (comments) {\n        // The user's comments are now available\n      });\n      ```\n\n      If the assimliated promise rejects, then the downstream promise will also reject.\n\n      ```js\n      findUser().then(function (user) {\n        return findCommentsByAuthor(user);\n      }).then(function (comments) {\n        // If `findCommentsByAuthor` fulfills, we'll have the value here\n      }, function (reason) {\n        // If `findCommentsByAuthor` rejects, we'll have the reason here\n      });\n      ```\n\n      Simple Example\n      --------------\n\n      Synchronous Example\n\n      ```javascript\n      var result;\n\n      try {\n        result = findResult();\n        // success\n      } catch(reason) {\n        // failure\n      }\n      ```\n\n      Errback Example\n\n      ```js\n      findResult(function(result, err){\n        if (err) {\n          // failure\n        } else {\n          // success\n        }\n      });\n      ```\n\n      Promise Example;\n\n      ```javascript\n      findResult().then(function(result){\n        // success\n      }, function(reason){\n        // failure\n      });\n      ```\n\n      Advanced Example\n      --------------\n\n      Synchronous Example\n\n      ```javascript\n      var author, books;\n\n      try {\n        author = findAuthor();\n        books  = findBooksByAuthor(author);\n        // success\n      } catch(reason) {\n        // failure\n      }\n      ```\n\n      Errback Example\n\n      ```js\n\n      function foundBooks(books) {\n\n      }\n\n      function failure(reason) {\n\n      }\n\n      findAuthor(function(author, err){\n        if (err) {\n          failure(err);\n          // failure\n        } else {\n          try {\n            findBoooksByAuthor(author, function(books, err) {\n              if (err) {\n                failure(err);\n              } else {\n                try {\n                  foundBooks(books);\n                } catch(reason) {\n                  failure(reason);\n                }\n              }\n            });\n          } catch(error) {\n            failure(err);\n          }\n          // success\n        }\n      });\n      ```\n\n      Promise Example;\n\n      ```javascript\n      findAuthor().\n        then(findBooksByAuthor).\n        then(function(books){\n          // found books\n      }).catch(function(reason){\n        // something went wrong\n      });\n      ```\n\n      @method then\n      @param {Function} onFulfillment\n      @param {Function} onRejection\n      @param {String} label optional string for labeling the promise.\n      Useful for tooling.\n      @return {Promise}\n    */\n      then: function(onFulfillment, onRejection, label) {\n        var parent = this;\n        var state = parent._state;\n\n        if (state === lib$rsvp$$internal$$FULFILLED && !onFulfillment || state === lib$rsvp$$internal$$REJECTED && !onRejection) {\n          if (lib$rsvp$config$$config.instrument) {\n            lib$rsvp$instrument$$default('chained', parent, parent);\n          }\n          return parent;\n        }\n\n        parent._onError = null;\n\n        var child = new parent.constructor(lib$rsvp$$internal$$noop, label);\n        var result = parent._result;\n\n        if (lib$rsvp$config$$config.instrument) {\n          lib$rsvp$instrument$$default('chained', parent, child);\n        }\n\n        if (state) {\n          var callback = arguments[state - 1];\n          lib$rsvp$config$$config.async(function(){\n            lib$rsvp$$internal$$invokeCallback(state, child, callback, result);\n          });\n        } else {\n          lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection);\n        }\n\n        return child;\n      },\n\n    /**\n      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same\n      as the catch block of a try/catch statement.\n\n      ```js\n      function findAuthor(){\n        throw new Error('couldn't find that author');\n      }\n\n      // synchronous\n      try {\n        findAuthor();\n      } catch(reason) {\n        // something went wrong\n      }\n\n      // async with promises\n      findAuthor().catch(function(reason){\n        // something went wrong\n      });\n      ```\n\n      @method catch\n      @param {Function} onRejection\n      @param {String} label optional string for labeling the promise.\n      Useful for tooling.\n      @return {Promise}\n    */\n      'catch': function(onRejection, label) {\n        return this.then(undefined, onRejection, label);\n      },\n\n    /**\n      `finally` will be invoked regardless of the promise's fate just as native\n      try/catch/finally behaves\n\n      Synchronous example:\n\n      ```js\n      findAuthor() {\n        if (Math.random() > 0.5) {\n          throw new Error();\n        }\n        return new Author();\n      }\n\n      try {\n        return findAuthor(); // succeed or fail\n      } catch(error) {\n        return findOtherAuther();\n      } finally {\n        // always runs\n        // doesn't affect the return value\n      }\n      ```\n\n      Asynchronous example:\n\n      ```js\n      findAuthor().catch(function(reason){\n        return findOtherAuther();\n      }).finally(function(){\n        // author was either found, or not\n      });\n      ```\n\n      @method finally\n      @param {Function} callback\n      @param {String} label optional string for labeling the promise.\n      Useful for tooling.\n      @return {Promise}\n    */\n      'finally': function(callback, label) {\n        var promise = this;\n        var constructor = promise.constructor;\n\n        return promise.then(function(value) {\n          return constructor.resolve(callback()).then(function(){\n            return value;\n          });\n        }, function(reason) {\n          return constructor.resolve(callback()).then(function(){\n            throw reason;\n          });\n        }, label);\n      }\n    };\n\n    function lib$rsvp$all$settled$$AllSettled(Constructor, entries, label) {\n      this._superConstructor(Constructor, entries, false /* don't abort on reject */, label);\n    }\n\n    lib$rsvp$all$settled$$AllSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);\n    lib$rsvp$all$settled$$AllSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;\n    lib$rsvp$all$settled$$AllSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;\n    lib$rsvp$all$settled$$AllSettled.prototype._validationError = function() {\n      return new Error('allSettled must be called with an array');\n    };\n\n    function lib$rsvp$all$settled$$allSettled(entries, label) {\n      return new lib$rsvp$all$settled$$AllSettled(lib$rsvp$promise$$default, entries, label).promise;\n    }\n    var lib$rsvp$all$settled$$default = lib$rsvp$all$settled$$allSettled;\n    function lib$rsvp$all$$all(array, label) {\n      return lib$rsvp$promise$$default.all(array, label);\n    }\n    var lib$rsvp$all$$default = lib$rsvp$all$$all;\n    var lib$rsvp$asap$$len = 0;\n    var lib$rsvp$asap$$toString = {}.toString;\n    var lib$rsvp$asap$$vertxNext;\n    function lib$rsvp$asap$$asap(callback, arg) {\n      lib$rsvp$asap$$queue[lib$rsvp$asap$$len] = callback;\n      lib$rsvp$asap$$queue[lib$rsvp$asap$$len + 1] = arg;\n      lib$rsvp$asap$$len += 2;\n      if (lib$rsvp$asap$$len === 2) {\n        // If len is 1, that means that we need to schedule an async flush.\n        // If additional callbacks are queued before the queue is flushed, they\n        // will be processed by this flush that we are scheduling.\n        lib$rsvp$asap$$scheduleFlush();\n      }\n    }\n\n    var lib$rsvp$asap$$default = lib$rsvp$asap$$asap;\n\n    var lib$rsvp$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;\n    var lib$rsvp$asap$$browserGlobal = lib$rsvp$asap$$browserWindow || {};\n    var lib$rsvp$asap$$BrowserMutationObserver = lib$rsvp$asap$$browserGlobal.MutationObserver || lib$rsvp$asap$$browserGlobal.WebKitMutationObserver;\n    var lib$rsvp$asap$$isNode = typeof self === 'undefined' &&\n      typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';\n\n    // test for web worker but not in IE10\n    var lib$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&\n      typeof importScripts !== 'undefined' &&\n      typeof MessageChannel !== 'undefined';\n\n    // node\n    function lib$rsvp$asap$$useNextTick() {\n      var nextTick = process.nextTick;\n      // node version 0.10.x displays a deprecation warning when nextTick is used recursively\n      // setImmediate should be used instead instead\n      var version = process.versions.node.match(/^(?:(\\d+)\\.)?(?:(\\d+)\\.)?(\\*|\\d+)$/);\n      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {\n        nextTick = setImmediate;\n      }\n      return function() {\n        nextTick(lib$rsvp$asap$$flush);\n      };\n    }\n\n    // vertx\n    function lib$rsvp$asap$$useVertxTimer() {\n      return function() {\n        lib$rsvp$asap$$vertxNext(lib$rsvp$asap$$flush);\n      };\n    }\n\n    function lib$rsvp$asap$$useMutationObserver() {\n      var iterations = 0;\n      var observer = new lib$rsvp$asap$$BrowserMutationObserver(lib$rsvp$asap$$flush);\n      var node = document.createTextNode('');\n      observer.observe(node, { characterData: true });\n\n      return function() {\n        node.data = (iterations = ++iterations % 2);\n      };\n    }\n\n    // web worker\n    function lib$rsvp$asap$$useMessageChannel() {\n      var channel = new MessageChannel();\n      channel.port1.onmessage = lib$rsvp$asap$$flush;\n      return function () {\n        channel.port2.postMessage(0);\n      };\n    }\n\n    function lib$rsvp$asap$$useSetTimeout() {\n      return function() {\n        setTimeout(lib$rsvp$asap$$flush, 1);\n      };\n    }\n\n    var lib$rsvp$asap$$queue = new Array(1000);\n    function lib$rsvp$asap$$flush() {\n      for (var i = 0; i < lib$rsvp$asap$$len; i+=2) {\n        var callback = lib$rsvp$asap$$queue[i];\n        var arg = lib$rsvp$asap$$queue[i+1];\n\n        callback(arg);\n\n        lib$rsvp$asap$$queue[i] = undefined;\n        lib$rsvp$asap$$queue[i+1] = undefined;\n      }\n\n      lib$rsvp$asap$$len = 0;\n    }\n\n    function lib$rsvp$asap$$attemptVertex() {\n      try {\n        var r = require;\n        var vertx = r('vertx');\n        lib$rsvp$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;\n        return lib$rsvp$asap$$useVertxTimer();\n      } catch(e) {\n        return lib$rsvp$asap$$useSetTimeout();\n      }\n    }\n\n    var lib$rsvp$asap$$scheduleFlush;\n    // Decide what async method to use to triggering processing of queued callbacks:\n    if (lib$rsvp$asap$$isNode) {\n      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useNextTick();\n    } else if (lib$rsvp$asap$$BrowserMutationObserver) {\n      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMutationObserver();\n    } else if (lib$rsvp$asap$$isWorker) {\n      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMessageChannel();\n    } else if (lib$rsvp$asap$$browserWindow === undefined && typeof require === 'function') {\n      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$attemptVertex();\n    } else {\n      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useSetTimeout();\n    }\n    function lib$rsvp$defer$$defer(label) {\n      var deferred = {};\n\n      deferred['promise'] = new lib$rsvp$promise$$default(function(resolve, reject) {\n        deferred['resolve'] = resolve;\n        deferred['reject'] = reject;\n      }, label);\n\n      return deferred;\n    }\n    var lib$rsvp$defer$$default = lib$rsvp$defer$$defer;\n    function lib$rsvp$filter$$filter(promises, filterFn, label) {\n      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {\n        if (!lib$rsvp$utils$$isFunction(filterFn)) {\n          throw new TypeError(\"You must pass a function as filter's second argument.\");\n        }\n\n        var length = values.length;\n        var filtered = new Array(length);\n\n        for (var i = 0; i < length; i++) {\n          filtered[i] = filterFn(values[i]);\n        }\n\n        return lib$rsvp$promise$$default.all(filtered, label).then(function(filtered) {\n          var results = new Array(length);\n          var newLength = 0;\n\n          for (var i = 0; i < length; i++) {\n            if (filtered[i]) {\n              results[newLength] = values[i];\n              newLength++;\n            }\n          }\n\n          results.length = newLength;\n\n          return results;\n        });\n      });\n    }\n    var lib$rsvp$filter$$default = lib$rsvp$filter$$filter;\n\n    function lib$rsvp$promise$hash$$PromiseHash(Constructor, object, label) {\n      this._superConstructor(Constructor, object, true, label);\n    }\n\n    var lib$rsvp$promise$hash$$default = lib$rsvp$promise$hash$$PromiseHash;\n\n    lib$rsvp$promise$hash$$PromiseHash.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);\n    lib$rsvp$promise$hash$$PromiseHash.prototype._superConstructor = lib$rsvp$enumerator$$default;\n    lib$rsvp$promise$hash$$PromiseHash.prototype._init = function() {\n      this._result = {};\n    };\n\n    lib$rsvp$promise$hash$$PromiseHash.prototype._validateInput = function(input) {\n      return input && typeof input === 'object';\n    };\n\n    lib$rsvp$promise$hash$$PromiseHash.prototype._validationError = function() {\n      return new Error('Promise.hash must be called with an object');\n    };\n\n    lib$rsvp$promise$hash$$PromiseHash.prototype._enumerate = function() {\n      var enumerator = this;\n      var promise    = enumerator.promise;\n      var input      = enumerator._input;\n      var results    = [];\n\n      for (var key in input) {\n        if (promise._state === lib$rsvp$$internal$$PENDING && Object.prototype.hasOwnProperty.call(input, key)) {\n          results.push({\n            position: key,\n            entry: input[key]\n          });\n        }\n      }\n\n      var length = results.length;\n      enumerator._remaining = length;\n      var result;\n\n      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {\n        result = results[i];\n        enumerator._eachEntry(result.entry, result.position);\n      }\n    };\n\n    function lib$rsvp$hash$settled$$HashSettled(Constructor, object, label) {\n      this._superConstructor(Constructor, object, false, label);\n    }\n\n    lib$rsvp$hash$settled$$HashSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$promise$hash$$default.prototype);\n    lib$rsvp$hash$settled$$HashSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;\n    lib$rsvp$hash$settled$$HashSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;\n\n    lib$rsvp$hash$settled$$HashSettled.prototype._validationError = function() {\n      return new Error('hashSettled must be called with an object');\n    };\n\n    function lib$rsvp$hash$settled$$hashSettled(object, label) {\n      return new lib$rsvp$hash$settled$$HashSettled(lib$rsvp$promise$$default, object, label).promise;\n    }\n    var lib$rsvp$hash$settled$$default = lib$rsvp$hash$settled$$hashSettled;\n    function lib$rsvp$hash$$hash(object, label) {\n      return new lib$rsvp$promise$hash$$default(lib$rsvp$promise$$default, object, label).promise;\n    }\n    var lib$rsvp$hash$$default = lib$rsvp$hash$$hash;\n    function lib$rsvp$map$$map(promises, mapFn, label) {\n      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {\n        if (!lib$rsvp$utils$$isFunction(mapFn)) {\n          throw new TypeError(\"You must pass a function as map's second argument.\");\n        }\n\n        var length = values.length;\n        var results = new Array(length);\n\n        for (var i = 0; i < length; i++) {\n          results[i] = mapFn(values[i]);\n        }\n\n        return lib$rsvp$promise$$default.all(results, label);\n      });\n    }\n    var lib$rsvp$map$$default = lib$rsvp$map$$map;\n\n    function lib$rsvp$node$$Result() {\n      this.value = undefined;\n    }\n\n    var lib$rsvp$node$$ERROR = new lib$rsvp$node$$Result();\n    var lib$rsvp$node$$GET_THEN_ERROR = new lib$rsvp$node$$Result();\n\n    function lib$rsvp$node$$getThen(obj) {\n      try {\n       return obj.then;\n      } catch(error) {\n        lib$rsvp$node$$ERROR.value= error;\n        return lib$rsvp$node$$ERROR;\n      }\n    }\n\n\n    function lib$rsvp$node$$tryApply(f, s, a) {\n      try {\n        f.apply(s, a);\n      } catch(error) {\n        lib$rsvp$node$$ERROR.value = error;\n        return lib$rsvp$node$$ERROR;\n      }\n    }\n\n    function lib$rsvp$node$$makeObject(_, argumentNames) {\n      var obj = {};\n      var name;\n      var i;\n      var length = _.length;\n      var args = new Array(length);\n\n      for (var x = 0; x < length; x++) {\n        args[x] = _[x];\n      }\n\n      for (i = 0; i < argumentNames.length; i++) {\n        name = argumentNames[i];\n        obj[name] = args[i + 1];\n      }\n\n      return obj;\n    }\n\n    function lib$rsvp$node$$arrayResult(_) {\n      var length = _.length;\n      var args = new Array(length - 1);\n\n      for (var i = 1; i < length; i++) {\n        args[i - 1] = _[i];\n      }\n\n      return args;\n    }\n\n    function lib$rsvp$node$$wrapThenable(then, promise) {\n      return {\n        then: function(onFulFillment, onRejection) {\n          return then.call(promise, onFulFillment, onRejection);\n        }\n      };\n    }\n\n    function lib$rsvp$node$$denodeify(nodeFunc, options) {\n      var fn = function() {\n        var self = this;\n        var l = arguments.length;\n        var args = new Array(l + 1);\n        var arg;\n        var promiseInput = false;\n\n        for (var i = 0; i < l; ++i) {\n          arg = arguments[i];\n\n          if (!promiseInput) {\n            // TODO: clean this up\n            promiseInput = lib$rsvp$node$$needsPromiseInput(arg);\n            if (promiseInput === lib$rsvp$node$$GET_THEN_ERROR) {\n              var p = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);\n              lib$rsvp$$internal$$reject(p, lib$rsvp$node$$GET_THEN_ERROR.value);\n              return p;\n            } else if (promiseInput && promiseInput !== true) {\n              arg = lib$rsvp$node$$wrapThenable(promiseInput, arg);\n            }\n          }\n          args[i] = arg;\n        }\n\n        var promise = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);\n\n        args[l] = function(err, val) {\n          if (err)\n            lib$rsvp$$internal$$reject(promise, err);\n          else if (options === undefined)\n            lib$rsvp$$internal$$resolve(promise, val);\n          else if (options === true)\n            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$arrayResult(arguments));\n          else if (lib$rsvp$utils$$isArray(options))\n            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$makeObject(arguments, options));\n          else\n            lib$rsvp$$internal$$resolve(promise, val);\n        };\n\n        if (promiseInput) {\n          return lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);\n        } else {\n          return lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);\n        }\n      };\n\n      fn.__proto__ = nodeFunc;\n\n      return fn;\n    }\n\n    var lib$rsvp$node$$default = lib$rsvp$node$$denodeify;\n\n    function lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {\n      var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);\n      if (result === lib$rsvp$node$$ERROR) {\n        lib$rsvp$$internal$$reject(promise, result.value);\n      }\n      return promise;\n    }\n\n    function lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self){\n      return lib$rsvp$promise$$default.all(args).then(function(args){\n        var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);\n        if (result === lib$rsvp$node$$ERROR) {\n          lib$rsvp$$internal$$reject(promise, result.value);\n        }\n        return promise;\n      });\n    }\n\n    function lib$rsvp$node$$needsPromiseInput(arg) {\n      if (arg && typeof arg === 'object') {\n        if (arg.constructor === lib$rsvp$promise$$default) {\n          return true;\n        } else {\n          return lib$rsvp$node$$getThen(arg);\n        }\n      } else {\n        return false;\n      }\n    }\n    var lib$rsvp$platform$$platform;\n\n    /* global self */\n    if (typeof self === 'object') {\n      lib$rsvp$platform$$platform = self;\n\n    /* global global */\n    } else if (typeof global === 'object') {\n      lib$rsvp$platform$$platform = global;\n    } else {\n      throw new Error('no global: `self` or `global` found');\n    }\n\n    var lib$rsvp$platform$$default = lib$rsvp$platform$$platform;\n    function lib$rsvp$race$$race(array, label) {\n      return lib$rsvp$promise$$default.race(array, label);\n    }\n    var lib$rsvp$race$$default = lib$rsvp$race$$race;\n    function lib$rsvp$reject$$reject(reason, label) {\n      return lib$rsvp$promise$$default.reject(reason, label);\n    }\n    var lib$rsvp$reject$$default = lib$rsvp$reject$$reject;\n    function lib$rsvp$resolve$$resolve(value, label) {\n      return lib$rsvp$promise$$default.resolve(value, label);\n    }\n    var lib$rsvp$resolve$$default = lib$rsvp$resolve$$resolve;\n    function lib$rsvp$rethrow$$rethrow(reason) {\n      setTimeout(function() {\n        throw reason;\n      });\n      throw reason;\n    }\n    var lib$rsvp$rethrow$$default = lib$rsvp$rethrow$$rethrow;\n\n    // defaults\n    lib$rsvp$config$$config.async = lib$rsvp$asap$$default;\n    lib$rsvp$config$$config.after = function(cb) {\n      setTimeout(cb, 0);\n    };\n    var lib$rsvp$$cast = lib$rsvp$resolve$$default;\n    function lib$rsvp$$async(callback, arg) {\n      lib$rsvp$config$$config.async(callback, arg);\n    }\n\n    function lib$rsvp$$on() {\n      lib$rsvp$config$$config['on'].apply(lib$rsvp$config$$config, arguments);\n    }\n\n    function lib$rsvp$$off() {\n      lib$rsvp$config$$config['off'].apply(lib$rsvp$config$$config, arguments);\n    }\n\n    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`\n    if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {\n      var lib$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];\n      lib$rsvp$config$$configure('instrument', true);\n      for (var lib$rsvp$$eventName in lib$rsvp$$callbacks) {\n        if (lib$rsvp$$callbacks.hasOwnProperty(lib$rsvp$$eventName)) {\n          lib$rsvp$$on(lib$rsvp$$eventName, lib$rsvp$$callbacks[lib$rsvp$$eventName]);\n        }\n      }\n    }\n\n    var lib$rsvp$umd$$RSVP = {\n      'race': lib$rsvp$race$$default,\n      'Promise': lib$rsvp$promise$$default,\n      'allSettled': lib$rsvp$all$settled$$default,\n      'hash': lib$rsvp$hash$$default,\n      'hashSettled': lib$rsvp$hash$settled$$default,\n      'denodeify': lib$rsvp$node$$default,\n      'on': lib$rsvp$$on,\n      'off': lib$rsvp$$off,\n      'map': lib$rsvp$map$$default,\n      'filter': lib$rsvp$filter$$default,\n      'resolve': lib$rsvp$resolve$$default,\n      'reject': lib$rsvp$reject$$default,\n      'all': lib$rsvp$all$$default,\n      'rethrow': lib$rsvp$rethrow$$default,\n      'defer': lib$rsvp$defer$$default,\n      'EventTarget': lib$rsvp$events$$default,\n      'configure': lib$rsvp$config$$configure,\n      'async': lib$rsvp$$async\n    };\n\n    /* global define:true module:true window: true */\n    if (typeof define === 'function' && define['amd']) {\n      define(function() { return lib$rsvp$umd$$RSVP; });\n    } else if (typeof module !== 'undefined' && module['exports']) {\n      module['exports'] = lib$rsvp$umd$$RSVP;\n    } else if (typeof lib$rsvp$platform$$default !== 'undefined') {\n      lib$rsvp$platform$$default['RSVP'] = lib$rsvp$umd$$RSVP;\n    }\n}).call(this);\n\n"],"names":[],"mappings":"AAAA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;AC5XA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;AACA;;;;;","file":"polyfills.js"}//# sourceMappingURL=buy-button-sdk.polyfilled.common.map