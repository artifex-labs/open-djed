import { defineConfig } from "cypress";
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  viewportWidth: 1920,
	viewportHeight: 1080,
  e2e: {
    baseUrl: process.env.CYPRESS_PREPROD_URL,
  },
});
