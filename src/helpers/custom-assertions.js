const { assert } = require('chai');

const ERROR_ID_REGEXP = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/;
const TOTAL = 22;

module.exports = {
	assertErrorBody: (json, expectedErrorMessage) => {
		assert.hasAllDeepKeys(json, 'error');
		assert.hasAllDeepKeys(json.error, [ 'id', 'message' ]);

		assert.match(json.error.id, ERROR_ID_REGEXP);

		assert.typeOf(json.error.message, 'string');

		const actualErrorMessage = json.error.message;
		assert.equal(actualErrorMessage, expectedErrorMessage);
	},

	assertCorrectBody: (json) => {
		assert.hasAllDeepKeys(json, [ 'total', 'items' ]);
        
		assert.strictEqual(json.total, TOTAL);

		assert.typeOf(json.items, 'array');
		assert.typeOf(json.total, 'number');
	},

	assertCorrectItems: (items) => {
		items.forEach(item => {
			assert.hasAllDeepKeys(item, [ 'id', 'name', 'code', 'country' ]);
			assert.hasAllDeepKeys(item.country, [ 'name', 'code' ]);
    
			assert.typeOf(item.id, 'number');
			assert.typeOf(item.name, 'string');
			assert.typeOf(item.code, 'string');
			assert.typeOf(item.country.name, 'string');
			assert.typeOf(item.country.code, 'string');
		});
	},

	assertCorrectStatusCode: (actualStatusCode, expectedStatusCode) => {
		assert.equal(
			actualStatusCode,
			expectedStatusCode,
			`HTTP-статус ответа от сервера должен быть ${expectedStatusCode}`
		);
	}
};
