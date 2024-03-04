// Prevent duplicate exams
//
// This hook ensures that no duplicate exams are created, by
// checking if there are other resources that share the same
// course, year, semester and exam type.
//
// For now, this will exclude resources with null semesters,
// and will ignore the existence of exam varients (let someone
// else deal with that)
//

import { defineHook } from '@directus/extensions-sdk';
import _ from 'lodash';

import { createResourceConflictError, createResourceManipulationError } from './errors';
import conflictQuery from './query';
import { VALID_EXAM_TYPES } from '../utils/constants';

export default defineHook(({ filter }, { services, database, getSchema }) => {
	const { ItemsService } = services;

	// Handle updating resources
	// 1. If batch updating, ensure only status is being updated
	// 2. If updating single resource, then find resultant resource by combining the payload with the current resource and check for conflicts
	filter('resource.items.update', async (payload: any, meta) => {
		if (meta.keys.length > 1) {
			const fields = Object.keys(payload);
			if (fields.length != 1 || fields[0] != 'status')
				throw new (createResourceManipulationError(
					"You aren't allowed to batch update resources, unless you only intend to modify the status field!"
				))();
			return;
		}

		const schema = await getSchema();
		const resourceItemService = new ItemsService('resource', { database: database, schema: schema });

		const oldResource = await resourceItemService.readOne(meta.keys[0], {
			fields: ['course', 'semester', 'year', 'type', 'exam_data.type'],
		});

		const mergedResource = _.merge(oldResource, payload);

		if (
			mergedResource.type != 'exam' ||
			!VALID_EXAM_TYPES.includes(mergedResource?.exam_data.type) ||
			!mergedResource.semester
		)
			return;

		const conflictingResources = await resourceItemService.readByQuery(
			_.merge(conflictQuery(mergedResource), { filter: { id: { _neq: meta.keys[0] } } })
		);

		if (conflictingResources.length > 0) throw new (createResourceConflictError(conflictingResources))();
	});

	// Handle creating resource
	filter('resource.items.create', async (payload: any) => {
		const schema = await getSchema();
		const resourceItemService = new ItemsService('resource', { database: database, schema: schema });

		if (payload.type != 'exam') return;

		const conflictingResources = await resourceItemService.readByQuery(conflictQuery(payload));

		if (conflictingResources.length > 0) throw new (createResourceConflictError(conflictingResources))();
	});
});
