'use strict';

import { Dialect } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

interface Params {
  database: string
  username: string
  password: string
  host: string
  port: number
  dialect: Dialect
  sequelizeLog: boolean
}

export default (
  { database, username, password, host, port, dialect, sequelizeLog }: Params,
  validateOnly = false
) => {
  const sequelize = new Sequelize(database, username, password, {
    host,
    dialect,
    port,
    logging: sequelizeLog && console.log,
    models: [__dirname + '/**/models/*.model.ts', __dirname + '/*.model.ts'],
    modelMatch: filename => {
      return filename.indexOf('.spec') === -1;
    },
    validateOnly,
    minifyAliases: true,
    define: {
      timestamps: false // Should be enabled on a real project for audit purposes.
    }
  });

  return sequelize;
};
