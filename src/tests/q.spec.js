const { assert } = require('chai');

const findRegions = require('helpers/find-regions');
const {
	assertCorrectBody,
	assertErrorBody,
	assertCorrectItems,
	assertCorrectStatusCode
} = require('helpers/custom-assertions');

const httpStatuses = require('constants/http-statuses');

describe('проверка параметра "q"', () => {
	// tests data
	const VALID_VALUES = {
		values: [ 'НОв', 'СТАН', 'бишкек', 'ть-', 'Нижний Новгород', 'восток', 'АКТАУ', 'к-К', 'й Н' ],
		expectedStatusCode: httpStatuses.OK
	};

	const VALID_VALUES_FOR_EMPTY_ITEMS = {
		values: [ 'Moskva', 'Новоновосибибирск', 123, false, true, '!!\'' ],
		expectedStatusCode: httpStatuses.OK
	};

	const INVALID_SHORT_VALUES = {
		values: [ '', 'н', 'ст' ],
		expectedErrorMessage: 'Параметр \'q\' должен быть не менее 3 символов',
		expectedStatusCode: httpStatuses.BAD_REQUEST
	};

	const INVALID_LONG_VALUE = {
		value: 'НовосибирскНовосибирскНовосибирскНовосибирск',
		expectedErrorMessage: 'Параметр \'q\' должен быть не более 30 символов',
		expectedStatusCode: httpStatuses.BAD_REQUEST
	};

	// tests
	VALID_VALUES_FOR_EMPTY_ITEMS.values.forEach(value => {
		it(`проверка валидного значения на пустую выдачу: ${value}`, async () => {
			// arrange
			const queryParams = { q: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);

			// assert
			assertCorrectStatusCode(statusCode, VALID_VALUES_FOR_EMPTY_ITEMS.expectedStatusCode);
			assertCorrectBody(body);
			assert.isEmpty(body.items);
		});
	});

	VALID_VALUES.values.forEach(value => {
		it(`проверка валидного значения: "${value}"`, async () => {
			// arrange
			const queryParams = { q: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);
            
			// assert
			assertCorrectStatusCode(statusCode, VALID_VALUES.expectedStatusCode);
			assertCorrectBody(body);
			assertCorrectItems(body.items);

			body.items.forEach(item => {
				assert.include(item.name.toLowerCase(), value.toLowerCase());
			});
		});
	});

	INVALID_SHORT_VALUES.values.forEach(value => {
		it(`проверка невалидного значения менee 3 символов: "${value}"`, async () => {
			// arrange
			const queryParams = { q: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);

			// assert
			assertCorrectStatusCode(statusCode, INVALID_SHORT_VALUES.expectedStatusCode);
			assertErrorBody(body, INVALID_SHORT_VALUES.expectedErrorMessage);
		});
	});

	it('проверка значения длиной > 30', async () => {
		// arrange
		const queryParams = { q: INVALID_LONG_VALUE.value };
        
		// act
		const { body, statusCode } = await findRegions(queryParams);

		// assert
		assertCorrectStatusCode(statusCode, INVALID_LONG_VALUE.expectedStatusCode);
		assertErrorBody(body, INVALID_LONG_VALUE.expectedErrorMessage);
	});

	it('проверка игнорирования всех других параметров при указанном q', async () => {
		// arrange
		const queryParamsOnlyQ = { q: VALID_VALUES.values[0] };

		const combineQueries = [
			{ ...queryParamsOnlyQ, page_size: -1 },
			{ ...queryParamsOnlyQ, country_code: 'cz' },
			{ ...queryParamsOnlyQ, page: 10 },
			{ ...queryParamsOnlyQ, page: 20, country_code: 'asdasd', page_size: 11 }
		];

		// act
		const { body: expectedbody } = await findRegions(queryParamsOnlyQ);

		const responses = await Promise.all(
			combineQueries.map(query => findRegions(query))
		);

		// assert
		assertCorrectItems(expectedbody.items);

		responses.forEach(response => {
			assertCorrectStatusCode(response.statusCode, httpStatuses.OK);
			assert.deepEqual(expectedbody, response.body);
		});
	});
});
