import 'dotenv/config';
import { PrismaClient } from './generated';

const prisma = new PrismaClient();

export default prisma;
