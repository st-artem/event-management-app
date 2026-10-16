import * as yup from 'yup';

export const createTagSchema = yup.object({
  name: yup.string().trim().min(1, 'Tag name is required').max(30, 'Maximum 30 characters').required('Tag name is required'),
});
