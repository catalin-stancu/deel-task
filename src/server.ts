import { json, urlencoded } from 'body-parser';
import { config as configDotEnv } from 'dotenv';
import 'express-async-errors';

import 'reflect-metadata';
configDotEnv();

import express from 'express';
import routes from './routes';
import models from './models';
import db from './config/db';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(urlencoded({ extended: false }));
app.use(json());

export const sequelize = models(db);

app.use('/', routes);

app.use(errorHandler);

export default app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}`));
