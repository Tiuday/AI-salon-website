import { Client, Databases, Account } from 'appwrite'
import { APPWRITE_CONFIG } from './config'

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)

export const databases = new Databases(client)
export const account    = new Account(client)
export { client }
