export const formatCurrency = (value) => {
    const number = Number(value);
    if (isNaN(number) || value === null || value === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
}; 