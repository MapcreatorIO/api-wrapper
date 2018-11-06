// setup file for jest
import dotenv from 'dotenv';
import moxios from 'moxios';

dotenv.config({ path: './.env.test' });
moxios.install();
