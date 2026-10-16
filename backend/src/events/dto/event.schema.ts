import * as yup from 'yup';

const futureDate = yup
  .date()
  .typeError('Date must be a valid date')
  .test('is-future', 'Event date must be in the future', (value) => !value || value.getTime() > Date.now());

const tags = yup.array().of(yup.string().trim().required()).max(5, 'Maximum 5 tags allowed');

export const createEventSchema = yup.object({
  title: yup.string().trim().required('Title is required'),
  description: yup.string().trim().required('Description is required'),
  dateTime: futureDate.required('Date and time are required'),
  location: yup.string().trim().required('Location is required'),
  capacity: yup.number().integer().nullable().min(1, 'Capacity must be at least 1'),
  isPublic: yup.boolean().default(true),
  tags: tags.optional(),
});

export const updateEventSchema = yup.object({
  title: yup.string().trim().min(1, 'Title cannot be empty'),
  description: yup.string().trim().min(1, 'Description cannot be empty'),
  dateTime: futureDate,
  location: yup.string().trim().min(1, 'Location cannot be empty'),
  capacity: yup.number().integer().nullable().min(1, 'Capacity must be at least 1'),
  isPublic: yup.boolean(),
  tags: tags.optional(),
});
