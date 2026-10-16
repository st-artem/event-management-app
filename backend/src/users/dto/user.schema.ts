import * as yup from 'yup';

const optionalText = (max: number) => yup.string().trim().max(max, `Maximum ${max} characters`).nullable();

export const updateProfileSchema = yup.object({
  name: yup.string().trim().min(1, 'Name cannot be empty').max(100, 'Maximum 100 characters'),
  bio: optionalText(500),
  location: optionalText(100),
  github: optionalText(200),
  website: optionalText(200),
  telegram: optionalText(100),
});
