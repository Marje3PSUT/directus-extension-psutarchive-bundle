// Limit total upload
//
// This hook limit the total size of files uploaded by contributers
// to 50mbs per day (set MAX_PAYLOAD_SIZE per upload as env variable
// as well)
//

import { defineHook } from '@directus/extensions-sdk';
//import { createError } from '@directus/errors';

import { CONTRIBUTOR_ROLE_NAME, MAX_UPLOAD_COUNT_DAY, MAX_UPLOAD_SIZE_DAY } from '../utils/constants';
/*
const maxUploadError = createError(
	'MAX_UPLOAD_ERROR',
	"You've reached your maximum quota of uploaded files for the day! Please try again tomorrow.",
	500
);
*/
export default defineHook(({ action, filter }, { services }) => {
	const { ItemsService, FilesService } = services;

	/* Directus doesn't allow for the creation of resources with null/empty
	// files entries (as a result form the files.upload action handler
	// deleting them), so these hooks are redundant for now.

	const resourceFilterHandler = async (payload: any, meta, { schema, database, accountability }) => {
		if (!(payload?.files?.create.length > 0)) return;

		const uploadedFilesLastDay = await getUploadedFilesLastDay(schema, database, accountability);

		if (
			uploadedFilesLastDay.length > MAX_UPLOAD_COUNT_DAY ||
			uploadedFilesLastDay.reduce((result, file) => (result += parseInt(file.filesize)), 0) / 2 ** 20 >= MAX_UPLOAD_SIZE_DAY
		)
			throw new maxUploadError();
	};

	filter('resource.items.create', resourceFilterHandler);

	filter('resource.items.update', resourceFilterHandler);

	*/

	action('files.upload', async ({ key }, { schema, database, accountability }) => {
		const filesService = new FilesService({ schema, knex: database, accountability });

		const uploadedFilesLastDay = await getUploadedFilesLastDay(schema, database, accountability);

		if (
			uploadedFilesLastDay.length > MAX_UPLOAD_COUNT_DAY ||
			uploadedFilesLastDay.reduce((result, file) => (result += parseInt(file.filesize)), 0) / 2 ** 20 >=
				MAX_UPLOAD_SIZE_DAY
		)
			await filesService.deleteOne(key);
	});

	const getUploadedFilesLastDay = async (schema, database, accountability): Promise<any[]> => {
		if (!accountability) return [];

		const userItemsService = new ItemsService('directus_users', { database, schema });
		const fileItemsService = new ItemsService('directus_files', { database, schema });

		const userEntity = await userItemsService.readOne(accountability.user, { fields: ['role.name'] });

		if (userEntity.role.name != CONTRIBUTOR_ROLE_NAME) return [];

		const date = new Date();
		date.setHours(0, 0, 0, 0);

		return await fileItemsService.readByQuery({
			fields: ['filesize'],
			filter: {
				uploaded_by: {
					_eq: accountability.user,
				},

				uploaded_on: {
					_gte: date,
				},
			},
			limit: -1,
		});
	};
});
