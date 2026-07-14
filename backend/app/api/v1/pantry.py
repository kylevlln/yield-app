"""Pantry Management API Routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.recipe import (
    PantryStaple,
    PantryInventoryItem,
    IngredientCategory,
    MeasurementUnit
)
from app.core.auth import get_current_user_id
from app.db.supabase import recipe_service, supabase

router = APIRouter(tags=["pantry"])


# =============================================================================
# PANTRY STAPLES (Always On-Hand Items)
# =============================================================================

@router.get(
    "/staples",
    response_model=List[PantryStaple],
    summary="Get user's pantry staples"
)
async def get_pantry_staples(user_id: str = Depends(get_current_user_id)):
    """Get all 'Always On-Hand' ingredients for the user"""
    client = supabase.service_client
    result = await client.table("pantry_staples")\
        .select("*")\
        .eq("user_id", user_id)\
        .eq("is_staple", True)\
        .order("name")\
        .execute()
    return result.data or []


@router.post(
    "/staples",
    response_model=PantryStaple,
    status_code=status.HTTP_201_CREATED,
    summary="Add pantry staple"
)
async def add_pantry_staple(
    staple: PantryStaple,
    user_id: str = Depends(get_current_user_id)
):
    """Add an ingredient to user's 'Always On-Hand' list"""
    client = supabase.service_client
    data = staple.model_dump()
    data["user_id"] = user_id
    data["is_staple"] = True
    
    result = await client.table("pantry_staples").insert(data).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=400, detail="Failed to add staple")


@router.patch(
    "/staples/{staple_id}",
    response_model=PantryStaple,
    summary="Update pantry staple"
)
async def update_pantry_staple(
    staple_id: str,
    staple: PantryStaple,
    user_id: str = Depends(get_current_user_id)
):
    """Update a pantry staple"""
    client = supabase.service_client
    data = staple.model_dump(exclude_unset=True)
    data["user_id"] = user_id
    
    result = await client.table("pantry_staples")\
        .update(data)\
        .eq("id", staple_id)\
        .eq("user_id", user_id)\
        .execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=404, detail="Staple not found")


@router.delete(
    "/staples/{staple_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove pantry staple"
)
async def delete_pantry_staple(
    staple_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Remove an ingredient from 'Always On-Hand' list"""
    client = supabase.service_client
    result = await client.table("pantry_staples")\
        .delete()\
        .eq("id", staple_id)\
        .eq("user_id", user_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Staple not found")


# =============================================================================
# CURRENT INVENTORY (What user actually has right now)
# =============================================================================

@router.get(
    "/inventory",
    response_model=List[PantryInventoryItem],
    summary="Get current inventory"
)
async def get_inventory(
    location: str = None,
    expiring_soon: bool = False,
    user_id: str = Depends(get_current_user_id)
):
    """Get user's current ingredient inventory"""
    client = supabase.service_client
    query = client.table("pantry_inventory").select("*").eq("user_id", user_id)
    
    if location:
        query = query.eq("location", location)
    if expiring_soon:
        from datetime import datetime, timedelta
        cutoff = (datetime.utcnow() + timedelta(days=2)).isoformat()
        query = query.lte("expires_at", cutoff)
    
    query = query.order("expires_at", nulls_last=True)
    result = await query.execute()
    return result.data or []


@router.post(
    "/inventory",
    response_model=PantryInventoryItem,
    status_code=status.HTTP_201_CREATED,
    summary="Add inventory item"
)
async def add_inventory_item(
    item: PantryInventoryItem,
    user_id: str = Depends(get_current_user_id)
):
    """Add item to current inventory"""
    client = supabase.service_client
    data = item.model_dump()
    data["user_id"] = user_id
    
    result = await client.table("pantry_inventory").insert(data).execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=400, detail="Failed to add item")


@router.patch(
    "/inventory/{item_id}",
    response_model=PantryInventoryItem,
    summary="Update inventory item"
)
async def update_inventory_item(
    item_id: str,
    item: PantryInventoryItem,
    user_id: str = Depends(get_current_user_id)
):
    """Update inventory item (quantity, location, etc.)"""
    client = supabase.service_client
    data = item.model_dump(exclude_unset=True)
    data["user_id"] = user_id
    
    result = await client.table("pantry_inventory")\
        .update(data)\
        .eq("id", item_id)\
        .eq("user_id", user_id)\
        .execute()
    if result.data:
        return result.data[0]
    raise HTTPException(status_code=404, detail="Item not found")


@router.delete(
    "/inventory/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove inventory item"
)
async def delete_inventory_item(
    item_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Remove item from inventory"""
    client = supabase.service_client
    result = await client.table("pantry_inventory")\
        .delete()\
        .eq("id", item_id)\
        .eq("user_id", user_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Item not found")


# =============================================================================
# SMART SUBSTITUTIONS
# =============================================================================

@router.get(
    "/substitutions/{ingredient}",
    response_model=List[dict],
    summary="Get substitution suggestions for ingredient"
)
async def get_substitutions(
    ingredient: str,
    category: str = None,
    dietary: str = None,
    user_id: str = Depends(get_current_user_id)
):
    """Get smart substitution suggestions for an ingredient"""
    client = supabase.service_client
    
    query = client.table("ingredient_substitutions")\
        .select("*")\
        .ilike("ingredient_name", f"%{ingredient}%")
    
    if category:
        query = query.eq("category", category)
    if dietary:
        query = query.contains("dietary_tags", [dietary])
    
    query = query.order("confidence_score", desc=True).limit(5)
    result = await query.execute()
    
    # Also check user's personal preferences
    pref_result = await client.table("user_substitution_preferences")\
        .select("*")\
        .eq("user_id", user_id)\
        .ilike("ingredient_name", f"%{ingredient}%")\
        .execute()
    
    suggestions = []
    
    # Add user preferences first
    for pref in pref_result.data or []:
        suggestions.append({
            "substitute": pref["preferred_substitute"],
            "ratio": pref["ratio"],
            "category": "personal",
            "confidence": 1.0,
            "source": "your_preference",
            "notes": pref.get("notes")
        })
    
    # Add community/AI suggestions
    for sub in result.data or []:
        suggestions.append({
            "substitute": sub["substitute_name"],
            "ratio": sub["ratio"],
            "category": sub["category"],
            "confidence": float(sub["confidence_score"]),
            "source": sub["source"],
            "notes": sub.get("notes"),
            "works_in": sub.get("works_in", [])
        })
    
    return suggestions


@router.post(
    "/substitutions/feedback",
    status_code=status.HTTP_201_CREATED,
    summary="Record substitution feedback"
)
async def record_substitution_feedback(
    original: str,
    substitute: str,
    successful: bool,
    recipe_id: str = None,
    notes: str = None,
    user_id: str = Depends(get_current_user_id)
):
    """Record whether a substitution worked for learning"""
    client = supabase.service_client
    
    data = {
        "user_id": user_id,
        "original_ingredient": original,
        "substituted_ingredient": substitute,
        "was_successful": successful,
        "recipe_id": recipe_id,
        "notes": notes
    }
    
    result = await client.table("user_substitution_history").insert(data).execute()
    return {"success": True, "id": result.data[0]["id"] if result.data else None}