import ie9Ajax from './ie9-ajax';

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
  return response.json().then(json => {
    return { json, originalResponse: response, isJSON: true };
  }).catch(() => {
    const responseClone = response.clone();

    return responseClone.text().then(text => {
      return { text, originalResponse: responseClone, isText: true };
    });
  });
}

export default function ajax(method, url, opts = {}) {
  const xhr = new XMLHttpRequest();

  if (!('withCredentials' in xhr)) {
    return ie9Ajax(...arguments);
  }

  opts.method = method;
  opts.mode = 'cors';

  return fetch(url, opts)
    .then(checkStatus)
    .then(parseResponse);
}
