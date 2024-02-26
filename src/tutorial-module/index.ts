import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
	id: 'welcome',
	name: 'Welcome',
	icon: 'info',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
	],
});
