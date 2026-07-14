"""Health Check Endpoint"""

from fastapi import APIRouter, Depends
from app.core.config import get_settings, Settings
from app.db.supabase import supabase
from app.models.recipe import HealthCheck

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthCheck)
async def health_check(settings: Settings = Depends(get_settings)):
    """Health check endpoint for load balancers"""
    services = {}

    # Check Supabase by querying a simple table
    try:
        result = await supabase.table("pantry_staples").select("id").limit(1).execute()
        services["supabase"] = "up"
    except Exception:
        services["supabase"] = "down"

    # Check LLM providers
    if settings.OPENAI_API_KEY:
        services["openai"] = "configured"
    else:
        services["openai"] = "not_configured"

    if settings.ANTHROPIC_API_KEY:
        services["anthropic"] = "configured"
    else:
        services["anthropic"] = "not_configured"

    # Overall status
    if services.get("supabase") == "up":
        status = "healthy"
    else:
        status = "degraded"

    return HealthCheck(
        status=status,
        version=settings.APP_VERSION,
        services=services
    )


@router.get("/ready")
async def readiness_check():
    """Kubernetes readiness probe"""
    return {"status": "ready"}


@router.get("/live")
async def liveness_check():
    """Kubernetes liveness probe"""
    return {"status": "alive"}
