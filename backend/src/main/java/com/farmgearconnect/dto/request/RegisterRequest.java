package com.farmgearconnect.dto.request;

import com.farmgearconnect.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
             message = "Password must contain uppercase, lowercase and digit")
    private String password;

    private String phone;

    @NotNull(message = "Role is required")
    private User.UserRole role;

    private String state;
    private String district;
    private String village;

    private User.Language preferredLanguage = User.Language.ENGLISH;

    private String couponCode;
}
