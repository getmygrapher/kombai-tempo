import React, { useState } from 'react';
import { ProfileSection, TierType } from '../../types/enums';
import { User, ProfileFormData, NotificationSettings, ProfileStats, EquipmentItem } from '../../types';
import { ProfileDashboard } from './ProfileDashboard';
import { ProfileEditForm } from './ProfileEditForm';
import { EquipmentManager } from './EquipmentManager';
import { TierManagement } from './TierManagement';
import { NotificationSettingsComponent } from './NotificationSettings';
import { 
  mockProfileStats, 
  mockNotificationSettings, 
  mockUserProfile 
} from '../../data/profileManagementMockData';

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
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [profileStats] = useState<ProfileStats>(mockProfileStats);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);

  const handleSectionSelect = (section: ProfileSection) => {
    setCurrentSection(section);
  };

  const handleBackToDashboard = () => {
    setCurrentSection(null);
  };

  const handleProfileUpdate = async (data: ProfileFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedUser: User = {
      ...currentUser,
      name: data.basicInfo.name,
      email: data.basicInfo.email,
      phone: data.basicInfo.phone,
      alternatePhone: data.basicInfo.alternatePhone,
      gender: data.basicInfo.gender,
      profilePhoto: data.basicInfo.profilePhoto || currentUser.profilePhoto,
      location: {
        ...currentUser.location,
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

    setCurrentUser(updatedUser);
    onProfileUpdated?.(updatedUser);
    handleBackToDashboard();
  };

  const handleEquipmentUpdate = (equipment: EquipmentItem[]) => {
    const updatedUser: User = {
      ...currentUser,
      equipment: {
        ...currentUser.equipment,
        // Convert equipment items to the format expected by User type
        cameras: equipment.filter(item => item.category === 'cameras').map(item => item.name),
        lenses: equipment.filter(item => item.category === 'lenses').map(item => item.name),
        lighting: equipment.filter(item => item.category === 'lighting').map(item => item.name),
        other: equipment.filter(item => item.category === 'other').map(item => item.name),
      }
    };

    setCurrentUser(updatedUser);
    onProfileUpdated?.(updatedUser);
  };

  const handleTierUpgrade = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const upgradedUser: User = {
      ...currentUser,
      tier: TierType.PRO
    };

    setCurrentUser(upgradedUser);
    onTierUpgraded?.();
    onProfileUpdated?.(upgradedUser);
  };

  const handleNotificationUpdate = async (settings: NotificationSettings) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setNotificationSettings(settings);
  };

  const handleManageSubscription = () => {
    // Implement subscription management
    console.log('Managing subscription...');
  };

  // Convert user equipment to EquipmentItem format for EquipmentManager
  const convertToEquipmentItems = (user: User): EquipmentItem[] => {
    const items: EquipmentItem[] = [];
    
    if (user.equipment?.cameras) {
      user.equipment.cameras.forEach((camera, index) => {
        items.push({
          id: `camera-${index}`,
          category: 'cameras' as any,
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
          category: 'lenses' as any,
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
          category: 'lighting' as any,
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
          category: 'other' as any,
          name: other,
          isIndoorCapable: true,
          isOutdoorCapable: true,
        });
      });
    }

    return items;
  };

  // Render current section
  const renderCurrentSection = () => {
    switch (currentSection) {
      case ProfileSection.BASIC_INFO:
      case ProfileSection.PROFESSIONAL_DETAILS:
      case ProfileSection.PRICING:
        return (
          <ProfileEditForm
            user={currentUser}
            onSave={handleProfileUpdate}
            onCancel={handleBackToDashboard}
          />
        );

      case ProfileSection.EQUIPMENT:
        return (
          <EquipmentManager
            equipment={convertToEquipmentItems(currentUser)}
            onEquipmentUpdate={handleEquipmentUpdate}
            onBack={handleBackToDashboard}
          />
        );

      case ProfileSection.TIER:
        return (
          <TierManagement
            user={currentUser}
            onUpgrade={handleTierUpgrade}
            onManageSubscription={handleManageSubscription}
            onBack={handleBackToDashboard}
          />
        );

      case ProfileSection.PRIVACY:
        return (
          <NotificationSettingsComponent
            settings={notificationSettings}
            onSettingsUpdate={handleNotificationUpdate}
            onBack={handleBackToDashboard}
          />
        );

      case ProfileSection.INSTAGRAM:
        // For now, redirect to profile edit form
        return (
          <ProfileEditForm
            user={currentUser}
            onSave={handleProfileUpdate}
            onCancel={handleBackToDashboard}
          />
        );

      default:
        return (
          <ProfileDashboard
            user={currentUser}
            profileStats={profileStats}
            onSectionSelect={handleSectionSelect}
            onEditProfile={() => setCurrentSection(ProfileSection.BASIC_INFO)}
            onUpgradeTier={handleTierUpgrade}
          />
        );
    }
  };

  return renderCurrentSection();
};