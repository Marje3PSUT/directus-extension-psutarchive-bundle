// Slug
//
// This hook adds a slug field to the specified collections after each save
// and update.
//

import { defineHook } from '@directus/extensions-sdk';
import slugify from '@sindresorhus/slugify';

interface KeyStringObject {
	[key: string]: string;
}

const COLLECTIONS: KeyStringObject = {
	category: 'name_en',
};

const handler = (payload: any, { collection }): unknown => {
	const titleFieldName = COLLECTIONS[collection];

	if (titleFieldName && payload[titleFieldName]) {
		const slug = slugify(payload[titleFieldName]);
		return { ...payload, slug };
	}

	return payload;
};

export default defineHook(({ filter }) => {
	Object.keys(COLLECTIONS).forEach((collectionName) => {
		filter(`${collectionName}.items.create`, handler);
		filter(`${collectionName}.items.update`, handler);
	});
});
