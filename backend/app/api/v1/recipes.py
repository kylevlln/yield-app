"""Recipe API Routes"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query, File, UploadFile
from typing import Optional, List
from datetime import datetime

from app.models.recipe import (
    RecipeGenerationRequest,
    RecipeGenerationResponse,
    RecipeDB,
    GenerationStatus,
    RecipeGenerationJob
)
from app.services.recipe_generation import get_recipe_service, RecipeGenerationError, RecipeGenerationService
from app.core.auth import get_current_user_id
from app.core.config import settings
from app.db.supabase import supabase

router = APIRouter(tags=["recipes"])


async def _safe_generate(service, request, user_id):
    """Wrapper that always raises RecipeGenerationError or returns recipe"""
    try:
        return await service.generate_recipe(request, user_id)
    except RecipeGenerationError:
        raise
    except Exception as e:
        raise RecipeGenerationError(f"Unexpected error: {e}")


@router.post(
    "/generate",
    response_model=RecipeGenerationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate recipe from ingredients"
)
async def generate_recipe(
    request: RecipeGenerationRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    service: RecipeGenerationService = Depends(get_recipe_service)
):
    """
    Generate a recipe using ONLY the provided ingredients + user's pantry staples.
    
    Features:
    - **Strict ingredient constraint**: No outside ingredients allowed
    - **Taste Filter**: Rejects inedible combinations (chocolate+fish, etc.)
    - **Food Safety**: Mandatory temperature banners for proteins
    - **Swipeable Steps**: Structured for mobile step-by-step viewer
    - **Smart Substitutions**: Suggestions for missing ingredients
    """
    try:
        recipe = await service.generate_recipe(request, user_id)
        
        # Log generation in background
        background_tasks.add_task(
            log_recipe_generation,
            user_id=user_id,
            request=request,
            recipe=recipe
        )
        
        return recipe
        
    except RecipeGenerationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": str(e),
                "violations": getattr(e, 'violations', []),
                "type": "generation_error"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Recipe generation failed", "type": "internal_error"}
        )


@router.post(
    "/generate/stream",
    summary="Generate recipe with streaming distraction messages"
)
async def generate_recipe_stream(
    request: RecipeGenerationRequest,
    user_id: str = Depends(get_current_user_id),
    service: RecipeGenerationService = Depends(get_recipe_service)
):
    """
    Generate recipe with Server-Sent Events for distraction UX.
    Streams status messages while LLM processes, then returns full recipe.
    """
    from fastapi.responses import StreamingResponse
    import asyncio
    import json
    
    async def event_generator():
        import asyncio
        import json

        messages = [
            "Consulting the flavor spirits...",
            "Balancing sweet, salty, sour, bitter, umami...",
            "Checking your pantry's secret stash...",
            "Negotiating with the garlic gods...",
            "Calculating optimal onion-to-garlic ratio...",
            "Preheating the imagination oven...",
            "Summoning the spirit of Julia Child...",
            "Measuring with grandmother's precision...",
            "Whisking creativity into the batter...",
            "Simmering ideas to perfection...",
        ]

        # Start LLM call in background — don't block on it
        llm_task = asyncio.create_task(
            _safe_generate(service, request, user_id)
        )

        # Stream distraction messages while LLM works
        for i, msg in enumerate(messages):
            if llm_task.done():
                break
            yield f"data: {json.dumps({'type': 'distraction', 'message': msg, 'progress': (i + 1) * 8})}\n\n"
            try:
                await asyncio.wait_for(asyncio.shield(llm_task), timeout=1.5)
                # LLM finished before timeout — break out of distraction loop
                break
            except asyncio.TimeoutError:
                # LLM still working — send next distraction message
                pass

        # Retrieve LLM result (raises if it failed) — 60s hard timeout
        try:
            recipe = await asyncio.wait_for(llm_task, timeout=60)
            yield f"data: {json.dumps({'type': 'complete', 'recipe': recipe.model_dump(mode='json')})}\n\n"
        except asyncio.TimeoutError:
            llm_task.cancel()
            yield f"data: {json.dumps({'type': 'error', 'message': 'Recipe generation timed out. Please try again.'})}\n\n"
        except RecipeGenerationError as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'violations': getattr(e, 'violations', [])})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': 'Generation failed'})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post(
    "",
    response_model=RecipeDB,
    status_code=status.HTTP_201_CREATED,
    summary="Save a generated recipe"
)
async def save_recipe(
    recipe_data: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Save a generated recipe to the user's collection"""
    client = supabase.service_client
    
    db_record = {
        "user_id": user_id,
        "title": recipe_data.get("title", "Untitled Recipe"),
        "description": recipe_data.get("description"),
        "servings": recipe_data.get("servings", 2),
        "prep_time_minutes": recipe_data.get("prep_time_minutes", 0),
        "cook_time_minutes": recipe_data.get("cook_time_minutes", 0),
        "difficulty": recipe_data.get("difficulty", "easy"),
        "meal_type": recipe_data.get("meal_type", []),
        "dietary_tags": recipe_data.get("dietary_tags", []),
        "cuisine": recipe_data.get("cuisine"),
        "ingredients": recipe_data.get("ingredients", []),
        "steps": recipe_data.get("steps", []),
        "equipment": recipe_data.get("equipment", []),
        "protein_type": recipe_data.get("protein_type", "none"),
        "food_safety": recipe_data.get("food_safety"),
        "substitutions": recipe_data.get("substitutions", []),
        "status": "saved",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    result = await client.table("recipes").insert(db_record).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save recipe")
    
    return result.data[0]


@router.post(
    "/vision",
    response_model=List[dict],
    summary="Parse ingredients from photo"
)
async def parse_ingredients_from_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """
    Parse ingredients from uploaded image using GPT-4o vision.
    Returns structured ingredient list for recipe generation.
    """
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="Vision API not configured")

    # Read and encode image
    import base64
    image_bytes = await file.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    mime_type = file.content_type or "image/jpeg"

    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a kitchen ingredient识别 assistant. "
                        "Analyze the image and identify all food ingredients visible. "
                        "Return ONLY a JSON array of objects with keys: "
                        "name (string), quantity (number or null), unit (string or null), "
                        "category (one of: produce, meat, seafood, dairy, pantry, spices, baking, condiments, beverages, frozen, other). "
                        "No markdown, no commentary."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{image_b64}"},
                        },
                        {
                            "type": "text",
                            "text": "Identify all food ingredients in this image. Return as JSON array.",
                        },
                    ],
                },
            ],
            max_tokens=1000,
            temperature=0.2,
        )

        import json
        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        ingredients = json.loads(raw)

        if not isinstance(ingredients, list):
            raise HTTPException(
                status_code=422,
                detail={"message": "Vision model returned unexpected format", "type": "parse_error"}
            )

        if len(ingredients) == 0:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "No ingredients detected — try a clearer photo with visible food items",
                    "type": "no_ingredients",
                }
            )

        return ingredients

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Could not parse vision response — try a clearer photo",
                "type": "parse_error",
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        try:
            import sentry_sdk
            sentry_sdk.capture_exception(e)
        except ImportError:
            pass
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Image analysis failed — try again or enter ingredients manually",
                "type": "vision_api_error",
            }
        )


@router.get(
    "",
    response_model=List[RecipeDB],
    summary="Get user's recipes"
)
async def get_recipes(
    user_id: str = Depends(get_current_user_id),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's saved/generated recipes with filtering"""
    client = supabase.service_client
    query = client.table("recipes").select("*").eq("user_id", user_id)
    
    if status_filter:
        query = query.eq("status", status_filter)
    
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    result = await query.execute()
    
    return result.data or []


@router.get(
    "/{recipe_id}",
    response_model=RecipeDB,
    summary="Get single recipe"
)
async def get_recipe(
    recipe_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a single recipe by ID"""
    client = supabase.service_client
    result = await client.table("recipes")\
        .select("*")\
        .eq("id", recipe_id)\
        .eq("user_id", user_id)\
        .single()\
        .execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return result.data


@router.patch(
    "/{recipe_id}",
    response_model=RecipeDB,
    summary="Update recipe"
)
async def update_recipe(
    recipe_id: str,
    updates: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Update recipe (notes, rating, status, etc.)"""
    client = supabase.service_client
    updates["updated_at"] = datetime.utcnow().isoformat()
    
    result = await client.table("recipes")\
        .update(updates)\
        .eq("id", recipe_id)\
        .eq("user_id", user_id)\
        .execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return result.data[0]


@router.delete(
    "/{recipe_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete recipe"
)
async def delete_recipe(
    recipe_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a recipe"""
    client = supabase.service_client
    result = await client.table("recipes")\
        .delete()\
        .eq("id", recipe_id)\
        .eq("user_id", user_id)\
        .execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Recipe not found")


@router.post(
    "/{recipe_id}/cook",
    response_model=RecipeDB,
    summary="Mark recipe as cooked"
)
async def mark_cooked(
    recipe_id: str,
    rating: int = Query(None, ge=1, le=5),
    notes: str = None,
    user_id: str = Depends(get_current_user_id)
):
    """Mark recipe as cooked with optional rating/notes"""
    client = supabase.service_client
    updates = {
        "status": "cooked",
        "cooked_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    if rating:
        updates["rating"] = rating
    if notes:
        updates["notes"] = notes
    
    result = await client.table("recipes")\
        .update(updates)\
        .eq("id", recipe_id)\
        .eq("user_id", user_id)\
        .execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return result.data[0]


@router.get(
    "/{recipe_id}/steps",
    response_model=List[dict],
    summary="Get recipe steps for swipeable viewer"
)
async def get_recipe_steps(
    recipe_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get ordered steps for the swipeable step-by-step viewer"""
    client = supabase.service_client
    
    # Verify ownership
    recipe = await client.table("recipes")\
        .select("id")\
        .eq("id", recipe_id)\
        .eq("user_id", user_id)\
        .single()\
        .execute()
    
    if not recipe.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    result = await client.table("recipe_steps")\
        .select("*")\
        .eq("recipe_id", recipe_id)\
        .order("step_number")\
        .execute()
    
    return result.data or []


# Background task
async def log_recipe_generation(user_id: str, request: RecipeGenerationRequest, recipe: RecipeGenerationResponse):
    """Log recipe generation for analytics"""
    try:
        client = supabase.service_client
        await client.table("recipe_generation_logs").insert({
            "user_id": user_id,
            "input_ingredients": [i.model_dump() for i in request.ingredients],
            "pantry_staples_used": request.pantry_staples,
            "generated_recipe_id": recipe.id if hasattr(recipe, 'id') else None,
            "model_used": "gpt-4o",
            "generation_time_ms": 0,  # Would be in recipe.generation_metadata
            "taste_filter_passed": True,
            "status": "success"
        }).execute()
    except Exception:
        pass  # Don't fail request if logging fails