-- ============================================================================
-- YIELD - Supabase PostgreSQL Schema
-- Created by: Spencer Calimlim & Christian Canto
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('user', 'premium', 'admin');
CREATE TYPE ingredient_category AS ENUM (
    'produce', 'meat', 'seafood', 'dairy', 'pantry', 'spices', 'baking', 
    'condiments', 'beverages', 'frozen', 'other'
);
CREATE TYPE measurement_unit AS ENUM (
    'g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'pcs', 'pinch', 'dash', 'clove', 'slice', 'bunch', 'can', 'jar', 'package'
);
CREATE TYPE recipe_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE recipe_meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'drink');
CREATE TYPE dietary_tag AS ENUM (
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 
    'low-carb', 'high-protein', 'low-fat', 'nut-free', 'shellfish-free'
);
CREATE TYPE recipe_status AS ENUM ('draft', 'generated', 'saved', 'cooked', 'archived');
CREATE TYPE protein_type AS ENUM ('chicken', 'beef', 'pork', 'fish', 'shellfish', 'eggs', 'tofu', 'tempeh', 'none');
CREATE TYPE cooking_method AS ENUM ('bake', 'boil', 'fry', 'grill', 'roast', 'steam', 'saute', 'slow-cook', 'pressure-cook', 'raw', 'microwave');
CREATE TYPE taste_filter_severity AS ENUM ('warning', 'error');

-- ============================================================================
-- USERS & AUTHENTICATION (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'en-US',
    units_measurement TEXT DEFAULT 'metric', -- 'metric' | 'imperial'
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================================
-- PANTRY / INGREDIENTS (The "Pantry Memory" Feature)
-- ============================================================================

CREATE TABLE pantry_staples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category ingredient_category NOT NULL DEFAULT 'pantry',
    default_unit measurement_unit DEFAULT 'g',
    default_quantity DECIMAL(10, 2) DEFAULT 0,
    min_threshold DECIMAL(10, 2) DEFAULT 0,
    is_staple BOOLEAN DEFAULT TRUE,
    notes TEXT,
    last_restocked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

ALTER TABLE pantry_staples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own staples" ON pantry_staples
    FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_pantry_staples_updated_at
    BEFORE UPDATE ON pantry_staples
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Current inventory (what user actually has right now)
CREATE TABLE pantry_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    staple_id UUID REFERENCES pantry_staples(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category ingredient_category NOT NULL DEFAULT 'pantry',
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit measurement_unit DEFAULT 'g',
    expires_at TIMESTAMPTZ,
    location TEXT, -- 'fridge', 'freezer', 'pantry', 'counter'
    is_open BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pantry_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own inventory" ON pantry_inventory
    FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_pantry_inventory_updated_at
    BEFORE UPDATE ON pantry_inventory
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================================
-- RECIPES (Generated + Saved)
-- ============================================================================

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status recipe_status DEFAULT 'generated',
    difficulty recipe_difficulty DEFAULT 'medium',
    meal_type recipe_meal_type,
    servings INTEGER DEFAULT 2,
    prep_time_minutes INTEGER DEFAULT 0,
    cook_time_minutes INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0, -- Computed: prep + cook
    protein_type protein_type DEFAULT 'none',
    cooking_methods cooking_method[],
    dietary_tags dietary_tag[],
    cuisine TEXT,
    calories_per_serving INTEGER,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    fiber_g DECIMAL(6,2),
    sugar_g DECIMAL(6,2),
    sodium_mg INTEGER,
    source TEXT DEFAULT 'ai-generated', -- 'ai-generated', 'user-created', 'imported'
    generation_prompt TEXT, -- The prompt used to generate
    generation_model TEXT, -- e.g., 'gpt-4o', 'claude-3-opus'
    taste_filter_passed BOOLEAN DEFAULT TRUE,
    taste_filter_notes TEXT,
    food_safety_banner JSONB, -- Stored food safety banner data
    source_image_url TEXT, -- For vision parsing
    notes TEXT,
    cooked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recipes" ON recipes
    FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger to auto-compute total_time_minutes
CREATE OR REPLACE FUNCTION update_recipe_total_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_time_minutes = COALESCE(NEW.prep_time_minutes, 0) + COALESCE(NEW.cook_time_minutes, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_total_time
    BEFORE INSERT OR UPDATE ON recipes
    FOR EACH ROW EXECUTE PROCEDURE update_recipe_total_time();

-- Recipe Ingredients (structured for substitution feature)
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    unit measurement_unit NOT NULL,
    category ingredient_category DEFAULT 'other',
    is_staple BOOLEAN DEFAULT FALSE, -- From user's pantry staples
    is_optional BOOLEAN DEFAULT FALSE,
    preparation TEXT, -- 'diced', 'minced', 'julienned', etc.
    substitution_group TEXT, -- Group ID for smart substitutions
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recipe ingredients" ON recipe_ingredients
    FOR ALL USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

-- Recipe Steps (for swipeable step-by-step viewer with timers)
CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    timer_enabled BOOLEAN DEFAULT FALSE,
    timer_label TEXT, -- e.g., "Simmer sauce"
    temperature_c DECIMAL(5,1),
    temperature_f DECIMAL(5,1),
    technique TEXT,
    equipment TEXT[],
    tips TEXT[],
    visual_cue TEXT, -- "Sauce should coat the back of a spoon"
    media_url TEXT, -- Image/video URL for this step
    media_type TEXT, -- 'image', 'video', 'gif'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recipe steps" ON recipe_steps
    FOR ALL USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE UNIQUE INDEX unique_recipe_step_number ON recipe_steps(recipe_id, step_number);

-- ============================================================================
-- TASTE FILTER (Hard-coded Safety Layer)
-- ============================================================================

CREATE TABLE taste_filter_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_type TEXT NOT NULL, -- 'forbidden_combo', 'max_ingredient_count', 'forbidden_single'
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    severity taste_filter_severity NOT NULL DEFAULT 'error',
    rule_config JSONB NOT NULL, -- Flexible config per rule type
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-seed taste filter rules
INSERT INTO taste_filter_rules (rule_type, name, description, severity, rule_config) VALUES
('forbidden_combo', 'chocolate_fish', 'Chocolate and fish should not be combined', 'error', '{"ingredients": ["chocolate", "cocoa"], "conflicts_with": ["fish", "salmon", "tuna", "cod", "shellfish"]}'),
('forbidden_combo', 'citrus_milk_boil', 'Citrus juice curdles milk when boiled', 'warning', '{"ingredients": ["lemon juice", "lime juice", "orange juice"], "conflicts_with": ["milk", "cream", "yogurt"], "condition": "heat"}'),
('forbidden_combo', 'pineapple_gelatin', 'Fresh pineapple prevents gelatin from setting', 'error', '{"ingredients": ["fresh pineapple"], "conflicts_with": ["gelatin"]}'),
('forbidden_single', 'inedible_items', 'Non-food items cannot be ingredients', 'error', '{"ingredients": ["bleach", "soap", "detergent", "gasoline", "motor oil", "paint", "glue"]}'),
('max_ingredient_count', 'max_ingredients', 'Recipes with too many ingredients are impractical', 'warning', '{"max_count": 25}');

-- ============================================================================
-- FOOD SAFETY RULES (Mandatory Banners for Protein)
-- ============================================================================

CREATE TABLE food_safety_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protein_type protein_type NOT NULL UNIQUE,
    min_internal_temp_c DECIMAL(4,1) NOT NULL,
    min_internal_temp_f DECIMAL(4,1) NOT NULL,
    rest_time_minutes INTEGER DEFAULT 3,
    danger_zone_min_c DECIMAL(4,1) DEFAULT 4.4,
    danger_zone_max_c DECIMAL(4,1) DEFAULT 60.0,
    danger_zone_min_f DECIMAL(4,1) DEFAULT 40.0,
    danger_zone_max_f DECIMAL(4,1) DEFAULT 140.0,
    max_time_in_danger_zone_minutes INTEGER DEFAULT 120,
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO food_safety_rules (protein_type, min_internal_temp_c, min_internal_temp_f, rest_time_minutes, special_instructions) VALUES
('chicken', 74.0, 165.0, 3, 'Cook until juices run clear. No pink meat visible.'),
('beef', 63.0, 145.0, 3, 'Medium-rare: 57°C/135°F. Ground beef: 71°C/160°F.'),
('pork', 63.0, 145.0, 3, 'Ground pork: 71°C/160°F.'),
('fish', 63.0, 145.0, 0, 'Flesh should be opaque and flake easily.'),
('shellfish', 74.0, 165.0, 0, 'Shells should open during cooking. Discard unopened.'),
('eggs', 71.0, 160.0, 0, 'Yolks and whites should be firm.'),
('tofu', 0.0, 0.0, 0, 'No minimum temperature. Press and cook until golden.'),
('tempeh', 74.0, 165.0, 0, 'Steam 10 minutes before cooking to remove bitterness.'),
('none', 0.0, 0.0, 0, 'No protein-specific temperature requirements.');

-- ============================================================================
-- RECIPE GENERATION LOGS (For debugging & analytics)
-- ============================================================================

CREATE TABLE recipe_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    input_ingredients TEXT[] NOT NULL,
    pantry_staples_used TEXT[],
    system_prompt TEXT NOT NULL,
    user_prompt TEXT NOT NULL,
    model_used TEXT NOT NULL,
    response_raw JSONB,
    response_parsed JSONB,
    taste_filter_passed BOOLEAN,
    taste_filter_violations JSONB,
    generation_time_ms INTEGER,
    token_usage JSONB,
    error_message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed', 'filtered'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipe_generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generation logs" ON recipe_generation_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- SMART SUBSTITUTIONS (Community-driven + AI)
-- ============================================================================

CREATE TABLE ingredient_substitutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_name TEXT NOT NULL,
    substitute_name TEXT NOT NULL,
    ratio TEXT NOT NULL, -- e.g., '1:1', '1 tbsp : 1 tsp', '3 tbsp : 1 tbsp'
    category TEXT, -- 'dairy', 'gluten', 'egg', 'allergen', 'preference'
    notes TEXT,
    works_in TEXT[], -- 'baking', 'cooking', 'raw', 'all'
    confidence_score DECIMAL(3,2) DEFAULT 0.8,
    source TEXT DEFAULT 'community', -- 'community', 'ai', 'expert'
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_substitutions_ingredient ON ingredient_substitutions(ingredient_name);
CREATE INDEX idx_substitutions_category ON ingredient_substitutions(category);

-- User's personal substitution preferences
CREATE TABLE user_substitution_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    preferred_substitute TEXT NOT NULL,
    ratio TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, ingredient_name)
);

ALTER TABLE user_substitution_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own substitution prefs" ON user_substitution_preferences
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get user's pantry staples for prompt injection
CREATE OR REPLACE FUNCTION get_user_pantry_staples(p_user_id UUID)
RETURNS TABLE(name TEXT, category ingredient_category, default_unit measurement_unit, default_quantity DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT ps.name, ps.category, ps.default_unit, ps.default_quantity
    FROM pantry_staples ps
    WHERE ps.user_id = p_user_id AND ps.is_staple = TRUE
    ORDER BY ps.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check taste filter violations
CREATE OR REPLACE FUNCTION check_taste_filter(p_ingredients TEXT[])
RETURNS TABLE(violation_type TEXT, message TEXT, severity taste_filter_severity) AS $$
DECLARE
    rule RECORD;
    ing_lower TEXT;
    conflict_lower TEXT;
    ingredient_list TEXT[];
    conflict_list TEXT[];
BEGIN
    FOR rule IN SELECT * FROM taste_filter_rules WHERE is_active = TRUE LOOP
        IF rule.rule_type = 'forbidden_combo' THEN
            ingredient_list := (rule.rule_config->'ingredients')::TEXT[];
            conflict_list := (rule.rule_config->'conflicts_with')::TEXT[];
            
            FOREACH ing_lower IN ARRAY (SELECT array_agg(lower(i)) FROM unnest(p_ingredients) AS i) LOOP
                FOREACH conflict_lower IN ARRAY conflict_list LOOP
                    IF ing_lower = ANY(SELECT lower(i) FROM unnest(ingredient_list) AS i)
                       AND lower(conflict_lower) = ANY(SELECT lower(i) FROM unnest(p_ingredients) AS i) THEN
                        RETURN QUERY SELECT rule.rule_type, rule.description, rule.severity;
                    END IF;
                END LOOP;
            END LOOP;
        ELSIF rule.rule_type = 'max_ingredient_count' THEN
            IF array_length(p_ingredients, 1) > (rule.rule_config->>'max_count')::INT THEN
                RETURN QUERY SELECT 
                    rule.rule_type,
                    format('Recipe has %s ingredients (max: %s)', array_length(p_ingredients, 1), rule.rule_config->>'max_count'),
                    rule.severity;
            END IF;
        ELSIF rule.rule_type = 'forbidden_single' THEN
            ingredient_list := (rule.rule_config->'ingredients')::TEXT[];
            FOREACH ing_lower IN ARRAY (SELECT array_agg(lower(i)) FROM unnest(p_ingredients) AS i) LOOP
                IF ing_lower = ANY(SELECT lower(i) FROM unnest(ingredient_list) AS i) THEN
                    RETURN QUERY SELECT rule.rule_type, rule.description, rule.severity;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get food safety banner for recipe
CREATE OR REPLACE FUNCTION get_food_safety_banner(p_protein_type protein_type)
RETURNS TABLE(
    protein_type protein_type,
    min_temp_c DECIMAL,
    min_temp_f DECIMAL,
    rest_time_minutes INTEGER,
    instructions TEXT,
    danger_zone_text TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fsr.protein_type,
        fsr.min_internal_temp_c,
        fsr.min_internal_temp_f,
        fsr.rest_time_minutes,
        fsr.special_instructions,
        format('DANGER ZONE: %.1f°C–%.1f°C (%.1f°F–%.1f°F) — Max %s minutes',
            fsr.danger_zone_min_c, fsr.danger_zone_max_c,
            fsr.danger_zone_min_f, fsr.danger_zone_max_f,
            fsr.max_time_in_danger_zone_minutes)
    FROM food_safety_rules fsr
    WHERE fsr.protein_type = p_protein_type AND fsr.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- User's full pantry view
CREATE VIEW user_full_pantry AS
SELECT 
    p.id AS user_id,
    COALESCE(ps.name, pi.name) AS name,
    COALESCE(ps.category, pi.category) AS category,
    COALESCE(ps.default_unit, pi.unit) AS unit,
    COALESCE(pi.quantity, ps.default_quantity, 0) AS quantity,
    ps.is_staple,
    pi.expires_at,
    pi.location,
    CASE 
        WHEN pi.expires_at IS NOT NULL AND pi.expires_at < NOW() + INTERVAL '2 days' THEN 'expiring_soon'
        WHEN pi.expires_at IS NOT NULL AND pi.expires_at < NOW() THEN 'expired'
        WHEN COALESCE(pi.quantity, 0) <= COALESCE(ps.min_threshold, 0) THEN 'low_stock'
        ELSE 'ok'
    END AS status
FROM profiles p
LEFT JOIN pantry_staples ps ON ps.user_id = p.id
LEFT JOIN pantry_inventory pi ON pi.user_id = p.id AND (pi.staple_id = ps.id OR (ps.id IS NULL AND pi.name = ps.name))
WHERE p.id = auth.uid();

-- Recipe viewer data (for swipeable step component)
CREATE VIEW recipe_viewer_data AS
SELECT 
    r.*,
    jsonb_agg(
        jsonb_build_object(
            'step_number', rs.step_number,
            'instruction', rs.instruction,
            'duration_minutes', rs.duration_minutes,
            'duration_seconds', rs.duration_seconds,
            'timer_enabled', rs.timer_enabled,
            'timer_label', rs.timer_label,
            'temperature_c', rs.temperature_c,
            'temperature_f', rs.temperature_f,
            'technique', rs.technique,
            'equipment', rs.equipment,
            'tips', rs.tips,
            'visual_cue', rs.visual_cue,
            'media_url', rs.media_url,
            'media_type', rs.media_type
        ) ORDER BY rs.step_number
    ) AS steps,
    jsonb_agg(
        jsonb_build_object(
            'name', ri.name,
            'quantity', ri.quantity,
            'unit', ri.unit,
            'category', ri.category,
            'is_staple', ri.is_staple,
            'is_optional', ri.is_optional,
            'preparation', ri.preparation,
            'substitution_group', ri.substitution_group
        ) ORDER BY ri.order_index
    ) AS ingredients_detail
FROM recipes r
LEFT JOIN recipe_steps rs ON rs.recipe_id = r.id
LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
GROUP BY r.id;