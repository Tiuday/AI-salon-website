export const APPWRITE_CONFIG = {
  endpoint:   process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT  ?? 'https://cloud.appwrite.io/v1',
  projectId:  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? '',

  collections: {
    services:     process.env.NEXT_PUBLIC_APPWRITE_SERVICES_ID     ?? 'services',
    hairstyles:   process.env.NEXT_PUBLIC_APPWRITE_HAIRSTYLES_ID   ?? 'hairstyles',
    testimonials: process.env.NEXT_PUBLIC_APPWRITE_TESTIMONIALS_ID ?? 'testimonials',
    appointments: process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_ID ?? 'appointments',
    faq:          process.env.NEXT_PUBLIC_APPWRITE_FAQ_ID          ?? 'faq',
  },
}
