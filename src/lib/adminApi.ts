import { supabase } from './supabase';
import { 
  Academy, 
  Location, 
  Skill, 
  AcademyPhoto, 
  AcademySkill, 
  // User,
  Admin,
  ApiResponse,
  PaginatedResponse 
} from '../types/database';

export class AdminApi {
  
  // =============================================
  // ACADEMY MANAGEMENT
  // =============================================

  /**
   * Create a new academy
   */
  static async createAcademy(academyData: {
    name: string;
    phone_number: string;
    owner_id: string;
    location_id: string;
  }): Promise<ApiResponse<Academy>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .insert({
          ...academyData,
          status: 'pending'
        })
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create academy';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete an academy
   */
  static async deleteAcademy(academyId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academies')
        .delete()
        .eq('id', academyId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete academy';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update academy status (pending/active/suspended)
   */
  static async updateAcademyStatus(
    academyId: string, 
    status: 'pending' | 'active' | 'suspended'
  ): Promise<ApiResponse<Academy>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .update({ status })
        .eq('id', academyId)
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update academy status';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update academy name (admin only)
   */
  static async updateAcademyName(
    academyId: string, 
    name: string
  ): Promise<ApiResponse<Academy>> {
    try {
      const { data, error } = await supabase
        .from('academies')
        .update({ name })
        .eq('id', academyId)
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update academy name';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all academies with pagination
   */
  static async getAcademies(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<PaginatedResponse<Academy>> {
    try {
      let query = supabase
        .from('academies')
        .select(`
          *,
          location:locations(*),
          owner:users(*)
        `, { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch academies';
      throw new Error(errorMessage);
    }
  }

  // =============================================
  // LOCATION MANAGEMENT
  // =============================================

  /**
   * Create a new location
   */
  static async createLocation(locationData: {
    name: string;
    city: string;
    state: string;
    country?: string;
  }): Promise<ApiResponse<Location>> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          ...locationData,
          country: locationData.country || 'India'
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create location';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update location
   */
  static async updateLocation(
    locationId: string,
    updates: Partial<Location>
  ): Promise<ApiResponse<Location>> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', locationId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update location';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete location
   */
  static async deleteLocation(locationId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if location is being used by any academy
      const { data: academies, error: checkError } = await supabase
        .from('academies')
        .select('id')
        .eq('location_id', locationId)
        .limit(1);

      if (checkError) {
        return { data: null, error: checkError.message };
      }

      if (academies && academies.length > 0) {
        return { data: null, error: 'Cannot delete location that is being used by academies' };
      }

      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete location';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all locations
   */
  static async getLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch locations';
      throw new Error(errorMessage);
    }
  }

  // =============================================
  // SKILL MANAGEMENT
  // =============================================

  /**
   * Create a new skill
   */
  static async createSkill(skillData: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<Skill>> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert(skillData)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create skill';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update skill
   */
  static async updateSkill(
    skillId: string,
    updates: Partial<Skill>
  ): Promise<ApiResponse<Skill>> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', skillId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update skill';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete skill
   */
  static async deleteSkill(skillId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if skill is being used by any academy
      const { data: academySkills, error: checkError } = await supabase
        .from('academy_skills')
        .select('id')
        .eq('skill_id', skillId)
        .limit(1);

      if (checkError) {
        return { data: null, error: checkError.message };
      }

      if (academySkills && academySkills.length > 0) {
        return { data: null, error: 'Cannot delete skill that is being used by academies' };
      }

      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete skill';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all skills
   */
  static async getSkills(): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch skills';
      throw new Error(errorMessage);
    }
  }

  // =============================================
  // APPROVAL WORKFLOWS
  // =============================================

  /**
   * Get all pending academy photos for approval
   */
  static async getPendingPhotos(): Promise<AcademyPhoto[]> {
    try {
      const { data, error } = await supabase
        .from('academy_photos')
        .select(`
          *,
          academies!inner(name, owner_id)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending photos';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all pending academy skills for approval
   */
  static async getPendingSkills(): Promise<AcademySkill[]> {
    try {
      const { data, error } = await supabase
        .from('academy_skills')
        .select(`
          *,
          academies!inner(name, owner_id),
          skills!inner(name, description)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending skills';
      throw new Error(errorMessage);
    }
  }

  /**
   * Approve academy photo
   */
  static async approvePhoto(photoId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academy_photos')
        .update({ status: 'approved' })
        .eq('id', photoId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve photo';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Reject academy photo
   */
  static async rejectPhoto(photoId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academy_photos')
        .update({ status: 'rejected' })
        .eq('id', photoId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject photo';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Approve academy skill
   */
  static async approveSkill(academySkillId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academy_skills')
        .update({ status: 'approved' })
        .eq('id', academySkillId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve skill';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Reject academy skill
   */
  static async rejectSkill(academySkillId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('academy_skills')
        .update({ status: 'rejected' })
        .eq('id', academySkillId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject skill';
      return { data: null, error: errorMessage };
    }
  }

  // =============================================
  // USER MANAGEMENT (Super Admin only)
  // =============================================

  /**
   * Create a new admin (Super Admin only)
   */
  static async createAdmin(adminData: {
    user_id: string;
    created_by: string;
  }): Promise<ApiResponse<Admin>> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .insert(adminData)
        .select(`
          *,
          user:users(*),
          creator:users!admins_created_by_fkey(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create admin';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Update admin status
   */
  static async updateAdminStatus(
    adminId: string,
    status: 'active' | 'suspended'
  ): Promise<ApiResponse<Admin>> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .update({ status })
        .eq('id', adminId)
        .select(`
          *,
          user:users(*),
          creator:users!admins_created_by_fkey(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update admin status';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Delete admin
   */
  static async deleteAdmin(adminId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete admin';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Get all admins
   */
  static async getAdmins(): Promise<Admin[]> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select(`
          *,
          user:users(*),
          creator:users!admins_created_by_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch admins';
      throw new Error(errorMessage);
    }
  }

  // =============================================
  // DASHBOARD DATA AGGREGATION
  // =============================================

  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats(): Promise<{
    totalAcademies: number;
    pendingAcademies: number;
    activeAcademies: number;
    suspendedAcademies: number;
    totalPhotos: number;
    pendingPhotos: number;
    totalSkills: number;
    pendingSkills: number;
    totalAdmins: number;
    activeAdmins: number;
  }> {
    try {
      // Get academy counts
      const { count: totalAcademies } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      const { count: pendingAcademies } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: activeAcademies } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: suspendedAcademies } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'suspended');

      // Get photo counts
      const { count: totalPhotos } = await supabase
        .from('academy_photos')
        .select('*', { count: 'exact', head: true });

      const { count: pendingPhotos } = await supabase
        .from('academy_photos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get skill counts
      const { count: totalSkills } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true });

      const { count: pendingSkills } = await supabase
        .from('academy_skills')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get admin counts
      const { count: totalAdmins } = await supabase
        .from('admins')
        .select('*', { count: 'exact', head: true });

      const { count: activeAdmins } = await supabase
        .from('admins')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        totalAcademies: totalAcademies || 0,
        pendingAcademies: pendingAcademies || 0,
        activeAcademies: activeAcademies || 0,
        suspendedAcademies: suspendedAcademies || 0,
        totalPhotos: totalPhotos || 0,
        pendingPhotos: pendingPhotos || 0,
        totalSkills: totalSkills || 0,
        pendingSkills: pendingSkills || 0,
        totalAdmins: totalAdmins || 0,
        activeAdmins: activeAdmins || 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get recent activities for admin dashboard
   */
  static async getRecentActivities(limit: number = 10): Promise<any[]> {
    try {
      // Get recent academy creations
      const { data: recentAcademies } = await supabase
        .from('academies')
        .select(`
          id,
          name,
          status,
          created_at,
          owner:users(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Get recent photo uploads
      const { data: recentPhotos } = await supabase
        .from('academy_photos')
        .select(`
          id,
          status,
          created_at,
          academies!inner(name, owner:users(full_name, email))
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Combine and sort by date
      const activities = [
        ...(recentAcademies || []).map(academy => ({
          type: 'academy_created',
          id: academy.id,
          title: `New academy: ${academy.name}`,
          description: `Created by ${(academy as any).owner?.full_name || (academy as any).owner?.email}`,
          status: academy.status,
          created_at: academy.created_at
        })),
        ...(recentPhotos || []).map(photo => ({
          type: 'photo_uploaded',
          id: photo.id,
          title: `Photo uploaded to ${(photo.academies as any)?.name}`,
          description: `Uploaded by ${(photo.academies as any)?.owner?.full_name || (photo.academies as any)?.owner?.email}`,
          status: photo.status,
          created_at: photo.created_at
        }))
      ];

      return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch recent activities';
      throw new Error(errorMessage);
    }
  }
}
