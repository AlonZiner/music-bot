require('dotenv').config();
const ytdl = require('@distube/ytdl-core');
const YouTube = require('youtube-sr').default;

class YouTubeService {

    extractVideoId(url) {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
                return parsedUrl.searchParams.get('v'); // Extract the 'v' parameter
            } else if (parsedUrl.hostname === 'youtu.be') {
                return parsedUrl.pathname.substring(1); // Extract from path
            } else {
                throw new Error('Not a valid YouTube URL');
            }
        } catch (error) {
            console.error('Error extracting videoId:', error.message);
            return null;
        }
    }
    
    // Function to fetch video details using YouTube Data API
    async getYouTubeVideoInfo(videoId) {
        const apiKey = process.env.YOUTUBE_API_KEY
        const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics`;
    
        try {
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.items && data.items.length > 0) {
                return data.items[0]; // Return the video details
            } else {
                throw new Error('Video not found or API limit reached.');
            }
        } catch (error) {
            console.error('Error fetching video info:', error.message);
            return null;
        }
    }

    async getVideoInfo(url) {
        try {
            console.log("BEFORE DYNAMIC IMPORT");
            const fetch = import('node-fetch');
            const URL = import('url');
            const videoId = this.extractVideoId(url);
            console.log("VIDEO ID:", videoId);
            const info = await this.getYouTubeVideoInfo(videoId)
            console.log("NEW INFO");
            console.log(info);
            

            // const songInfo = await ytdl.getInfo(url);
            return {
                title: videoInfo.snippet.title,
                url: url,
                duration: videoInfo.contentDetails.duration
            };
        } catch (error) {
            console.error('Error getting video info:', error);
            throw error;
        }
    }

    async getMixPlaylist(url, maxSongs = 20) {
        try {
            const initialVideo = await this.getVideoInfo(url);
            const songs = [initialVideo];
            
            // Get related videos from the initial video
            const info = await ytdl.getInfo(url);
            const relatedVideos = info.related_videos;

            // Add related videos up to maxSongs
            for (let i = 0; i < Math.min(relatedVideos.length, maxSongs - 1); i++) {
                const videoId = relatedVideos[i].id;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                const videoInfo = await this.getVideoInfo(videoUrl);
                songs.push(videoInfo);
            }

            return {
                name: `Mix - ${initialVideo.title}`,
                songs: songs
            };
        } catch (error) {
            console.error('Error getting mix playlist:', error);
            throw error;
        }
    }

    async searchSong(query) {
        try {
            const results = await YouTube.search(query, {
                limit: 1,
                type: 'video'
            });

            if (results && results.length > 0) {
                const video = results[0];
                return {
                    title: video.title,
                    url: `https://www.youtube.com/watch?v=${video.id}`,
                    duration: video.duration
                };
            }
            return null;
        } catch (error) {
            console.error('Error searching YouTube:', error);
            throw error;
        }
    }

    async getRelatedSongs(videoUrl, maxSongs = 10) {
        try {
            const info = await ytdl.getInfo(videoUrl);
            const relatedVideos = info.related_videos.filter(video => video.id !== currentVideoId);;
            const songs = [];

            // Get details for each related video up to maxSongs
            for (let i = 0; i < Math.min(relatedVideos.length, maxSongs); i++) {
                const videoId = relatedVideos[i].id;
                try {
                    const videoInfo = await this.getVideoInfo(`https://www.youtube.com/watch?v=${videoId}`);
                    songs.push(videoInfo);
                } catch (error) {
                    console.error(`Error getting info for related video ${videoId}:`, error);
                    // Continue with next video if one fails
                    continue;
                }
            }

            return songs;
        } catch (error) {
            console.error('Error getting related songs:', error);
            throw error;
        }
    }
    
    isMixPlaylist(url) {
        return url.includes('list=RD') || url.includes('start_radio=1');
    }
}

module.exports = new YouTubeService();
