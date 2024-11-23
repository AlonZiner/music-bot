class QueueManager {
    constructor() {
        this.queues = new Map();
    }

    // Initialize queue for a server
    createQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, {
                songs: [],
                playing: false,
                connection: null
            });
        }
        return this.queues.get(guildId);
    }

    // Add song to queue
    addSong(guildId, song) {
        const queue = this.getQueue(guildId);
        if (!queue) return false;
        
        queue.songs.push(song);
        return true;
    }

    // Get queue for a server
    getQueue(guildId) {
        return this.queues.get(guildId);
    }

    // Remove song from queue
    removeSong(guildId, index) {
        const queue = this.getQueue(guildId);
        if (!queue || !queue.songs[index]) return false;
        
        queue.songs.splice(index, 1);
        return true;
    }

    // Clear queue
    clearQueue(guildId) {
        const queue = this.getQueue(guildId);
        if (!queue) return false;
        
        queue.songs = [];
        return true;
    }
}

module.exports = new QueueManager();