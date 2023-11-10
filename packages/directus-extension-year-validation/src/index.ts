// Year Validation
//
// This hook validates the year field in the resource collection to ensure
// that it's less than or equal to the current year.
//

import { defineHook } from '@directus/extensions-sdk';
import { createError } from '@directus/errors';

interface KeyStringObject {
	[key: string]: string;
}

const COLLECTIONS: KeyStringObject = {
	resource: 'year',
};

const invalidPayloadError = createError('INVALID_PAYLOAD_ERROR', 'Year must be valid.', 500);

const handler = (payload: any, { collection }): unknown => {
	const yearFieldName = COLLECTIONS[collection];

	if (yearFieldName && payload[yearFieldName] > new Date().getFullYear()) {
		throw new invalidPayloadError();
	}

	return payload;
};

export default defineHook(({ filter }) => {
	Object.keys(COLLECTIONS).forEach((collectionName) => {
		filter(`${collectionName}.items.create`, handler);
		filter(`${collectionName}.items.update`, handler);
	});
});
