# CorPro VPN

## Zero-Trust VPN Security & WireGuard Automation

CorPro VPN is a Cybersecurity Engineering graduation project demonstrating a Zero-Trust-style remote-access workflow using WireGuard, endpoint compliance checks, centralized peer provisioning, authentication, policy enforcement, and monitoring.

> Status: Educational / portfolio project. Validate and harden every component before production deployment.

Live project: https://corpo-vpn.vercel.app/

## Security architecture

~~~text
User → Authentication / OTP → Endpoint Compliance → Access Decision
                                      ↓
                              WireGuard Client
                                      ↓
                                 VPN Gateway
                                      ↓
                              Firewall / Routing
                                      ↓
                              Protected Network
~~~

## Key capabilities

- WireGuard encrypted VPN connectivity
- Endpoint pre-flight compliance checks
- Automated VPN peer provisioning
- OTP-based access control
- Administrative policy and connection monitoring
- Firewall/routing integration
- IP/GeoIP policy enforcement
- Security logging and operational visibility

## Technology

- Desktop: Electron, React, Vite, Tailwind CSS
- Backend: Node.js/TypeScript API services
- Data: Supabase / PostgreSQL
- VPN: WireGuard on Ubuntu Linux
- Network security: iptables, routing and access policies

Compliance is treated as one security signal; it does not prove that a device is free of compromise.

## Documentation

- Threat Model: docs/THREAT_MODEL.md
- Security Policy: SECURITY.md

## Security disclaimer

Use only on systems and networks you own or are explicitly authorized to administer. Do not commit private keys, credentials, tokens, or production configuration.

## Author

Hassan Faris — Cybersecurity Engineer

- GitHub: https://github.com/faris7assan
- LinkedIn: https://www.linkedin.com/in/hassan-faris
- Portfolio: https://hassanhamedfaris69.base44.app
