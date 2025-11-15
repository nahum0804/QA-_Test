import * as dotenv from 'dotenv';
dotenv.config();

export const QA_EMAIL = process.env.QA_EMAIL as string;
export const QA_PASSWORD = process.env.QA_PASSWORD as string;
