export const DEMO_RECIPES = [
  {
    title: 'Garlic Butter Shrimp Pasta',
    servings: 2, prep: 5, cook: 12, difficulty: 'easy' as const, protein: 'shrimp',
    equipment: ['large skillet'],
    ingredients: ['shrimp', 'garlic', 'butter', 'lemon', 'pasta'],
    steps: [
      { step_number: 1, instruction: 'Cook pasta in salted boiling water until al dente. Reserve 1 cup pasta water before draining. Meanwhile, pat shrimp dry and season with salt and pepper.', duration_minutes: 8, duration_seconds: 0, timer_enabled: true, timer_label: 'Boil pasta', equipment: ['large pot'], tips: ['Salt the water generously — it should taste like the sea'], technique: 'boiling' },
      { step_number: 2, instruction: 'Melt butter in a large skillet over medium-high heat. Add shrimp in a single layer. Cook 2 minutes per side until pink and curled. Remove to a plate. Add minced garlic to the same pan, cook 30 seconds until fragrant.', duration_minutes: 4, duration_seconds: 0, timer_enabled: true, timer_label: 'Cook shrimp', equipment: ['large skillet'], tips: ['Don\'t overcrowd the shrimp — they need direct heat'], technique: 'sautéing' },
      { step_number: 3, instruction: 'Return shrimp to pan. Add pasta and a splash of pasta water. Toss everything together. Squeeze lemon over top. Season with salt and pepper. Serve immediately.', duration_minutes: 2, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Pasta water helps the sauce cling to the noodles'], technique: 'tossing' },
    ],
  },
  {
    title: 'One-Pan Tomato Basil Pasta',
    servings: 2, prep: 3, cook: 15, difficulty: 'easy' as const, protein: 'none',
    equipment: ['large skillet'],
    ingredients: ['pasta', 'canned tomatoes', 'garlic', 'basil'],
    steps: [
      { step_number: 1, instruction: 'Crush 4 garlic cloves. Drain and roughly chop canned tomatoes. Pick basil leaves from stems.', duration_minutes: 3, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Tear basil instead of cutting — it bruises less'], technique: 'prep' },
      { step_number: 2, instruction: 'Heat olive oil in a large skillet over medium heat. Add garlic, cook 1 minute until golden. Add crushed tomatoes, pinch of sugar, and salt. Simmer 8 minutes, stirring occasionally.', duration_minutes: 10, duration_seconds: 0, timer_enabled: true, timer_label: 'Simmer sauce', equipment: ['large skillet'], tips: ['Sugar cuts the acidity of canned tomatoes'], technique: 'simmering' },
      { step_number: 3, instruction: 'Add dry pasta and 2 cups water directly to the sauce. Stir well. Cook 10-12 minutes, stirring every 2 minutes, until pasta is al dente and sauce is thick. Stir in basil leaves and a drizzle of olive oil.', duration_minutes: 12, duration_seconds: 0, timer_enabled: true, timer_label: 'Cook pasta in sauce', equipment: [], tips: ['Stirring prevents the pasta from sticking together'], technique: 'one-pot cooking' },
    ],
  },
  {
    title: 'Egg Fried Rice',
    servings: 2, prep: 2, cook: 8, difficulty: 'easy' as const, protein: 'eggs',
    equipment: ['wok or large skillet'],
    ingredients: ['leftover rice', 'eggs', 'soy sauce', 'frozen peas', 'garlic'],
    steps: [
      { step_number: 1, instruction: 'Crack 3 eggs into a bowl, beat with a fork and a pinch of salt. Have your cold leftover rice ready — fresh hot rice will turn mushy.', duration_minutes: 2, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Day-old rice is best — it\'s drier and fries better'], technique: 'prep' },
      { step_number: 2, instruction: 'Heat oil in a wok or large skillet over high heat until smoking. Pour in eggs, scramble quickly for 30 seconds until just set. Push to one side. Add frozen peas and minced garlic to the empty side, cook 1 minute.', duration_minutes: 3, duration_seconds: 0, timer_enabled: true, timer_label: 'Cook eggs', equipment: ['wok or large skillet'], tips: ['High heat is essential for good fried rice'], technique: 'stir-frying' },
      { step_number: 3, instruction: 'Add rice to the wok. Break up any clumps with your spatula. Drizzle soy sauce around the edges (not on the rice directly). Toss everything together for 2-3 minutes until rice is hot and slightly crispy.', duration_minutes: 3, duration_seconds: 0, timer_enabled: true, timer_label: 'Fry rice', equipment: [], tips: ['Soy sauce on the hot wok edges caramelizes better'], technique: 'stir-frying' },
    ],
  },
  {
    title: 'Simple Aglio e Olio',
    servings: 2, prep: 2, cook: 10, difficulty: 'easy' as const, protein: 'none',
    equipment: ['large pot', 'large skillet'],
    ingredients: ['pasta', 'garlic', 'olive oil', 'red pepper flakes', 'parsley'],
    steps: [
      { step_number: 1, instruction: 'Cook pasta in well-salted boiling water. Reserve 1 cup pasta water. Meanwhile, thinly slice 6 garlic cloves.', duration_minutes: 9, duration_seconds: 0, timer_enabled: true, timer_label: 'Cook pasta', equipment: ['large pot'], tips: ['Slice garlic thin — thick pieces burn before they\'re golden'], technique: 'boiling' },
      { step_number: 2, instruction: 'Heat 1/3 cup olive oil in a large skillet over medium-low heat. Add garlic and a pinch of red pepper flakes. Cook slowly, stirring often, until garlic is light golden — about 3 minutes. Do not burn.', duration_minutes: 4, duration_seconds: 0, timer_enabled: true, timer_label: 'Toast garlic', equipment: ['large skillet'], tips: ['Low and slow — burnt garlic is bitter and ruins the dish'], technique: 'infusing' },
      { step_number: 3, instruction: 'Add drained pasta directly to the garlic oil. Toss vigorously. Add pasta water a splash at a time until you get a silky sauce that coats each strand. Finish with chopped parsley and a drizzle of fresh olive oil.', duration_minutes: 2, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['The starch in pasta water emulsifies with the oil'], technique: 'tossing' },
    ],
  },
  {
    title: 'Tuna Melt',
    servings: 1, prep: 3, cook: 6, difficulty: 'easy' as const, protein: 'tuna',
    equipment: ['skillet'],
    ingredients: ['canned tuna', 'bread', 'mayo', 'cheese', 'mustard'],
    steps: [
      { step_number: 1, instruction: 'Drain the canned tuna. Mix with mayo, a dab of mustard, salt, pepper, and a squeeze of lemon if you have it. Toast one side of each bread slice in a dry skillet.', duration_minutes: 3, duration_seconds: 0, timer_enabled: true, timer_label: 'Toast bread', equipment: ['skillet'], tips: ['Toast the side that will be inside — it prevents sogginess'], technique: 'toasting' },
      { step_number: 2, instruction: 'Butter the outside of each bread slice. Layer cheese, tuna mix, then more cheese on the toasted side. Close the sandwich. Cook in a skillet over medium heat, pressing gently with a spatula.', duration_minutes: 4, duration_seconds: 0, timer_enabled: true, timer_label: 'Cook melt', equipment: ['skillet'], tips: ['Cheese on both sides of the tuna acts as glue'], technique: 'grilling' },
      { step_number: 3, instruction: 'Cook 2-3 minutes per side until bread is golden brown and cheese is melted. Slice in half. Serve immediately while the cheese is still stretchy.', duration_minutes: 2, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Let it rest 1 minute — the filling will be molten'], technique: 'finishing' },
    ],
  },
  {
    title: 'Vegetable Stir Fry',
    servings: 2, prep: 5, cook: 8, difficulty: 'easy' as const, protein: 'none',
    equipment: ['wok or large skillet'],
    ingredients: ['frozen mixed veggies', 'soy sauce', 'rice', 'garlic', 'ginger'],
    steps: [
      { step_number: 1, instruction: 'Cook rice according to package. Mince garlic and grate fresh ginger (or use ginger powder). Mix 3 tbsp soy sauce with 1 tsp sugar and 1 tbsp water for the sauce.', duration_minutes: 2, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Prep everything first — stir frying goes fast'], technique: 'prep' },
      { step_number: 2, instruction: 'Heat oil in a wok over high heat until smoking. Add frozen vegetables — they\'ll sizzle and steam. Stir-fry 3-4 minutes until crisp-tender and any water has evaporated.', duration_minutes: 4, duration_seconds: 0, timer_enabled: true, timer_label: 'Cook veggies', equipment: ['wok or large skillet'], tips: ['Let the water evaporate before adding sauce — otherwise it\'s steamed, not fried'], technique: 'stir-frying' },
      { step_number: 3, instruction: 'Push veggies to the side. Add garlic and ginger to the empty spot, cook 30 seconds until fragrant. Pour sauce over everything, toss to coat. Serve over rice.', duration_minutes: 1, duration_seconds: 30, timer_enabled: false, timer_label: '', equipment: [], tips: ['Add garlic last — it burns fast at high heat'], technique: 'stir-frying' },
    ],
  },
  {
    title: 'Grilled Cheese & Tomato Soup',
    servings: 1, prep: 2, cook: 10, difficulty: 'easy' as const, protein: 'none',
    equipment: ['small pot', 'skillet'],
    ingredients: ['bread', 'cheese', 'canned tomato soup', 'butter', 'milk'],
    steps: [
      { step_number: 1, instruction: 'Pour canned tomato soup into a small pot. Add half a can of milk (or water). Stir well. Heat over medium-low, stirring occasionally. Do not boil.', duration_minutes: 8, duration_seconds: 0, timer_enabled: true, timer_label: 'Heat soup', equipment: ['small pot'], tips: ['Milk makes the soup creamier than water'], technique: 'heating' },
      { step_number: 2, instruction: 'Butter one side of each bread slice. Place one slice butter-down in a cold skillet. Layer cheese slices on top. Top with second bread slice, butter-side up. Turn heat to medium.', duration_minutes: 1, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: ['skillet'], tips: ['Starting in a cold pan melts the cheese before the bread burns'], technique: 'assembly' },
      { step_number: 3, instruction: 'Cook 3-4 minutes per side, pressing gently with a spatula, until golden brown and cheese is melted. Slice diagonally. Serve with hot soup.', duration_minutes: 6, duration_seconds: 0, timer_enabled: true, timer_label: 'Grill sandwich', equipment: [], tips: ['The diagonal cut is scientifically proven to taste better'], technique: 'grilling' },
    ],
  },
  {
    title: 'Bean & Cheese Burrito',
    servings: 1, prep: 2, cook: 6, difficulty: 'easy' as const, protein: 'beans',
    equipment: ['small pot', 'skillet'],
    ingredients: ['tortilla', 'canned beans', 'cheese', 'salsa', 'rice'],
    steps: [
      { step_number: 1, instruction: 'Drain and rinse canned beans. Heat in a small pot with a pinch of cumin and salt, mashing slightly with a fork. Cook rice if you have it.', duration_minutes: 5, duration_seconds: 0, timer_enabled: true, timer_label: 'Heat beans', equipment: ['small pot'], tips: ['Mashing some beans makes the filling creamy while keeping some whole'], technique: 'heating' },
      { step_number: 2, instruction: 'Warm the tortilla in a dry skillet for 30 seconds per side. Spread mashed beans down the center. Top with rice, cheese, and salsa.', duration_minutes: 2, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: ['skillet'], tips: ['A warm tortilla folds without cracking'], technique: 'warming' },
      { step_number: 3, instruction: 'Fold the bottom of the tortilla up over the filling. Fold in the sides. Roll tightly. Place seam-side down in the skillet and cook 1 minute to seal. Serve with extra salsa.', duration_minutes: 1, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Seam-side down first — it seals the burrito shut'], technique: 'rolling' },
    ],
  },
  {
    title: 'Anchovy Garlic Pasta',
    servings: 2, prep: 2, cook: 10, difficulty: 'easy' as const, protein: 'none',
    equipment: ['large pot', 'large skillet'],
    ingredients: ['pasta', 'anchovies', 'garlic', 'olive oil', 'breadcrumbs'],
    steps: [
      { step_number: 1, instruction: 'Cook pasta in salted boiling water until al dente. Reserve 1 cup pasta water. Meanwhile, finely chop 4 garlic cloves and mash 4 anchovy fillets into a paste.', duration_minutes: 9, duration_seconds: 0, timer_enabled: true, timer_label: 'Cook pasta', equipment: ['large pot'], tips: ['Anchovies melt into the sauce — you won\'t taste fish'], technique: 'boiling' },
      { step_number: 2, instruction: 'Toast breadcrumbs in a dry skillet over medium heat, stirring often, until golden — about 3 minutes. Set aside. In the same skillet, heat olive oil over medium-low. Add garlic and anchovy paste, cook 2 minutes until anchovies dissolve.', duration_minutes: 5, duration_seconds: 0, timer_enabled: true, timer_label: 'Toast crumbs', equipment: ['large skillet'], tips: ['Toasted breadcrumbs add crunch to an otherwise silky dish'], technique: 'toasting' },
      { step_number: 3, instruction: 'Add drained pasta to the garlic-anchovy oil. Toss well. Add pasta water as needed to loosen. Serve topped with toasted breadcrumbs and a drizzle of good olive oil.', duration_minutes: 1, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['This dish is all about the quality of your olive oil'], technique: 'tossing' },
    ],
  },
  {
    title: 'Egg Drop Soup',
    servings: 1, prep: 2, cook: 6, difficulty: 'easy' as const, protein: 'eggs',
    equipment: ['small pot'],
    ingredients: ['eggs', 'chicken broth', 'soy sauce', 'sesame oil', 'green onion'],
    steps: [
      { step_number: 1, instruction: 'Beat 2 eggs in a small bowl with a pinch of salt. Thinly slice green onions. Mix 1 tsp soy sauce with a few drops of sesame oil in a small dish.', duration_minutes: 2, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Room temp eggs make better ribbons than cold ones'], technique: 'prep' },
      { step_number: 2, instruction: 'Bring chicken broth to a boil in a small pot. Season with soy sauce. Once boiling, reduce to a gentle simmer. Slowly drizzle in the beaten eggs while stirring the soup in one direction — this creates ribbons.', duration_minutes: 3, duration_seconds: 0, timer_enabled: true, timer_label: 'Cook soup', equipment: ['small pot'], tips: ['Stir in one direction for long, elegant ribbons'], technique: 'simmering' },
      { step_number: 3, instruction: 'Turn off the heat. The eggs will finish cooking from residual heat. Drizzle sesame oil over top. Garnish with sliced green onions. Serve immediately.', duration_minutes: 1, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['This soup is done in under 5 minutes — perfect for sick days'], technique: 'finishing' },
    ],
  },
  {
    title: 'Sausage & Pepper Pasta',
    servings: 2, prep: 3, cook: 14, difficulty: 'easy' as const, protein: 'sausage',
    equipment: ['large skillet', 'large pot'],
    ingredients: ['sausage', 'bell pepper', 'onion', 'pasta', 'marinara sauce'],
    steps: [
      { step_number: 1, instruction: 'Cook pasta in salted boiling water. Meanwhile, slice sausage into coins, dice bell pepper and onion.', duration_minutes: 3, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Slice sausage on a slight angle for more surface area'], technique: 'prep' },
      { step_number: 2, instruction: 'Heat oil in a large skillet over medium-high heat. Add sausage coins, cook 4 minutes until browned on both sides. Remove. Add pepper and onion, cook 4 minutes until softened and charred at edges.', duration_minutes: 8, duration_seconds: 0, timer_enabled: true, timer_label: 'Brown sausage', equipment: ['large skillet'], tips: ['Don\'t move the sausage — let it develop a crust'], technique: 'sautéing' },
      { step_number: 3, instruction: 'Return sausage to the pan. Add marinara sauce. Simmer 3 minutes. Toss with drained pasta. Top with parmesan if you have it.', duration_minutes: 3, duration_seconds: 0, timer_enabled: true, timer_label: 'Simmer sauce', equipment: [], tips: ['Let the flavors meld — don\'t rush the simmer'], technique: 'simmering' },
    ],
  },
  {
    title: 'Quesadilla with What You Have',
    servings: 1, prep: 3, cook: 6, difficulty: 'easy' as const, protein: 'none',
    equipment: ['skillet'],
    ingredients: ['tortilla', 'cheese', 'leftover chicken', 'salsa', 'sour cream'],
    steps: [
      { step_number: 1, instruction: 'Shred leftover chicken. Grate cheese. Slice any veggies you have — peppers, onions, whatever.', duration_minutes: 2, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Grate your own cheese — pre-shredded has anti-caking agents'], technique: 'prep' },
      { step_number: 2, instruction: 'Place tortilla in a dry skillet over medium heat. Layer cheese on one half, add chicken and any toppings, fold in half. Cook 3 minutes per side until golden and cheese is melted.', duration_minutes: 6, duration_seconds: 0, timer_enabled: true, timer_label: 'Cook quesadilla', equipment: ['skillet'], tips: ['Press down with a spatula — it helps the layers stick together'], technique: 'grilling' },
      { step_number: 3, instruction: 'Slide onto a cutting board. Cut into wedges. Serve with salsa and sour cream on the side.', duration_minutes: 1, duration_seconds: 0, timer_enabled: false, timer_label: '', equipment: [], tips: ['Let it rest 1 minute so the cheese doesn\'t ooze out'], technique: 'finishing' },
    ],
  },
]
