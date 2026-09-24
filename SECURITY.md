# Security Policy

## Scope

CorPro VPN is an educational Zero-Trust VPN project intended for authorized laboratory, academic, and controlled enterprise-style testing.

## Security boundaries

- Never commit WireGuard private keys, JWT secrets, database credentials, SMTP/API keys, or production configuration.
- Endpoint compliance checks are policy signals; they do not prove that a device is malware-free.
- GeoIP/IP allowlisting is an access-control layer, not an identity control.
- WireGuard provides encrypted transport; application authentication and authorization remain separate controls.
- The deployment should be reviewed and hardened before exposure to untrusted networks.

## Reporting

Please report suspected vulnerabilities privately through GitHub's security reporting features rather than publishing exploit details in an issue.

## Safe testing

Only test the VPN, API, endpoint agent, and infrastructure against systems you own or are explicitly authorized to administer.
