package com.anonymous.social.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtp(String to, String otp) {
        String subject = "ShadowTalk Identity Verification";

        String htmlBody = """
            <div style="background-color: #0f0f0f; color: #e0e0e0; font-family: 'Courier New', monospace; padding: 40px; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; border: 1px solid #333; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <div style="background-color: #1a1a1a; padding: 20px; border-bottom: 2px solid #7c3aed;">
                        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">SHADOW<span style="color: #7c3aed;">TALK</span></h1>
                    </div>
                    <div style="padding: 40px 20px;">
                        <p style="font-size: 16px; color: #aaa; margin-bottom: 30px;">Protocol Initiated: Identity Verification</p>

                        <div style="background-color: #262626; padding: 20px; border-radius: 8px; border: 1px dashed #555; display: inline-block; margin-bottom: 30px;">
                            <span style="font-size: 32px; font-weight: bold; color: #fff; letter-spacing: 5px;">%s</span>
                        </div>

                        <p style="font-size: 14px; color: #666;">This code is valid for 10 minutes.</p>
                        <p style="font-size: 12px; color: #444; margin-top: 20px;">If you didn't request this, ignore this signal.</p>
                    </div>
                    <div style="background-color: #1a1a1a; padding: 15px; border-top: 1px solid #333; font-size: 10px; color: #555;">
                        SECURE TRANSMISSION // END ENCRYPTION
                    </div>
                </div>
            </div>
            """.formatted(otp);

        System.out.println("--------------------------------------------------");
        System.out.println("SENDING HTML EMAIL TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("OTP: " + otp);
        System.out.println("--------------------------------------------------");

        if (mailSender != null) {
            try {
                jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
                org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true);

                helper.setFrom("verify.shadowtalk@gmail.com", "ShadowTalk System");
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlBody, true); // true = isHtml

                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("JavaMailSender not configured, skipping actual email send.");
        }
    }
}
