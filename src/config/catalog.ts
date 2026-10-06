export type Matcher = string | RegExp;

export type MatchScope = "taxonomy" | "category" | "name" | "description" | "brand";

export interface StorefrontSubcategory {
  slug: string;
  name: string;
  description?: string;
  keywords: Matcher[];
  categoryArt?: string | null;
}

export interface StorefrontCategory {
  slug: string;
  name: string;
  description?: string;
  keywords: Matcher[];
  subs: StorefrontSubcategory[];
  categoryArt?: string | null;
}

export interface TaxonomyMapping {
  match: string | number;
  to: string;
}

export interface ExcludeRule {
  id: string;
  label: string;
  scopes: MatchScope[];
  keywords: Matcher[];
  skipRootLevel?: boolean;
}

export interface CatalogConfig {
  source: {
    isoCode: string;
    rootCategoryIds: number[];
    rootTaxonomyIds: number[];
    cacheTtlHours: number;
  };
  storefront: StorefrontCategory[];
  taxonomyMap: TaxonomyMapping[];
  include: {
    nameFallback: boolean;
    scopeKeywords: Matcher[];
  };
  exclude: {
    allowKitchenScissors: boolean;
    ignorePhrases: Matcher[];
    rules: ExcludeRule[];
  };
  price: {
    source: "retailPrice" | "inShopsPrice";
    multiplier: number;
    roundToNinetyNine: boolean;
    minRetail: number;
    maxRetail: number;
    minMarginOverWholesale: number;
    anomalyFactor: number;
    anomalyMinSample: number;
    anomalyBasis: "primary" | "subcategory";
  };
  quality: {
    minImages: number;
    maxImagesPerProduct: number;
    skipLogoImages: boolean;
    minNameLength: number;
    maxNameLength: number;
    minDescriptionChars: number;
    maxVariantsPerName: number;
    requireInStock: boolean;
  };
  limits: {
    maxProducts: number;
    maxPerPrimary: number;
    maxPerSub: number;
    minPerPrimary: number;
    minPerSub: number;
    maxTopLevel: number;
  };
  images: {
    keyPrefix: string;
    concurrency: number;
    timeoutMs: number;
    maxBytes: number;
  };
  brands: {
    showcaseLimit: number;
    minProducts: number;
  };
}

const ALLOW_KITCHEN_SCISSORS = false;

const storefront: StorefrontCategory[] = [
  {
    slug: "cookware",
    name: "Cookware",
    description: "Frying pans, saucepans, casseroles and woks for every hob.",
    keywords: ["cookware", "pots and pans", "pans and pots", "cooking pots", "pan sets", "cookware sets"],
    categoryArt: null,
    subs: [
      {
        slug: "frying-pans",
        name: "Frying pans & skillets",
        keywords: ["frying pan", "fry pan", "frypan", "skillet", "crepe pan", "pancake pan", "saute pan", "sauté pan", "omelette pan", "paella pan", "paellera", "tortilla pan", "pans"],
        categoryArt: null,
      },
      {
        slug: "saucepans-stockpots",
        name: "Saucepans & stockpots",
        keywords: ["saucepan", "sauce pan", "stockpot", "stock pot", "cooking pot", "pot", "milk pan", "pasta pot", "steamer pot", "steamer", "pots"],
        categoryArt: null,
      },
      {
        slug: "casseroles",
        name: "Casseroles & Dutch ovens",
        keywords: ["casserole", "dutch oven", "cocotte", "braiser", "stewpot", "stew pot", "tagine", "roaster"],
        categoryArt: null,
      },
      {
        slug: "woks",
        name: "Woks",
        keywords: ["wok"],
        categoryArt: null,
      },
      {
        slug: "griddles-grill-pans",
        name: "Griddles & grill pans",
        keywords: ["grill pan", "griddle", "plancha", "grill plate", "grilling pan"],
        categoryArt: null,
      },
      {
        slug: "pressure-cookers",
        name: "Pressure cookers",
        keywords: ["pressure cooker", "pressure pot", "pressure cookers"],
        categoryArt: null,
      },
      {
        slug: "lids-pan-accessories",
        name: "Lids & pan accessories",
        keywords: ["lid", "lids", "pan lid", "splatter guard", "splatter screen", "pan protector", "pan handle"],
        categoryArt: null,
      },
    ],
  },
  {
    slug: "bakeware",
    name: "Bakeware",
    description: "Tins, trays, oven dishes and pastry tools.",
    keywords: ["bakeware", "baking", "pastry", "bakery", "confectionery moulds"],
    categoryArt: null,
    subs: [
      {
        slug: "cake-tins-moulds",
        name: "Cake tins & moulds",
        keywords: ["cake tin", "cake pan", "cake mould", "cake mold", "springform", "bundt", "loaf tin", "loaf pan", "muffin tray", "muffin tin", "cupcake", "tart tin", "flan tin", "silicone mould", "silicone mold", "baking mould", "baking mold", "mould", "mold", "moulds", "molds"],
        categoryArt: null,
      },
      {
        slug: "baking-trays",
        name: "Baking trays & sheets",
        keywords: ["baking tray", "baking sheet", "oven tray", "baking mat", "pizza tray", "pizza stone", "pizza pan", "cooling rack", "baking paper", "swiss roll tin"],
        categoryArt: null,
      },
      {
        slug: "oven-dishes",
        name: "Oven dishes & roasters",
        keywords: ["oven dish", "baking dish", "roasting dish", "roasting tin", "roasting pan", "gratin dish", "lasagne dish", "lasagna dish", "ovenproof dish", "pie dish", "ramekin", "souffle dish", "soufflé dish"],
        categoryArt: null,
      },
      {
        slug: "pastry-tools",
        name: "Pastry & decorating tools",
        keywords: ["rolling pin", "pastry brush", "piping bag", "piping nozzle", "icing", "cookie cutter", "biscuit cutter", "pastry cutter", "dough scraper", "cake stand", "cake decorating", "fondant", "sifter", "flour sifter", "pastry mat"],
        categoryArt: null,
      },
    ],
  },
  {
    slug: "utensils-gadgets",
    name: "Utensils & gadgets",
    description: "Spatulas, ladles, graters, boards and everyday prep tools.",
    keywords: ["kitchen utensils", "utensils", "kitchen gadgets", "kitchen tools", "kitchen accessories", "cooking utensils"],
    categoryArt: null,
    subs: [
      {
        slug: "cooking-utensils",
        name: "Cooking utensils",
        keywords: ["spatula", "turner", "ladle", "tongs", "whisk", "skimmer", "slotted spoon", "wooden spoon", "cooking spoon", "spoon rest", "utensil set", "kitchen utensil set", "potato masher", "masher", "basting brush", "spaghetti server", "pasta server"],
        categoryArt: null,
      },
      {
        slug: "prep-tools",
        name: "Prep tools & gadgets",
        keywords: ["peeler", "grater", "zester", "garlic press", "citrus press", "lemon squeezer", "citrus squeezer", "can opener", "tin opener", "jar opener", "nutcracker", "egg separator", "salad spinner", "herb stripper", "pitter", "funnel", "mortar", "pestle", "kitchen gadget", "gadget", "garlic crusher", "egg cutter", ...(ALLOW_KITCHEN_SCISSORS ? ["kitchen scissors"] : [])],
        categoryArt: null,
      },
      {
        slug: "chopping-boards",
        name: "Chopping boards",
        keywords: ["chopping board", "cutting board", "carving board", "bread board", "serving board"],
        categoryArt: null,
      },
      {
        slug: "colanders-sieves",
        name: "Colanders & sieves",
        keywords: ["colander", "sieve", "strainer", "drainer", "mesh strainer"],
        categoryArt: null,
      },
      {
        slug: "measuring-tools",
        name: "Measuring jugs, spoons & timers",
        keywords: ["measuring jug", "measuring cup", "measuring spoon", "measuring", "kitchen timer", "egg timer", "meat thermometer", "cooking thermometer", "kitchen scale manual", "mechanical scale"],
        categoryArt: null,
      },
      {
        slug: "salt-pepper-mills",
        name: "Salt & pepper mills",
        keywords: ["salt mill", "pepper mill", "salt and pepper", "salt shaker", "pepper shaker", "spice mill", "salt cellar", "manual grinder"],
        categoryArt: null,
      },
    ],
  },
  {
    slug: "tableware",
    name: "Tableware",
    description: "Plates, bowls, dinner sets and serveware.",
    keywords: ["tableware", "dinnerware", "crockery", "table setting", "dinner service"],
    categoryArt: null,
    subs: [
      {
        slug: "plates",
        name: "Plates",
        keywords: ["plate", "dinner plate", "side plate", "dessert plate", "soup plate", "flat plate", "deep plate", "charger plate"],
        categoryArt: null,
      },
      {
        slug: "bowls",
        name: "Bowls",
        keywords: ["bowl", "salad bowl", "cereal bowl", "soup bowl", "poke bowl", "rice bowl", "dessert bowl", "mixing bowl"],
        categoryArt: null,
      },
      {
        slug: "dinner-sets",
        name: "Dinner sets",
        keywords: ["dinner set", "dinnerware set", "dinner service", "tableware set", "crockery set", "plate set"],
        categoryArt: null,
      },
      {
        slug: "serveware",
        name: "Serveware & platters",
        keywords: ["serveware", "platter", "serving dish", "serving tray", "serving plate", "tray", "tureen", "gravy boat", "sauce boat", "butter dish", "cake plate", "tapas", "appetiser", "appetizer", "snack bowl", "cheese board", "fruit bowl", "bread basket", "trivet", "egg cup"],
        categoryArt: null,
      },
    ],
  },
  {
    slug: "cutlery",
    name: "Cutlery",
    description: "Cutlery sets, forks, spoons and serving pieces.",
    keywords: ["cutlery", "flatware", "silverware"],
    categoryArt: null,
    subs: [
      {
        slug: "cutlery-sets",
        name: "Cutlery sets",
        keywords: ["cutlery set", "flatware set", "cutlery service", "canteen of cutlery"],
        categoryArt: null,
      },
      {
        slug: "forks-spoons",
        name: "Forks & spoons",
        keywords: ["fork", "spoon", "teaspoon", "tablespoon", "dessert spoon", "coffee spoon", "soup spoon", "cake fork"],
        categoryArt: null,
      },
      {
        slug: "serving-cutlery",
        name: "Serving cutlery",
        keywords: ["serving spoon", "serving fork", "salad servers", "salad server", "cake server", "pie server", "serving set", "chopsticks"],
        categoryArt: null,
      },
    ],
  },
  {
    slug: "glassware-drinkware",
    name: "Glassware & drinkware",
    description: "Tumblers, wine glasses, carafes and bottles.",
    keywords: ["glassware", "drinkware", "drinking glasses", "glasses and cups"],
    categoryArt: null,
    subs: [
      {
        slug: "drinking-glasses",
        name: "Tumblers & everyday glasses",
        keywords: ["glasses", "tumbler", "highball", "water glass", "drinking glass", "juice glass", "shot glass", "glass set", "set of glasses", "beer glass", "gin tonic glass", "whisky glass", "whiskey glass", "glass tumbler"],
        categoryArt: null,
      },
      {
        slug: "wine-champagne-glasses",
        name: "Wine & champagne glasses",
        keywords: ["wine glass", "champagne glass", "champagne flute", "flute", "goblet", "stemware", "cocktail glass", "martini glass", "coupe"],
        categoryArt: null,
      },
      {
        slug: "jugs-carafes",
        name: "Jugs & carafes",
        keywords: ["jug", "carafe", "pitcher", "decanter", "water jug", "lemonade dispenser", "drinks dispenser", "beverage dispenser"],
        categoryArt: null,
      },
      {
        slug: "bottles-tumblers",
        name: "Bottles & travel cups",
        keywords: ["water bottle", "bottle", "thermos", "flask", "vacuum flask", "travel mug", "travel cup", "insulated tumbler", "reusable cup"],
        categoryArt: null,
      },
    ],
  },
  {
    slug: "coffee-tea",
    name: "Coffee & tea",
    description: "Cafetières, moka pots, teapots and mugs. No machines, no plugs.",
    keywords: ["coffee and tea", "tea and coffee", "coffee accessories", "tea accessories", "coffee makers", "tea time"],
    categoryArt: null,
    subs: [
      {
        slug: "cafetieres-pour-over",
        name: "Cafetières & pour-over",
        keywords: ["cafetiere", "cafetière", "french press", "coffee press", "plunger coffee", "pour over", "pour-over", "coffee dripper", "drip cone", "cold brew", "coffee filter holder"],
        categoryArt: null,
      },
      {
        slug: "moka-pots",
        name: "Moka pots",
        keywords: ["moka pot", "moka", "stovetop espresso", "stove top espresso", "espresso maker stovetop", "italian coffee maker", "coffee maker"],
        categoryArt: null,
      },
      {
        slug: "teapots-infusers",
        name: "Teapots & infusers",
        keywords: ["teapot", "tea pot", "tea infuser", "infuser", "tea strainer", "tea set", "tea service", "tea ball", "tea caddy", "tea canister"],
        categoryArt: null,
      },
      {
        slug: "mugs-cups",
        name: "Mugs, cups & saucers",
        keywords: ["mug", "cup", "cup and saucer", "saucer", "espresso cup", "cappuccino cup", "coffee cup", "tea cup", "teacup", "latte glass"],
        categoryArt: null,
      },
      {
        slug: "coffee-accessories",
        name: "Coffee accessories",
        keywords: ["milk jug", "milk frothing jug", "coffee grinder manual", "manual coffee grinder", "tamper", "coffee scoop", "coffee canister", "sugar bowl", "creamer", "coffee station"],
        categoryArt: null,
      },
    ],
  },
  {
    slug: "storage-organisation",
    name: "Storage & organisation",
    description: "Containers, lunch boxes, jars and the racks that keep a kitchen in order.",
    keywords: ["food storage", "kitchen storage", "kitchen organisation", "kitchen organization", "storage and organisation", "storage and organization"],
    categoryArt: null,
    subs: [
      {
        slug: "food-containers",
        name: "Food containers",
        keywords: ["food container", "storage container", "airtight container", "tupperware", "food storage box", "container set", "meal prep container", "container", "containers"],
        categoryArt: null,
      },
      {
        slug: "lunch-boxes",
        name: "Lunch boxes",
        keywords: ["lunch box", "lunchbox", "bento", "lunch bag", "food flask", "snack box", "sandwich box"],
        categoryArt: null,
      },
      {
        slug: "jars-canisters",
        name: "Jars & canisters",
        keywords: ["jar", "canister", "kilner", "mason jar", "storage jar", "spice jar", "pasta jar", "biscuit jar", "cookie jar", "bread bin", "bread box", "oil dispenser", "oil bottle", "oil cruet", "vinegar cruet"],
        categoryArt: null,
      },
      {
        slug: "kitchen-organisers",
        name: "Racks & organisers",
        keywords: ["organiser", "organizer", "dish rack", "dish drainer", "drying rack", "spice rack", "utensil holder", "kitchen roll holder", "paper towel holder", "cutlery tray", "drawer organiser", "drawer organizer", "shelf", "rack", "hook", "rail", "caddy", "sink caddy", "pot rack", "lid organiser", "lid organizer"],
        categoryArt: null,
      },
    ],
  },
  {
    slug: "kitchen-table-linen",
    name: "Kitchen & table linen",
    description: "Tea towels, aprons, tablecloths and napkins.",
    keywords: ["kitchen textiles", "table linen", "kitchen linen", "table textiles"],
    categoryArt: null,
    subs: [
      {
        slug: "tea-towels",
        name: "Tea towels",
        keywords: ["tea towel", "kitchen towel", "dish towel", "dish cloth", "dishcloth", "kitchen cloth"],
        categoryArt: null,
      },
      {
        slug: "aprons-oven-gloves",
        name: "Aprons & oven gloves",
        keywords: ["apron", "oven glove", "oven mitt", "pot holder", "potholder", "oven gloves", "chef hat", "kitchen glove"],
        categoryArt: null,
      },
      {
        slug: "tablecloths-runners",
        name: "Tablecloths & runners",
        keywords: ["tablecloth", "table cloth", "table runner", "table cover", "oilcloth"],
        categoryArt: null,
      },
      {
        slug: "placemats-napkins",
        name: "Placemats & napkins",
        keywords: ["placemat", "place mat", "table mat", "napkin", "serviette", "napkin ring", "coaster"],
        categoryArt: null,
      },
    ],
  },
  {
    slug: "bar-wine",
    name: "Bar & wine",
    description: "Corkscrews, cocktail tools, ice buckets and wine accessories.",
    keywords: ["bar accessories", "wine accessories", "bar and wine", "barware", "cocktail accessories", "home bar"],
    categoryArt: null,
    subs: [
      {
        slug: "wine-accessories",
        name: "Wine accessories",
        keywords: ["corkscrew", "wine opener", "bottle opener", "waiter's friend", "wine stopper", "bottle stopper", "wine pourer", "wine aerator", "aerator", "foil cutter", "wine rack", "wine holder", "wine cooler", "wine set"],
        categoryArt: null,
      },
      {
        slug: "cocktail-tools",
        name: "Cocktail tools",
        keywords: ["cocktail shaker", "shaker", "jigger", "muddler", "bar spoon", "cocktail strainer", "cocktail set", "bar set", "cocktail kit"],
        categoryArt: null,
      },
      {
        slug: "ice-serving",
        name: "Ice buckets & serving",
        keywords: ["ice bucket", "ice cube tray", "ice tray", "ice mould", "ice mold", "ice tongs", "champagne bucket", "cooler bucket", "ice scoop", "whisky stones"],
        categoryArt: null,
      },
    ],
  },
];

const taxonomyMap: TaxonomyMapping[] = [
  { match: "Pans", to: "cookware/frying-pans" },
  { match: "Frying Pans", to: "cookware/frying-pans" },
  { match: "Saucepans", to: "cookware/saucepans-stockpots" },
  { match: "Pots", to: "cookware/saucepans-stockpots" },
  { match: "Casserole Dishes", to: "cookware/casseroles" },
  { match: "Woks", to: "cookware/woks" },
  { match: "Pressure Cookers", to: "cookware/pressure-cookers" },
  { match: "Grills & Griddles", to: "cookware/griddles-grill-pans" },
  { match: "Baking Moulds", to: "bakeware/cake-tins-moulds" },
  { match: "Baking Trays", to: "bakeware/baking-trays" },
  { match: "Oven Dishes", to: "bakeware/oven-dishes" },
  { match: "Pastry Utensils", to: "bakeware/pastry-tools" },
  { match: "Chopping Boards", to: "utensils-gadgets/chopping-boards" },
  { match: "Colanders", to: "utensils-gadgets/colanders-sieves" },
  { match: "Kitchen Utensils", to: "utensils-gadgets/cooking-utensils" },
  { match: "Plates", to: "tableware/plates" },
  { match: "Bowls", to: "tableware/bowls" },
  { match: "Dinnerware Sets", to: "tableware/dinner-sets" },
  { match: "Serving Trays", to: "tableware/serveware" },
  { match: "Cutlery", to: "cutlery" },
  { match: "Cutlery Sets", to: "cutlery/cutlery-sets" },
  { match: "Glasses", to: "glassware-drinkware/drinking-glasses" },
  { match: "Wine Glasses", to: "glassware-drinkware/wine-champagne-glasses" },
  { match: "Jugs", to: "glassware-drinkware/jugs-carafes" },
  { match: "Bottles", to: "glassware-drinkware/bottles-tumblers" },
  { match: "Coffee Makers", to: "coffee-tea" },
  { match: "Teapots", to: "coffee-tea/teapots-infusers" },
  { match: "Mugs", to: "coffee-tea/mugs-cups" },
  { match: "Cups", to: "coffee-tea/mugs-cups" },
  { match: "Lunch Boxes", to: "storage-organisation/lunch-boxes" },
  { match: "Food Storage Containers", to: "storage-organisation/food-containers" },
  { match: "Jars", to: "storage-organisation/jars-canisters" },
  { match: "Kitchen Organisation", to: "storage-organisation/kitchen-organisers" },
  { match: "Dish Racks", to: "storage-organisation/kitchen-organisers" },
  { match: "Kitchen Linen", to: "kitchen-table-linen" },
  { match: "Aprons", to: "kitchen-table-linen/aprons-oven-gloves" },
  { match: "Tablecloths", to: "kitchen-table-linen/tablecloths-runners" },
  { match: "Bar Accessories", to: "bar-wine" },
  { match: "Wine Accessories", to: "bar-wine/wine-accessories" },
];

const electricKeywords: Matcher[] = [
  "electric", "electrical", "electronic", "appliance", "appliances", "small appliances", "household appliances",
  "kettle", "toaster", "blender", "mixer", "hand mixer", "stand mixer", "fryer", "air fryer", "deep fryer",
  "coffee machine", "espresso machine", "coffee maker electric", "electric coffee maker", "capsule machine",
  "grinder electric", "electric grinder", "induction hob", "hob", "hotplate", "hot plate", "cooktop",
  "microwave", "oven", "mini oven", "toaster oven", "steam oven", "robot", "food processor", "kitchen robot",
  "multicooker", "multi cooker", "slow cooker", "rice cooker", "bread maker", "breadmaker", "yogurt maker",
  "waffle maker", "sandwich maker", "sandwich toaster", "crepe maker", "popcorn maker", "ice cream maker",
  "juicer", "citrus juicer electric", "milk frother", "frother", "food dehydrator", "vacuum sealer",
  "machine", "battery", "batteries", "rechargeable", "cordless", "usb", "plug", "volt", "volts", "watt", "watts",
  "led", "lcd", "digital", "wireless", "bluetooth", "smart", "motor", "heating element", "heating plate", "self heating", "heated", "thermostat",
  "power supply", "adapter", "charger", "cable", "mains",
  /\b\d+(?:[.,]\d+)?\s?w\b/i,
  /\b\d+(?:[.,]\d+)?\s?v\b/i,
  /\b\d+(?:[.,]\d+)?\s?kw\b/i,
  /\b\d+\s?mah\b/i,
];

const knifeKeywords: Matcher[] = [
  "knife", "knives", "cleaver", "blade", "blades", "machete", "sharpener", "knife sharpener", "knife block",
  "whetstone", "sharpening stone", "honing steel", "dagger", "razor", "mandoline", "mandolin", "slicer",
  "axe", "hatchet", "box cutter", "cutter blade",
  ...(ALLOW_KITCHEN_SCISSORS ? [] : ["scissors", "shears", "kitchen scissors"]),
];

const licensedKeywords: Matcher[] = [
  "disney", "pixar", "marvel", "avengers", "spider man", "spiderman", "spider-man", "iron man", "captain america",
  "dc comics", "batman", "superman", "wonder woman", "justice league", "harry potter", "hogwarts", "fantastic beasts",
  "star wars", "mandalorian", "baby yoda", "grogu", "pokemon", "pokémon", "pikachu", "mickey", "minnie",
  "mickey mouse", "minnie mouse", "winnie the pooh", "toy story", "lilo and stitch", "the lion king",
  "disney princess", "disney frozen", "frozen ii", "elsa and anna", "anna and elsa", "hello kitty", "sanrio", "peppa pig", "paw patrol", "bluey", "barbie", "lego", "minecraft",
  "fortnite", "sonic the hedgehog", "super mario", "nintendo", "playstation", "xbox", "looney tunes", "bugs bunny", "snoopy",
  "peanuts", "smurfs", "simpsons", "the simpsons", "garfield", "sesame street", "minions", "despicable me",
  "shrek", "dragon ball", "naruto", "my little pony", "transformers", "hot wheels", "jurassic",
  "game of thrones", "lord of the rings", "stranger things", "squid game", "coca cola", "coca-cola",
  "pepsi", "nutella", "ferrari", "porsche", "lamborghini", "mercedes", "bmw", "real madrid", "fc barcelona",
  "barça", "barca", "atletico de madrid", "atlético de madrid", "juventus", "manchester united", "manchester city",
  "liverpool fc", "chelsea fc", "arsenal", "paris saint germain", "psg", "bayern", "ac milan", "inter milan",
  "nba", "nfl", "uefa", "fifa", "licensed product", "official licence", "official license", "officially licensed",
];

const licensedDescriptionKeywords: Matcher[] = [
  "disney", "pixar", "marvel", "harry potter", "hogwarts", "star wars", "pokemon", "pikachu", "hello kitty",
  "peppa pig", "paw patrol", "minecraft", "fortnite", "nintendo", "looney tunes", "warner bros", "dc comics",
  "official licence", "official license", "officially licensed", "licensed product", "under licence", "under license",
];

const regionKeywords: Matcher[] = [
  "russian", "russia", "ru language", "ru only", "cyrillic", "cis", "region locked", "region lock", "region free",
  "vpn", "belarus", "spanish text", "text in spanish", "message in spanish", "spanish language", "spanish only",
  "portuguese text", "text in portuguese", "portuguese language", "french text", "text in french", "french language",
  "italian text", "text in italian", "german text", "text in german", "catalan", "galician", "basque", "us plug", "uk plug", "eu plug", "not for sale in",
  /\bregion\s*:\s*\w+/i,
  /\b(?:only|exclusively)\s+(?:for|in)\s+(?:spain|portugal|france|italy|germany|uk|usa)\b/i,
];

const rules: ExcludeRule[] = [
  { id: "electric", label: "Electric, battery or appliance", scopes: ["taxonomy", "category", "name"], keywords: electricKeywords },
  { id: "knives", label: "Knives and blades", scopes: ["taxonomy", "category", "name"], keywords: knifeKeywords },
  {
    id: "alcohol",
    label: "Alcoholic drinks",
    scopes: ["taxonomy", "category", "name"],
    keywords: [
      "alcoholic", "alcoholic drinks", "alcoholic beverages", "liqueur", "liqueurs", "wines and spirits",
      "spirits and liqueurs", "bottle of wine", "beer pack",
      /\b\d+(?:[.,]\d+)?\s?%\s?(?:vol|abv|alc)\b/i,
    ],
  },
  {
    id: "alcohol",
    label: "Alcoholic drinks",
    scopes: ["taxonomy", "category"],
    keywords: ["wines", "beers", "spirits", "ciders", "champagnes", "cavas", "vermouths"],
  },
  {
    id: "food",
    label: "Food and consumables",
    scopes: ["taxonomy", "category", "name"],
    keywords: [
      /\bfood\b(?!\s*(?:storage|containers?|prep|preparation|covers?|savers?|boxes?|jars?|wraps?|bags?|flasks?|processors?|mills?|grade|safe))/i,
      "groceries", "grocery", "gourmet", "delicatessen", "snacks", "sweets", "confectionery", "candy", "chocolates",
      "beverages", "soft drinks", "condiments", "spices", "seasoning", "coffee beans", "ground coffee", "coffee capsules",
      "capsules", "pods", "coffee pods", "tea bags", "herbal infusion", "infusions", "supplement", "supplements",
      "cleaning products", "detergent", "dishwasher tablets", "washing up liquid", "disposable", "single use",
      "paper plates", "plastic cups disposable", "aluminium foil roll", "cling film",
    ],
  },
  {
    id: "adult",
    label: "Adult content",
    scopes: ["taxonomy", "category", "name"],
    keywords: [/\badult (?:toys?|products?|games?|content|gifts?|humou?r)\b/i, "adults only", "for adults only", "erotic", "erotica", "sex", "sexy", "sexual", "lingerie", "fetish", "bdsm", "xxx", "18+", "penis", "pecker", "boobs", "naughty", "kinky", "bachelorette", "hen party", "stag party"],
  },
  {
    id: "weapons",
    label: "Weapons and self-defence",
    scopes: ["taxonomy", "category", "name"],
    keywords: ["weapon", "weapons", "gun", "pistol", "rifle", "airsoft", "crossbow", "ammunition", "ammo", "pepper spray", "self defence", "self defense", "baton", "knuckle", "knuckles", "sword", "katana", "taser", "stun gun", "bullet", "grenade", "slingshot"],
  },
  {
    id: "vapes",
    label: "Vapes and smoking",
    scopes: ["taxonomy", "category", "name"],
    keywords: ["vape", "vaping", "e cigarette", "e-cigarette", "ecig", "shisha", "hookah", "cbd", "cannabis", "weed", "tobacco", "smoking", "cigarette", "cigar", "herb grinder", "rolling papers", "ashtray", "bong", "lighter"],
  },
  {
    id: "medical",
    label: "Medical and health products",
    scopes: ["taxonomy", "category", "name"],
    keywords: ["medical", "medicine", "medicines", "pharmacy", "pharmaceutical", "first aid", "pill", "pills", "pill box", "pill organiser", "clinical", "orthopaedic", "orthopedic", "surgical", "face mask", "masks", "covid", "ppe", "hygiene", "blood pressure", "glucose", "insulin", "inhaler", "baby bottle", "feeding bottle", "breast pump", "teether", "pacifier", "dummy"],
  },
  { id: "licensed", label: "Licensed characters and famous trademarks", scopes: ["taxonomy", "category", "name", "brand"], keywords: licensedKeywords },
  { id: "licensed", label: "Licensed characters and famous trademarks", scopes: ["description"], keywords: licensedDescriptionKeywords },
  { id: "region", label: "Region or language restricted", scopes: ["name", "description"], keywords: regionKeywords },
  {
    id: "condition",
    label: "Refurbished, used or outlet stock",
    scopes: ["name"],
    keywords: ["refurbished", "reconditioned", "second hand", "second-hand", "pre owned", "pre-owned", "used", "open box", "outlet", "damaged packaging", "grade a", "grade b"],
  },
  {
    id: "off-niche",
    label: "Outside the kitchen niche",
    scopes: ["taxonomy", "category", "name"],
    skipRootLevel: true,
    keywords: [
      "toy", "toys", "kids toy", "play kitchen", "toy kitchen", "pets", "pet bowl", "pet food", "pet supplies", "dog",
      "cat bowl", "cat food", "feeder", "garden", "gardening", "flower pot", "plant pot", "planter", "camping stove",
      "bbq", "barbecue", "costume", "fancy dress", "halloween", "car", "automotive", "bathroom", "toilet", "cosmetic",
      "make up", "makeup", "sunglasses", "eyewear", "reading glasses", "spectacles", "fashion", "clothing", "jewellery",
      "jewelry", "watch", "watches", "footwear", "shoes", "luggage", "furniture", "coffee table", "side table",
      "dining table", "chair", "stool", "sofa", "sideboard", "lamp", "lighting", "candle", "home decor", "home decoration",
      "wall decor", "wall decoration", "christmas decoration", "ornament", "vase", "artificial flowers", "figurine",
      "picture frame", "wall mirror", "clock",
    ],
  },
];

const ignorePhrases: Matcher[] = [
  /\bsuitable for (?:all )?(?:types of )?(?:hobs?|cookers?|stoves?|cooktops?)(?:[^.;()]*?(?:induction|electric|gas|ceramic|vitroceramic|halogen))*/gi,
  /\b(?:all|any) (?:types? of )?(?:hobs?|cookers?|heat sources?)(?: including (?:induction|electric|gas|ceramic))*/gi,
  /\b(?:induction|electric|gas|ceramic|vitroceramic|halogen)(?:\s*(?:,|and|&|\/|or)\s*(?:induction|electric|gas|ceramic|vitroceramic|halogen))*\s*(?:hobs?|cookers?|stoves?|cooktops?|compatible|ready|suitable|base|bottom)\b/gi,
  /\b(?:induction|electric|gas)\s*(?:compatible|suitable|friendly|safe)\b/gi,
  /\bfor induction\b/gi,
  /\b(?:all|any) (?:hobs?|cookers?|stoves?|heat sources?) types?\b/gi,
  /\b(?:for |on )?(?:the )?(?:hobs?|stoves?|cookers?)\s*(?:and|\/|or)\s*(?:the )?ovens?\b/gi,
  /\b(?:for |in )?(?:the )?ovens?\s*(?:and|\/|or)\s*(?:the )?(?:hobs?|stoves?|grills?|dishwashers?|microwaves?)\b/gi,
  /\b(?:dishwasher|microwave|oven|freezer|fridge)(?:\s*(?:,|and|&|\/)\s*(?:dishwasher|microwave|oven|freezer|fridge))*\s*[- ]?\s*(?:safe|proof|suitable|friendly|resistant)\b/gi,
  /\bsuitable for (?:the )?(?:dishwasher|microwave|oven|freezer)(?:\s*(?:,|and|&|\/)\s*(?:dishwasher|microwave|oven|freezer))*/gi,
  /\b(?:ovenproof|oven-proof|ovenware|microwavable|microwaveable)\b/gi,
  /\boven\s*(?:to\s*table|dish(?:es)?|tray(?:s)?|gloves?|mitts?|tins?|roasting|bag)\b/gi,
  /\bdutch ovens?\b/gi,
  /\b(?:home|house) (?:and|&) garden\b/gi,
  /\b(?:from|to|for|in|into|inside) (?:the |an |your )?oven\b/gi,
  /\bheat[- ]resistant\b/gi,
  /\b(?:led|lead)[- ]free\b/gi,
  /\bpan(?:s)? with (?:induction )?base\b/gi,
];

export const catalogConfig: CatalogConfig = {
  source: {
    isoCode: "en",
    rootCategoryIds: [],
    rootTaxonomyIds: [],
    cacheTtlHours: 6,
  },
  storefront,
  taxonomyMap,
  include: {
    nameFallback: true,
    scopeKeywords: ["kitchen", "kitchens", "dining", "cooking", "cookware", "tableware", "kitchenware", "bakeware", "baking", "table linen", "table setting", "barware", "home bar", "housewares", "crockery", "cutlery", "glassware", "drinkware"],
  },
  exclude: {
    allowKitchenScissors: ALLOW_KITCHEN_SCISSORS,
    ignorePhrases,
    rules,
  },
  price: {
    source: "retailPrice",
    multiplier: 1,
    roundToNinetyNine: false,
    minRetail: 4,
    maxRetail: 350,
    minMarginOverWholesale: 1.15,
    anomalyFactor: 5,
    anomalyMinSample: 8,
    anomalyBasis: "subcategory",
  },
  quality: {
    minImages: 1,
    maxImagesPerProduct: 6,
    skipLogoImages: true,
    minNameLength: 6,
    maxNameLength: 140,
    minDescriptionChars: 80,
    maxVariantsPerName: 3,
    requireInStock: true,
  },
  limits: {
    maxProducts: 2500,
    maxPerPrimary: 400,
    maxPerSub: 120,
    minPerPrimary: 30,
    minPerSub: 12,
    maxTopLevel: 10,
  },
  images: {
    keyPrefix: "brasmora/products",
    concurrency: 6,
    timeoutMs: 30000,
    maxBytes: 15 * 1024 * 1024,
  },
  brands: {
    showcaseLimit: 24,
    minProducts: 3,
  },
};
