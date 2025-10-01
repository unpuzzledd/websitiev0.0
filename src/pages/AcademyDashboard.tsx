import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AcademyApi, AcademyStats, AcademyActivity } from '../lib/academyApi'

const AcademyDashboard = () => {
  const [showAddActivityModal, setShowAddActivityModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<string | null>('Karate')
  
  // Data state
  const [academyInfo, setAcademyInfo] = useState<any>(null)
  const [stats, setStats] = useState<AcademyStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<AcademyActivity[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  // Role-based access control
  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'academy_owner') {
        // Redirect non-academy owners to appropriate page
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin')
        } else if (user.role) {
          navigate('/dashboard')
        } else {
          navigate('/role-selection')
        }
      }
    } else if (!loading && !user) {
      // No user - redirect to home
      navigate('/')
    }
  }, [user, loading, navigate])

  // Load academy data when authenticated
  useEffect(() => {
    if (user && user.role === 'academy_owner') {
      loadAcademyData()
    }
  }, [user])

  const loadAcademyData = async () => {
    if (!user?.id) return

    try {
      setDataLoading(true)
      setDataError(null)

      // Load academy info
      const { academy, location, skills: academySkills, error: academyError } = await AcademyApi.getAcademyInfo(user.id)
      
      if (academyError) {
        setDataError(academyError)
        return
      }

      if (!academy) {
        setDataError('No academy found for this user')
        return
      }

      setAcademyInfo({ academy, location })
      setSkills(academySkills)

      // Load stats
      const { stats: academyStats, error: statsError } = await AcademyApi.getAcademyStats(academy.id)
      if (!statsError) {
        setStats(academyStats)
      }

      // Load recent activities
      const { activities, error: activitiesError } = await AcademyApi.getRecentActivities(academy.id, 5)
      if (!activitiesError) {
        setRecentActivities(activities)
      }

      // Load batches
      const { batches: academyBatches, error: batchesError } = await AcademyApi.getBatches(academy.id)
      if (!batchesError) {
        setBatches(academyBatches)
      }

      // Load students
      const { students: academyStudents, error: studentsError } = await AcademyApi.getStudents(academy.id)
      if (!studentsError) {
        setStudents(academyStudents)
      }

      // Load teachers
      const { teachers: academyTeachers, error: teachersError } = await AcademyApi.getTeachers(academy.id)
      if (!teachersError) {
        setTeachers(academyTeachers)
      }

    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to load academy data')
    } finally {
      setDataLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FCFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963] mx-auto mb-4"></div>
          <p className="text-[#5E8C7D]">Loading...</p>
        </div>
      </div>
    )
  }

  // Show access denied if user is not an academy owner
  if (!user || user.role !== 'academy_owner') {
    return (
      <div className="min-h-screen bg-[#F7FCFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F1717] mb-2">Access Denied</h2>
          <p className="text-[#5E8C7D] mb-4">This page is only accessible to Academy Owners.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4d] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const activities = [
    { name: 'Chess', image: 'https://api.builder.io/api/v1/image/assets/TEMP/4c88c0a5855eb4415bad44ff5c61d4454f8e5509?width=496' },
    { name: 'Karate', image: 'https://api.builder.io/api/v1/image/assets/TEMP/d1d9eea3f944bbd86d0a833debd1dd23afb6caa0?width=296' },
    { name: 'Art', image: 'https://api.builder.io/api/v1/image/assets/TEMP/6af8a22e47ae385842ec8cd80e9b1c54a1d7f1ef?width=296' },
    { name: 'Music/Dance', image: 'https://api.builder.io/api/v1/image/assets/TEMP/0818dd948dee100e9eddf1c621e6bbd91772177e?width=296' }
  ]

  const upcomingActivities = ['Chess', 'Karate', 'Art', 'Music/Dance']

  return (
    <div className="min-h-screen bg-[#F7FCFA] font-[Lexend]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E8EB]">
        <div className="flex justify-between items-center px-10 py-3">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-start">
                <div className="w-4 h-4 relative">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.333333 0.333333H4.7778V4.7778H9.2222V9.2222H13.6667V13.6667H0.333333V0.333333V0.333333Z" fill="#0F1717"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-lg font-bold text-[#0F1717] leading-[23px]">
                {academyInfo?.academy?.name || 'Academy Dashboard'}
              </h1>
            </div>
          
          <div className="flex justify-end items-center gap-4 flex-1">
            <div className="flex items-center gap-9">
              <span className="text-sm text-[#0F1717] leading-[21px]">Home</span>
            </div>
            
            <div className="flex items-center gap-2 px-2.5 py-0 bg-[#F0F5F2] rounded-[20px] max-w-[480px]">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.3281 12.7453C14.8945 11.9984 14.25 9.88516 14.25 7.125C14.25 3.67322 11.4518 0.875 8 0.875C4.54822 0.875 1.75 3.67322 1.75 7.125C1.75 9.88594 1.10469 11.9984 0.671094 12.7453C0.445722 13.1318 0.444082 13.6092 0.666796 13.9973C0.889509 14.3853 1.30261 14.6247 1.75 14.625H4.93828C5.23556 16.0796 6.51529 17.1243 8 17.1243C9.48471 17.1243 10.7644 16.0796 11.0617 14.625H14.25C14.6972 14.6244 15.1101 14.3849 15.3326 13.9969C15.5551 13.609 15.5534 13.1317 15.3281 12.7453V12.7453ZM8 15.875C7.20562 15.8748 6.49761 15.3739 6.23281 14.625H9.76719C9.50239 15.3739 8.79438 15.8748 8 15.875V15.875ZM1.75 13.375C2.35156 12.3406 3 9.94375 3 7.125C3 4.36358 5.23858 2.125 8 2.125C10.7614 2.125 13 4.36358 13 7.125C13 9.94141 13.6469 12.3383 14.25 13.375H1.75Z" fill="#0F1717"/>
              </svg>
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[#0F1717]">{user?.full_name || 'Academy Owner'}</p>
                <p className="text-xs text-[#5E8C7D]">Academy Owner</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-[#F0F5F2] text-[#0D1C17] font-medium text-xs rounded-lg hover:bg-[#E5F5F0] transition-colors"
              >
                Logout
              </button>
            </div>
            
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/ec3fd35c54906d1a891fbea1c5010977b18a8366?width=80" 
              alt="Profile" 
              className="w-10 h-10 rounded-[20px]"
            />
          </div>
        </div>
      </header>

      <div className="flex min-h-[800px]">
        {/* Sidebar */}
        <div className="w-80 p-6 flex flex-col justify-center items-start gap-1">
          <div className="bg-white p-4 rounded-none min-h-[700px] flex flex-col justify-between items-start self-stretch">
            <div className="flex flex-col items-start gap-4 self-stretch">
              <div className="flex items-start gap-3 self-stretch">
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/03fe4649b6b83549e66e7b59d2cd2df2753843b9?width=80" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-[20px]"
                />
              <div className="flex flex-col items-start h-10">
                <span className="text-base text-[#0F1717] leading-6 self-stretch">
                  {academyInfo?.academy?.name || 'Academy'}
                </span>
              </div>
              </div>
              
              <div className="flex flex-col items-start gap-2 self-stretch">
                <div className="flex items-center gap-3 self-stretch px-3 py-2 bg-[#F0F5F2] rounded-[20px]">
                  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M18 8.83281V17.5C18 18.3284 17.3284 19 16.5 19H12.75C11.9216 19 11.25 18.3284 11.25 17.5V13.75C11.25 13.3358 10.9142 13 10.5 13H7.5C7.08579 13 6.75 13.3358 6.75 13.75V17.5C6.75 18.3284 6.07843 19 5.25 19H1.5C0.671573 19 0 18.3284 0 17.5V8.83281C-6.38024e-05 8.41309 0.17573 8.01254 0.484688 7.72844L7.98469 0.652188L7.995 0.641875C8.56719 0.121501 9.44124 0.121501 10.0134 0.641875C10.0166 0.645543 10.0201 0.648989 10.0238 0.652188L17.5238 7.72844C17.8296 8.01402 18.0022 8.41437 18 8.83281V8.83281Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Home</span>
                </div>
                
                <div className="flex items-center gap-3 self-stretch px-3 py-2">
                  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.9922 10.805C13.0561 9.43099 13.9769 6.86767 13.2592 4.49441C12.5414 2.12114 10.3544 0.497718 7.875 0.497718C5.39558 0.497718 3.20857 2.12114 2.49084 4.49441C1.7731 6.86767 2.69393 9.43099 4.75781 10.805C2.93952 11.4752 1.38666 12.7153 0.330938 14.3403C0.179932 14.5647 0.161484 14.8531 0.28266 15.095C0.403836 15.3368 0.645857 15.4947 0.916031 15.5081C1.18621 15.5215 1.44266 15.3884 1.58719 15.1597C2.97076 13.0317 5.33677 11.7479 7.875 11.7479C10.4132 11.7479 12.7792 13.0317 14.1628 15.1597C14.3917 15.4999 14.8514 15.5932 15.1948 15.3692C15.5382 15.1452 15.6381 14.6869 15.4191 14.3403C14.3633 12.7153 12.8105 11.4752 10.9922 10.805V10.805ZM3.75 6.125C3.75 3.84683 5.59683 2 7.875 2C10.1532 2 12 3.84683 12 6.125C12 8.40317 10.1532 10.25 7.875 10.25C5.5979 10.2474 3.75258 8.4021 3.75 6.125V6.125ZM23.4506 15.3781C23.1037 15.6043 22.6391 15.5066 22.4128 15.1597C21.0308 13.0303 18.6636 11.7466 16.125 11.75C15.7108 11.75 15.375 11.4142 15.375 11C15.375 10.5858 15.7108 10.25 16.125 10.25C17.7863 10.2484 19.2846 9.25042 19.9261 7.71798C20.5677 6.18554 20.2273 4.4178 19.0626 3.23312C17.898 2.04844 16.1363 1.67805 14.5931 2.29344C14.3427 2.40171 14.0531 2.36541 13.8372 2.19864C13.6212 2.03188 13.5128 1.76096 13.5542 1.49125C13.5956 1.22154 13.7802 0.995581 14.0363 0.90125C16.7109 -0.165433 19.7592 0.960006 21.099 3.50883C22.4388 6.05765 21.6374 9.2067 19.2422 10.805C21.0605 11.4752 22.6133 12.7153 23.6691 14.3403C23.8953 14.6872 23.7975 15.1518 23.4506 15.3781V15.3781Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Teachers</span>
                </div>
                
                <div className="flex items-center gap-3 self-stretch px-3 py-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_2005_1137)">
                      <path d="M12.0002 14.2474C9.79087 10.3326 3.71582 12.7219 3.71582 12.7219V21.7719C3.71582 21.7719 9.79091 19.3822 12.0002 23.2969V14.2474Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 14.2474C14.2093 10.3326 20.2844 12.7219 20.2844 12.7219V21.7719C20.2844 21.7719 14.2093 19.3822 12 23.2969V14.2474Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.9874 18.1678C8.23314 18.0134 7.4514 18.0071 6.72803 18.0726" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.0127 18.1678C15.767 18.0134 16.5487 18.0071 17.2721 18.0726" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.9874 15.1515C8.23314 14.9971 7.4514 14.9903 6.72803 15.0559" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.0127 15.1515C15.767 14.9971 16.5487 14.9903 17.2721 15.0559" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4.46893 7.8568C5.92471 7.8568 7.10485 6.67666 7.10485 5.22088C7.10485 3.7651 5.92471 2.58496 4.46893 2.58496C3.01315 2.58496 1.83301 3.7651 1.83301 5.22088C1.83301 6.67666 3.01315 7.8568 4.46893 7.8568Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.5314 7.8568C20.9872 7.8568 22.1674 6.67666 22.1674 5.22088C22.1674 3.7651 20.9872 2.58496 19.5314 2.58496C18.0757 2.58496 16.8955 3.7651 16.8955 5.22088C16.8955 6.67666 18.0757 7.8568 19.5314 7.8568Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12.0002 5.97497C13.456 5.97497 14.6361 4.79483 14.6361 3.33905C14.6361 1.88327 13.456 0.703125 12.0002 0.703125C10.5444 0.703125 9.36426 1.88327 9.36426 3.33905C9.36426 4.79483 10.5444 5.97497 12.0002 5.97497Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.7656 12.0274V11.1368C15.7656 10.2808 16.2491 9.49873 17.0143 9.11576C18.1105 8.56746 19.5312 7.85693 19.5312 7.85693C19.5312 7.85693 20.9516 8.56676 22.0474 9.11464C22.8134 9.49723 23.2969 10.2797 23.2969 11.1357V14.2593H20.2844V12.7218C20.2844 12.7218 18.0284 11.8346 15.7656 12.0274Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.71564 14.2593V12.7218C3.71564 12.7218 5.97164 11.8346 8.23439 12.0274V11.1357C8.23439 10.2797 7.75087 9.49723 6.98494 9.11464C5.88914 8.56671 4.46873 7.85693 4.46873 7.85693C4.46873 7.85693 3.04795 8.56751 1.95178 9.11576C1.18664 9.49878 0.703125 10.2809 0.703125 11.1368C0.703125 12.4638 0.703125 14.2593 0.703125 14.2593H3.71564Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.23438 12.0276V9.25494C8.23438 8.399 8.71789 7.61689 9.48303 7.2343C10.5792 6.68568 12 5.9751 12 5.9751C12 5.9751 13.4204 6.68493 14.5162 7.2328C15.2821 7.61539 15.7656 8.39788 15.7656 9.25382V12.0276C14.323 12.1504 12.8774 12.7126 12.0128 14.2244L12 14.2474C11.1369 12.7182 9.6845 12.1511 8.23438 12.0276Z" stroke="black" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_2005_1137">
                        <rect width="24" height="24" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Students</span>
                </div>
                
                <div className="flex items-center gap-3 self-stretch px-3 py-2">
                  <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M13.4163 6.87562L8.91625 3.87563C8.68605 3.72204 8.38998 3.70769 8.14601 3.83831C7.90204 3.96892 7.74982 4.22327 7.75 4.5V10.5C7.74982 10.7767 7.90204 11.0311 8.14601 11.1617C8.38998 11.2923 8.68605 11.278 8.91625 11.1244L13.4163 8.12438C13.6252 7.98533 13.7507 7.75098 13.7507 7.5C13.7507 7.24902 13.6252 7.01467 13.4163 6.87562V6.87562ZM9.25 9.09844V5.90625L11.6481 7.5L9.25 9.09844ZM18.25 0.75H1.75C0.921573 0.75 0.25 1.42157 0.25 2.25V12.75C0.25 13.5784 0.921573 14.25 1.75 14.25H18.25C19.0784 14.25 19.75 13.5784 19.75 12.75V2.25C19.75 1.42157 19.0784 0.75 18.25 0.75V0.75ZM18.25 12.75H1.75V2.25H18.25V12.75V12.75ZM19.75 16.5C19.75 16.9142 19.4142 17.25 19 17.25H1C0.585786 17.25 0.25 16.9142 0.25 16.5C0.25 16.0858 0.585786 15.75 1 15.75H19C19.4142 15.75 19.75 16.0858 19.75 16.5V16.5Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Batches</span>
                </div>
                
                <div className="flex items-center gap-3 self-stretch px-3 py-2">
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M18.25 2.75H10.75V1.25C10.75 0.835786 10.4142 0.5 10 0.5C9.58579 0.5 9.25 0.835786 9.25 1.25V2.75H1.75C0.921573 2.75 0.25 3.42157 0.25 4.25V15.5C0.25 16.3284 0.921573 17 1.75 17H5.44L3.41406 19.5312C3.15518 19.8549 3.20765 20.3271 3.53125 20.5859C3.85485 20.8448 4.32705 20.7924 4.58594 20.4688L7.36 17H12.64L15.4141 20.4688C15.6729 20.7924 16.1451 20.8448 16.4688 20.5859C16.7924 20.3271 16.8448 19.8549 16.5859 19.5312L14.56 17H18.25C19.0784 17 19.75 16.3284 19.75 15.5V4.25C19.75 3.42157 19.0784 2.75 18.25 2.75V2.75ZM18.25 15.5H1.75V4.25H18.25V15.5V15.5ZM7.75 10.25V12.5C7.75 12.9142 7.41421 13.25 7 13.25C6.58579 13.25 6.25 12.9142 6.25 12.5V10.25C6.25 9.83579 6.58579 9.5 7 9.5C7.41421 9.5 7.75 9.83579 7.75 10.25V10.25ZM10.75 8.75V12.5C10.75 12.9142 10.4142 13.25 10 13.25C9.58579 13.25 9.25 12.9142 9.25 12.5V8.75C9.25 8.33579 9.58579 8 10 8C10.4142 8 10.75 8.33579 10.75 8.75V8.75ZM13.75 7.25V12.5C13.75 12.9142 13.4142 13.25 13 13.25C12.5858 13.25 12.25 12.9142 12.25 12.5V7.25C12.25 6.83579 12.5858 6.5 13 6.5C13.4142 6.5 13.75 6.83579 13.75 7.25V7.25Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Attendance</span>
                </div>
                
                <div className="flex items-center gap-3 self-stretch px-3 py-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 5.5C7.51472 5.5 5.5 7.51472 5.5 10C5.5 12.4853 7.51472 14.5 10 14.5C12.4853 14.5 14.5 12.4853 14.5 10C14.4974 7.51579 12.4842 5.50258 10 5.5V5.5ZM10 13C8.34315 13 7 11.6569 7 10C7 8.34315 8.34315 7 10 7C11.6569 7 13 8.34315 13 10C13 11.6569 11.6569 13 10 13V13ZM18.25 10.2025C18.2537 10.0675 18.2537 9.9325 18.25 9.7975L19.6488 8.05C19.7975 7.86393 19.849 7.61827 19.7875 7.38813C19.5582 6.52619 19.2152 5.69861 18.7675 4.92719C18.6486 4.72249 18.4401 4.58592 18.205 4.55875L15.9813 4.31125C15.8888 4.21375 15.795 4.12 15.7 4.03L15.4375 1.80063C15.4101 1.56531 15.2732 1.35677 15.0681 1.23813C14.2964 0.791263 13.4689 0.448595 12.6072 0.219063C12.3769 0.157836 12.1312 0.209687 11.9453 0.35875L10.2025 1.75C10.0675 1.75 9.9325 1.75 9.7975 1.75L8.05 0.354063C7.86393 0.205326 7.61827 0.153827 7.38813 0.215312C6.52633 0.445025 5.6988 0.788016 4.92719 1.23531C4.72249 1.35417 4.58592 1.56268 4.55875 1.79781L4.31125 4.02531C4.21375 4.11844 4.12 4.21219 4.03 4.30656L1.80063 4.5625C1.56531 4.58988 1.35677 4.72682 1.23813 4.93188C0.791263 5.70359 0.448595 6.5311 0.219063 7.39281C0.157836 7.6231 0.209687 7.86878 0.35875 8.05469L1.75 9.7975C1.75 9.9325 1.75 10.0675 1.75 10.2025L0.354063 11.95C0.205326 12.1361 0.153827 12.3817 0.215312 12.6119C0.444615 13.4738 0.787627 14.3014 1.23531 15.0728C1.35417 15.2775 1.56268 15.4141 1.79781 15.4412L4.02156 15.6887C4.11469 15.7862 4.20844 15.88 4.30281 15.97L4.5625 18.1994C4.58988 18.4347 4.72682 18.6432 4.93188 18.7619C5.70359 19.2087 6.5311 19.5514 7.39281 19.7809C7.6231 19.8422 7.86878 19.7903 8.05469 19.6413L9.7975 18.25C9.9325 18.2537 10.0675 18.2537 10.2025 18.25L11.95 19.6488C12.1361 19.7975 12.3817 19.849 12.6119 19.7875C13.4738 19.5582 14.3014 19.2152 15.0728 18.7675C15.2775 18.6486 15.4141 18.4401 15.4412 18.205L15.6887 15.9813C15.7862 15.8888 15.88 15.795 15.97 15.7L18.1994 15.4375C18.4347 15.4101 18.6432 15.2732 18.7619 15.0681C19.2087 14.2964 19.5514 13.4689 19.7809 12.6072C19.8422 12.3769 19.7903 12.1312 19.6413 11.9453L18.25 10.2025ZM16.7406 9.59313C16.7566 9.86414 16.7566 10.1359 16.7406 10.4069C16.7295 10.5924 16.7876 10.7755 16.9037 10.9206L18.2341 12.5828C18.0814 13.0679 17.886 13.5385 17.65 13.9891L15.5312 14.2291C15.3467 14.2495 15.1764 14.3377 15.0531 14.4766C14.8727 14.6795 14.6805 14.8717 14.4775 15.0522C14.3387 15.1754 14.2505 15.3458 14.23 15.5303L13.9947 17.6472C13.5442 17.8833 13.0736 18.0787 12.5884 18.2313L10.9253 16.9009C10.7922 16.7946 10.6269 16.7367 10.4566 16.7369H10.4116C10.1405 16.7528 9.86883 16.7528 9.59781 16.7369C9.41226 16.7257 9.22918 16.7838 9.08406 16.9L7.41719 18.2313C6.93206 18.0786 6.46146 17.8831 6.01094 17.6472L5.77094 15.5312C5.75046 15.3467 5.66227 15.1764 5.52344 15.0531C5.32048 14.8727 5.12827 14.6805 4.94781 14.4775C4.82456 14.3387 4.6542 14.2505 4.46969 14.23L2.35281 13.9937C2.11674 13.5433 1.92128 13.0727 1.76875 12.5875L3.09906 10.9244C3.21522 10.7793 3.27336 10.5962 3.26219 10.4106C3.24625 10.1396 3.24625 9.86789 3.26219 9.59688C3.27336 9.41133 3.21522 9.22824 3.09906 9.08313L1.76875 7.41719C1.9214 6.93206 2.11685 6.46146 2.35281 6.01094L4.46875 5.77094C4.65326 5.75046 4.82362 5.66227 4.94688 5.52344C5.12733 5.32048 5.31954 5.12827 5.5225 4.94781C5.66188 4.82448 5.75043 4.65373 5.77094 4.46875L6.00625 2.35281C6.45672 2.11674 6.92733 1.92128 7.4125 1.76875L9.07563 3.09906C9.22074 3.21522 9.40383 3.27336 9.58937 3.26219C9.86039 3.24625 10.1321 3.24625 10.4031 3.26219C10.5887 3.27336 10.7718 3.21522 10.9169 3.09906L12.5828 1.76875C13.0679 1.9214 13.5385 2.11685 13.9891 2.35281L14.2291 4.46875C14.2495 4.65326 14.3377 4.82362 14.4766 4.94688C14.6795 5.12733 14.8717 5.31954 15.0522 5.5225C15.1754 5.66133 15.3458 5.74952 15.5303 5.77L17.6472 6.00531C17.8833 6.45578 18.0787 6.9264 18.2313 7.41156L16.9009 9.07469C16.7837 9.22103 16.7255 9.406 16.7378 9.59313H16.7406Z" fill="#0F1717"/>
                  </svg>
                  <span className="text-sm text-[#0F1717] leading-[21px]">Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-[960px] flex flex-col items-start">
          {dataLoading && (
            <div className="flex items-center justify-center py-12 w-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963] mx-auto mb-4"></div>
                <p className="text-[#5E8C7D]">Loading academy data...</p>
              </div>
            </div>
          )}

          {dataError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
              <p className="text-red-700">{dataError}</p>
              <button 
                onClick={loadAcademyData}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {!dataLoading && !dataError && (
            <div className="flex w-full">
              <div className="flex-1 flex flex-col items-start">
                <div className="flex justify-between items-start content-start gap-3 self-stretch flex-wrap p-4">
            <div className="flex min-w-[288px] flex-col items-start gap-3">
              <h1 className="text-[32px] font-bold text-[#0F1717] leading-10 self-stretch">Academy Dashboard</h1>
              <div className="w-[340px] flex flex-col items-start">
                <p className="text-sm text-[#5E8C7D] leading-[21px] self-stretch">
                  Welcome back, {user?.full_name || 'Academy Owner'}
                </p>
                {academyInfo?.location && (
                  <p className="text-xs text-[#5E8C7D] leading-[18px] self-stretch mt-1">
                    📍 {academyInfo.location.name}, {academyInfo.location.city}, {academyInfo.location.state}
                  </p>
                )}
              </div>
            </div>
            
          </div>

          <div className="flex h-[60px] px-4 py-3 flex-col items-start self-stretch">
            <h2 className="text-[22px] font-bold text-[#0F1717] leading-7 self-stretch">Today's Academy Snapshot</h2>
          </div>

          {/* Stats Cards */}
          <div className="flex items-start gap-4 self-stretch p-4">
            <div className="flex min-w-[158px] flex-1 flex-col items-center gap-4 bg-white border border-[#DBE5E0] rounded-xl p-6">
              <span className="text-xs text-[#5E8C7D] leading-[14.4px] self-stretch">Total Students</span>
              <span className="text-2xl font-bold text-[#0F1717] leading-[30px] self-stretch">
                {dataLoading ? '...' : stats?.totalStudents || 0}
              </span>
            </div>
            <div className="flex min-w-[158px] flex-1 flex-col items-center gap-4 bg-white border border-[#DBE5E0] rounded-xl p-6">
              <span className="text-xs text-[#5E8C7D] leading-[14.4px] self-stretch">New/Pending Students</span>
              <span className="text-2xl font-bold text-[#0F1717] leading-[30px] self-stretch">
                {dataLoading ? '...' : stats?.newPendingStudents || 0}
              </span>
            </div>
            <div className="flex min-w-[158px] flex-1 flex-col items-center gap-4 bg-white border border-[#DBE5E0] rounded-xl p-6">
              <span className="text-xs text-[#5E8C7D] leading-[14.4px] self-stretch">Active Teachers</span>
              <span className="text-2xl font-bold text-[#0F1717] leading-[30px] self-stretch">
                {dataLoading ? '...' : stats?.activeTeachers || 0}
              </span>
            </div>
            <div className="flex min-w-[158px] flex-1 flex-col items-center gap-4 bg-white border border-[#DBE5E0] rounded-xl p-6">
              <span className="text-xs text-[#5E8C7D] leading-[14.4px] self-stretch">Active Batches</span>
              <span className="text-2xl font-bold text-[#0F1717] leading-[30px] self-stretch">
                {dataLoading ? '...' : stats?.activeBatches || 0}
              </span>
            </div>
            <div className="flex min-w-[158px] flex-1 flex-col items-center gap-4 bg-white border border-[#DBE5E0] rounded-xl p-6">
              <span className="text-xs text-[#5E8C7D] leading-[14.4px] self-stretch">Skills Offered</span>
              <span className="text-2xl font-bold text-[#0F1717] leading-[30px] self-stretch">
                {dataLoading ? '...' : stats?.totalSkills || 0}
              </span>
            </div>
          </div>

          {/* Academy Information Section */}
          <div className="flex px-4 flex-col items-start self-stretch mb-6">
            <div className="flex p-4 flex-col justify-center items-start gap-4 self-stretch bg-white border border-[#DBE5E0] rounded-xl">
              <div className="flex px-4 py-3 justify-between items-center self-stretch">
                <span className="text-[22px] font-bold text-[#0F1717] leading-7">Academy Information</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#0F1717]">Academy Name</span>
                  <span className="text-sm text-[#5E8C7D]">{academyInfo?.academy?.name || 'Coming Soon'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#0F1717]">Phone Number</span>
                  <span className="text-sm text-[#5E8C7D]">{academyInfo?.academy?.phone_number || 'Coming Soon'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#0F1717]">Location</span>
                  <span className="text-sm text-[#5E8C7D]">
                    {academyInfo?.location ? 
                      `${academyInfo.location.name}, ${academyInfo.location.city}, ${academyInfo.location.state}` : 
                      'Coming Soon'
                    }
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#0F1717]">Status</span>
                  <span className="text-sm text-[#5E8C7D]">{academyInfo?.academy?.status || 'Coming Soon'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#0F1717]">Skills Offered</span>
                  <span className="text-sm text-[#5E8C7D]">
                    {skills.length > 0 ? skills.map(s => s.name).join(', ') : 'Coming Soon'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#0F1717]">Active Batches</span>
                  <span className="text-sm text-[#5E8C7D]">
                    {batches.length > 0 ? batches.filter(b => b.status === 'active').length : 'Coming Soon'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* All Activity Section */}
          <div className="flex px-4 flex-col items-start self-stretch">
            <div className="flex p-4 flex-col justify-center items-start gap-4 self-stretch bg-white border border-[#DBE5E0] rounded-xl">
              <div className="flex px-4 py-3 justify-between items-center self-stretch">
                <span className="text-[22px] font-bold text-[#0F1717] leading-7">All Activity</span>
                <button 
                  onClick={() => setShowAddActivityModal(true)}
                  className="flex h-8 min-w-[84px] max-w-[480px] px-4 justify-center items-center bg-[#F0F5F2] rounded-lg"
                >
                  <span className="text-sm text-[#0F1717] leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">+ Add Activity</span>
                </button>
              </div>
              
              <div className="flex items-start self-stretch">
                {skills.length > 0 ? (
                  skills.slice(0, 2).map((skill, index) => (
                    <div key={skill.id} className="flex w-[280px] px-4 flex-col items-start">
                      <div className="flex flex-col justify-center items-center self-stretch rounded-xl">
                        <div className="h-[157px] self-stretch rounded-xl bg-gradient-to-br from-[#F0F5F2] to-[#E5F5F0] flex items-center justify-center">
                          <div className="text-6xl">♟️</div>
                        </div>
                        <div className="flex h-[101px] flex-col justify-center items-center gap-4 self-stretch">
                          <span className="text-base font-bold text-[#0F1717] leading-5">{skill.name}</span>
                          <button className="flex h-8 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-shrink-0 bg-[#F0F5F2] rounded-2xl">
                            <span className="text-sm text-[#0F1717] leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">Manage</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex w-[280px] px-4 flex-col items-start">
                    <div className="flex flex-col justify-center items-center self-stretch rounded-xl">
                      <div className="h-[157px] self-stretch rounded-xl bg-[#F0F5F2] flex items-center justify-center">
                        <span className="text-4xl">📚</span>
                      </div>
                      <div className="flex h-[101px] flex-col justify-center items-center gap-4 self-stretch">
                        <span className="text-base font-bold text-[#0F1717] leading-5">No Skills Yet</span>
                        <span className="text-sm text-[#5E8C7D] leading-[21px] text-center">Add your first skill</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex w-[280px] px-4 flex-col items-start">
                  <div className="flex px-[69px] pt-16 pb-20 flex-col items-center gap-[29px] self-stretch bg-[#F0F5F2] rounded-xl relative">
                    <div className="text-[89px] font-thin text-[#0F1717] text-center overflow-hidden text-ellipsis whitespace-nowrap opacity-50 absolute left-26 top-16 w-[52px] h-16 flex justify-center items-center">+</div>
                    <div className="text-sm text-[#0F1717] leading-[21px] text-center overflow-hidden text-ellipsis absolute left-[82px] top-[157px] w-[97px] h-[21px]">Add Activity</div>
                  </div>
                </div>
              </div>
            </div>
                </div>
              </div>

              {/* Recent Activities Sidebar */}
              <div className="w-[200px] pt-[100px] pl-[5px]">
                <div className="flex w-[200px] p-4 flex-col items-start bg-[#F7FCFA] rounded-xl min-h-[200px]">
                  <span className="text-sm font-medium text-[#0D1C17] leading-[21px] mb-3">Recent Activities</span>
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 3).map((activity, index) => (
                      <div key={activity.id} className="flex flex-col p-2.5 px-3 w-full bg-white rounded-lg mb-2 shadow-sm">
                        <span className="text-sm font-medium text-[#0D1C17] leading-[21px] break-words">{activity.name}</span>
                        <span className="text-xs text-[#5E8C7D] leading-[18px] mt-1">{activity.description}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col p-2.5 px-3 w-full bg-white rounded-lg mb-2 shadow-sm">
                      <span className="text-sm text-[#5E8C7D] leading-[21px]">No recent activities</span>
                      <span className="text-xs text-[#5E8C7D] leading-[18px] mt-1">Activities will appear here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

    </div>

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[603px] p-16 flex flex-col items-start gap-6 bg-[#F7FCFA] rounded-xl">
            <div className="flex h-[72px] p-4 justify-between items-center self-stretch">
              <span className="w-[288px] text-[32px] font-bold text-[#0F1717] leading-10">Add Activity</span>
              <button 
                onClick={() => setShowAddActivityModal(false)}
                className="w-8 h-8"
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8L24 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M24 8L8 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <div className="flex px-4 flex-col items-start gap-[3px] self-stretch">
              <span className="text-base text-[#0F1717] leading-6 self-stretch">Select Activity Type -</span>
              <div className="flex p-4 py-0 items-start gap-3 self-stretch">
                {activities.map((activity, index) => (
                  <button 
                    key={index}
                    onClick={() => setSelectedActivity(activity.name)}
                    className={`flex h-32 min-w-[84px] max-w-[480px] px-0 pb-3 flex-col justify-between items-center flex-1 rounded-xl ${
                      selectedActivity === activity.name ? 'bg-[#0F1717]' : 'bg-[#F0F5F2]'
                    }`}
                  >
                    <img 
                      src={activity.image} 
                      alt={activity.name} 
                      className="w-[148px] h-[83px] flex-shrink-0"
                    />
                    <span className={`text-sm font-bold leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center ${
                      selectedActivity === activity.name ? 'text-[#F0F5F2]' : 'text-[#0F1717]'
                    }`}>
                      {activity.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex px-4 items-center gap-4 self-stretch">
              <button 
                onClick={() => setShowAddActivityModal(false)}
                className="flex h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 bg-[#F0F5F2] rounded-xl"
              >
                <span className="text-sm font-bold text-[#0F1717] leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">Cancel</span>
              </button>
              <button className="flex h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 bg-[#009963] rounded-xl">
                <span className="text-sm font-bold text-white leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap text-center">Add</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AcademyDashboard
