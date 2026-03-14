import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Manually load the .env file for the CLI
dotenv.config();

export default defineConfig({
  datasource: {
    // This will now find your URL from the .env file
    url: process.env.DATABASE_URL,
  },
});