import fetch from 'fetch';

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
      return { json, response, isJSON: true };
    })
    .catch(() => {
      const responseClone = response.clone();

      return responseClone.text().then(text => {
        return { text, response: responseClone, isText: true };
      });
    });
}

export default function ajax(method, url, opts = {}) {
  opts.method = method;

  return fetch(url, opts)
    .then(checkStatus)
    .then(parseResponse);
}
