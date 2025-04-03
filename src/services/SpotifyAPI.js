import { getClientAccessToken } from './clientAuth';
import { getUserAccessToken } from './userAuth';

let clientToken = null;

const fetchClientToken = async () => {
  if (!clientToken) {
    clientToken = await getClientAccessToken();
  }
  return clientToken;
};

const spotifyRequest = async (endpoint) => {
  try {
    const token = await fetchClientToken();
    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Spotify API Request Failed:", error);
    return null;
  }
};

export const userSpotifyRequest = async (endpoint) => {
  try {
    const token = getUserAccessToken();
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Spotify User API Request Failed:", error);
    throw error;
  }
};

// Get available genres
export const getGenres = async () => {
  try {
    const data = await spotifyRequest("browse/categories");
    return data.categories.items.map((category) => category.name);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

// Get artist by genre
export const getArtistsByGenre = async (genre, limit = 4) => {
    try {
      const searchResults = await spotifyRequest(
        `search?q=genre:${encodeURIComponent(genre)}&type=artist&limit=50`
      );
      
      // Add proper null checks
      const artists = searchResults?.artists?.items?.filter(artist => 
        artist && artist.id && artist.name
      ) || [];
      
      if (artists.length === 0) return [];
      
      const shuffled = [...artists].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error("Error fetching artists by genre:", error);
      return [];
    }
  };

// Search for artists by name
export const searchArtists = async (query) => {
  try {
    return await spotifyRequest(`search?q=${encodeURIComponent(query)}&type=artist&limit=5`);
  } catch (error) {
    console.error("Error searching artists:", error);
    return null;
  }
};

// Get artist details
export const getArtist = async (artistId) => {
  try {
    return await spotifyRequest(`artists/${artistId}`);
  } catch (error) {
    console.error("Error fetching artist:", error);
    return null;
  }
};

// Get more Artist Details
export const getArtistDetails = async (artistId) => {
    try {
      const [artist, topTracks] = await Promise.all([
        spotifyRequest(`artists/${artistId}`),
        spotifyRequest(`artists/${artistId}/top-tracks?market=US`)
      ]);
      
      return {
        ...artist,
        topTracks: topTracks?.tracks || []
      };
    } catch (error) {
      console.error("Error fetching artist details:", error);
      return null;
    }
  };