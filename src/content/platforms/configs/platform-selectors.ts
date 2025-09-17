export const PLATFORM_SELECTORS = {
  youtube: {
    video: 'video.html5-main-video',
    container: '.html5-video-player',
    controls: '.ytp-chrome-bottom',
    fullscreen: '.ytp-fullscreen-button',
    title: 'h1.title yt-formatted-string, .title .ytd-video-primary-info-renderer',
    channel: '#upload-info #channel-name, .ytd-channel-name a'
  },
  netflix: {
    video: '.VideoContainer video, video[data-uia="video-player"]',
    container: '.VideoContainer',
    controls: '.player-controls',
    fullscreen: '.fullscreen-button',
    title: '[data-uia="video-title"], .ellipsize-text h4',
    episode: '[data-uia="episode-title"]'
  },
  twitch: {
    video: 'video[data-a-target="player-video"]',
    container: '.video-player',
    controls: '.player-controls',
    fullscreen: '.player-fullscreen-button',
    title: '.stream-title, [data-a-target="stream-title"]',
    channel: '.channel-name, [data-a-target="channel-name"]'
  },
  vimeo: {
    video: 'video',
    iframe: 'iframe[src*="player.vimeo.com"]',
    container: '.player',
    title: '.vp-title, .clip-title',
    author: '.vp-author, .clip-author'
  },
  generic: {
    video: 'video',
    iframe: 'iframe[src*="youtube.com/embed"], iframe[src*="vimeo.com/video"], iframe[src*="player.twitch.tv"]',
    containers: ['.video-player', '.player-container', '.media-player', '[data-video-id]']
  }
};
