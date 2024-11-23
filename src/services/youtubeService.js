const play = require('play-dl'); 
const YouTube = require('youtube-sr').default;

class YouTubeService {
    async getVideoInfo(url) {
        try {
            const songInfo = await play.getInfo(url);
            return {
                title: songInfo.videoDetails.title,
                url: url,
                duration: songInfo.videoDetails.lengthSeconds
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
            const info = await play.getInfo(url);
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
            const info = await play.getInfo(videoUrl);
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