function getAnchorParams() {
  const out = {};

  let query = window.location.hash.substr(1);

  for(let raw of query.split('&')) {
    let pair = raw.split('=').map(decodeURIComponent);
    out[pair[0]] = pair[1];
  }

  return out;
}


// Interfaces that all define a way to auth should be passed to the api class, if none is provided it will not
// authenticate for the implicit path a listener should check if the anchor query is set, remove it from the anchor and
// store the data. Tokens should be added to the request using some sort of wrapper.

// Check for access_token in anchor query
// http://localhost:8000/oauth/authorize?client_id=4&redirect_uri=http%3A%2F%2Flocalhost%3A1337%2Fcallback.php&response_type=token&scope=
// request /\    returns \/
// { access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiI…", token_type: "bearer", expires_in: "1296000" }