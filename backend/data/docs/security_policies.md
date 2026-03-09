# Vault Security & Fraud Prevention Policies

## Two-Factor Authentication (2FA)
All Vault accounts require 2FA for the following actions:
- Logging in from a new device or browser
- Initiating wire transfers exceeding $5,000
- Modifying account beneficiaries or authorized signers
- Changing the primary email or phone number on file

Vault supports TOTP-based authenticator apps (Google Authenticator, Authy) and SMS-based verification. Hardware security keys (FIDO2/WebAuthn) are available for Premium and Business tier accounts.

## Suspicious Activity Monitoring
Vault employs real-time transaction monitoring powered by machine learning models. Transactions flagged as suspicious are held for review and the account holder is notified via push notification and email within 30 seconds. False positives can be resolved by confirming the transaction through the mobile app.

## Account Lockout Policy
After 5 consecutive failed login attempts, the account is temporarily locked for 30 minutes. After 10 failed attempts within 24 hours, the account is locked and requires identity verification through customer support to reactivate.

## Data Encryption
All data at rest is encrypted using AES-256. Data in transit uses TLS 1.3. Vault does not store full card numbers in any user-accessible system — only tokenized references are used.
