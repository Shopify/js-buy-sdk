function authToUrl(url, opts) {
  let authorization;

  if (opts.headers) {
    Object.keys(opts.headers).forEach(key => {
      if (key.toLowerCase() === 'authorization') {
        authorization = opts.headers[key];
      }
    });
  }

  if (authorization) {
    const hashedKey = authorization.split(' ').slice(-1)[0];

    try {
      const plainKey = atob(hashedKey);

      let newUrl;

      if (url.indexOf('?') > -1) {
        newUrl = `${url}&_x_http_authorization=${plainKey}`;
      } else {
        newUrl = `${url}?_x_http_authorization=${plainKey}`;
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

  return url;
}

function ie9Ajax(method, url, opts) {
  return new Promise(function (resolve, reject) {
    const xdr = new XDomainRequest();

    xdr.onload = function () {
      try {
        const json = JSON.parse(xdr.responseText);

        resolve({ json, originalResponse: xdr, isJSON: true });
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

export default ie9Ajax;
