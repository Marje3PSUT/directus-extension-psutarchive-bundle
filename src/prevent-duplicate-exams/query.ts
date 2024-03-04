import { VALID_EXAM_CONFLICT_TYPES } from '../utils/constants';
// Query that is used to find conflicts
export default (payload: any) => ({
	fields: ['id'],
	filter: {
		_and: [
			{
				course: {
					_eq: payload.course,
				},
			},
			{
				year: {
					_eq: payload.year,
				},
			},
			{
				_and: [
					{
						semester: {
							_nnull: true,
						},
					},
					{
						semester: {
							_eq: payload.semester ? payload.semester : null,
						},
					},
				],
			},
			{
				_and: [
					{
						exam_data: {
							type: {
								_eq: payload.exam_data.type,
							},
						},
					},
					{
						exam_data: {
							type: {
								_in: VALID_EXAM_CONFLICT_TYPES,
							},
						},
					},
				],
			},
		],
	},
});
