import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Avatar.css';

const Avatar = ({
    avatar,
    size = 'medium',
    alt = 'User avatar',
    className = '',
    fallbackImage = '/default-avatar.png' // Đường dẫn ảnh mặc định
}) => {
    const [error, setError] = useState(false);
    const [imageFormat, setImageFormat] = useState('png');

    useEffect(() => {
        // Reset error state when avatar changes
        setError(false);
        if (avatar?.format) {
            setImageFormat(avatar.format.toLowerCase());
        }
    }, [avatar]);

    const handleImageError = () => {
        setError(true);
    };

    // Nếu không có avatar hoặc có lỗi, hiển thị fallback
    if (!avatar || error) {
        return (
            <div className={`avatar-container avatar-${size} ${className}`}>
                <img
                    src={fallbackImage}
                    alt={alt}
                    className="avatar"
                    onError={handleImageError}
                />
            </div>
        );
    }

    // Validate avatar object
    const hasValidUrls = avatar.thumbnail && avatar.medium && avatar.original;
    if (!hasValidUrls) {
        return (
            <div className={`avatar-container avatar-${size} ${className}`}>
                <img
                    src={fallbackImage}
                    alt={alt}
                    className="avatar"
                />
            </div>
        );
    }

    return (
        <picture className={`avatar-container ${className}`}>
            {/* Thumbnail cho màn hình nhỏ */}
            <source
                media="(max-width: 480px)"
                srcSet={avatar.thumbnail}
                type={`image/${imageFormat}`}
            />
            {/* Medium cho màn hình trung bình */}
            <source
                media="(max-width: 768px)"
                srcSet={avatar.medium}
                type={`image/${imageFormat}`}
            />
            {/* Original cho màn hình lớn */}
            <img
                src={avatar.original}
                alt={alt}
                className={`avatar avatar-${size}`}
                loading="lazy"
                onError={handleImageError}
            />
        </picture>
    );
};

Avatar.propTypes = {
    avatar: PropTypes.shape({
        thumbnail: PropTypes.string,
        medium: PropTypes.string,
        original: PropTypes.string,
        format: PropTypes.string
    }),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    alt: PropTypes.string,
    className: PropTypes.string,
    fallbackImage: PropTypes.string
};

// Default props
Avatar.defaultProps = {
    size: 'medium',
    alt: 'User avatar',
    className: '',
    fallbackImage: '/default-avatar.png'
};

export default React.memo(Avatar); 