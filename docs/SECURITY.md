# Security Policy & Incident Response

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to **<security@smartapd.id>**.
**DO NOT** create a public GitHub issue for security vulnerabilities.

---

## Incident Response Runbook (Credential Leak)

### 1. Identification

- **Trigger**: Dependabot alert, manual discovery, or report.
- **Action**: Verify if the secret is valid and active.

### 2. Containment

- **Action**: Revoke the compromised secret immediately.
  - **Telegram Bot**: Revoke via BotFather.
  - **Database**: Change user password in DB and update `.env`.
  - **JWT Secret**: Change `JWT_SECRET` in `.env` (forces all users to re-login).
  - **Email**: Change SMTP password.

### 3. Mitigation

- **Action**: Check logs for suspicious activity during the exposure window.
- **Action**: Rotate all other credentials if they share usage patterns.

### 4. Recovery

- **Action**: Update the application with new secrets.
- **Action**: Redeploy the application.
- **Action**: Monitor for stability.

### 5. Post-Incident

- **Action**: Clean git history using **BFG Repo-Cleaner** if the secret was committed.
- **Action**: Document the lesson learned.

---

## checklist Recovery

- [ ] Revoke Old Key
- [ ] Generate New Key
- [ ] Update `.env` / Secret Manager
- [ ] Restart Services
- [ ] Clean Git History (if committed)
- [ ] Notify Team
