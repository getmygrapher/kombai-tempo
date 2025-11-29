import React, { useState, useEffect } from 'react';
import { ProfileSection, TierType, EquipmentCategory } from '../../types/enums';
import { User, ProfileFormData, NotificationSettings, ProfileStats, EquipmentItem } from '../../types';
import { ProfileDashboard } from './ProfileDashboard';
import { ProfileEditForm } from './ProfileEditForm';
import { EquipmentManager } from './EquipmentManager';
import { TierManagement } from './TierManagement';
import { NotificationSettingsComponent } from './NotificationSettings';
import { useProfileManagementStore } from '../../store/profileManagementStore';
import { mockUserProfile } from '../../data/profileManagementMockData';

interface ProfileManagementContainerProps {
  user?: User;
  onNavigateBack?: () => void;
  onProfileUpdated?: (user: User) => void;
  onTierUpgraded?: () => void;
}

export const ProfileManagementContainer: React.FC<ProfileManagementContainerProps> = ({
  user = mockUserProfile,
  onNavigateBack,
  onProfileUpdated,
  onTierUpgraded
}) => {
  const [currentSection, setCurrentSection] = useState<ProfileSection | null>(null);

  const {
    loadProfile,
    saveProfile,
    saveEquipment,
    savePricing,
    savePrivacy,
    profileDraft,
    equipmentDraft,
    pricingDraft,
    privacySettings,
    analytics,
    isLoading,
    isSaving,
    error
  } = useProfileManagementStore();

  // Load profile data when component mounts
  useEffect(() => {
    if (user?.id) {
      loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

  const handleSectionSelect = (section: ProfileSection) => {
    setCurrentSection(section);
  };

  const handleBackToDashboard = () => {
    setCurrentSection(null);
  };

  const handleProfileUpdate = async (data: ProfileFormData) => {
    try {
      await saveProfile(data);

      // Map ProfileFormData back to User type for parent update
      const updatedUser: User = {
        ...user,
        name: data.basicInfo.name,
        email: data.basicInfo.email,
        phone: data.basicInfo.phone,
        alternatePhone: data.basicInfo.alternatePhone,
        gender: data.basicInfo.gender,
        profilePhoto: data.basicInfo.profilePhoto || user.profilePhoto,
        location: {
          ...user.location,
          city: data.location.city,
          state: data.location.state,
          pinCode: data.location.pinCode,
          address: data.location.address,
        },
        preferredWorkLocations: data.location.preferredWorkLocations,
        professionalCategory: data.professional.category,
        professionalType: data.professional.type,
        specializations: data.professional.specializations,
        experience: data.professional.experience,
        about: data.professional.about,
        instagramHandle: data.professional.instagramHandle,
        pricing: data.pricing,
      };

      onProfileUpdated?.(updatedUser);
      handleBackToDashboard();
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Error is handled in store
    }
  };

  const handleEquipmentUpdate = async (equipment: EquipmentItem[]) => {
    try {
      await saveEquipment(equipment);

      const updatedUser: User = {
        ...user,
        equipment: {
          ...user.equipment,
          cameras: equipment.filter(item => item.category === EquipmentCategory.CAMERAS).map(item => item.name),
          lenses: equipment.filter(item => item.category === EquipmentCategory.LENSES).map(item => item.name),
          lighting: equipment.filter(item => item.category === EquipmentCategory.LIGHTING).map(item => item.name),
          other: equipment.filter(item => item.category === EquipmentCategory.OTHER).map(item => item.name),
        }
      };

      onProfileUpdated?.(updatedUser);
    } catch (err) {
      console.error('Failed to update equipment:', err);
    }
  };

  const handleTierUpgrade = async () => {
    // Tier upgrade logic might need a separate service or payment flow
    // For now, we simulate it or use a store action if available
    // await upgradeTier(); 

    const upgradedUser: User = {
      ...user,
      tier: TierType.PRO
    };

    onTierUpgraded?.();
    onProfileUpdated?.(upgradedUser);
  };

  const handleNotificationUpdate = async (settings: NotificationSettings) => {
    try {
      // Map NotificationSettings to PrivacySettings if needed, or create a specific action
      // For now assuming savePrivacy handles it or we need a new action
      // await saveNotificationSettings(settings);
    } catch (err) {
      console.error('Failed to update notifications:', err);
    }
  };

  const handleManageSubscription = () => {
    console.log('Managing subscription...');
  };

  // Convert user equipment to EquipmentItem format for EquipmentManager
  // We should use equipmentDraft from store if available
  const getEquipmentItems = (): EquipmentItem[] => {
    if (equipmentDraft && equipmentDraft.length > 0) return equipmentDraft;

    // Fallback to converting user object if draft is empty (initial load)
    const items: EquipmentItem[] = [];

    if (user.equipment?.cameras) {
      user.equipment.cameras.forEach((camera, index) => {
        items.push({
          id: `camera-${index}`,
          category: EquipmentCategory.CAMERAS,
          name: camera,
          isIndoorCapable: true,
          isOutdoorCapable: true,
        });
      });
    }

    if (user.equipment?.lenses) {
      user.equipment.lenses.forEach((lens, index) => {
        items.push({
          id: `lens-${index}`,
          category: EquipmentCategory.LENSES,
          name: lens,
          isIndoorCapable: true,
          isOutdoorCapable: true,
        });
      });
    }

    if (user.equipment?.lighting) {
      user.equipment.lighting.forEach((light, index) => {
        items.push({
          id: `lighting-${index}`,
          category: EquipmentCategory.LIGHTING,
          name: light,
          isIndoorCapable: true,
          isOutdoorCapable: false,
        });
      });
    }

    if (user.equipment?.other) {
      user.equipment.other.forEach((other, index) => {
        items.push({
          id: `other-${index}`,
          category: EquipmentCategory.OTHER,
          name: other,
          isIndoorCapable: true,
          isOutdoorCapable: true,
        });
      });
    }

    return items;
  };

  // Map store analytics to ProfileStats
  const getProfileStats = (): ProfileStats => {
    return {
      profileViews: analytics.profileViews,
      jobApplications: 0, // Not in analytics yet
      successRate: 0, // Not in analytics yet
      responseRate: 100, // Mock or from analytics
      profileCompletion: analytics.completionRate
    };
  };

  // Render current section
  const renderCurrentSection = () => {
    if (isLoading && !currentSection) {
      // Maybe show loading spinner?
    }

    if (error) {
      // Show error?
      console.error(error);
    }

    switch (currentSection) {
      case ProfileSection.BASIC_INFO:
      case ProfileSection.PROFESSIONAL_DETAILS:
      case ProfileSection.PRICING:
        return (
          <ProfileEditForm
            user={user} // Pass user, form handles state internally until save
            onSave={handleProfileUpdate}
            onCancel={handleBackToDashboard}
          />
        );

      case ProfileSection.EQUIPMENT:
        return (
          <EquipmentManager
            equipment={getEquipmentItems()}
            onEquipmentUpdate={handleEquipmentUpdate}
            onBack={handleBackToDashboard}
          />
        );

      case ProfileSection.TIER:
        return (
          <TierManagement
            user={user}
            onUpgrade={handleTierUpgrade}
            onManageSubscription={handleManageSubscription}
            onBack={handleBackToDashboard}
          />
        );

      case ProfileSection.PRIVACY:
        return (
          <NotificationSettingsComponent
            settings={privacySettings as any} // Need to map types
            onSettingsUpdate={handleNotificationUpdate}
            onBack={handleBackToDashboard}
          />
        );

      case ProfileSection.INSTAGRAM:
        // For now, redirect to profile edit form
        return (
          <ProfileEditForm
            user={user}
            onSave={handleProfileUpdate}
            onCancel={handleBackToDashboard}
          />
        );

      default:
        return (
          <ProfileDashboard
            user={user}
            profileStats={getProfileStats()}
            onSectionSelect={handleSectionSelect}
            onEditProfile={() => setCurrentSection(ProfileSection.BASIC_INFO)}
            onUpgradeTier={handleTierUpgrade}
          />
        );
    }
  };

  return renderCurrentSection();
};