require('isomorphic-fetch');

const { stringify } = require('query-string');

const BASE_URL = 'https://regions-test.2gis.com/1.0/regions';

module.exports = async (queryParams) => {
	const res = await fetch(`${BASE_URL}?${stringify(queryParams)}`);
	const body = await res.json();

	return {
		body,
		statusCode: res.status
	};
};
