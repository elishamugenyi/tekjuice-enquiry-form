export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    // Check if email is empty
    if (!email) {
        return { isValid: false, error: "Email is required" };
    }

    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: "Please enter a valid email address" };
    }

    // Check for common disposable email domains
    const disposableDomains = [
        'tempmail.com',
        'throwawaymail.com',
        'mailinator.com',
        'guerrillamail.com',
        'yopmail.com',
        '10minutemail.com'
    ];
    
    const domain = email.split('@')[1].toLowerCase();
    if (disposableDomains.some(d => domain.includes(d))) {
        return { isValid: false, error: "Disposable email addresses are not allowed" };
    }

    return { isValid: true };
};

export const validatePassword = (password: string, email: string): { isValid: boolean; error?: string } => {
    // Check if password is empty
    if (!password) {
        return { isValid: false, error: "Password is required" };
    }

    // Check minimum length
    if (password.length < 8) {
        return { isValid: false, error: "Password must be at least 8 characters long" };
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, error: "Password must contain at least one uppercase letter" };
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
        return { isValid: false, error: "Password must contain at least one lowercase letter" };
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
        return { isValid: false, error: "Password must contain at least one number" };
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, error: "Password must contain at least one special character" };
    }

    // Check if password contains email username
    const emailUsername = email.split('@')[0].toLowerCase();
    if (password.toLowerCase().includes(emailUsername)) {
        return { isValid: false, error: "Password cannot contain your email username" };
    }

    // Check if password contains email domain
    const emailDomain = email.split('@')[1].toLowerCase();
    if (password.toLowerCase().includes(emailDomain)) {
        return { isValid: false, error: "Password cannot contain your email domain" };
    }

    return { isValid: true };
};
