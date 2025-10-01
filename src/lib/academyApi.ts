import { supabase } from './supabase';
import { Academy, Location, Skill, Batch } from '../types/database';

export interface AcademyStats {
  totalStudents: number;
  newPendingStudents: number;
  activeTeachers: number;
  totalBatches: number;
  activeBatches: number;
  totalSkills: number;
}

export interface AcademyActivity {
  id: string;
  name: string;
  type: 'skill' | 'batch' | 'student' | 'teacher';
  status: 'active' | 'pending' | 'completed';
  description: string;
  created_at: string;
}

export class AcademyApi {
  /**
   * Get academy information for the current user
   */
  static async getAcademyInfo(userId: string): Promise<{
    academy: Academy | null;
    location: Location | null;
    skills: Skill[];
    error: string | null;
  }> {
    try {
      // Get academy owned by the user
      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .select(`
          *,
          location:locations(*)
        `)
        .eq('owner_id', userId)
        .eq('status', 'active')
        .single();

      if (academyError) {
        return { academy: null, location: null, skills: [], error: academyError.message };
      }

      if (!academy) {
        return { academy: null, location: null, skills: [], error: 'No academy found' };
      }

      // Get skills for this academy
      const { data: academySkills, error: skillsError } = await supabase
        .from('academy_skills')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('academy_id', academy.id)
        .eq('status', 'approved');

      if (skillsError) {
        return { academy, location: academy.location, skills: [], error: skillsError.message };
      }

      const skills = academySkills.map((as: any) => as.skill).filter(Boolean);

      return { academy, location: academy.location, skills, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy info';
      return { academy: null, location: null, skills: [], error: errorMessage };
    }
  }

  /**
   * Get academy statistics
   */
  static async getAcademyStats(academyId: string): Promise<{
    stats: AcademyStats | null;
    error: string | null;
  }> {
    try {
      // Get student enrollments
      const { data: studentEnrollments, error: studentsError } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('academy_id', academyId);

      if (studentsError) {
        return { stats: null, error: studentsError.message };
      }

      // Get teacher assignments
      const { data: teacherAssignments, error: teachersError } = await supabase
        .from('teacher_assignments')
        .select('*')
        .eq('academy_id', academyId)
        .eq('status', 'approved');

      if (teachersError) {
        return { stats: null, error: teachersError.message };
      }

      // Get batches
      const { data: batches, error: batchesError } = await supabase
        .from('batches')
        .select('*')
        .eq('academy_id', academyId);

      if (batchesError) {
        return { stats: null, error: batchesError.message };
      }

      // Get academy skills
      const { data: academySkills, error: skillsError } = await supabase
        .from('academy_skills')
        .select('*')
        .eq('academy_id', academyId)
        .eq('status', 'approved');

      if (skillsError) {
        return { stats: null, error: skillsError.message };
      }

      const totalStudents = studentEnrollments?.length || 0;
      const newPendingStudents = studentEnrollments?.filter(se => se.status === 'pending').length || 0;
      const activeTeachers = teacherAssignments?.length || 0;
      const totalBatches = batches?.length || 0;
      const activeBatches = batches?.filter(b => b.status === 'active').length || 0;
      const totalSkills = academySkills?.length || 0;

      const stats: AcademyStats = {
        totalStudents,
        newPendingStudents,
        activeTeachers,
        totalBatches,
        activeBatches,
        totalSkills
      };

      return { stats, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get academy stats';
      return { stats: null, error: errorMessage };
    }
  }

  /**
   * Get recent activities for the academy
   */
  static async getRecentActivities(academyId: string, limit: number = 10): Promise<{
    activities: AcademyActivity[];
    error: string | null;
  }> {
    try {
      const activities: AcademyActivity[] = [];

      // Get recent batches
      const { data: batches, error: batchesError } = await supabase
        .from('batches')
        .select('*')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!batchesError && batches) {
        batches.forEach(batch => {
          activities.push({
            id: batch.id,
            name: batch.name,
            type: 'batch',
            status: batch.status as 'active' | 'pending' | 'completed',
            description: `New batch created: ${batch.name}`,
            created_at: batch.created_at
          });
        });
      }

      // Get recent student enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          student:users!student_enrollments_student_id_fkey(*)
        `)
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!enrollmentsError && enrollments) {
        enrollments.forEach(enrollment => {
          activities.push({
            id: enrollment.id,
            name: enrollment.student?.full_name || 'Unknown Student',
            type: 'student',
            status: enrollment.status as 'active' | 'pending' | 'completed',
            description: `New student enrollment: ${enrollment.student?.full_name || 'Unknown'}`,
            created_at: enrollment.created_at
          });
        });
      }

      // Sort by created_at and limit
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { activities: activities.slice(0, limit), error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get recent activities';
      return { activities: [], error: errorMessage };
    }
  }

  /**
   * Get batches for the academy
   */
  static async getBatches(academyId: string): Promise<{
    batches: Batch[];
    error: string | null;
  }> {
    try {
      const { data: batches, error } = await supabase
        .from('batches')
        .select(`
          *,
          skill:skills(*),
          teacher:users!batches_teacher_id_fkey(*)
        `)
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) {
        return { batches: [], error: error.message };
      }

      return { batches: batches || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get batches';
      return { batches: [], error: errorMessage };
    }
  }

  /**
   * Get students for the academy
   */
  static async getStudents(academyId: string): Promise<{
    students: any[];
    error: string | null;
  }> {
    try {
      const { data: enrollments, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          student:users!student_enrollments_student_id_fkey(*)
        `)
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false });

      if (error) {
        return { students: [], error: error.message };
      }

      const students = enrollments?.map(enrollment => ({
        ...enrollment.student,
        enrollment_status: enrollment.status,
        enrolled_at: enrollment.created_at
      })) || [];

      return { students, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get students';
      return { students: [], error: errorMessage };
    }
  }

  /**
   * Get teachers for the academy
   */
  static async getTeachers(academyId: string): Promise<{
    teachers: any[];
    error: string | null;
  }> {
    try {
      const { data: assignments, error } = await supabase
        .from('teacher_assignments')
        .select(`
          *,
          teacher:users!teacher_assignments_teacher_id_fkey(*)
        `)
        .eq('academy_id', academyId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        return { teachers: [], error: error.message };
      }

      const teachers = assignments?.map(assignment => ({
        ...assignment.teacher,
        assignment_status: assignment.status,
        assigned_at: assignment.created_at
      })) || [];

      return { teachers, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get teachers';
      return { teachers: [], error: errorMessage };
    }
  }
}
