import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useRealTimeUpdates = (
  schoolId: string,
  onUpdate: (table: string, payload: any) => void
) => {
  useEffect(() => {
    if (!schoolId) return;

    // Écouter les changements sur les tables importantes
    const channels = [
      // Élèves et inscriptions
      supabase
        .channel('students_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'students',
            filter: `school_id=eq.${schoolId}`
          },
          (payload) => onUpdate('students', payload)
        )
        .subscribe(),

      supabase
        .channel('enrollments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'student_class_enrollments',
            filter: `school_id=eq.${schoolId}`
          },
          (payload) => onUpdate('enrollments', payload)
        )
        .subscribe(),

      // Paiements
      supabase
        .channel('payments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payment_transactions',
            filter: `school_id=eq.${schoolId}`
          },
          (payload) => onUpdate('payments', payload)
        )
        .subscribe(),

      // Enseignants
      supabase
        .channel('teachers_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'teachers',
            filter: `school_id=eq.${schoolId}`
          },
          (payload) => onUpdate('teachers', payload)
        )
        .subscribe(),

      // Classes
      supabase
        .channel('classes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'classes',
            filter: `school_id=eq.${schoolId}`
          },
          (payload) => onUpdate('classes', payload)
        )
        .subscribe(),

      // Notes
      supabase
        .channel('grades_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'grades',
            filter: `school_id=eq.${schoolId}`
          },
          (payload) => onUpdate('grades', payload)
        )
        .subscribe()
    ];

    // Nettoyage
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [schoolId, onUpdate]);
};