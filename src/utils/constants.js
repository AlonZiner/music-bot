module.exports = {
    messages: {
        JOIN_SUCCESS: '✅ Joined the voice channel!',
        JOIN_ERROR: '❌ You need to be in a voice channel first!',
        PLAY_ERROR: '❌ Error playing the song.',
        QUEUE_EMPTY: '📪 Queue is empty.',
        SONG_ADDED: '➕ Added to queue:',
        SONG_PLAYING: '▶️ Now playing:',
        SKIP_ERROR: '❌ Error skipping song.',
        CLEAR_ERROR: '❌ Error clearing queue.',
        QUEUE_ERROR: '❌ Error managing queue.',
        LEAVE_SUCCESS: '👋 Left the voice channel.',
        NO_PERMISSION: '🚫 You do not have permission to use this command.',
        RADIO_ERROR: '❌ Error generating radio station.'
    },
    
    errorTypes: {
        VOICE_CONNECTION: 'VOICE_CONNECTION_ERROR',
        PLAYBACK: 'PLAYBACK_ERROR',
        QUEUE: 'QUEUE_ERROR',
        PERMISSION: 'PERMISSION_ERROR'
    }
};