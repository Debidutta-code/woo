/**
 * Validates an email address format.
 * @param email - The email string to validate.
 * @returns true if the email is valid, false otherwise.
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Validates a contact/phone number format.
 * Allows digits only, optionally starting with '+'.
 * Must be between 10 and 15 characters long.
 * @param contact - The contact string to validate.
 * @returns true if the contact number is valid, false otherwise.
 */
export function isValidContact(contact: string): boolean {
    const contactRegex = /^\+?[0-9]{10,15}$/;
    return contactRegex.test(contact);
}
