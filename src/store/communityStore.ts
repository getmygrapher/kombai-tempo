import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  SortBy, 
  LibraryFilters, 
  CommunityPose,
  PoseComment,
  ContributionDraft,
  ContributionStep,
  ContributionFormData,
  ModerationSubmission,
  DifficultyLevel,
  PoseCategory,
  ValidationErrorType
} from '../types/community';

interface CommunityStore {
  // Library state
  currentSort: SortBy;
  activeFilters: LibraryFilters;
  searchQuery: string;
  showFilters: boolean;
  selectedPose: string | null;
  
  // Data state
  poses: CommunityPose[];
  comments: PoseComment[];
  likedPoses: Set<string>;
  savedPoses: Set<string>;
  
  // Contribution state
  contributionDraft: ContributionDraft;
  contributionStep: ContributionStep;
  
  // Moderation state
  moderationQueue: ModerationSubmission[];
  selectedSubmission: ModerationSubmission | null;
  
  // Real-time state
  isConnected: boolean;
  lastCommentUpdate: string | null;
  lastModerationUpdate: string | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentSort: (sortBy: SortBy) => void;
  setActiveFilters: (filters: Partial<LibraryFilters>) => void;
  setSearchQuery: (query: string) => void;
  setShowFilters: (show: boolean) => void;
  setSelectedPose: (poseId: string | null) => void;
  clearFilters: () => void;
  
  // Data actions
  setPoses: (poses: CommunityPose[]) => void;
  setComments: (comments: PoseComment[]) => void;
  addComment: (comment: PoseComment) => void;
  toggleLike: (poseId: string) => void;
  toggleSave: (poseId: string) => void;
  
  // Contribution actions
  updateContributionDraft: (draft: Partial<ContributionDraft>) => void;
  setContributionStep: (step: ContributionStep) => void;
  clearContributionDraft: () => void;
  
  // Moderation actions
  setModerationQueue: (queue: ModerationSubmission[]) => void;
  setSelectedSubmission: (submission: ModerationSubmission | null) => void;
  updateSubmissionStatus: (submissionId: string, status: string) => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialContributionDraft: ContributionDraft = {
  step: ContributionStep.UPLOAD,
  image: null,
  exifData: null,
  formData: {
    title: '',
    posing_tips: '',
    difficulty_level: DifficultyLevel.BEGINNER,
    people_count: 1,
    category: PoseCategory.PORTRAIT,
    mood_emotion: '',
    additional_equipment: [],
    lighting_setup: '',
    story_behind: ''
  },
  validationErrors: {},
  timestamp: new Date().toISOString()
};

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSort: SortBy.POPULAR,
      activeFilters: {
        categories: [],
        difficultyLevels: [],
        locationTypes: [],
        equipmentTypes: [],
        peopleCount: [],
      },
      searchQuery: '',
      showFilters: false,
      selectedPose: null,
      
      poses: [],
      comments: [],
      likedPoses: new Set(['pose-001']),
      savedPoses: new Set(['pose-002']),
      
      contributionDraft: initialContributionDraft,
      contributionStep: ContributionStep.UPLOAD,
      
      moderationQueue: [],
      selectedSubmission: null,
      
      isConnected: false,
      lastCommentUpdate: null,
      lastModerationUpdate: null,
      
      isLoading: false,
      error: null,

      // Actions
      setCurrentSort: (sortBy) => set({ currentSort: sortBy }),
      
      setActiveFilters: (filters) => set((state) => ({
        activeFilters: { ...state.activeFilters, ...filters }
      })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setShowFilters: (show) => set({ showFilters: show }),
      
      setSelectedPose: (poseId) => set({ selectedPose: poseId }),
      
      clearFilters: () => set({
        activeFilters: {
          categories: [],
          difficultyLevels: [],
          locationTypes: [],
          equipmentTypes: [],
          peopleCount: [],
        }
      }),
      
      // Data actions
      setPoses: (poses) => set({ poses }),
      
      setComments: (comments) => set({ comments }),
      
      addComment: (comment) => set((state) => ({
        comments: [comment, ...state.comments]
      })),
      
      toggleLike: (poseId) => set((state) => {
        const newLikedPoses = new Set(state.likedPoses);
        if (newLikedPoses.has(poseId)) {
          newLikedPoses.delete(poseId);
        } else {
          newLikedPoses.add(poseId);
        }
        return { likedPoses: newLikedPoses };
      }),
      
      toggleSave: (poseId) => set((state) => {
        const newSavedPoses = new Set(state.savedPoses);
        if (newSavedPoses.has(poseId)) {
          newSavedPoses.delete(poseId);
        } else {
          newSavedPoses.add(poseId);
        }
        return { savedPoses: newSavedPoses };
      }),
      
      // Contribution actions
      updateContributionDraft: (draft) => set((state) => ({
        contributionDraft: { ...state.contributionDraft, ...draft, timestamp: new Date().toISOString() }
      })),
      
      setContributionStep: (step) => set({ contributionStep: step }),
      
      clearContributionDraft: () => set({ contributionDraft: initialContributionDraft }),
      
      // Moderation actions
      setModerationQueue: (queue) => set({ moderationQueue: queue }),
      
      setSelectedSubmission: (submission) => set({ selectedSubmission: submission }),
      
      updateSubmissionStatus: (submissionId, status) => set((state) => ({
        moderationQueue: state.moderationQueue.map(submission =>
          submission.id === submissionId ? { ...submission, status: status as any } : submission
        )
      })),
      
      // Loading actions
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'community-store',
      partialize: (state) => ({
        contributionDraft: state.contributionDraft,
        likedPoses: Array.from(state.likedPoses),
        savedPoses: Array.from(state.savedPoses),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Sets
          state.likedPoses = new Set(state.likedPoses as any);
          state.savedPoses = new Set(state.savedPoses as any);
        }
      },
    }
  )
);