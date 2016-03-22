function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);

  error.status = response.status;
  error.response = response;
  throw error;
}

function parseResponse(response) {
  return response.json()
    .then(json => {
      return { json, originalResponse: response, isJSON: true };
    })
    .catch(() => {
      const responseClone = response.clone();

      return responseClone.text().then(text => {
        return { text, originalResponse: responseClone, isText: true };
      });
    });
}

function ieFallback(method, url, opts) {
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

    xdr.open(method, url);
    xdr.send(opts.data);
  });
}

export default function ajax(method, url, opts = {}) {
  if (window.XDomainRequest) {
    return ieFallback(...arguments);
  }

  opts.method = method;
  opts.mode = 'cors';

  return fetch(url, opts)
    .then(checkStatus)
    .then(parseResponse);
}
