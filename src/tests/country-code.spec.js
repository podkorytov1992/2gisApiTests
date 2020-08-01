const { assert } = require('chai');

const findRegions = require('helpers/find-regions');
const {
	assertCorrectBody,
	assertErrorBody,
	assertCorrectItems,
	assertCorrectStatusCode
} = require('helpers/custom-assertions');

const httpStatuses = require('constants/http-statuses');

describe('проверка параметра "country_code"', () => {
	// tests data
	const VALID_VALUES = {
		values: [ 'ru', 'kg', 'kz', 'cz' ],
		expectedStatusCode: httpStatuses.OK
	};

	const INVALID_VALUES = {
		values: [ 0, -1, 'KG', 'adasdasdad', false, 'ua' ],
		expectedErrorMessage: 'Параметр \'country_code\' может быть одним из следующих значений: ru, kg, kz, cz',
		expectedStatusCode: httpStatuses.BAD_REQUEST
	};

	// tests
	VALID_VALUES.values.forEach(value => {
		it(`проверка валидного значения: ${value}`, async () => {
			// arrange
			const queryParams = { country_code: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);

			// assert
			assertCorrectStatusCode(statusCode, VALID_VALUES.expectedStatusCode);
			assertCorrectBody(body);
			assertCorrectItems(body.items);

			body.items.forEach(item => {
				assert.equal(item.country.code, value);
			});
		});
	});

	INVALID_VALUES.values.forEach(value => {
		it(`проверка невалидного значения: ${value}`, async () => {
			// arrange
			const queryParams = { country_code: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);

			// assert
			assertErrorBody(body, INVALID_VALUES.expectedErrorMessage);
			assertCorrectStatusCode(statusCode, INVALID_VALUES.expectedStatusCode);
		});
	});
});
