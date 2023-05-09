import { Dialect } from 'sequelize';

export default {
  host: process.env.DBHOST,
  dialect: (process.env.DBDIALECT as Dialect) ?? 'postgres',
  database: process.env.DBDATABASE,
  username: process.env.DBUSERNAME,
  password: process.env.DBPASSWORD,
  port: parseInt(process.env.DBPORT ?? '5432', 10),
  sequelizeLog: process.env.SEQUELIZELOG === 'true'
};
