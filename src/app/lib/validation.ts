import {z} from 'zod';
export const schoolSchema = z.object({
    name:z.string().min(1, 'School name is required')
    .max(250, 'School name must be at most 250 characters long'),

    address:z.string().min(1, 'Address is required'),

    city:z.string().min(1, 'City is required'),

    state:z.string().min(1, 'State is required'),

    contact:z.string().min(10, 'Contact must contain at least 10 digits')
    .max(15, 'Contact number is too long')
    .regex(/^\d+$/, 'Contact must contain only numbers'),

    email_id:z.string().email('Invalid email address'),

    image: z
    .custom<FileList>((files) => files instanceof FileList, {
      message: 'Image must be a FileList',
    })
    .refine((files) => files.length > 0, 'Image is required')
    .refine((files) => files[0]?.size <= 5 * 1024 * 1024, 'Image size must be less than 5MB')
    .refine(
      (files) =>
        ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(
          files[0]?.type
        ),
      'Only JPEG, PNG, JPG, and WEBP formats are supported'
    ),
});
export type SchoolFormData = z.infer<typeof schoolSchema>;