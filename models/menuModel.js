const allowedFields=[
    "name",
    "category",
    "price",
    "available"
]
function validateMenuItem(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return false;
    }

    if (Object.keys(data).some(field => !allowedFields.includes(field))) {
        return false;}

    return (
        typeof data.name === 'string' &&
        data.name.trim().length > 0 &&
        typeof data.category === 'string' &&
        data.category.trim().length > 0 &&
        typeof data.price === 'number' &&
        data.price > 0 &&
        typeof data.available === 'boolean'
    )
}
function validateMenuItemPatch(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data) 
    || Object.keys(data).length === 0) {
        return false;
    }
    return Object.keys(data).every(field => allowedFields.includes(field));
}
function validateId(id) {
    const parsedId = Number(id);
    return Number.isInteger(parsedId) && parsedId > 0;
}
module.exports = {
    validateMenuItem,
    validateMenuItemPatch,
    validateId
};
