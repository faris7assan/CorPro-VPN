# CorPro VPN Threat Model

## Assets

- VPN credentials and peer configurations
- WireGuard private keys
- Authentication/session data
- Endpoint compliance results
- Administrative policies
- Connection and security logs
- Internal network traffic

## Trust boundaries

1. Endpoint client ↔ authentication/API
2. Endpoint client ↔ local operating-system security controls
3. API ↔ database
4. API ↔ WireGuard server
5. VPN server ↔ protected network
6. Administrator ↔ management dashboard

## Primary threats

| Threat | Example | Control |
|---|---|---|
| Credential theft | Compromised user account | OTP/MFA, short-lived sessions, least privilege |
| Endpoint compromise | AV/firewall disabled | Compliance policy before tunnel activation |
| Key exposure | Leaked WireGuard private key | Secure key storage and rotation |
| Unauthorized peer | Rogue VPN configuration | Server-side peer policy and revocation |
| Network abuse | Unauthorized source IP | Firewalling, routing policy, allowlists |
| Admin compromise | Stolen dashboard account | RBAC, MFA, audit logging |
| Configuration drift | Weak firewall or routing rule | Versioned configuration and verification |
| False trust | Device passes checks while compromised | Treat compliance as one signal, not proof of health |

## Security assumptions

The project assumes that the underlying operating system, identity provider, database, and WireGuard host are maintained securely. A passing compliance scan cannot detect every compromise.

## Residual risk

GeoIP restrictions, endpoint checks, and IP allowlists reduce attack surface but do not replace strong identity, authorization, key management, patching, monitoring, and incident response.
