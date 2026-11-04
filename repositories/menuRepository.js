const pool = require('../database');

function mapRow(row) {
    return row ? {
        ...row,
        item_id: Number(row.item_id),
        restaurant_id: Number(row.restaurant_id),
        category_id: row.category_id === null ? null : Number(row.category_id),
        base_price: Number(row.base_price)
    } : null;
}

// Previously queries used id/category/price/available from the demo array and
// the locally invented table. Use the supplied schema's column names instead.
async function getMenuItems({ categoryId, restaurantId, search, limit, offset }) {
    const conditions = [];
    const values = [];
    if (categoryId !== undefined) {
        values.push(categoryId);
        conditions.push(`category_id = $${values.length}`);
    }
    if (restaurantId !== undefined) {
        values.push(restaurantId);
        conditions.push(`restaurant_id = $${values.length}`);
    }
    if (search) {
        values.push(`%${search}%`);
        conditions.push(`(LOWER(name) LIKE $${values.length} OR LOWER(COALESCE(description, '')) LIKE $${values.length})`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await pool.query(`SELECT COUNT(*) FROM menu_items ${where}`, values);
    values.push(limit, offset);
    const items = await pool.query(
        `SELECT item_id, restaurant_id, category_id, name, description, base_price, image_url, is_available FROM menu_items ${where} ORDER BY item_id LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values
    );
    return { data: items.rows.map(mapRow), total: Number(count.rows[0].count) };
}

async function getMenuItemById(id) {
    const result = await pool.query('SELECT item_id, restaurant_id, category_id, name, description, base_price, image_url, is_available FROM menu_items WHERE item_id = $1', [id]);
    return mapRow(result.rows[0]);
}

async function createMenuItem(data) {
    const result = await pool.query(
        'INSERT INTO menu_items (restaurant_id, category_id, name, description, base_price, image_url, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING item_id, restaurant_id, category_id, name, description, base_price, image_url, is_available',
        [data.restaurant_id, data.category_id ?? null, data.name.trim(), data.description ?? null, data.base_price, data.image_url ?? null, data.is_available]
    );
    return mapRow(result.rows[0]);
}

async function replaceMenuItem(id, data) {
    const result = await pool.query(
        'UPDATE menu_items SET restaurant_id = $1, category_id = $2, name = $3, description = $4, base_price = $5, image_url = $6, is_available = $7, updated_at = CURRENT_TIMESTAMP WHERE item_id = $8 RETURNING item_id, restaurant_id, category_id, name, description, base_price, image_url, is_available',
        [data.restaurant_id, data.category_id ?? null, data.name.trim(), data.description ?? null, data.base_price, data.image_url ?? null, data.is_available, id]
    );
    return mapRow(result.rows[0]);
}

async function updateMenuItem(id, data) {
    const fields = [];
    const values = [];
    for (const field of ['restaurant_id', 'category_id', 'name', 'description', 'base_price', 'image_url', 'is_available']) {
        if (Object.hasOwn(data, field)) {
            values.push(field === 'name' && data[field] !== null ? data[field].trim() : data[field]);
            fields.push(`${field} = $${values.length}`);
        }
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const result = await pool.query(
        `UPDATE menu_items SET ${fields.join(', ')} WHERE item_id = $${values.length} RETURNING item_id, restaurant_id, category_id, name, description, base_price, image_url, is_available`,
        values
    );
    return mapRow(result.rows[0]);
}

async function removeMenuItem(id) {
    // Keep menu history and associations intact; the supplied schema uses
    // availability as the reversible way to remove an item from ordering.
    const result = await pool.query('UPDATE menu_items SET is_available = FALSE, updated_at = CURRENT_TIMESTAMP WHERE item_id = $1 RETURNING item_id, restaurant_id, category_id, name, description, base_price, image_url, is_available', [id]);
    return mapRow(result.rows[0]);
}

module.exports = { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, replaceMenuItem, removeMenuItem };
