import { VALID_EXAM_TYPES } from '../utils/constants';

// Query that is used to find conflicts
export default (payload: any) => ({
	fields: ['id'],
	filter: {
		course: {
			_eq: payload.course,
		},
		semester: {
			_and: {
				_eq: payload.semester.toUpperCase() + payload.semester.slice(1),
				_nnull: true,
			},
		},
		year: {
			_eq: payload.year,
		},
		exam_data: {
			type: {
				_and: {
					_eq: payload.exam_data.type,
					_in: VALID_EXAM_TYPES,
				},
			},
		},
	},
});
