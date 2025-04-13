import { config } from 'dotenv';

config();

const vars = {
  baseUrl: process.env.DISCOGS_BASE_URL,
  userAgent: process.env.DISCOGS_USER_AGENT,
  token: process.env.DISCOGS_PERSONAL_TOKEN,
}

export default vars;