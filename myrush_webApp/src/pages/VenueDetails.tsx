import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venuesApi } from '../api/venues';
import type { Venue } from '../api/venues';
import { courtsApi } from '../api/courts';
import type { CourtRatings, CourtReview } from '../api/courts';
import './VenueDetails.css';

export const VenueDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [venue, setVenue] = useState<Venue | null>(null);
    const [ratings, setRatings] = useState<CourtRatings | null>(null);
    const [reviews, setReviews] = useState<CourtReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (id) {
            loadVenueData(id);
        }
    }, [id]);

    const loadVenueData = async (venueId: string) => {
        setLoading(true);
        try {
            const [venueRes, ratingsRes, reviewsRes] = await Promise.all([
                venuesApi.getVenueById(venueId),
                courtsApi.getCourtRatings(venueId),
                courtsApi.getCourtReviews(venueId, 5)
            ]);

            if (venueRes.success && venueRes.data) {
                setVenue(venueRes.data);
            }
            if (ratingsRes.success) {
                setRatings(ratingsRes.data);
            }
            if (reviewsRes.success) {
                setReviews(reviewsRes.data.reviews);
            }
        } catch (error) {
            console.error('Error loading venue details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen">Loading details...</div>;
    }

    if (!venue) {
        return <div className="error-screen">Venue not found</div>;
    }

    const ratingValue = ratings?.average_rating || 0;
    const reviewCount = ratings?.total_reviews || 0;

    return (
        <div className="venue-details-page">
            <header className="details-header">
                <div className="header-image" style={{ backgroundImage: `url(${venue.photos?.[0] || '/placeholder-court.jpg'})` }}>
                    <div className="header-overlay">
                        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                        <button className="fav-btn" onClick={() => setIsFavorite(!isFavorite)}>
                            {isFavorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="details-content">
                <section className="info-section">
                    <h1>{venue.court_name}</h1>
                    <div className="location-row">
                        <span>📍</span> {venue.location}
                    </div>
                    <div className="rating-row">
                        <span className="star">⭐</span>
                        <strong>{ratingValue.toFixed(1)}</strong>
                        <span className="count">({reviewCount} reviews)</span>
                    </div>
                </section>

                {venue.amenities && venue.amenities.length > 0 && (
                    <section className="amenities-section">
                        <h3>Amenities</h3>
                        <div className="amenities-grid">
                            {venue.amenities.map(amenity => (
                                <div key={amenity.id} className="amenity-item">
                                    <div className="amenity-icon">{amenity.icon || '✨'}</div>
                                    <span>{amenity.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="about-section">
                    <h3>About</h3>
                    <p>{venue.description || 'No description available.'}</p>
                </section>

                {venue.terms_and_conditions && (
                    <section className="terms-section">
                        <h3>Terms & Conditions</h3>
                        <p>{venue.terms_and_conditions}</p>
                    </section>
                )}

                <section className="reviews-section">
                    <h3>Reviews</h3>
                    {reviews.length === 0 ? (
                        <p className="no-reviews">No reviews yet. Be the first!</p>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map(review => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <strong>{review.user_name}</strong>
                                        <div className="stars">
                                            {'⭐'.repeat(Math.round(review.rating))}
                                        </div>
                                    </div>
                                    <p>{review.review_text}</p>
                                    <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Spacer for fixed footer */}
                <div style={{ height: '100px' }}></div>
            </main>

            <footer className="details-footer">
                <div className="price-info">
                    <span className="label">Price</span>
                    <div className="amount">
                        <strong>₹{venue.prices}</strong>
                        <span>/hour</span>
                    </div>
                </div>
                <button
                    className="book-now-btn"
                    onClick={() => navigate(`/booking/slots?venueId=${venue.id}`)}
                >
                    Book Now
                </button>
            </footer>
        </div>
    );
};
