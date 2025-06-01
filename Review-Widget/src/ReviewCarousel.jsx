import React, { useEffect, useState, useRef } from 'react';
import './ReviewCarousel.css';

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default function ReviewCarousel() {
  const [reviews, setReviews] = useState([]);
  const [chunks, setChunks]   = useState([]);    // Array of arrays, each inner array has up to 4 reviews
  const [currentIdx, setCurrentIdx] = useState(0);
  const timerRef = useRef(null);

  // 1. Fetch reviews once on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const resp = await fetch('http://localhost:4000/api/reviews');
        if (!resp.ok) throw new Error('Failed to load reviews');
        const data = await resp.json();
        setReviews(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchReviews();
  }, []);

  // 2. Whenever `reviews` changes, recompute chunks of 4
  useEffect(() => {
    if (reviews.length) {
      const c = chunkArray(reviews, 4);
      setChunks(c);
      setCurrentIdx(0);
    }
  }, [reviews]);

  // 3. Set up interval to advance the index every 20 seconds
  useEffect(() => {
    if (chunks.length < 2) return; // No need to rotate if only 1 chunk or none

    timerRef.current = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % chunks.length);
    }, 20000); // 20 seconds

    return () => clearInterval(timerRef.current);
  }, [chunks]);

  if (!chunks.length) {
    return <div>Loading reviews…</div>;
  }

  return (
    <div className="carousel-container">
      <div
        className="slides-wrapper"
        style={{
          width: `${chunks.length * 100}%`,
          transform: `translateX(-${currentIdx * (100 / chunks.length)}%)`,
        }}
      >
        {chunks.map((group, idx) => (
          <div className="slide" key={idx}>
            {group.map((r, i) => (
              <div className="review-card" key={i}>
                {r.photoUrl && (
                  <img src={r.photoUrl} className="author-photo" alt={`${r.author}`} />
                )}
                <div className="review-content">
                  <p className="review-text">“{r.text}”</p>
                  <p className="review-author">— {r.author}</p>
                  <p className="review-rating">Rating: {r.rating} / 5</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Optional: indicators or arrows */}
    </div>
  );
}
