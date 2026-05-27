# ═══════════════════════════════════════
# models/product.py — Product Model Helpers
# ═══════════════════════════════════════

from datetime import datetime

def product_document(name, description, price, original_price, category,
                     images, stock, rating=0, reviews_count=0,
                     discount=0, is_featured=False, brand=None):
    return {
        "name":           name,
        "description":    description,
        "price":          price,
        "original_price": original_price,
        "discount":       discount,
        "category":       category.lower(),
        "brand":          brand,
        "images":         images,
        "stock":          stock,
        "rating":         rating,
        "reviews_count":  reviews_count,
        "is_featured":    is_featured,
        "is_active":      True,
        "created_at":     datetime.utcnow(),
        "updated_at":     datetime.utcnow(),
    }

def serialize_product(p: dict) -> dict:
    return {
        "id":             str(p["_id"]),
        "name":           p.get("name", ""),
        "description":    p.get("description", ""),
        "price":          p.get("price", 0),
        "original_price": p.get("original_price"),
        "discount":       p.get("discount", 0),
        "category":       p.get("category", ""),
        "brand":          p.get("brand"),
        "images":         p.get("images", []),
        "stock":          p.get("stock", 0),
        "rating":         p.get("rating", 0),
        "reviews_count":  p.get("reviews_count", 0),
        "is_featured":    p.get("is_featured", False),
        "created_at":     str(p.get("created_at", "")),
    }