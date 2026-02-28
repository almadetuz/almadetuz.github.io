const API_URL = environment == 'production' ? "https://api.almadetuz.com" : "http://localhost:5000";
async function api_user_activity_access(activity_code, data) {
  try {
    return await axios.post(API_URL +
      "/user/activity/" + activity_code + "/access",
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (errors) {
    console.error(errors);
  }
}

async function api_card_lead(card_name, data) {
  try {
    return await axios.post(API_URL +
      "/card/" + card_name + "/lead",
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (errors) {
    console.error(errors);
    throw errors;
  }
}

function _api_event_user_data_get() {
    const query_params = new URLSearchParams(window.location.search);
    var last_utm = {};
    try { last_utm = JSON.parse(localStorage.getItem('adt_last_utms')) || {}; }
    catch (error) { last_utm = {}; }
    var fbp = document.cookie.replace(/;\s+/g, ';').split(';').find(row => row.startsWith('_fbp='));
    if (fbp) {
        fbp = fbp.split('=')[1];
    }
    return {
        fbc: `fb.1.${Date.now()}.${query_params.get('fbclid') || last_utm['fbclid']}`,
        fbp: fbp,
    };
}

function _api_event_source_url_get() {
    return window.location.href;
}

async function api_track_fb_event(event_name, event_id = undefined, custom_data = {}) {
  try {
    const response = await axios.post(API_URL + "/track/fb", {
      event_name: event_name,
      event_id: event_id,
      event_source_url: _api_event_source_url_get(),
      action_source: 'website',
      user_data: _api_event_user_data_get(),
      custom_data: custom_data
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (errors) {
    console.error("FB CAPI Error:", errors);
  }
}
