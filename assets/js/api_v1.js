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
