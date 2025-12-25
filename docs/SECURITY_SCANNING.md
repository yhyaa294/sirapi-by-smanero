# Security Scanning Documentation

## Overview

SmartAPD uses multiple security scanning tools to identify vulnerabilities in dependencies and source code.

## Tools

### Dependabot

- **Location**: `.github/dependabot.yml`
- **Schedule**: Daily
- **Ecosystems**: npm (frontend), pip (ai-engine), gomod (backend)

### CodeQL (SAST)

- **Trigger**: Push/PR to main
- **Languages**: Go, JavaScript, Python
- **Results**: GitHub Security tab

### gosec (Go Security)

- Scans for hardcoded credentials, SQL injection, etc.
- Results uploaded as SARIF to GitHub

### Bandit (Python Security)

- Scans for common Python security issues
- Report saved as artifact

### npm audit

- Scans for vulnerable npm packages
- Runs on frontend directory

## Interpreting Results

### High/Critical Issues

- **Fix immediately** before merging
- Use `npm audit fix` or `go get -u` to update

### Medium/Low Issues

- Review during sprint planning
- May be false positives

## Remediation Steps

1. **Dependency vulnerabilities**: Update to patched version
2. **Hardcoded secrets**: Move to environment variables
3. **SQL injection**: Use parameterized queries
4. **XSS**: Sanitize user input

## Branch Protection

Recommended rules for `main`:

- Require all security checks to pass
- Require CodeQL analysis
- Require Dependabot updates

## Local Scanning

```bash
# Go
cd backend && gosec ./...

# Python
cd ai-engine && bandit -r . -ll

# NPM
cd frontend && npm audit
```
