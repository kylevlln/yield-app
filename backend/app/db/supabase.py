"""Supabase Client - Direct HTTP API (avoids library version conflicts)"""

from __future__ import annotations
from typing import Optional
import httpx
from app.core.config import settings


class SupabaseClient:
    """Direct REST API client for Supabase"""
    
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
        self._service_client: Optional[httpx.AsyncClient] = None
        self.base_url = settings.SUPABASE_URL.rstrip('/')
        self.anon_key = settings.SUPABASE_ANON_KEY
        self.service_key = settings.SUPABASE_SERVICE_ROLE_KEY
    
    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=f"{self.base_url}/rest/v1",
                headers={
                    "apikey": self.anon_key,
                    "Authorization": f"Bearer {self.anon_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                timeout=30.0
            )
        return self._client
    
    @property
    def service_client(self) -> httpx.AsyncClient:
        if self._service_client is None:
            self._service_client = httpx.AsyncClient(
                base_url=f"{self.base_url}/rest/v1",
                headers={
                    "apikey": self.service_key,
                    "Authorization": f"Bearer {self.service_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                timeout=30.0
            )
        return self._service_client
    
    async def close(self):
        if self._client:
            await self._client.aclose()
        if self._service_client:
            await self._service_client.aclose()
    
    def table(self, name: str) -> "SupabaseTable":
        return SupabaseTable(self.service_client, name)


class SupabaseTable:
    """Table query builder"""
    
    def __init__(self, client: httpx.AsyncClient, name: str):
        self.client = client
        self.name = name
        self._query_params = {}
        self._select_fields = "*"
        self._filters = {}
        self._order = None
        self._limit = None
        self._range = None
        self._method = "GET"
        self._data = None
        self._single = False
    
    def select(self, fields: str = "*"):
        self._select_fields = fields
        return self
    
    def insert(self, data: dict | list):
        self._method = "POST"
        self._data = data
        return self
    
    def update(self, data: dict):
        self._method = "PATCH"
        self._data = data
        return self
    
    def delete(self):
        self._method = "DELETE"
        return self
    
    def eq(self, column: str, value):
        self._filters[column] = f"eq.{value}"
        return self
    
    def neq(self, column: str, value):
        self._filters[column] = f"neq.{value}"
        return self
    
    def gt(self, column: str, value):
        self._filters[column] = f"gt.{value}"
        return self
    
    def gte(self, column: str, value):
        self._filters[column] = f"gte.{value}"
        return self
    
    def lt(self, column: str, value):
        self._filters[column] = f"lt.{value}"
        return self
    
    def lte(self, column: str, value):
        self._filters[column] = f"lte.{value}"
        return self
    
    def like(self, column: str, pattern: str):
        self._filters[column] = f"like.{pattern}"
        return self
    
    def ilike(self, column: str, pattern: str):
        self._filters[column] = f"ilike.{pattern}"
        return self
    
    def in_(self, column: str, values: list):
        self._filters[column] = f"in.({','.join(str(v) for v in values)})"
        return self
    
    def order(self, column: str, desc: bool = False):
        self._order = f"{column}.{'desc' if desc else 'asc'}"
        return self
    
    def limit(self, count: int):
        self._limit = count
        return self
    
    def range(self, start: int, end: int):
        self._range = (start, end)
        return self
    
    def single(self):
        self._single = True
        return self
    
    async def execute(self):
        params = {}
        
        if self._select_fields:
            params["select"] = self._select_fields
        
        params.update(self._filters)
        
        if self._order:
            params["order"] = self._order
        
        if self._limit:
            params["limit"] = str(self._limit)
        
        if self._range:
            params["range"] = f"{self._range[0]},{self._range[1]}"
        
        headers = {}
        if self._single:
            headers["Accept"] = "application/vnd.pgrst.object+json"
        
        if self._method == "GET":
            response = await self.client.get(f"/{self.name}", params=params, headers=headers)
        elif self._method == "POST":
            response = await self.client.post(f"/{self.name}", params=params, json=self._data, headers=headers)
        elif self._method == "PATCH":
            response = await self.client.patch(f"/{self.name}", params=params, json=self._data, headers=headers)
        elif self._method == "DELETE":
            response = await self.client.delete(f"/{self.name}", params=params, headers=headers)
        else:
            raise ValueError(f"Unknown method: {self._method}")
        
        response.raise_for_status()
        data = response.json()
        
        return SupabaseResponse(data, self._single)


class SupabaseResponse:
    def __init__(self, data, single: bool = False):
        self.data = data if not single else [data] if data else []
        self.single = single
    
    @property
    def count(self):
        return len(self.data) if self.data else 0


supabase = SupabaseClient()


class RecipeService:
    """High-level recipe operations using Supabase"""
    
    def __init__(self):
        self.db = supabase
    
    async def get_user_pantry_staples(self, user_id: str) -> list[str]:
        """Get user's 'always on-hand' pantry staples"""
        result = await self.db.table("pantry_staples")\
            .select("name")\
            .eq("user_id", user_id)\
            .eq("is_staple", True)\
            .execute()
        return [row["name"] for row in result.data] if result.data else []
    
    async def save_recipe(self, user_id: str, recipe_data: dict) -> str:
        """Save generated recipe to database"""
        db_data = {
            "user_id": user_id,
            **recipe_data,
            "ingredients": [ing.model_dump() if hasattr(ing, 'model_dump') else ing for ing in recipe_data.get("ingredients", [])],
            "steps": [step.model_dump() if hasattr(step, 'model_dump') else step for step in recipe_data.get("steps", [])],
            "food_safety_banner": recipe_data.get("food_safety", {}).model_dump() if recipe_data.get("food_safety") else None,
            "generation_metadata": recipe_data.get("generation_metadata", {}).model_dump() if recipe_data.get("generation_metadata") else None,
        }
        
        result = await self.db.table("recipes").insert(db_data).execute()
        if result.data:
            return result.data[0]["id"]
        raise Exception("Failed to save recipe")
    
    async def get_recipe(self, recipe_id: str, user_id: str) -> Optional[dict]:
        """Get recipe by ID (must belong to user)"""
        result = await self.db.table("recipes")\
            .select("*")\
            .eq("id", recipe_id)\
            .eq("user_id", user_id)\
            .execute()
        return result.data[0] if result.data else None
    
    async def list_recipes(self, user_id: str, status: str = None, limit: int = 20) -> list[dict]:
        """List user's recipes"""
        query = self.db.table("recipes").select("*").eq("user_id", user_id)
        if status:
            query = query.eq("status", status)
        result = await query.order("created_at", desc=True).limit(limit).execute()
        return result.data or []


recipe_service = RecipeService()