import { Injectable, BadRequestException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PolicyService {
  constructor(private db: DatabaseService) {}

  // ── Helper: require caller to be admin ──
  private async requireAdmin(callerEmail: string) {
    const result = await this.db.pool.query(
      "SELECT role FROM auth_users WHERE email=$1",
      [callerEmail]
    );
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      throw new ForbiddenException("Access denied: Admins only");
    }
  }

  // ── Check if an email is in ANY policy ──
  async isEmailInPolicy(email: string): Promise<boolean> {
    const result = await this.db.pool.query(
      "SELECT id FROM vpn_policies WHERE $1 = ANY(emails) LIMIT 1",
      [email]
    );
    return result.rows.length > 0;
  }

  // ── Create Policy ──
  async createPolicy(callerEmail: string, dto: any) {
    await this.requireAdmin(callerEmail);

    const { companyName, maxUsers, sessionTimeout, emails, criticalChecks, warningChecks, infoChecks } = dto;

    if (!companyName || !maxUsers) {
      throw new BadRequestException("Company name and max users are required");
    }

    const result = await this.db.pool.query(
      `INSERT INTO vpn_policies (company_name, max_users, session_timeout, emails, critical_checks, warning_checks, info_checks, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        companyName,
        maxUsers,
        sessionTimeout || 3600,
        emails || [],
        criticalChecks || [],
        warningChecks || [],
        infoChecks || [],
        callerEmail,
      ]
    );

    console.log(`✅ Policy created for ${companyName} by ${callerEmail}`);
    return result.rows[0];
  }

  // ── Update Policy ──
  async updatePolicy(callerEmail: string, id: number, dto: any) {
    await this.requireAdmin(callerEmail);

    const { companyName, maxUsers, sessionTimeout, emails, criticalChecks, warningChecks, infoChecks } = dto;

    const result = await this.db.pool.query(
      `UPDATE vpn_policies
       SET company_name=$1, max_users=$2, session_timeout=$3, emails=$4,
           critical_checks=$5, warning_checks=$6, info_checks=$7, updated_at=NOW()
       WHERE id=$8
       RETURNING *`,
      [
        companyName,
        maxUsers,
        sessionTimeout || 3600,
        emails || [],
        criticalChecks || [],
        warningChecks || [],
        infoChecks || [],
        id,
      ]
    );

    if (result.rows.length === 0) {
      throw new HttpException("Policy not found", HttpStatus.NOT_FOUND);
    }

    console.log(`✅ Policy #${id} updated by ${callerEmail}`);
    return result.rows[0];
  }

  // ── Delete Policy ──
  async deletePolicy(callerEmail: string, id: number) {
    await this.requireAdmin(callerEmail);

    const result = await this.db.pool.query(
      "DELETE FROM vpn_policies WHERE id=$1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      throw new HttpException("Policy not found", HttpStatus.NOT_FOUND);
    }

    console.log(`✅ Policy #${id} deleted by ${callerEmail}`);
    return { message: `Policy #${id} deleted` };
  }

  // ── List All Policies (admin) ──
  async listPolicies(callerEmail: string) {
    await this.requireAdmin(callerEmail);

    const result = await this.db.pool.query(
      "SELECT * FROM vpn_policies ORDER BY created_at DESC"
    );
    return result.rows;
  }

  // ── Get policy for a specific user email ──
  async getMyPolicy(email: string) {
    const result = await this.db.pool.query(
      "SELECT * FROM vpn_policies WHERE $1 = ANY(emails) LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  // ── Notify admins about compliance failures ──
  // POSTPONED: Email notifications are logged to console until SMTP is configured.
  // This can be re-enabled later with a transactional email service (e.g., Resend, SendGrid).
  async notifyCompliance(userEmail: string, criticalFails: string[], warningFails: string[]) {
    const hasCritical = criticalFails && criticalFails.length > 0;
    const hasWarning = warningFails && warningFails.length > 0;

    if (hasCritical) {
      console.log(`🚨 [COMPLIANCE ALERT] User ${userEmail} BLOCKED — ${criticalFails.length} critical failures: ${criticalFails.join(', ')}`);
    }
    if (hasWarning) {
      console.log(`⚠️ [COMPLIANCE WARNING] User ${userEmail} connected with ${warningFails.length} warning(s): ${warningFails.join(', ')}`);
    }

    // TODO: Re-enable email notifications when SMTP/transactional email is configured
    // const adminsResult = await this.db.pool.query("SELECT email FROM auth_users WHERE role='admin'");
    // Send email to admins...

    return { message: 'Compliance event logged (email notifications postponed)' };
  }
}
