import { DataSource } from 'typeorm';
import { DATA_SOURCE } from 'src/common/constants';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
        // synchronize: true,
        ssl: {
          rejectUnauthorized: true,
        },
      });

      return dataSource.initialize();
    },
  },
];
