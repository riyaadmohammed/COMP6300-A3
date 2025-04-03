import React from 'react';

function ArtistCard({ artist, onSelect }) {
  if (!artist) return null;

  return (
    <div className="artist-card" onClick={() => onSelect(artist)}>
      <div className="artist-image">
        {artist.images?.[0]?.url ? (
          <img src={artist.images[0].url} alt={artist.name} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>
      <div className="artist-info">
        <h3>{artist.name}</h3>
        {artist.genres?.length > 0 && (
          <p className="genres">
            {artist.genres.slice(0, 3).join(', ')}
          </p>
        )}
        <p className="followers">
          {artist.followers?.total?.toLocaleString()} followers
        </p>
      </div>
    </div>
  );
}

export default ArtistCard;