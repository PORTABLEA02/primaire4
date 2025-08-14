import { supabase } from '../lib/supabase';

export class NotificationService {
  // Envoyer une notification par email
  static async sendEmailNotification(
    to: string[],
    subject: string,
    htmlContent: string,
    schoolId: string
  ) {
    try {
      // Note: Vous devrez configurer un service d'email comme SendGrid ou Resend
      // Pour l'instant, on simule l'envoi
      
      console.log('Envoi d\'email:', {
        to,
        subject,
        content: htmlContent,
        schoolId
      });

      // Logger l'activité
      await supabase
        .from('activity_logs')
        .insert({
          school_id: schoolId,
          action: 'SEND_EMAIL',
          entity_type: 'notification',
          level: 'info',
          details: `Email envoyé à ${to.length} destinataire(s): ${subject}`
        });

      return { success: true, messageId: `email_${Date.now()}` };
    } catch (error) {
      console.error('Erreur lors de l\'envoi d\'email:', error);
      throw error;
    }
  }

  // Envoyer une notification SMS
  static async sendSMSNotification(
    phoneNumbers: string[],
    message: string,
    schoolId: string
  ) {
    try {
      // Note: Vous devrez configurer un service SMS
      // Pour l'instant, on simule l'envoi
      
      console.log('Envoi de SMS:', {
        phoneNumbers,
        message,
        schoolId
      });

      // Logger l'activité
      await supabase
        .from('activity_logs')
        .insert({
          school_id: schoolId,
          action: 'SEND_SMS',
          entity_type: 'notification',
          level: 'info',
          details: `SMS envoyé à ${phoneNumbers.length} numéro(s)`
        });

      return { success: true, messageId: `sms_${Date.now()}` };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de SMS:', error);
      throw error;
    }
  }

  // Notifier les parents d'un bulletin
  static async notifyBulletinAvailable(
    studentId: string,
    gradePeriodId: string,
    schoolId: string
  ) {
    try {
      // Obtenir les informations de l'élève et des parents
      const { data: enrollment } = await supabase
        .from('enrollment_details')
        .select('*')
        .eq('student_id', studentId)
        .eq('is_active', true)
        .single();

      if (!enrollment) throw new Error('Inscription non trouvée');

      const { data: period } = await supabase
        .from('grade_periods')
        .select('name')
        .eq('id', gradePeriodId)
        .single();

      if (!period) throw new Error('Période non trouvée');

      // Préparer le contenu de la notification
      const subject = `Bulletin scolaire disponible - ${enrollment.first_name} ${enrollment.last_name}`;
      const emailContent = `
        <h2>Bulletin Scolaire - ${period.name}</h2>
        <p>Cher(e) parent/tuteur,</p>
        <p>Le bulletin scolaire de <strong>${enrollment.first_name} ${enrollment.last_name}</strong> 
        pour la période <strong>${period.name}</strong> est maintenant disponible.</p>
        <p>Classe: <strong>${enrollment.class_name}</strong></p>
        <p>Vous pouvez le consulter en vous connectant à votre espace parent ou en contactant l'école.</p>
        <p>Cordialement,<br>L'équipe pédagogique</p>
      `;

      const smsContent = `Bulletin scolaire de ${enrollment.first_name} ${enrollment.last_name} (${enrollment.class_name}) disponible pour ${period.name}. Contactez l'école pour plus d'infos.`;

      // Envoyer les notifications
      const emailPromise = this.sendEmailNotification(
        [enrollment.parent_email],
        subject,
        emailContent,
        schoolId
      );

      const phoneNumbers = [enrollment.father_phone, enrollment.mother_phone].filter(Boolean);
      const smsPromise = phoneNumbers.length > 0 
        ? this.sendSMSNotification(phoneNumbers, smsContent, schoolId)
        : Promise.resolve({ success: true });

      await Promise.all([emailPromise, smsPromise]);

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la notification de bulletin:', error);
      throw error;
    }
  }

  // Notifier un paiement en retard
  static async notifyLatePayment(enrollmentId: string, schoolId: string) {
    try {
      const { data: enrollment } = await supabase
        .from('enrollment_details')
        .select('*')
        .eq('id', enrollmentId)
        .single();

      if (!enrollment) throw new Error('Inscription non trouvée');

      const subject = `Rappel de paiement - ${enrollment.first_name} ${enrollment.last_name}`;
      const emailContent = `
        <h2>Rappel de Paiement</h2>
        <p>Cher(e) parent/tuteur,</p>
        <p>Nous vous rappelons qu'un paiement est en attente pour <strong>${enrollment.first_name} ${enrollment.last_name}</strong>.</p>
        <p>Classe: <strong>${enrollment.class_name}</strong></p>
        <p>Montant dû: <strong>${enrollment.outstanding_amount.toLocaleString()} FCFA</strong></p>
        <p>Merci de régulariser cette situation dans les plus brefs délais.</p>
        <p>Cordialement,<br>Le service comptabilité</p>
      `;

      const smsContent = `Rappel: Paiement en attente pour ${enrollment.first_name} ${enrollment.last_name} (${enrollment.class_name}). Montant: ${enrollment.outstanding_amount.toLocaleString()} FCFA.`;

      // Envoyer les notifications
      await this.sendEmailNotification(
        [enrollment.parent_email],
        subject,
        emailContent,
        schoolId
      );

      const phoneNumbers = [enrollment.father_phone, enrollment.mother_phone].filter(Boolean);
      if (phoneNumbers.length > 0) {
        await this.sendSMSNotification(phoneNumbers, smsContent, schoolId);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la notification de retard:', error);
      throw error;
    }
  }

  // Notifier un changement d'enseignant
  static async notifyTeacherChange(
    classId: string,
    oldTeacherId: string,
    newTeacherId: string,
    schoolId: string,
    academicYearId: string
  ) {
    try {
      // Obtenir les informations de la classe et des enseignants
      const { data: classInfo } = await supabase
        .from('classes')
        .select('name, level')
        .eq('id', classId)
        .single();

      const { data: oldTeacher } = await supabase
        .from('teachers')
        .select('first_name, last_name')
        .eq('id', oldTeacherId)
        .single();

      const { data: newTeacher } = await supabase
        .from('teachers')
        .select('first_name, last_name')
        .eq('id', newTeacherId)
        .single();

      // Obtenir les parents des élèves de la classe
      const { data: enrollments } = await supabase
        .from('enrollment_details')
        .select('parent_email, father_phone, mother_phone, first_name, last_name')
        .eq('class_id', classId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true);

      if (!classInfo || !oldTeacher || !newTeacher || !enrollments) {
        throw new Error('Données manquantes pour la notification');
      }

      const subject = `Changement d'enseignant - Classe ${classInfo.name}`;
      const emailContent = `
        <h2>Changement d'Enseignant</h2>
        <p>Cher(e) parent/tuteur,</p>
        <p>Nous vous informons qu'un changement d'enseignant a eu lieu dans la classe <strong>${classInfo.name}</strong>.</p>
        <p><strong>Ancien enseignant:</strong> ${oldTeacher.first_name} ${oldTeacher.last_name}</p>
        <p><strong>Nouvel enseignant:</strong> ${newTeacher.first_name} ${newTeacher.last_name}</p>
        <p>Ce changement prend effet immédiatement. Une période de transition sera mise en place pour assurer la continuité pédagogique.</p>
        <p>N'hésitez pas à nous contacter pour toute question.</p>
        <p>Cordialement,<br>La direction</p>
      `;

      // Envoyer à tous les parents
      const parentEmails = enrollments.map(e => e.parent_email);
      await this.sendEmailNotification(parentEmails, subject, emailContent, schoolId);

      return { success: true, notifiedParents: parentEmails.length };
    } catch (error) {
      console.error('Erreur lors de la notification de changement:', error);
      throw error;
    }
  }

  // Obtenir les modèles de notification
  static getNotificationTemplates() {
    return {
      bulletin: {
        subject: 'Bulletin scolaire disponible - {{studentName}}',
        email: `
          <h2>Bulletin Scolaire - {{period}}</h2>
          <p>Cher(e) parent/tuteur,</p>
          <p>Le bulletin scolaire de <strong>{{studentName}}</strong> pour la période <strong>{{period}}</strong> est maintenant disponible.</p>
          <p>Classe: <strong>{{className}}</strong></p>
          <p>Vous pouvez le consulter en vous connectant à votre espace parent.</p>
          <p>Cordialement,<br>L'équipe pédagogique</p>
        `,
        sms: 'Bulletin scolaire de {{studentName}} ({{className}}) disponible pour {{period}}. Contactez l\'école pour plus d\'infos.'
      },
      payment: {
        subject: 'Rappel de paiement - {{studentName}}',
        email: `
          <h2>Rappel de Paiement</h2>
          <p>Cher(e) parent/tuteur,</p>
          <p>Un paiement est en attente pour <strong>{{studentName}}</strong>.</p>
          <p>Montant dû: <strong>{{amount}} FCFA</strong></p>
          <p>Merci de régulariser cette situation.</p>
          <p>Cordialement,<br>Le service comptabilité</p>
        `,
        sms: 'Rappel: Paiement en attente pour {{studentName}}. Montant: {{amount}} FCFA.'
      },
      teacherChange: {
        subject: 'Changement d\'enseignant - Classe {{className}}',
        email: `
          <h2>Changement d'Enseignant</h2>
          <p>Cher(e) parent/tuteur,</p>
          <p>Un changement d'enseignant a eu lieu dans la classe <strong>{{className}}</strong>.</p>
          <p><strong>Nouvel enseignant:</strong> {{newTeacher}}</p>
          <p>Cordialement,<br>La direction</p>
        `,
        sms: 'Changement d\'enseignant en {{className}}. Nouvel enseignant: {{newTeacher}}.'
      }
    };
  }
}