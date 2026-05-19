package com.farmgearconnect.service;

import com.farmgearconnect.entity.OtpVerification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    public void sendOtpEmail(String to, String otp, OtpVerification.OtpPurpose purpose) {
        try {
            String subject = purpose == OtpVerification.OtpPurpose.EMAIL_VERIFICATION
                    ? "Verify your Farm Gear Connect email"
                    : "Farm Gear Connect - Password Reset OTP";

            String body = buildOtpEmailBody(otp, purpose);
            sendHtmlEmail(to, subject, body);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendBookingNotification(String to, String subject, String body) {
        try {
            sendHtmlEmail(to, subject, body);
        } catch (Exception e) {
            log.error("Failed to send booking email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendSubscriptionExpiryReminder(String to, String ownerName, int daysLeft) {
        try {
            String subject = "Your Farm Gear Connect subscription expires in " + daysLeft + " days";
            String body = buildSubscriptionReminderBody(ownerName, daysLeft);
            sendHtmlEmail(to, subject, body);
        } catch (Exception e) {
            log.error("Failed to send subscription reminder to {}: {}", to, e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    private String buildOtpEmailBody(String otp, OtpVerification.OtpPurpose purpose) {
        String action = purpose == OtpVerification.OtpPurpose.EMAIL_VERIFICATION
                ? "verify your email address"
                : "reset your password";
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🌾 Farm Gear Connect</h1>
                  </div>
                  <div style="padding: 30px; background: #f9fafb;">
                    <h2 style="color: #1f2937;">Your OTP Code</h2>
                    <p style="color: #6b7280;">Use this OTP to %s:</p>
                    <div style="background: white; border: 2px solid #16a34a; border-radius: 8px;
                                padding: 20px; text-align: center; margin: 20px 0;">
                      <span style="font-size: 32px; font-weight: bold; color: #16a34a;
                                   letter-spacing: 8px;">%s</span>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px;">
                      This OTP expires in 10 minutes. Do not share it with anyone.
                    </p>
                  </div>
                  <div style="padding: 15px; text-align: center; color: #9ca3af; font-size: 12px;">
                    © 2025 Farm Gear Connect. All rights reserved.
                  </div>
                </body>
                </html>
                """.formatted(action, otp);
    }

    private String buildSubscriptionReminderBody(String ownerName, int daysLeft) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🌾 Farm Gear Connect</h1>
                  </div>
                  <div style="padding: 30px; background: #f9fafb;">
                    <h2 style="color: #1f2937;">Subscription Expiry Reminder</h2>
                    <p style="color: #6b7280;">Dear %s,</p>
                    <p style="color: #6b7280;">
                      Your Farm Gear Connect subscription will expire in <strong>%d days</strong>.
                      Renew now to keep your listings active on the marketplace.
                    </p>
                    <a href="%s/plans" style="display: inline-block; background: #16a34a; color: white;
                       padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
                      Renew Subscription
                    </a>
                  </div>
                </body>
                </html>
                """.formatted(ownerName, daysLeft, frontendUrl);
    }
}
