import { 
  CommunityPose, 
  PoseComment, 
  LibraryFilters, 
  SortBy, 
  ContributionSubmission,
  ModerationSubmission,
  ModerationAction,
  ModerationStatus,
  CommunityPosesResponse,
  PoseCommentsResponse
} from '../types/community';
import { mockQuery } from '../data/communityPosingLibraryMockData';

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CommunityService {
  // Pose operations
  async listPoses(filters: LibraryFilters, sortBy: SortBy, page: number = 1): Promise<CommunityPosesResponse> {
    await delay(800);
    
    let filteredPoses = [...mockQuery.communityPoses];
    
    // Apply filters
    if (filters.categories.length > 0) {
      filteredPoses = filteredPoses.filter(pose => 
        filters.categories.includes(pose.category)
      );
    }
    
    if (filters.difficultyLevels.length > 0) {
      filteredPoses = filteredPoses.filter(pose => 
        filters.difficultyLevels.includes(pose.difficulty_level)
      );
    }
    
    if (filters.locationTypes.length > 0) {
      filteredPoses = filteredPoses.filter(pose => 
        filters.locationTypes.includes(pose.location_type)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case SortBy.RECENT:
        filteredPoses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case SortBy.POPULAR:
        filteredPoses.sort((a, b) => b.likes_count - a.likes_count);
        break;
      case SortBy.TRENDING:
        // Mock trending algorithm - combination of recent likes and views
        filteredPoses.sort((a, b) => (b.likes_count + b.views_count * 0.1) - (a.likes_count + a.views_count * 0.1));
        break;
    }
    
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedPoses = filteredPoses.slice(startIndex, startIndex + pageSize);
    
    return {
      poses: paginatedPoses,
      total: filteredPoses.length,
      page,
      hasMore: startIndex + pageSize < filteredPoses.length
    };
  }

  async getPoseById(poseId: string): Promise<CommunityPose | null> {
    await delay(500);
    return mockQuery.communityPoses.find(pose => pose.id === poseId) || null;
  }

  async searchPoses(query: string): Promise<CommunityPose[]> {
    await delay(600);
    
    if (!query.trim()) return mockQuery.communityPoses;
    
    const searchTerm = query.toLowerCase();
    return mockQuery.communityPoses.filter(pose => 
      pose.title.toLowerCase().includes(searchTerm) ||
      pose.posing_tips.toLowerCase().includes(searchTerm) ||
      pose.photographer.name.toLowerCase().includes(searchTerm)
    );
  }

  // Interaction operations
  async likePose(poseId: string, userId: string): Promise<void> {
    await delay(300);
    console.log(`User ${userId} liked pose ${poseId}`);
  }

  async savePose(poseId: string, userId: string): Promise<void> {
    await delay(300);
    console.log(`User ${userId} saved pose ${poseId}`);
  }

  async sharePose(poseId: string, platform: string): Promise<void> {
    await delay(400);
    console.log(`Shared pose ${poseId} on ${platform}`);
  }

  // Comment operations
  async listComments(poseId: string): Promise<PoseCommentsResponse> {
    await delay(500);
    
    const comments = mockQuery.poseComments.filter(comment => 
      comment.pose_id === poseId
    );
    
    return {
      comments,
      total: comments.length
    };
  }

  async addComment(poseId: string, userId: string, text: string): Promise<PoseComment> {
    await delay(600);
    
    const newComment: PoseComment = {
      id: `comment-${Date.now()}`,
      pose_id: poseId,
      user_id: userId,
      comment_text: text,
      created_at: new Date().toISOString(),
      user: {
        name: 'Current User',
        profile_photo: 'https://i.pravatar.cc/150?img=10'
      }
    };
    
    return newComment;
  }

  // Contribution operations
  async submitContribution(contribution: ContributionSubmission): Promise<ModerationSubmission> {
    await delay(1000);
    
    const submission: ModerationSubmission = {
      id: `submission-${Date.now()}`,
      pose_id: `pose-${Date.now()}`,
      photographer_id: contribution.pose.photographer_id,
      title: contribution.pose.title,
      status: ModerationStatus.PENDING,
      submitted_at: new Date().toISOString(),
      image_url: contribution.pose.image_url
    };
    
    return submission;
  }

  async getMyContributions(userId: string): Promise<CommunityPose[]> {
    await delay(700);
    return mockQuery.communityPoses.filter(pose => 
      pose.photographer_id === userId
    );
  }

  // Moderation operations
  async getModerationQueue(filters?: any): Promise<{ submissions: ModerationSubmission[]; total: number; pendingCount: number }> {
    await delay(800);
    
    const mockSubmissions: ModerationSubmission[] = [
      {
        id: 'submission-001',
        pose_id: 'pose-pending-001',
        photographer_id: 'photographer-003',
        title: 'Creative Fashion Pose',
        status: ModerationStatus.PENDING,
        submitted_at: '2024-01-16T09:00:00Z',
        image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'
      },
      {
        id: 'submission-002',
        pose_id: 'pose-pending-002',
        photographer_id: 'photographer-004',
        title: 'Outdoor Portrait Session',
        status: ModerationStatus.PENDING,
        submitted_at: '2024-01-16T11:30:00Z',
        image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop'
      }
    ];
    
    return {
      submissions: mockSubmissions,
      total: mockSubmissions.length,
      pendingCount: mockSubmissions.filter(s => s.status === ModerationStatus.PENDING).length
    };
  }

  async reviewPose(poseId: string, action: ModerationAction, feedback?: string): Promise<void> {
    await delay(600);
    console.log(`Reviewed pose ${poseId} with action ${action}${feedback ? ` and feedback: ${feedback}` : ''}`);
  }

  // Real-time operations (stubs)
  subscribeToComments(poseId: string, callback: (comment: PoseComment) => void): () => void {
    console.log(`Subscribed to comments for pose ${poseId}`);
    
    // Mock real-time comment updates
    const interval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance every interval
        const mockComment: PoseComment = {
          id: `comment-${Date.now()}`,
          pose_id: poseId,
          user_id: 'mock-user',
          comment_text: 'This is a mock real-time comment!',
          created_at: new Date().toISOString(),
          user: {
            name: 'Mock User',
            profile_photo: 'https://i.pravatar.cc/150?img=20'
          }
        };
        callback(mockComment);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }

  subscribeToModeration(callback: (submission: ModerationSubmission) => void): () => void {
    console.log('Subscribed to moderation updates');
    
    // Mock real-time moderation updates
    const interval = setInterval(() => {
      if (Math.random() > 0.98) { // 2% chance every interval
        const mockSubmission: ModerationSubmission = {
          id: `submission-${Date.now()}`,
          pose_id: `pose-${Date.now()}`,
          photographer_id: 'mock-photographer',
          title: 'New Mock Submission',
          status: ModerationStatus.PENDING,
          submitted_at: new Date().toISOString(),
          image_url: 'https://images.unsplash.com/photo-1494790108755-2616c4e7e2b3?w=400&h=600&fit=crop'
        };
        callback(mockSubmission);
      }
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }
}

export const communityService = new CommunityService();