const { assert } = require('chai');

const findRegions = require('helpers/find-regions');
const {
	assertCorrectBody,
	assertErrorBody,
	assertCorrectItems,
	assertCorrectStatusCode
} = require('helpers/custom-assertions');

const httpStatuses = require('constants/http-statuses');

describe('проверка параметра "page_size"', () => {
	// tests data
	const DEFAULT_VALUE = 15;
    
	const VALID_VALUES = {
		values: [ 5, 10, 15 ],
		expectedStatusCode: httpStatuses.OK
	};

	const INVALID_TYPES_VALUES = {
		values: [ 'true', 'false', 'null', '!,', '\'', 0.5 ],
		expectedErrorMessage: 'Параметр \'page_size\' должен быть целым числом',
		expectedStatusCode: httpStatuses.BAD_REQUEST
	};

	const INVALID_NUMBER_VALUES = {
		values: [ -99999999, -1, 0, 20, 99999999 ],
		expectedErrorMessage: 'Параметр \'page_size\' может быть одним из следующих значений: 5, 10, 15',
		expectedStatusCode: httpStatuses.BAD_REQUEST
	};

	// tests
	it(`проверка значения по умолчанию: ${DEFAULT_VALUE}`, async () => {
		// arrange
		const queryParams = {};

		// act
		const { body, statusCode } = await findRegions(queryParams);
		const itemsSize = body.items.length;

		// assert
		assertCorrectBody(body);
		assertCorrectItems(body.items);

		assert.equal(itemsSize, DEFAULT_VALUE);
		assertCorrectStatusCode(statusCode, httpStatuses.OK);
	});

	VALID_VALUES.values.forEach(value => {
		it(`проверка валидного значения: ${value}`, async () => {
			// arrange
			const queryParams = { page_size: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);
			const itemsSize = body.items.length;

			// assert
			assertCorrectStatusCode(statusCode, VALID_VALUES.expectedStatusCode);
			assertCorrectItems(body.items);
			assert.equal(itemsSize, value);
		});
	});

	INVALID_NUMBER_VALUES.values.forEach(value => {
		it(`проверка некорректного числового значения: ${value}`, async () => {
			// arrange
			const queryParams = { page_size: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);
            
			// assert
			assertCorrectStatusCode(statusCode, INVALID_TYPES_VALUES.expectedStatusCode);
			assertErrorBody(body, INVALID_NUMBER_VALUES.expectedErrorMessage);
		});
	});

	INVALID_TYPES_VALUES.values.forEach(value => {
		it(`проверка некорректного нечислового значения: ${value}`, async () => {
			// arrange
			const queryParams = { page_size: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);

			// assert
			assertCorrectStatusCode(statusCode, INVALID_TYPES_VALUES.expectedStatusCode);
			assertErrorBody(body, INVALID_TYPES_VALUES.expectedErrorMessage);
		});
	});
});
