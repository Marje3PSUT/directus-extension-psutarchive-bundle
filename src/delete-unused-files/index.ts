// Delete Unused Files
//
// This hook deletes all files entities that aren't associated with
//  a resource entity (contained within the resource_files folder).
//
// This hook runs every Sunday at 3AM
//

import { defineHook } from '@directus/extensions-sdk';

interface Entity {
	id: number;
}

export default defineHook(({ schedule }, { services, database, getSchema, logger }) => {
	const { FilesService, ItemsService } = services;

	schedule('0 3 * * 0', async () => {
		logger.info('Deleting orhpan files!');

		const schema = await getSchema();

		// Get id of 'resource_files' folder
		const foldersItemsService = new ItemsService('directus_folders', { database: database, schema: schema });

		const folderEntity: Entity[] = await foldersItemsService.readByQuery({
			filter: {
				name: {
					_eq: 'resource_files',
				},
			},
			limit: -1,
		});

		// Get orphan file ids
		const fileItemsService = new ItemsService('directus_files', { database: database, schema: schema });

		const orphanFileEntities: Entity[] = await fileItemsService.readByQuery({
			filter: {
				_and: [
					{
						associated_resources: {
							_null: true,
						},
					},
					{
						folder: folderEntity[0]?.id,
					},
				],
			},
		});

		const orphanFileIds = orphanFileEntities.map((entity) => entity.id);

		// Delete orphan files by id
		const resFilesService = new FilesService({ knex: database, schema: schema });
		await resFilesService.deleteMany(orphanFileIds);
	});
});
