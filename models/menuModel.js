const allowedFields = [
    'restaurant_id', 'category_id', 'name', 'description',
    'base_price', 'image_url', 'is_available'
];

function isPositiveInteger(value) {
    return Number.isSafeInteger(value) && value > 0;
}

// Previously validation required category text, price > 0, and available. The
// supplied schema uses category_id, base_price (nonnegative), and is_available.
function validateMenuItem(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data) ||
        Object.keys(data).some(field => !allowedFields.includes(field))) return false;

    return isPositiveInteger(data.restaurant_id) &&
        (data.category_id == null || isPositiveInteger(data.category_id)) &&
        typeof data.name === 'string' && data.name.trim().length > 0 &&
        (data.description == null || typeof data.description === 'string') &&
        typeof data.base_price === 'number' && Number.isFinite(data.base_price) && data.base_price >= 0 &&
        (data.image_url == null || typeof data.image_url === 'string') &&
        typeof data.is_available === 'boolean';
}

// PATCH accepts schema fields only; the service validates the merged full record.
function validateMenuItemPatch(data) {
    return !!data && typeof data === 'object' && !Array.isArray(data) &&
        Object.keys(data).length > 0 && Object.keys(data).every(field => allowedFields.includes(field));
}

function validateId(id) {
    const parsedId = Number(id);
    return Number.isSafeInteger(parsedId) && parsedId > 0;
}

module.exports = { validateMenuItem, validateMenuItemPatch, validateId };
