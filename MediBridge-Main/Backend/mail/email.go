package mail

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"path/filepath"
	"time"

	"github.com/pawaspy/MediBridge/util"
)

// EmailData contains data to be used in email templates
type EmailData struct {
	SellerName      string
	MedicineName    string
	MedicineID      int32
	Price           string
	Quantity        int32
	ExpiryDate      string
	DaysUntilExpiry int
	DaysSinceExpiry int
}

// Mailer is responsible for sending emails
type Mailer struct {
	config      util.Config
	host        string
	port        string
	username    string
	password    string
	senderName  string
	senderEmail string
	auth        smtp.Auth
	templates   map[string]*template.Template
}

// NewMailer creates a new Mailer instance
func NewMailer(config util.Config) (*Mailer, error) {
	mailer := &Mailer{
		config:      config,
		host:        config.SMTPHost,
		port:        config.SMTPPort,
		username:    config.SMTPUsername,
		password:    config.SMTPPassword,
		senderName:  config.SenderName,
		senderEmail: config.SenderEmail,
		templates:   make(map[string]*template.Template),
	}

	mailer.auth = smtp.PlainAuth("", mailer.username, mailer.password, mailer.host)

	// Load email templates
	templatesDir := "mail/templates"
	templates := []string{"expiring_soon.html", "expired.html"}

	for _, tmpl := range templates {
		t, err := template.ParseFiles(filepath.Join(templatesDir, tmpl))
		if err != nil {
			return nil, fmt.Errorf("error parsing template %s: %w", tmpl, err)
		}
		mailer.templates[tmpl] = t
	}

	return mailer, nil
}

// SendExpiringMedicineEmail sends an email notification for medicines expiring soon
func (m *Mailer) SendExpiringMedicineEmail(recipientEmail, sellerName string, medicineID int32, medicineName, price string, quantity int32, expiryDate time.Time, daysUntilExpiry int) error {
	templateName := "expiring_soon.html"
	subject := "Important: Medicine Expiring Soon - Action Required"

	data := EmailData{
		SellerName:      sellerName,
		MedicineName:    medicineName,
		MedicineID:      medicineID,
		Price:           price,
		Quantity:        quantity,
		ExpiryDate:      expiryDate.Format("2006-01-02"),
		DaysUntilExpiry: daysUntilExpiry,
	}

	return m.sendEmail(recipientEmail, subject, templateName, data)
}

// SendExpiredMedicineEmail sends an email notification for expired medicines
func (m *Mailer) SendExpiredMedicineEmail(recipientEmail, sellerName string, medicineID int32, medicineName string, quantity int32, expiryDate time.Time, daysSinceExpiry int) error {
	templateName := "expired.html"
	subject := "URGENT: Medicine Expired - Removed from Inventory"

	data := EmailData{
		SellerName:      sellerName,
		MedicineName:    medicineName,
		MedicineID:      medicineID,
		Quantity:        quantity,
		ExpiryDate:      expiryDate.Format("2006-01-02"),
		DaysSinceExpiry: daysSinceExpiry,
	}

	return m.sendEmail(recipientEmail, subject, templateName, data)
}

// sendEmail handles the actual email sending process
func (m *Mailer) sendEmail(to, subject, templateName string, data EmailData) error {
	// Get the template
	tmpl, ok := m.templates[templateName]
	if !ok {
		return fmt.Errorf("template %s not found", templateName)
	}

	// Render the template
	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("error executing template: %w", err)
	}

	// Prepare email
	from := fmt.Sprintf("%s <%s>", m.senderName, m.senderEmail)
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	// Construct message
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body.String()

	// Send email
	addr := fmt.Sprintf("%s:%s", m.host, m.port)
	if err := smtp.SendMail(addr, m.auth, m.senderEmail, []string{to}, []byte(message)); err != nil {
		return fmt.Errorf("error sending email: %w", err)
	}

	return nil
}
