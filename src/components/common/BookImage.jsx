import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './BookImage.css';

const BookImage = ({
    image,
    alt = 'Book cover',
    className = '',
    fallbackImage = '/no-image.png',
    aspectRatio = '4/3', // mặc định 4:3
    objectFit = 'cover', // mặc định cover
    size = 'medium' // small, medium, large
}) => {
    const [error, setError] = useState(false);
    const [imageFormat, setImageFormat] = useState('jpg');

    useEffect(() => {
        setError(false);
        if (image?.format) setImageFormat(image.format.toLowerCase());
    }, [image]);

    const handleImageError = () => setError(true);

    // Style động cho container
    const containerStyle = {
        aspectRatio: aspectRatio,
    };
    // Style động cho img
    const imgStyle = {
        objectFit: objectFit,
        borderRadius: 16,
        width: '100%',
        height: '100%',
        background: '#f5f5f5',
        transition: 'transform 0.3s ease',
    };

    if (!image || error) {
        return (
            <div className={`book-image-container book-image-${size} ${className}`} style={containerStyle}>
                <img src={fallbackImage} alt={alt} className="book-image" style={imgStyle} />
            </div>
        );
    }

    const hasValidUrls = image.thumbnail && image.medium && image.original;
    if (!hasValidUrls) {
        return (
            <div className={`book-image-container book-image-${size} ${className}`} style={containerStyle}>
                <img src={fallbackImage} alt={alt} className="book-image" style={imgStyle} />
            </div>
        );
    }

    return (
        <picture className={`book-image-container book-image-${size} ${className}`} style={containerStyle}>
            <source media="(max-width: 480px)" srcSet={image.thumbnail} type={`image/${imageFormat}`} />
            <source media="(max-width: 900px)" srcSet={image.medium} type={`image/${imageFormat}`} />
            <img
                src={image.original}
                alt={alt}
                className="book-image"
                loading="lazy"
                onError={handleImageError}
                style={imgStyle}
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
    fallbackImage: PropTypes.string,
    aspectRatio: PropTypes.string,
    objectFit: PropTypes.oneOf(['cover', 'contain']),
    size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default React.memo(BookImage); 