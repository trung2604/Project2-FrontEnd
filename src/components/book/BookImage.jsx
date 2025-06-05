import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/book-card.css';

const BookImage = ({ image, alt, style, size = 'thumbnail', objectFit = 'contain' }) => {
    let src = '';
    if (typeof image === 'string') {
        src = image;
    } else if (image) {
        if (size === 'medium' && image.medium) {
            src = image.medium;
        } else if (size === 'original' && image.original) {
            src = image.original;
        } else if (size === 'thumbnail' && image.thumbnail) {
            src = image.thumbnail;
        } else {
            // fallback: thumbnail -> medium -> original
            src = image.thumbnail || image.medium || image.original || '';
        }
    }
    // Responsive <picture> for best format
    if (image && typeof image === 'object') {
        return (
            <picture>
                {image.thumbnail && <source media="(max-width: 480px)" srcSet={image.thumbnail} />}
                {image.medium && <source media="(max-width: 900px)" srcSet={image.medium} />}
                {image.original && <source media="(min-width: 901px)" srcSet={image.original} />}
                <img
                    src={src || '/default-book.png'}
                    alt={alt}
                    style={{ width: '100%', height: '100%', objectFit, ...style }}
                    onError={e => { e.target.src = '/default-book.png'; }}
                />
            </picture>
        );
    }
    return (
        <img
            src={src || '/default-book.png'}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit, ...style }}
            onError={e => { e.target.src = '/default-book.png'; }}
        />
    );
};

BookImage.propTypes = {
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    alt: PropTypes.string,
    style: PropTypes.object,
    size: PropTypes.oneOf(['thumbnail', 'medium', 'original']),
    objectFit: PropTypes.oneOf(['cover', 'contain'])
};

export default BookImage; 