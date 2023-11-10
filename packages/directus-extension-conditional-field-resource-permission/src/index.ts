// Conditional Field Resource Permission
//
// This hook adds a new permission to the editor role, restricting updates to verified
// resources and preventing edits to other users' resources, except for the 'needs_review'
// field.
//

import { defineHook } from '@directus/extensions-sdk';
import { createError } from '@directus/errors';

const invalidUpdateVerifiedError = createError(
	'INVALID_UPDATE_VERIFIED_ERROR',
	'If the resource is verified, you can only toggle the "Needs Review" button.',
	500
);

const invalidUnauthorizedUpdateError = createError(
	'INVALID_UNAUTHORIZED_UPDATE_ERROR',
	"You can only edit resources you've created.",
	500
);

interface Entity {
	id: string;
}

export default defineHook(({ filter }, { services }) => {
	const { ItemsService } = services;

	filter('resource.items.update', async (payload: any, { collection, keys }, { schema, accountability }) => {
		const rolesItemsService = new ItemsService('directus_roles', { schema: schema });

		const roleEntity: Entity[] = rolesItemsService.readByQuery({
			filter: {
				name: {
					_eq: 'Editor',
				},
			},
			limit: -1,
		});

		const editorRoleId = roleEntity![0]!.id;

		if (accountability!.role === editorRoleId) {
			const resItemsService = new ItemsService(collection, { schema: schema });
			const resourceEntity = await resItemsService.readOne(keys[0]);

			if (
				resourceEntity.status === 'verified' &&
				!(Object.keys(payload).length === 1 && !!Object.getOwnPropertyDescriptor(payload, 'needs_review'))
			) {
				throw new invalidUpdateVerifiedError();
			} else if (resourceEntity.status === 'unverified' && resourceEntity.user_created !== accountability!.user) {
				throw new invalidUnauthorizedUpdateError();
			}
		}

		return payload;
	});
});
