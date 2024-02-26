// Delete Orhpan Entities
//
// This hooks deletes all orphan entities in O2O relationships (Deletes files created directly through the collection which
// isn't intended) and M2M collections (for the jackasses that create random entities in the junction table).
//
// This script runs everyday at 3AM.
//

import { defineHook } from '@directus/extensions-sdk';

interface KeyStringObject {
	[key: string]: string;
}

// Syntax:
//     collection_name: field_to_be_checked
const COLLECTIONS_TO_CLEAN: KeyStringObject = {
	note_data: 'related_resource',
	exam_data: 'related_resource',
	resource_files: 'resource_id',
	course_category: 'course_id',
};

export default defineHook(({ schedule }, { getSchema, database, services, logger }) => {
	const { ItemsService } = services;

	schedule('0 3 * * *', async () => {
		logger.info('Cleaning orhpan entities!');

		Object.keys(COLLECTIONS_TO_CLEAN).forEach(async (collectionName: string) => {
			const colItemsService = new ItemsService(collectionName, { database: database, schema: await getSchema() });

			colItemsService.deleteByQuery({
				filter: {
					[COLLECTIONS_TO_CLEAN[collectionName] as string]: {
						_null: true,
					},
				},
				limit: -1,
			});
		});
	});
});
