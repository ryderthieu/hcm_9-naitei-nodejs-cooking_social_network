export interface UserProfile {
	firstName: string;
	lastName: string;
	bio: string;
	avatar: string;
}

export interface UserData {
	id?: number;
	username: string;
	firstName?: string;
	lastName?: string;
	avatar?: string | null;
	bio?: string | null;
	postsCount?: number;
	recipesCount?: number;
	savedPostsCount?: number;
	followers?: number;
	followings?: number;
	isFollowing?: boolean;
}

export interface UserStats {
	posts: { count: number };
	recipes: { count: number };
	saved: { count: number };
	followers: { count: number };
	following: { count: number };
}


