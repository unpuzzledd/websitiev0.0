import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AdminApi } from '../lib/adminApi';

interface SetupStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
}

export const TestAcademySetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [academyData, setAcademyData] = useState<any>(null);

  const updateStep = (stepId: string, status: SetupStep['status'], message?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message }
        : step
    ));
  };

  const createTestAcademy = async () => {
    setIsLoading(true);
    setSteps([
      { id: 'user', name: 'Create/Verify User', status: 'pending' },
      { id: 'location', name: 'Create/Verify Location', status: 'pending' },
      { id: 'academy', name: 'Create Academy', status: 'pending' },
      { id: 'skill', name: 'Add Chess Skill', status: 'pending' },
      { id: 'batch', name: 'Create Test Batch', status: 'pending' }
    ]);

    try {
      // Step 1: Create or verify user
      updateStep('user', 'in_progress', 'Checking user account...');
      
      // First, let's check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'meetneerajv@gmail.com')
        .single();

      let userId;
      if (existingUser) {
        updateStep('user', 'completed', 'User already exists');
        userId = existingUser.id;
      } else {
        updateStep('user', 'error', 'User not found. Please sign up first with meetneerajv@gmail.com');
        return;
      }

      // Step 2: Create or verify location
      updateStep('location', 'in_progress', 'Setting up Bangalore location...');
      
      const { data: locations } = await supabase
        .from('locations')
        .select('*')
        .eq('name', 'Bangalore')
        .single();

      let locationId;
      if (locations) {
        updateStep('location', 'completed', 'Location exists');
        locationId = locations.id;
      } else {
        const { data: newLocation, error: createLocationError } = await supabase
          .from('locations')
          .insert({
            name: 'Bangalore',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India'
          })
          .select()
          .single();

        if (createLocationError) {
          updateStep('location', 'error', `Error creating location: ${createLocationError.message}`);
          return;
        }
        locationId = newLocation.id;
        updateStep('location', 'completed', 'Location created');
      }

      // Step 3: Create academy
      updateStep('academy', 'in_progress', 'Creating Vishal Chess Academy...');
      
      const academyResult = await AdminApi.createAcademy({
        name: 'Vishal Chess Academy',
        phone_number: '+91 9876543210',
        owner_id: userId,
        location_id: locationId
      });

      if (academyResult.error) {
        updateStep('academy', 'error', `Error creating academy: ${academyResult.error}`);
        return;
      }

      updateStep('academy', 'completed', 'Academy created successfully');
      setAcademyData(academyResult.data);

      // Step 4: Add Chess skill
      updateStep('skill', 'in_progress', 'Adding Chess skill...');
      
      // First check if Chess skill exists
      const { data: chessSkill } = await supabase
        .from('skills')
        .select('*')
        .eq('name', 'Chess')
        .single();

      let skillId;
      if (chessSkill) {
        skillId = chessSkill.id;
      } else {
        const { data: newSkill, error: createSkillError } = await supabase
          .from('skills')
          .insert({
            name: 'Chess',
            description: 'Chess strategy and tactics training'
          })
          .select()
          .single();

        if (createSkillError) {
          updateStep('skill', 'error', `Error creating skill: ${createSkillError.message}`);
          return;
        }
        skillId = newSkill.id;
      }

      // Add skill to academy
      const { error: academySkillError } = await supabase
        .from('academy_skills')
        .insert({
          academy_id: academyResult.data!.id,
          skill_id: skillId,
          status: 'approved'
        });

      if (academySkillError) {
        updateStep('skill', 'error', `Error adding skill to academy: ${academySkillError.message}`);
        return;
      }

      updateStep('skill', 'completed', 'Chess skill added to academy');

      // Step 5: Create test batch
      updateStep('batch', 'in_progress', 'Creating test batch...');
      
      const { error: batchError } = await supabase
        .from('batches')
        .insert({
          name: 'Beginner Chess Batch',
          academy_id: academyResult.data!.id,
          skill_id: skillId,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          max_students: 20,
          status: 'active'
        })
        .select()
        .single();

      if (batchError) {
        updateStep('batch', 'error', `Error creating batch: ${batchError.message}`);
        return;
      }

      updateStep('batch', 'completed', 'Test batch created successfully');

    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏫 Test Academy Setup</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Vishal Chess Academy</h3>
        <p className="text-gray-600 mb-4">
          This will create a complete test academy setup with:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>User: meetneerajv@gmail.com (academy_owner role)</li>
          <li>Location: Bangalore, Karnataka, India</li>
          <li>Academy: Vishal Chess Academy</li>
          <li>Skill: Chess</li>
          <li>Batch: Beginner Chess Batch</li>
        </ul>
      </div>

      <button
        onClick={createTestAcademy}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {isLoading ? 'Setting up...' : 'Create Test Academy'}
      </button>

      {steps.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Setup Progress:</h4>
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'error' ? 'bg-red-500' :
                  step.status === 'in_progress' ? 'bg-yellow-500' :
                  'bg-gray-300'
                }`} />
                <span className="font-medium">{step.name}</span>
                {step.message && (
                  <span className="text-sm text-gray-600">- {step.message}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {academyData && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-lg font-semibold text-green-800 mb-2">✅ Academy Created Successfully!</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Name:</strong> {academyData.name}</p>
            <p><strong>ID:</strong> {academyData.id}</p>
            <p><strong>Owner:</strong> {academyData.owner?.full_name || academyData.owner?.email}</p>
            <p><strong>Location:</strong> {academyData.location?.name}, {academyData.location?.city}</p>
            <p><strong>Status:</strong> {academyData.status}</p>
            <p><strong>Phone:</strong> {academyData.phone_number}</p>
          </div>
          <div className="mt-3">
            <p className="text-sm text-green-600">
              <strong>Next Steps:</strong> Sign in with meetneerajv@gmail.com and navigate to /academy to see the dashboard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
