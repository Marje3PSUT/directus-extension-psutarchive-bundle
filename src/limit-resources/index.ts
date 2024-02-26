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
	filter('resource.items.create', async (items: any, meta, { accountability }) => {
		const { ItemsService } = services;
		const schema = await getSchema();

		const ResourceItemService = new ItemsService('resource', { database: database, schema: schema });

		const resourceEntities: Entity[] = await ResourceItemService.readByQuery({
			filter: {
				user_created: {
					_eq: accountability?.user,
				},
			},
			limit: -1,
		});

		logger.info(accountability?.role);

		if (resourceEntities.length >= 10) throw new ResourceLimitError();
	});
});
