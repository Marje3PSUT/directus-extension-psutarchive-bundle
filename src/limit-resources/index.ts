// Limit resources
//
// This hook checks if the user has 10 or more unverified resources
// upon creating a resource. If they do, then an descriptive error will
// show up for them.
//

import { defineHook } from '@directus/extensions-sdk';
import { createError } from '@directus/errors';

interface Entity {
	id: number;
}

const ResourceLimitError = createError(
	'RESOURCE_LIMIT_ERROR',
	"You can't submit resources if you have 10 or more unverified resources pending.",
	500
);

export default defineHook(({ filter }, { services, database, getSchema, logger }) => {
	const { ItemsService } = services;

	filter('resource.items.create', async (items: any, meta, { accountability }) => {
		if (accountability?.user) {
			const schema = await getSchema();

			const resourceItemService = new ItemsService('resource', { database: database, schema: schema });

			const resourceEntities: Entity[] = await resourceItemService.readByQuery({
				filter: {
					user_created: {
						_eq: accountability.user,
					},
				},
				limit: -1,
			});

			if (resourceEntities.length >= 10) throw new ResourceLimitError();
		}
	});
});
