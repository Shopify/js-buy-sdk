export function fixtureWithHeaders(fixture) {
  return {
    headers: {
      'Content-Type': 'application/json'
    },
    body: fixture
  };
}

export default function fetchMockPostOnce(fetchMock, apiUrl, fixture) {
  fetchMock.postOnce(apiUrl, fixtureWithHeaders(fixture));
}
