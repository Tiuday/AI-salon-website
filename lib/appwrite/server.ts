import { Client, Databases } from 'node-appwrite'
import { APPWRITE_CONFIG } from './config'

export function createServerClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT ?? APPWRITE_CONFIG.endpoint)
    .setProject(process.env.APPWRITE_PROJECT_ID ?? APPWRITE_CONFIG.projectId)
    .setKey(process.env.APPWRITE_API_KEY ?? '')

  return {
    databases: new Databases(client),
  }
}
