const API_URL = environment == 'production' ? "https://api.almadetuz.com" : "https://dev.almadetuz.com";
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

async function api_web_lead(section_name, data) {
  try {
    return await axios.post(API_URL +
      "/web/" + section_name + "/lead",
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

async function api_calendar_get(calendar_slug) {
  try {
    return await axios.get(API_URL + "/calendar/" + calendar_slug);
  } catch (errors) {
    console.error(errors);
    throw errors;
  }
}
