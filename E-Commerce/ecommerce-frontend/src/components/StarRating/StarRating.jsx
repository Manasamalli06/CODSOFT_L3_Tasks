import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import './StarRating.css';

const StarRating = ({ rating, numReviews, showCount = true, size = 'md' }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="star star-filled" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="star star-filled" />);
    } else {
      stars.push(<FiStar key={i} className="star star-empty" />);
    }
  }

  return (
    <div className={`star-rating star-rating-${size}`}>
      <div className="stars">{stars}</div>
      {showCount && numReviews !== undefined && (
        <span className="rating-count">({numReviews})</span>
      )}
    </div>
  );
};

export default StarRating;
