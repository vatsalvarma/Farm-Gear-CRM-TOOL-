package com.farmgearconnect.service;

import com.farmgearconnect.entity.User;
import com.farmgearconnect.exception.BadRequestException;
import com.farmgearconnect.exception.ResourceNotFoundException;
import com.farmgearconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Masked calling service using Exotel or Twilio
 * Allows users to call each other without exposing real phone numbers
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MaskedCallingService {

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;

    @Value("${app.calling.provider:EXOTEL}")
    private String callingProvider;

    @Value("${app.calling.exotel.api-key:}")
    private String exotelApiKey;

    @Value("${app.calling.exotel.api-token:}")
    private String exotelApiToken;

    @Value("${app.calling.exotel.sid:}")
    private String exotelSid;

    @Value("${app.calling.exotel.virtual-number:}")
    private String exotelVirtualNumber;

    @Value("${app.calling.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${app.calling.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${app.calling.twilio.virtual-number:}")
    private String twilioVirtualNumber;

    @Value("${app.calling.enabled:false}")
    private boolean callingEnabled;

    /**
     * Initiate a masked call between two users
     * @param callerId User initiating the call
     * @param receiverId User receiving the call
     * @return Call session ID or virtual number
     */
    public Map<String, String> initiateMaskedCall(UUID callerId, UUID receiverId) {
        if (!callingEnabled) {
            throw new BadRequestException("Calling feature is currently disabled");
        }

        User caller = userRepository.findByIdAndDeletedAtIsNull(callerId)
                .orElseThrow(() -> new ResourceNotFoundException("Caller not found"));
        User receiver = userRepository.findByIdAndDeletedAtIsNull(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        if (caller.getPhone() == null || receiver.getPhone() == null) {
            throw new BadRequestException("Both users must have verified phone numbers");
        }

        if ("EXOTEL".equalsIgnoreCase(callingProvider)) {
            return initiateExotelCall(caller.getPhone(), receiver.getPhone());
        } else if ("TWILIO".equalsIgnoreCase(callingProvider)) {
            return initiateTwilioCall(caller.getPhone(), receiver.getPhone());
        } else {
            throw new BadRequestException("Invalid calling provider configured");
        }
    }

    /**
     * Get virtual number for masked communication
     * Returns a temporary virtual number that forwards to the actual user
     */
    public String getVirtualNumber(UUID userId) {
        if (!callingEnabled) {
            throw new BadRequestException("Calling feature is currently disabled");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getPhone() == null) {
            throw new BadRequestException("User must have a verified phone number");
        }

        // Return the platform's virtual number
        // In production, you'd create a temporary mapping in database
        if ("EXOTEL".equalsIgnoreCase(callingProvider)) {
            return exotelVirtualNumber;
        } else {
            return twilioVirtualNumber;
        }
    }

    private Map<String, String> initiateExotelCall(String fromNumber, String toNumber) {
        try {
            String url = String.format(
                    "https://api.exotel.com/v1/Accounts/%s/Calls/connect.json",
                    exotelSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(exotelApiKey, exotelApiToken);

            String body = String.format(
                    "From=%s&To=%s&CallerId=%s&CallType=trans",
                    fromNumber, toNumber, exotelVirtualNumber);

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> callData = (Map<String, Object>) response.getBody().get("Call");
                String callSid = (String) callData.get("Sid");
                
                log.info("Exotel call initiated: {}", callSid);
                
                Map<String, String> result = new HashMap<>();
                result.put("callId", callSid);
                result.put("virtualNumber", exotelVirtualNumber);
                result.put("status", "initiated");
                return result;
            } else {
                throw new BadRequestException("Failed to initiate call via Exotel");
            }
        } catch (Exception e) {
            log.error("Exotel call failed: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to initiate call: " + e.getMessage());
        }
    }

    private Map<String, String> initiateTwilioCall(String fromNumber, String toNumber) {
        try {
            String url = String.format(
                    "https://api.twilio.com/2010-04-01/Accounts/%s/Calls.json",
                    twilioAccountSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(twilioAccountSid, twilioAuthToken);

            // TwiML URL that connects the call
            String twimlUrl = "http://twimlets.com/forward?PhoneNumber=" + toNumber;

            String body = String.format(
                    "From=%s&To=%s&Url=%s",
                    twilioVirtualNumber, fromNumber, twimlUrl);

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String callSid = (String) response.getBody().get("sid");
                
                log.info("Twilio call initiated: {}", callSid);
                
                Map<String, String> result = new HashMap<>();
                result.put("callId", callSid);
                result.put("virtualNumber", twilioVirtualNumber);
                result.put("status", "initiated");
                return result;
            } else {
                throw new BadRequestException("Failed to initiate call via Twilio");
            }
        } catch (Exception e) {
            log.error("Twilio call failed: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to initiate call: " + e.getMessage());
        }
    }

    /**
     * Get call status
     */
    public Map<String, String> getCallStatus(String callId) {
        if ("EXOTEL".equalsIgnoreCase(callingProvider)) {
            return getExotelCallStatus(callId);
        } else {
            return getTwilioCallStatus(callId);
        }
    }

    private Map<String, String> getExotelCallStatus(String callSid) {
        try {
            String url = String.format(
                    "https://api.exotel.com/v1/Accounts/%s/Calls/%s.json",
                    exotelSid, callSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(exotelApiKey, exotelApiToken);

            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> callData = (Map<String, Object>) response.getBody().get("Call");
                
                Map<String, String> result = new HashMap<>();
                result.put("callId", callSid);
                result.put("status", (String) callData.get("Status"));
                result.put("duration", String.valueOf(callData.get("Duration")));
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to get Exotel call status: {}", e.getMessage());
        }
        
        Map<String, String> result = new HashMap<>();
        result.put("callId", callSid);
        result.put("status", "unknown");
        return result;
    }

    private Map<String, String> getTwilioCallStatus(String callSid) {
        try {
            String url = String.format(
                    "https://api.twilio.com/2010-04-01/Accounts/%s/Calls/%s.json",
                    twilioAccountSid, callSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(twilioAccountSid, twilioAuthToken);

            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, String> result = new HashMap<>();
                result.put("callId", callSid);
                result.put("status", (String) response.getBody().get("status"));
                result.put("duration", String.valueOf(response.getBody().get("duration")));
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to get Twilio call status: {}", e.getMessage());
        }
        
        Map<String, String> result = new HashMap<>();
        result.put("callId", callSid);
        result.put("status", "unknown");
        return result;
    }
}
