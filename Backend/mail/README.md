# Medicine Expiry Checker

This module provides functionality to check medicine expiry dates and notify sellers via email when medicines are expiring soon or have already expired.

## Features

1. **Daily Automated Checking**: Runs every 24 hours (configurable) to check all medicines in the inventory.
2. **Near-Expiry Notifications**: Identifies medicines expiring within 6 months and sends email notifications to sellers.
3. **Expired Medicine Handling**: Identifies already expired medicines, sends notifications, and automatically removes them from the inventory.
4. **Email Notifications**: Professionally designed email templates for both near-expiry and expired medicine notifications.

## Configuration

The medicine expiry checker uses the following configuration parameters, which should be defined in your environment variables or configuration file:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SENDER_NAME=MediBridge System
SENDER_EMAIL=your-email@gmail.com
EXPIRY_CHECK_PERIOD=24h
```

## How It Works

1. The system initializes the medicine expiry checker during application startup.
2. The checker runs immediately and then at the configured interval (default: 24 hours).
3. For each medicine in the inventory:
   - If the medicine is already expired, it sends an "Expired Medicine" notification to the seller and removes the medicine from the inventory.
   - If the medicine will expire within 180 days, it sends an "Expiring Soon" notification to the seller, suggesting they consider applying a discount.

## Email Templates

The system uses HTML email templates located in the `mail/templates` directory:

- `expiring_soon.html`: Template for medicines expiring within 180 days.
- `expired.html`: Template for medicines that have already expired.

## Integration

The medicine expiry checker is integrated into the main application server and starts automatically when the server starts. No additional configuration is needed beyond the SMTP settings in your environment variables.

## Dependencies

- Go's standard `net/smtp` package for sending emails
- HTML templates for email formatting
- Database access for retrieving medicine and seller information 