const spotify = {
    intent_id: 'spotify_intent',
    link_id: 'spotify_link'
};
const ytmusic = {
    intent_id: 'ytmusic_intent',
    link_id: 'ytmusic_link'
};
const youtube = {
    intent_id: 'youtube_intent',
    link_id: 'youtube_link'
};
const artwork_link_id = 'artwork_link';

var isMobile = {
    Android: function() {
      return /Android/i.test(navigator.userAgent);
    },
    BlackBerry: function() {
      return /BlackBerry/i.test(navigator.userAgent);
    },
    iOS: function() {
      return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    Windows: function() {
      return /IEMobile/i.test(navigator.userAgent);
    },
    any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};

function deviceKind() {
    if (isMobile.Android()) { return 'android'; }
    else if (isMobile.BlackBerry()) { return 'blackberry'; }
    else if (isMobile.iOS()) { return 'ios'; }
    else if (isMobile.Windows()) { return 'windows'; }
    return 'desktop';
};

function addInfo(text) {
    var info = document.getElementById('info');
    var line = document.createElement('p');
    line.innerHTML = text;
    info.appendChild(line);
};

function fallbackLink(base, qs, fallback) {
    var params = new URLSearchParams(qs);
    if (params.has('f')) params.delete('f');
    params.append('f', fallback);
    return encodeURIComponent(base + '?' + params.toString());
}

function spotifyLinkSet(base, qs, medium, track_id, si) {
    var link = 'https://open.spotify.com/track/' + track_id + '?si=' + si;
    document.getElementById(spotify.intent_id).href = 'intent://' +
              'track/' + track_id + '?go=1&nd=1' +
              '#Intent;' +
              'scheme=spotify;' +
              'package=com.spotify.music;' +
              'S.browser_fallback_url=' + fallbackLink(base, qs, 'spotify') + ';' +
              'end;';
    document.getElementById(spotify.link_id).href = link;
    if (medium == 'spotify') document.getElementById(artwork_link_id).href = link;
}

function openSpotifyTrack(track_id, si) {
    // Try open by spotify mobile app
    if (isMobile.iOS()) {
        window.location = 'spotify://track/' + track_id + '?si=' + si;
    } else {
        document.getElementById(spotify.intent_id).click();
    }
};

function ytMusicLinkSet(base, qs, medium, track_id) {
    var link = 'https://music.youtube.com/watch?v=' + track_id;
    document.getElementById(ytmusic.intent_id).href = 'intent://' +
              'music.youtube.com/watch?v=' + track_id +
              '#Intent;' +
              'scheme=http;' +
              'package=com.google.android.apps.youtube.music;' +
              'S.browser_fallback_url=' + fallbackLink(base, qs, 'ytmusic') + ';' +
              'end;';
    document.getElementById(ytmusic.link_id).href = link;
    if (medium == 'ytmusic') document.getElementById(artwork_link_id).href = link;
}

function openYouTubeMusic(track_id) {
    // Try open by YouTube Music mobile app
    if (isMobile.iOS()) {
        window.location = 'youtubemusic://watch?v=' + track_id;
    } else {
        document.getElementById(ytmusic.intent_id).click();
    }
};

function youTubeLinkSet(base, qs, medium, video_id) {
    var link = 'https://www.youtube.com/watch?v=' + video_id;
    document.getElementById(youtube.intent_id).href = 'intent://' +
              'www.youtube.com/watch?v=' + video_id +
              '#Intent;' +
              'scheme=https;' +
              'package=com.google.android.youtube;' +
              'S.browser_fallback_url=' + fallbackLink(base, qs, 'youtube') + ';' +
              'end;';
    document.getElementById(youtube.link_id).href = link;
    if (medium == 'youtube') document.getElementById(artwork_link_id).href = link;
}

function openYouTubeVideo(video_id) {
    // Try open by YouTube mobile app
    if (isMobile.iOS()) {
        window.location = 'vnd.youtube://www.youtube.com/watch?v=' + video_id;
    } else {
        document.getElementById(youtube.intent_id).click();
    }
};
