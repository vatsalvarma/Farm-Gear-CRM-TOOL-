package com.farmgearconnect.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final RestTemplate restTemplate;

    @Value("${app.sms.provider:TWILIO}")
    private String smsProvider;

    @Value("${app.sms.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${app.sms.twilio.from-number:}")
    private String twilioFromNumber;

    @Value("${app.sms.msg91.auth-key:}")
    private String msg91AuthKey;

    @Value("${app.sms.msg91.sender-id:FGCNCT}")
    private String msg91SenderId;

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    @Async
    public void sendOtp(String phoneNumber, String otp) {
        if (!smsEnabled) {
            log.info("SMS disabled. OTP for {}: {}", phoneNumber, otp);
            return;
        }

        String message = String.format(
                "Your FarmGearConnect verification code is: %s. Valid for 10 minutes.", otp);
        sendSms(phoneNumber, message);
    }

    @Async
    public void sendBookingNotification(String phoneNumber, String equipmentTitle, String action) {
        if (!smsEnabled) {
            log.info("SMS disabled. Booking notification for {}", phoneNumber);
            return;
        }

        String message = String.format(
                "FarmGearConnect: Your booking for '%s' has been %s. Check app for details.",
                equipmentTitle, action);
        sendSms(phoneNumber, message);
    }

    @Async
    public void sendListingApprovalNotification(String phoneNumber, String equipmentTitle) {
        if (!smsEnabled) {
            log.info("SMS disabled. Listing approval for {}", phoneNumber);
            return;
        }

        String message = String.format(
                "FarmGearConnect: Your listing '%s' is now live on the marketplace!",
                equipmentTitle);
        sendSms(phoneNumber, message);
    }

    private void sendSms(String phoneNumber, String message) {
        try {
            if ("TWILIO".equalsIgnoreCase(smsProvider)) {
                sendViaTwilio(phoneNumber, message);
            } else if ("MSG91".equalsIgnoreCase(smsProvider)) {
                sendViaMsg91(phoneNumber, message);
            } else {
                log.warn("Unknown SMS provider: {}", smsProvider);
            }
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage(), e);
        }
    }

    private void sendViaTwilio(String phoneNumber, String message) {
        String url = String.format(
                "https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json",
                twilioAccountSid);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(twilioAccountSid, twilioAuthToken);

        String body = String.format("To=%s&From=%s&Body=%s",
                phoneNumber, twilioFromNumber, message);

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("SMS sent successfully via Twilio to {}", phoneNumber);
        } else {
            log.error("Twilio SMS failed: {}", response.getBody());
        }
    }

    private void sendViaMsg91(String phoneNumber, String message) {
        String url = "https://api.msg91.com/api/v5/flow/";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("authkey", msg91AuthKey);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", msg91SenderId);
        body.put("mobiles", phoneNumber);
        body.put("message", message);
        body.put("route", "4");
        body.put("country", "91");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("SMS sent successfully via MSG91 to {}", phoneNumber);
        } else {
            log.error("MSG91 SMS failed: {}", response.getBody());
        }
    }
}
