import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public pool: Pool;

  onModuleInit() {
    console.log('--- Connecting to PG ---');
    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'gradprojdb',
      password: process.env.DB_PASSWORD || '5926',
      port: parseInt(process.env.DB_PORT || '5432'),
    });
    
    this.pool.connect()
      .then(client => {
        console.log('✅ PostgreSQL Connected specifically to: gradprojdb');
        client.release();
      })
      .catch(err => {
        console.error('❌ PostgreSQL Connection FAILED:', err.message);
      });
  }

  onModuleDestroy() {
    this.pool.end();
  }
}
