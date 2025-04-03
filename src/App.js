import React, { useState, useEffect } from 'react';
import './App.css';
import SearchForm from './components/SearchForm';
import ArtistCard from './components/ArtistCard';
import SongList from './components/SongList';
import { loginWithSpotify, handleSpotifyCallback, getUserAccessToken, logoutFromSpotify } from './services/userAuth';
import { getGenres, getArtistsByGenre, searchArtists, getArtist } from './services/SpotifyAPI';

function App() {
  const [randomArtists, setRandomArtists] = useState([]);
  const [recommendedArtists, setRecommendedArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle Spotify callback on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = await handleSpotifyCallback();
      if (token) {
        const accessToken = getUserAccessToken();
        if (accessToken) {
          // You could fetch user profile here if needed
          setUser({ loggedIn: true });
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Load random artists on initial render
  useEffect(() => {
    const loadRandomArtists = async () => {
      const genres = await getGenres();
      if (genres.length > 0) {
        // Pick 4 random genres
        const randomGenres = genres.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        // Get one artist per random genre
        const artists = await Promise.all(
          randomGenres.map(genre => getArtistsByGenre(genre, 1).then(res => res[0]))
        );
        
        setRandomArtists(artists.filter(artist => artist !== null));
      }
    };
  
    loadRandomArtists();
  }, []);

  const handleSearch = async (searchData) => {
    setHasSearched(true);
    setLoading(true);
    try {
      let artists = [];
      
      if (searchData.genre) {
        const genreArtists = await getArtistsByGenre(searchData.genre, 4);
        if (genreArtists.length > 0) {
          artists = [...artists, ...genreArtists];
        } else {
          console.log("No artists found for this genre");
        }
      }
      
      if (searchData.artistName) {
        const searchResults = await searchArtists(searchData.artistName);
        const foundArtists = searchResults?.artists?.items?.filter(a => a?.id) || [];
        
        if (foundArtists.length > 0) {
          const remainingSlots = Math.max(0, 4 - artists.length);
          artists = [
            ...artists,
            ...foundArtists.slice(0, remainingSlots)
          ];
        }
      }
      
      setRecommendedArtists(artists);
    } catch (error) {
      console.error("Error searching artists:", error);
      setRecommendedArtists([]); // Reset on error
    } finally {
      setLoading(false);
    }
  };

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
  };

  const handleBackToList = () => {
    setSelectedArtist(null);
  };

  if (loading && !selectedArtist) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Artist Recommender</h1>
        
        {user ? (
          <button onClick={logoutFromSpotify} className="logout-btn">
            Logout from Spotify
          </button>
        ) : (
          <button onClick={loginWithSpotify} className="login-btn">
            Login with Spotify
          </button>
        )}
      </header>
  
      <main>
        {selectedArtist ? (
          <div className="artist-detail">
            <button onClick={handleBackToList} className="back-btn">
              Back to Artists
            </button>
            
            {/* New Artist Detail Section */}
            <div className="artist-header">
              <div className="artist-image-large">
                {selectedArtist.images?.[0]?.url ? (
                  <img src={selectedArtist.images[0].url} alt={selectedArtist.name} />
                ) : (
                  <div className="no-image-large">No Image</div>
                )}
              </div>
              
              <div className="artist-info-large">
                <h2>{selectedArtist.name}</h2>
                <p className="followers-large">
                  {selectedArtist.followers?.total?.toLocaleString()} followers
                </p>
                
                {selectedArtist.genres?.length > 0 && (
                  <div className="genres-large">
                    <h4>Genres:</h4>
                    <div className="genre-tags">
                      {selectedArtist.genres.map(genre => (
                        <span key={genre} className="genre-tag">{genre}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conditional rendering for songs (only when logged in) */}
            {user ? (
              <SongList artistId={selectedArtist.id} />
            ) : (
              <div className="login-prompt">
                <p>Log in with Spotify to view this artist's top tracks</p>
                <button onClick={loginWithSpotify} className="login-btn">
                  Login with Spotify
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <SearchForm onSubmit={handleSearch} />
            
            <div className="artists-container">
              {/* Add the empty results message here */}
              {hasSearched && !loading && recommendedArtists.length === 0 && (
                <div className="no-results">
                  <p>No artists found matching your search.</p>
                  <p>Try a different genre or artist name.</p>
                </div>
              )}
  
              {/* This shows when we have search results */}
              {recommendedArtists.length > 0 && (
                <>
                  <h2>Recommended Artists</h2>
                  <div className="artists-grid">
                    {recommendedArtists.map(artist => (
                      artist && artist.id && (
                        <ArtistCard 
                          key={artist.id} 
                          artist={artist} 
                          onSelect={handleArtistSelect}
                        />
                      )
                    ))}
                  </div>
                </>
              )}
  
              {/* This shows the random featured artists when no search has been made */}
              {!loading && recommendedArtists.length === 0 && randomArtists.length > 0 && (
                <>
                  <h2>Featured Artists</h2>
                  <div className="artists-grid">
                    {randomArtists.map(artist => (
                      artist && artist.id && (
                        <ArtistCard 
                          key={artist.id} 
                          artist={artist} 
                          onSelect={handleArtistSelect}
                        />
                      )
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;