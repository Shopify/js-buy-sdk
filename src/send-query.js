import ajax from './ajax';

export default function sendQuery(query, config) {
  const url = `https://${config.domain}/api/graph`;
  const headers = {
    authorization: `Basic ${btoa(config.apiKey)}`,
    'content-type': 'application/json'
  };
  const body = JSON.stringify({ query });

  return ajax('post', url, { body, headers });
}
