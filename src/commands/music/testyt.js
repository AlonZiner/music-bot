// const { 
//     createAudioResource, 
//     createAudioPlayer,
//     joinVoiceChannel,
//     AudioPlayerStatus,
//     NoSubscriberBehavior
// } = require('@discordjs/voice');
// const ytdl = require('@distube/ytdl-core');

// module.exports = {
//     name: 'testyt',
//     description: 'Test YouTube audio',
//     category: 'music',
//     async execute(message) {
//         try {
//             const voiceChannel = message.member.voice.channel;
//             if (!voiceChannel) {
//                 return message.reply('Please join a voice channel first!');
//             }

//             message.reply('Testing new YouTube player...');
            
//             // Use a short audio for testing
//             const url = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
            
//             // First verify we can get video info
//             const info = await ytdl.getInfo(url);
//             console.log('Successfully got video info:', info.videoDetails.title);
//             message.channel.send(`Found video: ${info.videoDetails.title}`);

//             // Join voice channel
//             const connection = joinVoiceChannel({
//                 channelId: voiceChannel.id,
//                 guildId: message.guild.id,
//                 adapterCreator: message.guild.voiceAdapterCreator,
//             });

//             // Create player
//             const player = createAudioPlayer({
//                 behaviors: {
//                     noSubscriber: NoSubscriberBehavior.Play
//                 }
//             });

//             // Add player event handlers
//             player.on(AudioPlayerStatus.Playing, () => {
//                 console.log('Now playing');
//                 message.channel.send('▶️ Started playing');
//             });

//             player.on(AudioPlayerStatus.Buffering, () => {
//                 console.log('Buffering');
//             });

//             player.on(AudioPlayerStatus.Idle, () => {
//                 console.log('Finished playing');
//                 message.channel.send('⏹️ Finished playing');
//             });

//             player.on('error', error => {
//                 console.error('Player error:', error);
//             });

//             // Subscribe connection to player
//             connection.subscribe(player);

//             // Create stream
//             const stream = ytdl(url, {
//                 filter: 'audioonly',
//                 quality: 'lowestaudio',
//                 highWaterMark: 1 << 25
//             });

//             // Create resource
//             const resource = createAudioResource(stream);

//             // Play
//             player.play(resource);
            
//             message.channel.send('Started playback attempt...');

//         } catch (error) {
//             console.error('Test error:', error);
//             message.reply(`Test failed: ${error.message}`);
//         }
//     }
// };