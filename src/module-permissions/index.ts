// Module permissions
//
// This hook ensures that only the admin will be able to see the
// files module.
//

import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter }) => {
	filter('settings.read', async (items: any, meta, { accountability }) => {
		if (accountability && !accountability.admin) {
			const settings: any = items[0];

			settings.module_bar = items[0].module_bar.map((module: any) => {
				if (module.id === 'files') {
					module.enabled = false;
				}

				return module;
			});
		}

		return items;
	});
});
