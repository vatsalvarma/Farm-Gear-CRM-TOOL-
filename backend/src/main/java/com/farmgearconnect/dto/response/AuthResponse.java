package com.farmgearconnect.dto.response;

import com.farmgearconnect.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserSummary user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private UUID id;
        private String fullName;
        private String email;
        private User.UserRole role;
        private String profilePhotoUrl;
        private boolean emailVerified;
        private String preferredLanguage;
        private boolean hasActiveSubscription;
    }
}
