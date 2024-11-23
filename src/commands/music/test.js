// const { 
//     createAudioResource, 
//     createAudioPlayer,
//     joinVoiceChannel,
//     AudioPlayerStatus,
//     NoSubscriberBehavior
// } = require('@discordjs/voice');
// const play = require('play-dl');

// module.exports = {
//     name: 'test',
//     description: 'Test audio playback',
//     category: 'music',
//     async execute(message) {
//         try {
//             // Set up play-dl
//             await play.setToken({
//                 youtube: {
//                     cookie: process.env.YOUTUBE_COOKIE // We'll add this to .env
//                 }
//             });

//             const voiceChannel = message.member.voice.channel;
//             if (!voiceChannel) {
//                 return message.reply('Please join a voice channel first!');
//             }

//             message.reply('Starting audio test...');
//             console.log('Test 1: Joining channel');

//             const connection = joinVoiceChannel({
//                 channelId: voiceChannel.id,
//                 guildId: message.guild.id,
//                 adapterCreator: message.guild.voiceAdapterCreator,
//                 selfDeaf: false
//             });

//             console.log('Test 2: Creating audio player');
//             const player = createAudioPlayer({
//                 behaviors: {
//                     noSubscriber: NoSubscriberBehavior.Play
//                 }
//             });

//             connection.subscribe(player);

//             player.on(AudioPlayerStatus.Playing, () => {
//                 console.log('Player status: Playing');
//                 message.channel.send('▶️ Now playing audio...');
//             });

//             player.on(AudioPlayerStatus.Idle, () => {
//                 console.log('Player status: Idle');
//             });

//             player.on(AudioPlayerStatus.Buffering, () => {
//                 console.log('Player status: Buffering');
//             });

//             player.on('error', error => {
//                 console.error('Player error:', error);
//                 message.channel.send('❌ Audio player error');
//             });

//             // Let's try a different video (shorter, might be easier to test)
//             const url = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';  // Big Buck Bunny clip
//             console.log('Test 3: Creating stream from:', url);

//             const { stream, type } = await play.stream(url, {
//                 discordPlayerCompatibility: true,
//                 quality: 2, // Lower quality for testing
//                 seek: 0
//             });

//             console.log('Stream created successfully');
//             console.log('Stream type:', type);

//             console.log('Test 4: Creating resource');
//             const resource = createAudioResource(stream, {
//                 inputType: type,
//                 inlineVolume: true
//             });

//             if (resource) {
//                 console.log('Resource created successfully');
//                 resource.volume?.setVolume(0.5); // Lower volume for testing
//             }

//             console.log('Test 5: Playing audio');
//             player.play(resource);

//             message.reply('Audio test initiated. You should hear something shortly...');

//         } catch (error) {
//             console.error('Test command error:', error);
//             message.reply(`❌ Test failed: ${error.message}`);
//         }
//     }
// };