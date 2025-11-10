import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { OnboardingStep, RegistrationStatus, LocationPermission } from '../../types/onboarding';
import { isMobileDevice, getLocationPermissionInstructions } from '../../utils/locationUtils';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAppStore } from '../../store/appStore';
import { OnboardingLayout } from './OnboardingLayout';
import { CategorySelectionScreen } from './CategorySelectionScreen';
import { ProfessionalTypeSelectionScreen } from './ProfessionalTypeSelectionScreen';
import { LocationSetupScreen } from './LocationSetupScreen';
import { BasicProfileSetupScreen } from './BasicProfileSetupScreen';
import { ProfessionalDetailsScreen } from './ProfessionalDetailsScreen';
import { AvailabilitySetupScreen } from './AvailabilitySetupScreen';
import { RegistrationCompleteScreen } from './RegistrationCompleteScreen';
import { User } from '../../types';
import { analyticsService } from '../../utils/analyticsEvents';
import { onboardingService } from '../../services/onboardingService';
import { supabase } from '../../services/supabaseClient';

interface OnboardingFlowProps {
  onRegistrationComplete: (user: User) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onRegistrationComplete,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    currentStep,
    completedSteps,
    registrationData,
    isLoading,
    locationPermission,
    uploadProgress,
    setCurrentStep,
    addCompletedStep,
    updateRegistrationData,
    setLocationPermission,
    setRegistrationStatus,
    canProceed
  } = useOnboardingStore();

  const { setUser, setAuthenticated } = useAppStore();

  useEffect(() => {
    setRegistrationStatus(RegistrationStatus.IN_PROGRESS);
    // Ensure a profiles row exists for the authenticated user
    (async () => {
      try {
        await onboardingService.ensureProfileExists();
      } catch (err: any) {
        console.error('ensureProfileExists error:', err);
      }
    })();
  }, [setRegistrationStatus]);

  // Auto-populate full name and phone from auth when entering Basic Profile
  useEffect(() => {
    const prefillFromAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const sbUser = data.user;
        if (!sbUser) return;
        const name = sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || '';
        const phone = sbUser.phone || '';
        // Only update if fields are empty to avoid overriding user input
        if (!registrationData.basicProfile.fullName || !registrationData.basicProfile.primaryMobile) {
          updateRegistrationData({
            basicProfile: {
              ...registrationData.basicProfile,
              fullName: registrationData.basicProfile.fullName || name,
              primaryMobile: registrationData.basicProfile.primaryMobile || phone,
            }
          });
        }
      } catch (err) {
        // Silent fail; keep form editable
      }
    };
    if (currentStep === OnboardingStep.BASIC_PROFILE) {
      prefillFromAuth();
    }
  }, [currentStep, registrationData.basicProfile.fullName, registrationData.basicProfile.primaryMobile, updateRegistrationData]);

  // Navigation helpers
  // Exit handler that properly clears state and navigates
  const handleExitOnboarding = async () => {
    try {
      // Sign out the user
      await supabase.auth.signOut();
      
      // Clear onboarding state
      setRegistrationStatus(RegistrationStatus.NOT_STARTED);
      setCurrentStep(OnboardingStep.WELCOME);
      
      // Clear app state
      setUser(null);
      setAuthenticated(false);
      
      // Navigate to welcome screen
      navigate('/welcome', { replace: true });
    } catch (error) {
      console.error('Error during exit:', error);
      // Still navigate even if sign out fails
      navigate('/welcome', { replace: true });
    }
  };

  const navigateToStep = (step: OnboardingStep) => {
    const stepRoutes: Record<OnboardingStep, string> = {
      [OnboardingStep.WELCOME]: '/welcome',
      [OnboardingStep.AUTHENTICATION]: '/auth',
      [OnboardingStep.CATEGORY_SELECTION]: '/onboarding/category',
      [OnboardingStep.TYPE_SELECTION]: '/onboarding/type',
      [OnboardingStep.LOCATION_SETUP]: '/onboarding/location',
      [OnboardingStep.BASIC_PROFILE]: '/onboarding/basic-profile',
      [OnboardingStep.PROFESSIONAL_DETAILS]: '/onboarding/professional-details',
      [OnboardingStep.AVAILABILITY_SETUP]: '/onboarding/availability',
      [OnboardingStep.REGISTRATION_COMPLETE]: '/onboarding/complete'
    };
    
    setCurrentStep(step);
    navigate(stepRoutes[step]);
  };

  const goToNextStep = () => {
    const stepOrder = [
      OnboardingStep.CATEGORY_SELECTION,
      OnboardingStep.TYPE_SELECTION,
      OnboardingStep.LOCATION_SETUP,
      OnboardingStep.BASIC_PROFILE,
      OnboardingStep.PROFESSIONAL_DETAILS,
      OnboardingStep.AVAILABILITY_SETUP,
      OnboardingStep.REGISTRATION_COMPLETE
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    const nextIndex = Math.min(currentIndex + 1, stepOrder.length - 1);
    const nextStep = stepOrder[nextIndex];
    
    analyticsService.trackStepNavigation(currentStep, nextStep, 'next');
    navigateToStep(nextStep);
  };

  const goToPreviousStep = () => {
    const stepOrder = [
      OnboardingStep.CATEGORY_SELECTION,
      OnboardingStep.TYPE_SELECTION,
      OnboardingStep.LOCATION_SETUP,
      OnboardingStep.BASIC_PROFILE,
      OnboardingStep.PROFESSIONAL_DETAILS,
      OnboardingStep.AVAILABILITY_SETUP,
      OnboardingStep.REGISTRATION_COMPLETE
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);
    const prevStep = stepOrder[prevIndex];
    
    analyticsService.trackStepNavigation(currentStep, prevStep, 'back');
    navigateToStep(prevStep);
  };

  const handleStepComplete = async (stepData?: any) => {
    try {
      await onboardingService.completeStep(String(currentStep));
    } catch (err: any) {
      analyticsService.trackValidationError(currentStep, 'onboarding_progress', err.message || 'Failed to mark step');
    }
    addCompletedStep(currentStep);
    if (stepData) {
      updateRegistrationData(stepData);
    }
    goToNextStep();
  };

  const handleCategorySelect = async (category: any) => {
    try {
      await onboardingService.upsertProfessionalProfile({ selectedCategory: category });
      await onboardingService.completeStep('CATEGORY_SELECTION');
      analyticsService.trackStepCompleted(OnboardingStep.CATEGORY_SELECTION, { category });
    } catch (err: any) {
      analyticsService.trackValidationError(OnboardingStep.CATEGORY_SELECTION, 'service', err.message || 'Failed to save category');
    }
    updateRegistrationData({ selectedCategory: category });
    addCompletedStep(OnboardingStep.CATEGORY_SELECTION);
    navigateToStep(OnboardingStep.TYPE_SELECTION);
  };

  const handleTypeSelect = async (type: string) => {
    try {
      await onboardingService.upsertProfessionalProfile({ selectedType: type });
      await onboardingService.completeStep('TYPE_SELECTION');
      analyticsService.trackStepCompleted(OnboardingStep.TYPE_SELECTION, { type });
    } catch (err: any) {
      analyticsService.trackValidationError(OnboardingStep.TYPE_SELECTION, 'service', err.message || 'Failed to save type');
    }
    updateRegistrationData({ selectedType: type });
    addCompletedStep(OnboardingStep.TYPE_SELECTION);
    navigateToStep(OnboardingStep.LOCATION_SETUP);
  };

  const handleLocationUpdate = async (locationData: any) => {
    // Map DistanceRadius enum to numeric km if available
    const radiusMap: Record<string, number> = {
      '5_km': 5,
      '10_km': 10,
      '25_km': 25,
      '50_km': 50,
      '100_km': 100,
    };
    const workRadiusKm = radiusMap[String(locationData.workRadius)] || 25;
    try {
      await onboardingService.upsertLocation({
        city: locationData.city,
        state: locationData.state,
        pinCode: locationData.pinCode,
        workRadiusKm,
        additionalLocations: (locationData.additionalLocations || []).map((s: string) => ({ city: s }))
      });
      await onboardingService.completeStep('LOCATION_SETUP');
      analyticsService.trackStepCompleted(OnboardingStep.LOCATION_SETUP, { city: locationData.city, state: locationData.state });
    } catch (err: any) {
      analyticsService.trackValidationError(OnboardingStep.LOCATION_SETUP, 'service', err.message || 'Failed to save location');
    }
    updateRegistrationData({ location: locationData });
    addCompletedStep(OnboardingStep.LOCATION_SETUP);
    navigateToStep(OnboardingStep.BASIC_PROFILE);
  };

  const handleProfileUpdate = async (profileData: any) => {
    try {
      await onboardingService.upsertBasicProfile({
        fullName: profileData.fullName,
        avatarUrl: profileData.profilePhotoUrl,
        phone: profileData.primaryMobile,
      });
      await onboardingService.completeStep('BASIC_PROFILE');
      analyticsService.trackStepCompleted(OnboardingStep.BASIC_PROFILE, { hasProfilePhoto: !!profileData.profilePhotoUrl });
    } catch (err: any) {
      analyticsService.trackValidationError(OnboardingStep.BASIC_PROFILE, 'service', err.message || 'Failed to save profile');
    }
    updateRegistrationData({ basicProfile: profileData });
    addCompletedStep(OnboardingStep.BASIC_PROFILE);
    navigateToStep(OnboardingStep.PROFESSIONAL_DETAILS);
  };

  const handleDetailsUpdate = async (detailsData: any) => {
    try {
      await onboardingService.upsertProfessionalProfile({
        experienceLevel: detailsData.experienceLevel,
        specializations: detailsData.specializations,
        pricing: detailsData.pricing,
        equipment: detailsData.equipment,
        instagramHandle: detailsData.instagramHandle,
        portfolioLinks: detailsData.portfolioLinks,
      });
      await onboardingService.completeStep('PROFESSIONAL_DETAILS');
      analyticsService.trackStepCompleted(OnboardingStep.PROFESSIONAL_DETAILS, { specializationCount: detailsData.specializations?.length || 0 });
    } catch (err: any) {
      analyticsService.trackValidationError(OnboardingStep.PROFESSIONAL_DETAILS, 'service', err.message || 'Failed to save details');
    }
    updateRegistrationData({ professionalDetails: detailsData });
    addCompletedStep(OnboardingStep.PROFESSIONAL_DETAILS);
    navigateToStep(OnboardingStep.AVAILABILITY_SETUP);
  };

  const handleAvailabilityUpdate = async (availabilityData: any) => {
    try {
      await onboardingService.upsertAvailability({
        defaultSchedule: availabilityData.defaultSchedule,
        leadTime: availabilityData.leadTime,
        advanceBookingLimit: availabilityData.advanceBookingLimit,
        calendarVisibility: availabilityData.calendarVisibility,
      });
      await onboardingService.completeStep('AVAILABILITY_SETUP');
      analyticsService.trackStepCompleted(OnboardingStep.AVAILABILITY_SETUP, { });
    } catch (err: any) {
      analyticsService.trackValidationError(OnboardingStep.AVAILABILITY_SETUP, 'service', err.message || 'Failed to save availability');
    }
    updateRegistrationData({ availability: availabilityData });
    addCompletedStep(OnboardingStep.AVAILABILITY_SETUP);
    navigateToStep(OnboardingStep.REGISTRATION_COMPLETE);
  };

  const handlePhotoUpload = (file: File) => {
    // Handle photo upload logic here
    console.log('Uploading photo:', file);
  };

  const handleRequestLocation = () => {
    // Check if we're in a secure context (HTTPS) - required for geolocation on modern browsers
    if (window.isSecureContext === false) {
      alert('Geolocation requires a secure context (HTTPS). Please use HTTPS to access this site.');
      setLocationPermission(LocationPermission.DENIED);
      return;
    }
    
    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission(LocationPermission.GRANTED);
          updateRegistrationData({
            location: {
              ...registrationData.location,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            },
          });
        },
        (error) => {
          setLocationPermission(LocationPermission.DENIED);
          
          // Provide more helpful error messages
          let errorMessage = 'Location access denied';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. ' + getLocationPermissionInstructions();
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again later.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please check your internet connection and try again.';
              break;
          }
          
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout for mobile devices
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationPermission(LocationPermission.NOT_SUPPORTED);
      alert('Geolocation is not supported by this browser. Please try using a different browser.');
    }
  };

  const handleRegistrationComplete = async () => {
    try {
      // Get the current user ID from Supabase
      const supabaseUserId = await onboardingService.getCurrentUserId();
      
      // Save all remaining data to backend before completing
      await Promise.all([
        // Ensure basic profile is saved
        onboardingService.upsertBasicProfile({
          fullName: registrationData.basicProfile.fullName,
          avatarUrl: registrationData.basicProfile.profilePhotoUrl,
          phone: registrationData.basicProfile.primaryMobile,
        }),
        
        // Ensure professional profile is saved with all details
        onboardingService.upsertProfessionalProfile({
          selectedCategory: registrationData.selectedCategory,
          selectedType: registrationData.selectedType,
          experienceLevel: registrationData.professionalDetails.experienceLevel,
          specializations: registrationData.professionalDetails.specializations,
          pricing: registrationData.professionalDetails.pricing,
          equipment: registrationData.professionalDetails.equipment,
          instagramHandle: registrationData.professionalDetails.instagramHandle,
          portfolioLinks: registrationData.professionalDetails.portfolioLinks,
        }),
        
        // Ensure location data is saved
        onboardingService.upsertLocation({
          city: registrationData.location.city,
          state: registrationData.location.state,
          pinCode: registrationData.location.pinCode,
          workRadiusKm: 25, // Default value
          additionalLocations: registrationData.location.additionalLocations.map(loc => ({ city: loc }))
        }),
        
        // Ensure availability settings are saved
        onboardingService.upsertAvailability({
          defaultSchedule: registrationData.availability.defaultSchedule,
          leadTime: registrationData.availability.leadTime,
          advanceBookingLimit: registrationData.availability.advanceBookingLimit,
          calendarVisibility: registrationData.availability.calendarVisibility,
        })
      ]);
      
      // Mark registration as complete
      await onboardingService.completeStep('REGISTRATION_COMPLETE');
      
      // Create user object from registration data
      const user: User = {
        id: supabaseUserId,
        name: registrationData.basicProfile.fullName,
        email: registrationData.email,
        phone: registrationData.basicProfile.primaryMobile,
        profilePhoto: registrationData.basicProfile.profilePhotoUrl,
        professionalCategory: registrationData.selectedCategory!,
        professionalType: registrationData.selectedType,
        location: {
          city: registrationData.location.city,
          state: registrationData.location.state,
          pinCode: registrationData.location.pinCode,
          coordinates: registrationData.location.coordinates || { lat: 0, lng: 0 },
        },
        tier: 'Free' as any,
        rating: 0,
        totalReviews: 0,
        isVerified: false,
        joinedDate: new Date().toISOString(),
        experience: registrationData.professionalDetails.experienceLevel,
        gender: registrationData.basicProfile.gender,
        about: registrationData.basicProfile.about,
        specializations: registrationData.professionalDetails.specializations,
        pricing: registrationData.professionalDetails.pricing,
        equipment: registrationData.professionalDetails.equipment,
        instagramHandle: registrationData.professionalDetails.instagramHandle,
      };

      // Update local state
      setUser(user);
      setAuthenticated(true);
      setRegistrationStatus(RegistrationStatus.COMPLETED);
      
      // Track completion
      analyticsService.trackStepCompleted(OnboardingStep.REGISTRATION_COMPLETE, { userId: supabaseUserId });
      
      // Call the completion handler
      onRegistrationComplete(user);
      
    } catch (err: any) {
      console.error('Registration completion failed:', err);
      analyticsService.trackValidationError(OnboardingStep.REGISTRATION_COMPLETE, 'service', err.message || 'Failed to complete registration');
      
      // Still try to complete with fallback user ID
      const fallbackUserId = 'user_' + Date.now();
      const user: User = {
        id: fallbackUserId,
        name: registrationData.basicProfile.fullName,
        email: registrationData.email,
        phone: registrationData.basicProfile.primaryMobile,
        profilePhoto: registrationData.basicProfile.profilePhotoUrl,
        professionalCategory: registrationData.selectedCategory!,
        professionalType: registrationData.selectedType,
        location: {
          city: registrationData.location.city,
          state: registrationData.location.state,
          pinCode: registrationData.location.pinCode,
          coordinates: registrationData.location.coordinates || { lat: 0, lng: 0 },
        },
        tier: 'Free' as any,
        rating: 0,
        totalReviews: 0,
        isVerified: false,
        joinedDate: new Date().toISOString(),
        experience: registrationData.professionalDetails.experienceLevel,
        gender: registrationData.basicProfile.gender,
        about: registrationData.basicProfile.about,
        specializations: registrationData.professionalDetails.specializations,
        pricing: registrationData.professionalDetails.pricing,
        equipment: registrationData.professionalDetails.equipment,
        instagramHandle: registrationData.professionalDetails.instagramHandle,
      };

      setUser(user);
      setAuthenticated(true);
      setRegistrationStatus(RegistrationStatus.COMPLETED);
      onRegistrationComplete(user);
    }
  };

  return (
    <Routes>
      {/* Screens with Layout (Onboarding-only) */}
      <Route path="/category" element={
        <OnboardingLayout
          currentStep={OnboardingStep.CATEGORY_SELECTION}
          completedSteps={completedSteps}
          onExit={handleExitOnboarding}
        >
          <CategorySelectionScreen
            selectedCategory={registrationData.selectedCategory}
            onCategorySelect={handleCategorySelect}
            onNext={() => handleCategorySelect(registrationData.selectedCategory!)}
            onBack={goToPreviousStep}
          />
        </OnboardingLayout>
      } />

      <Route path="/type" element={
        <OnboardingLayout
          currentStep={OnboardingStep.TYPE_SELECTION}
          completedSteps={completedSteps}
          onExit={handleExitOnboarding}
        >
          <ProfessionalTypeSelectionScreen
            selectedCategory={registrationData.selectedCategory!}
            selectedType={registrationData.selectedType}
            onTypeSelect={handleTypeSelect}
            onNext={() => handleTypeSelect(registrationData.selectedType)}
            onBack={goToPreviousStep}
          />
        </OnboardingLayout>
      } />

      <Route path="/location" element={
        <OnboardingLayout
          currentStep={OnboardingStep.LOCATION_SETUP}
          completedSteps={completedSteps}
          onExit={handleExitOnboarding}
        >
          <LocationSetupScreen
            locationData={registrationData.location}
            onLocationUpdate={(data) => updateRegistrationData({ location: { ...registrationData.location, ...data } })}
            locationPermission={locationPermission}
            onRequestLocation={handleRequestLocation}
            onNext={() => handleLocationUpdate(registrationData.location)}
            onBack={goToPreviousStep}
          />
        </OnboardingLayout>
      } />

      <Route path="/basic-profile" element={
        <OnboardingLayout
          currentStep={OnboardingStep.BASIC_PROFILE}
          completedSteps={completedSteps}
          onExit={handleExitOnboarding}
        >
          <BasicProfileSetupScreen
            profileData={registrationData.basicProfile}
            onProfileUpdate={(data) => updateRegistrationData({ basicProfile: { ...registrationData.basicProfile, ...data } })}
            onPhotoUpload={handlePhotoUpload}
            uploadProgress={uploadProgress}
            onNext={() => handleProfileUpdate(registrationData.basicProfile)}
            onBack={goToPreviousStep}
          />
        </OnboardingLayout>
      } />

      <Route path="/professional-details" element={
        <OnboardingLayout
          currentStep={OnboardingStep.PROFESSIONAL_DETAILS}
          completedSteps={completedSteps}
          onExit={handleExitOnboarding}
        >
          <ProfessionalDetailsScreen
            selectedCategory={registrationData.selectedCategory!}
            detailsData={registrationData.professionalDetails}
            onDetailsUpdate={(data) => updateRegistrationData({ professionalDetails: { ...registrationData.professionalDetails, ...data } })}
            onNext={() => handleDetailsUpdate(registrationData.professionalDetails)}
            onBack={goToPreviousStep}
          />
        </OnboardingLayout>
      } />

      <Route path="/availability" element={
        <OnboardingLayout
          currentStep={OnboardingStep.AVAILABILITY_SETUP}
          completedSteps={completedSteps}
          onExit={handleExitOnboarding}
        >
          <AvailabilitySetupScreen
            availabilityData={registrationData.availability}
            onAvailabilityUpdate={(data) => updateRegistrationData({ availability: { ...registrationData.availability, ...data } })}
            onNext={() => handleAvailabilityUpdate(registrationData.availability)}
            onBack={goToPreviousStep}
          />
        </OnboardingLayout>
      } />

      {/* Registration Complete - No Layout */}
      <Route path="/complete" element={
        <RegistrationCompleteScreen
          user={{
            id: 'user_123',
            name: registrationData.basicProfile.fullName || 'Professional User',
            email: registrationData.email,
            phone: registrationData.basicProfile.primaryMobile,
            profilePhoto: registrationData.basicProfile.profilePhotoUrl,
            professionalCategory: registrationData.selectedCategory!,
            professionalType: registrationData.selectedType,
            location: {
              city: registrationData.location.city,
              state: registrationData.location.state,
              coordinates: registrationData.location.coordinates || { lat: 0, lng: 0 },
            },
            tier: 'Free' as any,
            rating: 0,
            totalReviews: 0,
            isVerified: false,
            joinedDate: new Date().toISOString(),
            experience: registrationData.professionalDetails.experienceLevel,
          }}
          onContinue={handleRegistrationComplete}
        />
      } />

      {/* Default redirect to first onboarding step */}
      <Route path="*" element={<Navigate to="/onboarding/category" replace />} />
    </Routes>
  );
};