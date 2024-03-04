// Show note data
//
// This hook removed user_created and user_updated from read queries of exam resources
// for contributors.
//

import { defineHook } from '@directus/extensions-sdk';
import _ from 'lodash';
import { CONTRIBUTOR_ROLE_NAME } from '../utils/constants';

export default defineHook(({ filter }, { services }) => {
	const { ItemsService } = services;

	filter('resource.items.read', async (payload: any, meta, { accountability, schema, database }) => {
		if (!accountability) return payload;

		const userItemsService = new ItemsService('directus_users', { database, schema });
		const userEntity = await userItemsService.readOne(accountability.user, { fields: ['role.name'] });

		if (userEntity.role.name != CONTRIBUTOR_ROLE_NAME) return payload;

		const cleanResources = payload.map((resource) => {
			if (resource.type == 'note') return resource;
			return _.omit(resource, ['user_created', 'user_updated']);
		});

		return cleanResources;
	});
});
