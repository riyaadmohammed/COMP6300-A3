import React, { useState, useEffect } from 'react';
import { getGenres } from '../services/SpotifyAPI';

function SearchForm({ onSubmit }) {
  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    genre: '',
    artistName: ''
  });

  // Load available genres
  useEffect(() => {
    const loadGenres = async () => {
      const genreList = await getGenres();
      setGenres(genreList);
    };
    loadGenres();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="form-group">
        <label htmlFor="genre">Search by Genre:</label>
        <select 
          id="genre" 
          name="genre"
          value={formData.genre}
          onChange={handleChange}
        >
          <option value="">Select a genre</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="artistName">Search by Artist Name:</label>
        <input
          type="text"
          id="artistName"
          name="artistName"
          value={formData.artistName}
          onChange={handleChange}
          placeholder="Enter artist name"
        />
      </div>
      
      <button type="submit" className="search-btn">
        Find Artists
      </button>
    </form>
  );
}

export default SearchForm;