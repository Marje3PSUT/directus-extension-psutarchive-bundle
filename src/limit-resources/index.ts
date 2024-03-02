// Limit resources
//
// This hook checks if the user has 10 or more unverified resources
// upon creating a resource. If they do, then a descriptive error will
// show up for them.
//

import { defineHook } from '@directus/extensions-sdk';
import { createError } from '@directus/errors';
import { MAX_UNVERIFIED_RESOURCE_COUNT } from '../utils/constants';

interface Entity {
	id: number;
}

const ResourceLimitError = createError(
	'RESOURCE_LIMIT_ERROR',
	`You can't submit resources if you have ${MAX_UNVERIFIED_RESOURCE_COUNT} or more unverified resources pending.`,
	500
);

export default defineHook(({ filter }, { services, database, getSchema }) => {
	const { ItemsService } = services;

	filter('resource.items.create', async (items: any, meta, { accountability }) => {
		if (accountability?.user) {
			const schema = await getSchema();

			const resourceItemService = new ItemsService('resource', { database: database, schema: schema });

			const resourceEntities: Entity[] = await resourceItemService.readByQuery({
				fields: ['id'],
				filter: {
					user_created: {
						_eq: accountability.user,
					},
					status: {
						_eq: 'verified',
					},
				},
				limit: MAX_UNVERIFIED_RESOURCE_COUNT,
			});

			if (resourceEntities.length >= MAX_UNVERIFIED_RESOURCE_COUNT) throw new ResourceLimitError();
		}
	});
});
