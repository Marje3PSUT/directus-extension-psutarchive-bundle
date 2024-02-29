import { createError } from '@directus/errors';

export const createResourceConflictError = (resources: any[]) =>
	createError(
		'RESOURCE_CONFLICT_ERROR',
		`An exam with the same course, year, semester and exam type exists at id(s) ${resources.reduce(
			(result, resource) => (result += `#${resource.id} `),
			''
		)}!`,
		500
	);

export const createResourceManipulationError = (reason: string) =>
	createError('RESOURCE_MANIPULATION_ERROR', reason, 500);
