// google login api

/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = "770018345527-gnau6drmi4aba34vraaig7usf51jkuse.apps.googleusercontent.com";
const API_KEY = "AIzaSyB80t_U2yVbPcXp1vzz3qnTOofgrkLVDa0";

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/people/v1/rest";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/contacts.readonly";

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById("google__authorize_btn").style.visibility = "hidden";

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("google__authorize_btn").style.visibility = "visible";
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthorize_btn() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    document.getElementById("google__authorize_btn").style.visibility = "visible";
    document.getElementById("google__authorize_btn").innerText = "Refresh";
    await listConnectionNames();
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");
    document.getElementById("content").innerText = "";
    document.getElementById("google__authorize_btn").innerText = "Authorize";
    document.getElementById("signout_button").style.visibility = "hidden";
  }
}

/**
 * Print the display name if available for 10 connections.
 */
async function listConnectionNames() {
  let response;
  try {
    // Fetch first 10 files
    response = await gapi.client.people.people.connections.list({
      resourceName: "people/me",
      pageSize: 10,
      personFields: "names,emailAddresses",
    });
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return;
  }
  const connections = response.result.connections;
  if (!connections || connections.length == 0) {
    document.getElementById("content").innerText = "No connections found.";
    return;
  }
  // Flatten to string to display
  const output = connections.reduce((str, person) => {
    if (!person.names || person.names.length === 0) {
      return `${str}Missing display name\n`;
    }
    return `${str}${person.names[0].displayName}\n`;
  }, "Connections:\n");
  document.getElementById("content").innerText = output;
}
