@@ .. @@
 export class ValidationService {
   // Validation des données d'élève
   static validateStudentData(studentData: any): { isValid: boolean; errors: Record<string, string> } {
     const errors: Record<string, string> = {};

     if (!studentData.firstName?.trim()) {
       errors.firstName = 'Le prénom est requis';
     }

     if (!studentData.lastName?.trim()) {
       errors.lastName = 'Le nom est requis';
     }

     if (!studentData.dateOfBirth) {
       errors.dateOfBirth = 'La date de naissance est requise';
     } else {
       const age = this.calculateAge(studentData.dateOfBirth);
       if (age < 3 || age > 18) {
         errors.dateOfBirth = 'L\'âge doit être entre 3 et 18 ans';
       }
     }

     if (!studentData.parentEmail?.trim()) {
       errors.parentEmail = 'L\'email du parent est requis';
     } else if (!this.isValidEmail(studentData.parentEmail)) {
       errors.parentEmail = 'Format d\'email invalide';
     }

     if (!studentData.address?.trim()) {
       errors.address = 'L\'adresse est requise';
     }

     // Au moins un contact parent requis
     if (!studentData.fatherPhone?.trim() && !studentData.motherPhone?.trim()) {
       errors.parentContact = 'Au moins un numéro de téléphone parent est requis';
     }

     // Validation des numéros de téléphone
     if (studentData.fatherPhone && !this.isValidPhoneNumber(studentData.fatherPhone)) {
       errors.fatherPhone = 'Format de téléphone invalide';
     }

     if (studentData.motherPhone && !this.isValidPhoneNumber(studentData.motherPhone)) {
       errors.motherPhone = 'Format de téléphone invalide';
     }

     return {
       isValid: Object.keys(errors).length === 0,
       errors
     };
   }
 }