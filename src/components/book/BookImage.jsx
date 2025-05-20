import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/book-card.css';

const BookImage = ({
    image,
    alt = 'Book image',
    className = '',
    fallbackImage = 'https://via.placeholder.com/150'
}) => {
    const [error, setError] = useState(false);
    const [imageFormat, setImageFormat] = useState('jpg');

    useEffect(() => {
        setError(false);
        if (image?.format) {
            setImageFormat(image.format.toLowerCase());
        }
    }, [image]);

    const handleImageError = () => {
        setError(true);
    };

    if (!image || error) {
        return (
            <div className={`book-image-container ${className}`} style={{ textAlign: 'center' }}>
                <img
                    src={fallbackImage}
                    alt={alt}
                    className="book-card-image"
                    onError={handleImageError}
                />
            </div>
        );
    }

    const hasValidUrls = image.thumbnail && image.medium && image.original;
    if (!hasValidUrls) {
        return (
            <div className={`book-image-container ${className}`} style={{ textAlign: 'center' }}>
                <img
                    src={fallbackImage}
                    alt={alt}
                    className="book-card-image"
                />
            </div>
        );
    }

    return (
        <picture className={`book-image-container ${className}`} style={{ textAlign: 'center' }}>
            <source
                media="(max-width: 480px)"
                srcSet={image.thumbnail}
                type={`image/${imageFormat}`}
            />
            <source
                media="(max-width: 768px)"
                srcSet={image.medium}
                type={`image/${imageFormat}`}
            />
            <img
                src={image.original}
                alt={alt}
                className="book-card-image"
                loading="lazy"
                onError={handleImageError}
            />
        </picture>
    );
};

BookImage.propTypes = {
    image: PropTypes.shape({
        thumbnail: PropTypes.string,
        medium: PropTypes.string,
        original: PropTypes.string,
        format: PropTypes.string
    }),
    alt: PropTypes.string,
    className: PropTypes.string,
    fallbackImage: PropTypes.string
};

export default React.memo(BookImage); 