import { parse } from 'pg-connection-string';
import { createConnection } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export function loadDigitalOceanConnection(src: string): PostgresConnectionOptions {
    let res = parse(src);
    return {
        type: 'postgres',
        host: res.host!,
        port: parseInt(res.port!, 10),
        username: res.user!,
        password: res.password!,
        database: res.database!,
        ssl: { rejectUnauthorized: false }
    }
}

export async function startModel() {
    await createConnection({
        ...loadDigitalOceanConnection(process.env.DATABASE_URL!),
        entities: [],
        synchronize: false,
        dropSchema: false,
        migrationsRun: false,
        logging: ['query'],
        // logger: new PinoORMLogger(createLogger('orm'))
    });
}