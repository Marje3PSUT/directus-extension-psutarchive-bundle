import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter }, { services }) => {
	filter('settings.read', async (items: any, meta, { database: knex, schema, accountability }) => {
		if (accountability && accountability.admin) {
			//const { ItemsService } = services;
			//const service = new ItemsService('directus_roles', { knex, schema, accountability });
			//const rol = accountability.role;
			//const rolFind = await service.knex.from('directus_roles').where({ id: rol }).first();
			//const rolName = rolFind?.name?.toLowerCase();
			const settings: any = items[0];

			settings.module_bar = items[0].module_bar.map((module: any) => {
				if (module.id === 'files') {
					module.enabled = true;
				}

				return module;
			});
		}

		return items;
	});
});
