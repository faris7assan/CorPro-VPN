import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(private db: DatabaseService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token with Supabase
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Look up user in our local auth_users table
      const res = await this.db.pool.query('SELECT email, role FROM auth_users WHERE email=$1', [user.email]);
      if (res.rows.length === 0) {
        throw new UnauthorizedException('User not found in local database');
      }

      request.user = { user: user.email, role: res.rows[0].role, supabaseId: user.id };
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
