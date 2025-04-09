const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI;
const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-library-read",
    "user-read-recently-played"
];

export const loginWithSpotify = () => {
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes.join(" "));
    
    window.location.href = authUrl.toString();
};

export const handleSpotifyCallback = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const error = params.get("error");

    if (error) {
        console.error("Spotify auth error:", error);
        return null;
    }

    if (accessToken) {
        localStorage.setItem("spotify_access_token", accessToken);
        window.history.replaceState({}, "", window.location.pathname);
        return accessToken;
    }

    return null;
};

export const getUserAccessToken = () => {
    return localStorage.getItem("spotify_access_token") || null;
};

export const logoutFromSpotify = () => {
    localStorage.removeItem("spotify_access_token");
    window.location.reload();
};

/*
// commented off as PKCE flow even though more secure, requires code verifcation, thus for easy login, we use the token authentication flow
// Generates a random string for PKCE challenge
const generateRandomString = (length) => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map((x) => possible[x % possible.length])
        .join("");
};

// Computes the SHA-256 hash
const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest("SHA-256", data);
};

// Encodes data to Base64 URL format
const base64encode = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

// Initiates the Spotify Login Flow through key Exchange
export const loginWithSpotifyWithCode = async () => {
    const codeVerifier = generateRandomString(128);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    localStorage.setItem("code_verifier", codeVerifier);

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes.join(" "));
    authUrl.searchParams.append("code_challenge_method", "S256");
    authUrl.searchParams.append("code_challenge", codeChallenge);

    window.location.href = authUrl.toString();
};



// Handles the OAuth callback and exchanges code for an access token
export const handleSpotifyCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return null;

    const codeVerifier = localStorage.getItem("code_verifier");
    if (!codeVerifier) {
        console.error("Missing code_verifier.");
        return null;
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
        })
    });

    const data = await response.json();

    if (data.access_token) {
        localStorage.setItem("spotify_access_token", data.access_token);
        window.history.pushState({}, null, "/"); // Clean URL
        return data.access_token;
    } else {
        console.error("Failed to fetch access token:", data);
    }

    return null;
};


// Gets the stored access token
export const getUserAccessToken = () => {
    return localStorage.getItem("spotify_access_token") || null;
};

export const logoutFromSpotify = () => {
    localStorage.removeItem("spotify_access_token"); // Remove token
    window.location.reload(); // Refresh the page to reset the state
};

*/
