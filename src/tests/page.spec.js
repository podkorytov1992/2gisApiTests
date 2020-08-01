const { assert, expect } = require('chai');

const findRegions = require('helpers/find-regions');

const {
	assertCorrectBody,
	assertErrorBody,
	assertCorrectItems,
	assertCorrectStatusCode
} = require('helpers/custom-assertions');

const httpStatuses = require('constants/http-statuses');

describe('проверка параметра "page"', () => {
	// tests data
	const DEFAULT_VALUE = 1;
    
	const PAGE_SIZE_VALUES = {
		values: [ 5, 10, 15 ],
		expectedStatusCode: httpStatuses.OK
	};

	const INVALID_TYPES_VALUES = {
		values: [ 'true', 'false', 'null', '!,', '\'', '0.5', '-0.5', '-0,5' ],
		expectedErrorMessage: 'Параметр \'page\' должен быть целым числом',
		expectedStatusCode: httpStatuses.BAD_REQUEST
	};

	const INVALID_NUMBER_VALUES = {
		values: [ '-999999999999999999999999', -1, 0 ],
		expectedErrorMessage: 'Параметр \'page\' должен быть больше 0',
		expectedStatusCode: httpStatuses.BAD_REQUEST
	};

	// tests
	it('проверка большого значения page', async () => {
		// arrange
		const queryParams = { page: 1000000 };

		// act
		const { body, statusCode } = await findRegions(queryParams);

		// assert
		assertCorrectStatusCode(statusCode, httpStatuses.OK);
		assertCorrectBody(body);
		assert.isEmpty(body.items);
	});

	it(`проверка значения по умолчанию: ${DEFAULT_VALUE}`, async () => {
		// arrange
		const emptyQueryParams = {};
		const queryParams = { page: DEFAULT_VALUE };

		// act
		const { body: bodyWithoutQueryParams } = await findRegions(emptyQueryParams);
		const { body } = await findRegions(queryParams);

		// assert
		assert.deepEqual(body, bodyWithoutQueryParams);
	});

	PAGE_SIZE_VALUES.values.forEach(pageSize => {
		it(`проверка пагинации со значением page_size: ${pageSize}`, async () => {
			// arrange
			const firstTestQueryParams = { page: 1, page_size: pageSize };
			const secontTestQueryParams = { page: 2, page_size: pageSize };
		
			// act
			const firstResponse = await findRegions(firstTestQueryParams);
			const firstBody = firstResponse.body;
		
			const secondResponse = await findRegions(secontTestQueryParams);
			const secondBody = secondResponse.body;

			const firstItemsIds = firstBody.items.map(item => item.id);
			const secondItemsIds = secondBody.items.map(item => item.id);

			const intersectionItemsIds = firstItemsIds.filter(x => secondItemsIds.includes(x));

			// assert
			assertCorrectStatusCode(firstResponse.statusCode, httpStatuses.OK);
			assertCorrectStatusCode(secondResponse.statusCode, httpStatuses.OK);

			assertCorrectBody(firstBody);
			assertCorrectBody(secondBody);

			assert.isEmpty(intersectionItemsIds, `Регионы с id =[${intersectionItemsIds}] дублируются на страницах.`);
		});
	});

	INVALID_NUMBER_VALUES.values.forEach(value => {
		it(`проверка невалидного значения: ${value}`, async () => {
			// arrange
			const queryParams = { page: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);

			// assert
			assertCorrectStatusCode(statusCode, INVALID_NUMBER_VALUES.expectedStatusCode);
			assertErrorBody(body, INVALID_NUMBER_VALUES.expectedErrorMessage);
		});
	});

	INVALID_TYPES_VALUES.values.forEach(value => {
		it(`проверка некорректного нечислового значения: ${value}`, async () => {
			// arrange
			const queryParams = { page: value };

			// act
			const { body, statusCode } = await findRegions(queryParams);

			// assert
			assertCorrectStatusCode(statusCode, INVALID_TYPES_VALUES.expectedStatusCode);
			assertErrorBody(body, INVALID_TYPES_VALUES.expectedErrorMessage);
		});
	});
});
