import { Exclude } from 'class-transformer';

const GENDER_MAPPING = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
} as const;

export class UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  bio?: string;
  gender?: string;
  birthday?: string | null;
  followers?: number;
  followings?: number;
  isFollowing?: boolean;
  recipesCount?: number;
  postsCount?: number;
  savedPostsCount?: number;

  @Exclude()
  password: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  slug: string;

  @Exclude()
  _count: any;

  constructor(partial: Partial<UserResponseDto> & { _count?: any }) {
    Object.assign(this, partial);

    this.followers = partial._count?.following ?? 0; 
    this.followings = partial._count?.followers ?? 0; 
    this.postsCount = partial._count?.authoredPosts ?? 0;
    this.recipesCount = partial._count?.authoredRecipes ?? 0;
    this.savedPostsCount = partial._count?.savedPosts ?? 0;
    this.avatar = partial.avatar || undefined;
    this.bio = partial.bio || undefined;
    this.gender = this.mapGender(partial.gender);
    this.birthday = this.formatBirthday(partial.birthday);
  }

  private mapGender(gender: string | undefined): string | undefined {
    if (!gender) return undefined;
    return GENDER_MAPPING[gender as keyof typeof GENDER_MAPPING] || undefined;
  }

  private formatBirthday(birthday: any): string | null {
    if (!birthday) return null;

    try {
      const date = new Date(birthday);
      return date.toISOString().split('T')[0].replace(/-/g, '/');
    } catch {
      return null;
    }
  }
}
