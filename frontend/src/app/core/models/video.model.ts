export interface Video {
    _id?: string;
    url: string;
    videoId: string;
    thumbnailUrl: string;
    title: string;
    categories?: string[];
    createdAt: string;
}

export interface VideoResponse {
    success: boolean;
    data: Video | Video[];
    message?: string;
    count?: number;
}
