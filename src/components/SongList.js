import React, { useState, useEffect } from 'react';
import { userSpotifyRequest } from '../services/SpotifyAPI';

function SongList({ artistId }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const data = await userSpotifyRequest(`artists/${artistId}/top-tracks?market=US`);
        setSongs(data?.tracks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, [artistId]);

  if (loading) return <div className="loading">Loading songs...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (songs.length === 0) return <div>No songs found for this artist.</div>;

  return (
    <div className="song-list">
      <h3>Popular Tracks</h3>
      <ul>
        {songs.map((song, index) => (
          <li key={song.id} className="song-item">
            <span className="song-number">{index + 1}.</span>
            <div className="song-info">
              <span className="song-name">{song.name}</span>
              <span className="song-duration">
                {Math.floor(song.duration_ms / 60000)}:
                {((song.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
              </span>
            </div>
            <button 
              className="play-btn"
              onClick={() => window.open(song.external_urls.spotify, '_blank')}
            >
              Play on Spotify
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SongList;