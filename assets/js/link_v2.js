const spotify = {
    intent_id: 'spotify_intent',
    link_id: 'spotify_link',
    artist_id: 'spotify_artist_link'
};
const ytmusic = {
    intent_id: 'ytmusic_intent',
    link_id: 'ytmusic_link'
};
const youtube = {
    intent_id: 'youtube_intent',
    link_id: 'youtube_link'
};
const apple = {
    link_id: 'apple_link'
};
const soundcloud = {
    intent_id: 'soundcloud_intent',
    link_id: 'soundcloud_link'
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

var base;
var medium;
var event_prop;
var environment = 'devel';

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

function fallbackLink(fallback) {
    var params = new URLSearchParams(window.location.search);
    if (params.has('f')) params.delete('f');
    params.append('f', fallback);
    return encodeURIComponent(base + '?' + params.toString());
}

function amplitudeEvent(event, prop) {
    if (environment == 'production' && typeof amplitude !== 'undefined') {
        amplitude.track(event, prop);
    }
}

function amplitudeClick(button) {
    var click_prop = {
        button: button
    };
    amplitudeEvent('Click', {...event_prop, ...click_prop});
}

function facebookClick(button) {
    var click_prop = {
        content_category: 'streaming',
        content_name: button
    };
    if (environment == 'production' && typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', click_prop);
    }
}

function iOSClick(link, button) {
    amplitudeClick(button);
    facebookClick(button);
    window.location = link;
}

function androidClick(el_id) {
    document.getElementById(el_id).click();
}

function mobileClick(link, button, intent_id) {
    if (isMobile.iOS()) {
        iOSClick(link, button);
    } else {
        androidClick(intent_id);
    }
}

function linkSet(el_id, link, button) {
    var el_link = document.getElementById(el_id);
    if (el_link) {
        el_link.href = link;
        el_link.onclick = function(){
            amplitudeClick(button);
            facebookClick(button);
        };
    }
}


// ----------------------- SPOTIFY -------------------------

function spotifyPlaylistLinkSet(playlist_id, si) {
    var link = 'https://open.spotify.com/playlist/' + playlist_id + '?si=' + si;
    var intent = 'intent://' +
        'playlist/' + playlist_id + '?go=1&nd=1' +
        '#Intent;' +
        'scheme=spotify;' +
        'package=com.spotify.music;' +
        'S.browser_fallback_url=' + fallbackLink('spotify') + ';' +
        'end;';
    linkSet(spotify.intent_id, intent, 'spotify');
    linkSet(spotify.link_id, link, 'spotify');
    if (medium == 'spotify') { linkSet(artwork_link_id, link, 'artwork') };
}

function openSpotifyPlaylist(playlist_id, si) {
    var link = 'spotify://playlist/' + playlist_id + '?si=' + si;
    mobileClick(link, 'spotify', spotify.intent_id);
};

function spotifyArtistLinkSet(artist_id, si) {
    var link = 'https://open.spotify.com/artist/' + artist_id + '?si=' + si;
    var intent = 'intent://' +
        'artist/' + artist_id + '?go=1&nd=1' +
        '#Intent;' +
        'scheme=spotify;' +
        'package=com.spotify.music;' +
        'S.browser_fallback_url=' + fallbackLink('spotify') + ';' +
        'end;';
    linkSet(spotify.intent_id, intent, 'spotify');
    linkSet(spotify.link_id, link, 'spotify');
    linkSet(spotify.artist_id, link, 'spotify_artist');
    if (medium == 'spotify') { linkSet(artwork_link_id, link, 'artwork') };
}

function openSpotifyArtist(artist_id, si) {
    var link = 'spotify://artist/' + artist_id + '?si=' + si;
    mobileClick(link, 'spotify', spotify.intent_id);
};

function spotifyLinkSet(track_id, si, context) {
    var link = 'https://open.spotify.com/track/' + track_id + '?si=' + si;
    var intent = 'track/' + track_id + '?go=1&nd=1';
    if (context != 'none') {
        link = link + "&context=" + encodeURIComponent(context);
        intent = intent + "&context=" + encodeURIComponent(context);
    }
    intent = 'intent://' +
        intent +
        '#Intent;' +
        'scheme=spotify;' +
        'package=com.spotify.music;' +
        'S.browser_fallback_url=' + fallbackLink('spotify') + ';' +
        'end;';
    linkSet(spotify.intent_id, intent, 'spotify');
    linkSet(spotify.link_id, link, 'spotify');
    if (medium == 'spotify') { linkSet(artwork_link_id, link, 'artwork') };
}

function openSpotifyTrack(track_id, si, context) {
    var link = 'spotify://track/' + track_id + '?si=' + si;
    if (context != 'none') {
        link = link + "&context=" + encodeURIComponent(context);
    }
    mobileClick(link, 'spotify', spotify.intent_id);
};


// ----------------------- YOUTUBE MUSIC -------------------------

function ytMusicChannelSet(channel_id) {
    var link = 'https://music.youtube.com/channel/' + channel_id;
    var intent = 'intent://' +
        'music.youtube.com/channel/' + channel_id +
        '#Intent;' +
        'scheme=http;' +
        'package=com.google.android.apps.youtube.music;' +
        'S.browser_fallback_url=' + fallbackLink('ytmusic') + ';' +
        'end;';
    linkSet(ytmusic.intent_id, intent, 'ytmusic');
    linkSet(ytmusic.link_id, link, 'ytmusic');
    if (medium == 'ytmusic') { linkSet(artwork_link_id, link, 'artwork') };
}

function openYouTubeMusicChannel(channel_id) {
    var link = 'youtubemusic://channel/' + channel_id;
    mobileClick(link, 'ytmusic', ytmusic.intent_id);
};

function ytMusicLinkSet(track_id, list_id) {
    var link = 'https://music.youtube.com/watch?v=' + track_id;
    var intent = 'music.youtube.com/watch?v=' + track_id;
    if (list_id != 'none') {
        link = link + "&list=" + list_id;
        intent = intent + "&list=" + list_id;
    }
    intent = 'intent://' +
        intent +
        '#Intent;' +
        'scheme=http;' +
        'package=com.google.android.apps.youtube.music;' +
        'S.browser_fallback_url=' + fallbackLink('ytmusic') + ';' +
        'end;';
    linkSet(ytmusic.intent_id, intent, 'ytmusic');
    linkSet(ytmusic.link_id, link, 'ytmusic');
    if (medium == 'ytmusic') { linkSet(artwork_link_id, link, 'artwork') };
}

function openYouTubeMusic(track_id, list_id) {
    var link = 'youtubemusic://watch?v=' + track_id;
    if (list_id != 'none') {
        link = link + "&list=" + list_id;
    }
    mobileClick(link, 'ytmusic', ytmusic.intent_id);
};

// ----------------------- YOUTUBE -------------------------

function youTubeChannelSet(channel_id) {
    var link = 'https://www.youtube.com/channel/' + channel_id;
    var intent = 'intent://' +
        'www.youtube.com/channel/' + channel_id +
        '#Intent;' +
        'scheme=https;' +
        'package=com.google.android.youtube;' +
        'S.browser_fallback_url=' + link + ';' +
        'end;';
    linkSet(youtube.intent_id, intent, 'youtube');
    if (isMobile.iOS()) { linkSet(youtube.link_id, link, 'youtube'); }
                   else { linkSet(youtube.link_id, intent, 'youtube'); }
    if (medium == 'youtube') { linkSet(artwork_link_id, link, 'artwork') };
}

function openYouTubeChannel(channel_id) {
    var link = 'vnd.youtube://www.youtube.com/channel/' + channel_id;
    mobileClick(link, 'youtube', youtube.intent_id);
};

function youTubeLinkSet(video_id, list_id) {
    var link = 'https://www.youtube.com/watch?v=' + video_id;
    var intent = 'www.youtube.com/watch?v=' + video_id;
    if (list_id != 'none') {
        link = link + "&list=" + list_id;
        intent = intent + "&list=" + list_id;
    }
    intent = 'intent://' +
        intent +
        '#Intent;' +
        'scheme=https;' +
        'package=com.google.android.youtube;' +
        'S.browser_fallback_url=' + fallbackLink('youtube') + ';' +
        'end;';
    linkSet(youtube.intent_id, intent, 'youtube');
    if (isMobile.Android()) { linkSet(youtube.link_id, intent, 'youtube'); }
                       else { linkSet(youtube.link_id, link, 'youtube'); }
    if (medium == 'youtube') { linkSet(artwork_link_id, link, 'artwork') };
}

function openYouTubeVideo(video_id, list_id) {
    var link = 'vnd.youtube://www.youtube.com/watch?v=' + video_id;
    if (list_id != 'none') {
        link = link + "&list=" + list_id;
    }
    mobileClick(link, 'youtube', youtube.intent_id);
};

// ----------------------- APPLE MUSIC -------------------------

function appleLinkSet(link) {
    linkSet(apple.link_id, link, 'apple');
}

// ----------------------- SOUNDCLOUD -------------------------

function soundcloudArtistSet(artist_id) {
    var link = 'https://soundcloud.com/' + artist_id;
    var intent = 'intent://' +
        'soundcloud.com/' + artist_id +
        '#Intent;' +
        'scheme=https;' +
        'package=com.soundcloud.android;' +
        'S.browser_fallback_url=' + fallbackLink('soundcloud') + ';' +
        'end;';
    linkSet(soundcloud.intent_id, intent, 'soundcloud');
    linkSet(soundcloud.link_id, link, 'soundcloud');
    if (medium == 'soundcloud') { linkSet(artwork_link_id, link, 'artwork') };
}

function openSoundcloudArtist(artist_id) {
    var link = 'soundcloud://' + artist_id;
    mobileClick(link, 'soundcloud', soundcloud.intent_id);
};

function soundcloudLinkSet(track_id) {
    var link = 'https://soundcloud.com/' + track_id;
    var intent = 'intent://' +
        'soundcloud.com/' + track_id +
        '#Intent;' +
        'scheme=https;' +
        'package=com.soundcloud.android;' +
        'S.browser_fallback_url=' + fallbackLink('soundcloud') + ';' +
        'end;';
    linkSet(soundcloud.intent_id, intent, 'soundcloud');
    linkSet(soundcloud.link_id, link, 'soundcloud');
    if (medium == 'soundcloud') { linkSet(artwork_link_id, link, 'artwork') };
}

function openSoundcloudTrack(track_id) {
    var link = 'soundcloud://' + track_id;
    mobileClick(link, 'soundcloud', soundcloud.intent_id);
};
