// Show note data
//
// This hook removed user_created and user_updated from read queries of exam resources
// for contributors.
//

import { defineHook } from '@directus/extensions-sdk';
import _ from 'lodash';
import { CONTRIBUTOR_ROLE_NAME } from '../utils/constants';
import { EventContext } from '@directus/types';

export default defineHook(({ filter }, { services }) => {
	filter('resource.items.read', async (payload, meta, context) => {
		return await clean(payload, context, services, cleanResourceEntities);
	});

	filter('course.items.read', async (payload, meta, context) => {
		return await clean(payload, context, services, cleanCourseEntities);
	});
});

const clean = async (payload: any, context: EventContext, services: any, cleanHandler: (payload: any) => any) => {
	const { accountability, database, schema } = context;
	const { ItemsService } = services;

	if (!accountability || accountability.role === null) return cleanHandler(payload);
	if (accountability.admin) return payload;

	const userItemsService = new ItemsService('directus_users', {
		database,
		schema,
	});

	const userEntity = await userItemsService.readOne(accountability.user, {
		fields: ['role.name'],
	});

	if (userEntity.role.name === CONTRIBUTOR_ROLE_NAME) return cleanHandler(payload);

	return payload;
};

const cleanResourceEntities = (payload: any) =>
	payload.map((resource) => {
		if (resource.type == 'note') return resource;
		return _.omit(resource, ['user_created', 'user_updated']);
	});

const cleanCourseEntities = (payload: any) => {
	return payload.map((course) => {
		if (course.resource) course.resource = cleanResourceEntities(course.resource);

		return course;
	});
};
