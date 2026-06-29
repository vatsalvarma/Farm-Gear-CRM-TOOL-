package com.farmgearconnect.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Payload sent by the Next.js frontend (via NextAuth callback) when a user
 * authenticates through a third-party OAuth 2.0 provider (Google, GitHub, …).
 *
 * The frontend exchanges the provider's access token for our own JWT pair by
 * calling POST /auth/oauth with this body.
 */
@Data
public class OAuthRequest {

    /**
     * Provider name in UPPER_CASE: "GOOGLE" | "GITHUB"
     */
    @NotBlank(message = "provider is required")
    private String provider;

    /**
     * The unique account ID issued by the provider (sub for Google, id for GitHub).
     */
    @NotBlank(message = "providerAccountId is required")
    private String providerAccountId;

    /**
     * Email address returned by the provider.
     */
    @NotBlank(message = "email is required")
    @Email(message = "Invalid email format")
    private String email;

    /**
     * Display name from the provider profile.
     */
    private String name;

    /**
     * Avatar URL from the provider profile.
     */
    private String image;

    /**
     * Provider-issued access token (passed for optional server-side verification).
     */
    private String accessToken;

    /**
     * Desired role when a new account is auto-created.
     * Defaults to FARMER if absent or unrecognised.
     */
    private String role;
}
