import * as yup from 'yup';

export const createEventSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  dateTime: yup.date().required('Date and time are required'),
  location: yup.string().required('Location is required'),
  capacity: yup.number().nullable().min(1, 'Capacity must be at least 1'),
  isPublic: yup.boolean().default(true),
});