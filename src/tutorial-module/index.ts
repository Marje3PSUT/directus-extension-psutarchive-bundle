import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
	id: 'overview',
	name: 'Overview',
	icon: 'info',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
	],
});
