import axios from 'axios';
import { Buffer } from 'buffer';
const clientAuthEndpoint = "https://accounts.spotify.com/api/token";
const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

export const getClientAccessToken = async () => {

    const authHeader = 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))

    try {
        const response = await axios.post(clientAuthEndpoint, 
            new URLSearchParams({ grant_type: 'client_credentials' }), 
            { headers: { 'Authorization': authHeader, 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error);
        return null;
    }
};