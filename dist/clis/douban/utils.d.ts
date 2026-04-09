/**
 * Douban adapter utilities.
 */
import type { IPage } from '../../types.js';
export interface DoubanSubjectPhoto {
    index: number;
    photoId: string;
    title: string;
    imageUrl: string;
    thumbUrl: string;
    detailUrl: string;
    page: number;
}
export interface DoubanSubjectPhotosResult {
    subjectId: string;
    subjectTitle: string;
    type: string;
    photos: DoubanSubjectPhoto[];
}
export interface LoadDoubanSubjectPhotosOptions {
    type?: string;
    limit?: number;
    targetPhotoId?: string;
}
export declare function normalizeDoubanSubjectId(subjectId: string): string;
export declare function promoteDoubanPhotoUrl(url: string, size?: 's' | 'm' | 'l'): string;
export declare function resolveDoubanPhotoAssetUrl(candidates: Array<string | null | undefined>, baseUrl?: string): string;
export declare function getDoubanPhotoExtension(url: string): string;
export declare function loadDoubanSubjectPhotos(page: IPage, subjectId: string, options?: LoadDoubanSubjectPhotosOptions): Promise<DoubanSubjectPhotosResult>;
export declare function loadDoubanBookHot(page: IPage, limit: number): Promise<any[]>;
export declare function loadDoubanMovieHot(page: IPage, limit: number): Promise<any[]>;
export declare function searchDouban(page: IPage, type: string, keyword: string, limit: number): Promise<any[]>;
/**
 * Get current user's Douban ID from movie.douban.com/mine page
 */
export declare function getSelfUid(page: IPage): Promise<string>;
/**
 * Douban mark (viewing record) interface
 */
export interface DoubanMark {
    movieId: string;
    title: string;
    year: string;
    myRating: number | null;
    myStatus: 'collect' | 'wish' | 'do';
    myComment: string;
    myDate: string;
    url: string;
}
/**
 * Douban review interface
 */
export interface DoubanReview {
    reviewId: string;
    movieId: string;
    movieTitle: string;
    title: string;
    content: string;
    myRating: number;
    createdAt: string;
    votes: number;
    url: string;
}
