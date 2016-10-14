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

  /* eslint newline-before-return: 0 */
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

    function handleError(error) {
      // we should be calling reject but in browsers below ie9 it is better to do console.error
      reject(`There was an error with the XDR\n${JSON.stringify(error, null, '  ')}`);
    }

    xdr.onerror = handleError;
    xdr.ontimeout = handleError;

    try {
      xdr.open(method, authToUrl(url, opts));
      xdr.send(opts.data);
    } catch (error) {
      // using trim because the error message has a bunch of white space for some reason
      if (error.message.trim() === 'Access is denied.') {
        reject('Please ensure Shopify JavaScript Buy SDK is run over https');
      } else {
        reject(`There was an error when running XDR\n${error.message}`);
      }
    }
  });
}

export default ie9Ajax;
