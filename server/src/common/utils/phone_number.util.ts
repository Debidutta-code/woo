// import jsPhoneNumber from "libphonenumber-js";

// export const formatPhoneNumber = (phoneNumber: string, countryCode: string) => {
//     try {
//         const number = new jsPhoneNumber(phoneNumber, countryCode);
//         if (!number.isValid()) {
//             throw new Error("Invalid phone number");
//         }
//         return number.format('INTERNATIONAL');
//     } catch (error) {
//         throw error;
//     }
// };