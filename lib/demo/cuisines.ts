// Placeholder content library, one curated set per cuisine. Generic, realistic
// names/prices. Nothing here is a verifiable fact about any real business.
// Images are assigned from the shared photo pool at generation time.

export type DemoItem = { name: string; desc?: string; priceCents: number };
export type DemoCategory = { name: string; items: DemoItem[] };
export type Cuisine = {
  key: string;
  label: string;
  heroLead: string; // accent (orange) headline line
  heroSub: string; // supporting line
  featured: DemoItem[];
  menu: DemoCategory[];
  faq: { q: string; a: string }[];
};

const p = (n: number) => Math.round(n * 100);

export const CUISINES: Record<string, Cuisine> = {
  burgers: {
    key: "burgers",
    label: "Burgers & Sandwiches",
    heroLead: "Smash burgers and stacked sandwiches",
    heroSub: "Fresh patties, toasted buns, and sauces made in house.",
    featured: [
      { name: "Classic Cheeseburger", priceCents: p(9.99) },
      { name: "Double Smash", priceCents: p(12.99) },
      { name: "Crispy Chicken Sandwich", priceCents: p(10.99) },
      { name: "Bacon Deluxe", priceCents: p(13.49) },
      { name: "Loaded Fries", priceCents: p(6.99) },
      { name: "Milkshake", priceCents: p(5.49) },
    ],
    menu: [
      { name: "Burgers", items: [
        { name: "Classic Cheeseburger", desc: "Single patty, American cheese, house sauce.", priceCents: p(9.99) },
        { name: "Double Smash", desc: "Two smashed patties, pickles, onions.", priceCents: p(12.99) },
        { name: "Bacon Deluxe", desc: "Bacon, cheddar, lettuce, tomato.", priceCents: p(13.49) },
      ] },
      { name: "Sandwiches", items: [
        { name: "Crispy Chicken", desc: "Fried chicken breast, slaw, pickles.", priceCents: p(10.99) },
        { name: "Grilled Chicken", desc: "Marinated grilled breast, garlic aioli.", priceCents: p(10.49) },
      ] },
      { name: "Sides", items: [
        { name: "Fries", priceCents: p(3.99) },
        { name: "Loaded Fries", desc: "Cheese, sauce, scallions.", priceCents: p(6.99) },
        { name: "Onion Rings", priceCents: p(4.99) },
      ] },
      { name: "Drinks", items: [
        { name: "Milkshake", priceCents: p(5.49) },
        { name: "Soft Drink", priceCents: p(2.49) },
      ] },
    ],
    faq: [
      { q: "What are your signature items?", a: "Our smash burgers and hand-breaded crispy chicken sandwiches are the crowd favorites." },
      { q: "Do you have vegetarian options?", a: "Yes, we offer veggie patties and a few meat-free sides. Ask when you order." },
      { q: "Can I customize my burger?", a: "Absolutely. You can adjust toppings, cheese, and sauces on any burger." },
    ],
  },
  chicken: {
    key: "chicken",
    label: "Fried / Hot Chicken",
    heroLead: "Crispy, juicy, custom heat",
    heroSub: "Hand-breaded fried chicken with heat levels from mild to fire.",
    featured: [
      { name: "Classic Nashville", priceCents: p(12.99) },
      { name: "The Buffalo", priceCents: p(12.99) },
      { name: "Jr. Classic", priceCents: p(8.99) },
      { name: "5 Piece Wings", priceCents: p(7.99) },
      { name: "Jumbo Tenders", priceCents: p(9.99) },
      { name: "Milkshake", priceCents: p(5.99) },
    ],
    menu: [
      { name: "Sandwiches", items: [
        { name: "Classic Nashville", desc: "Crispy breast, hot oil, pickles, slaw.", priceCents: p(12.99) },
        { name: "The Buffalo", desc: "Breast dipped in buffalo, ranch drizzle.", priceCents: p(12.99) },
        { name: "Honey Butter", desc: "Sweet honey butter glaze, pickles.", priceCents: p(12.99) },
      ] },
      { name: "Tenders", items: [
        { name: "3 Jumbo Tenders", desc: "With dipping sauce.", priceCents: p(9.99) },
        { name: "5 Jumbo Tenders", priceCents: p(13.99) },
      ] },
      { name: "Wings", items: [
        { name: "5 Piece Wings", priceCents: p(7.99) },
        { name: "10 Piece Wings", priceCents: p(13.99) },
      ] },
      { name: "Sides", items: [
        { name: "Crinkle Fries", priceCents: p(3.99) },
        { name: "Mac & Cheese", priceCents: p(4.49) },
        { name: "Coleslaw", priceCents: p(2.99) },
      ] },
      { name: "Drinks", items: [
        { name: "Milkshake", priceCents: p(5.99) },
        { name: "Soft Drink", priceCents: p(2.49) },
      ] },
    ],
    faq: [
      { q: "What are your signature items?", a: "Our Nashville-style hot chicken sandwiches and jumbo tenders are what we are known for." },
      { q: "What heat levels do you offer?", a: "We go from no heat up to our hottest level, so you can pick what suits you." },
      { q: "Is your chicken halal?", a: "We can note halal status on request. Availability varies by location." },
    ],
  },
  halal: {
    key: "halal",
    label: "Halal / Mediterranean",
    heroLead: "Fresh Mediterranean, done right",
    heroSub: "Grilled meats, warm pita, and house-made sauces.",
    featured: [
      { name: "Chicken Shawarma Plate", priceCents: p(12.99) },
      { name: "Beef Gyro Wrap", priceCents: p(10.99) },
      { name: "Falafel Plate", priceCents: p(10.49) },
      { name: "Mixed Grill", priceCents: p(15.99) },
      { name: "Hummus & Pita", priceCents: p(5.99) },
      { name: "Baklava", priceCents: p(3.49) },
    ],
    menu: [
      { name: "Plates", items: [
        { name: "Chicken Shawarma Plate", desc: "Rice, salad, garlic sauce.", priceCents: p(12.99) },
        { name: "Mixed Grill", desc: "Chicken, beef, kofta over rice.", priceCents: p(15.99) },
        { name: "Falafel Plate", desc: "Crispy falafel, hummus, salad.", priceCents: p(10.49) },
      ] },
      { name: "Wraps", items: [
        { name: "Beef Gyro Wrap", desc: "Pita, onions, tzatziki.", priceCents: p(10.99) },
        { name: "Chicken Wrap", desc: "Grilled chicken, garlic sauce.", priceCents: p(9.99) },
      ] },
      { name: "Appetizers", items: [
        { name: "Hummus & Pita", priceCents: p(5.99) },
        { name: "Stuffed Grape Leaves", priceCents: p(4.99) },
      ] },
      { name: "Desserts", items: [
        { name: "Baklava", priceCents: p(3.49) },
        { name: "Rice Pudding", priceCents: p(3.99) },
      ] },
    ],
    faq: [
      { q: "What are your signature items?", a: "Our chicken shawarma plates and mixed grill are the most popular choices." },
      { q: "Do you have vegetarian options?", a: "Yes, our falafel, hummus, and salads are all vegetarian." },
      { q: "Is the meat halal?", a: "We can confirm halal sourcing on request; details vary by location." },
    ],
  },
  persian: {
    key: "persian",
    label: "Persian",
    heroLead: "Charcoal kebabs and saffron rice",
    heroSub: "Traditional Persian grill, slow-cooked stews, and basmati rice.",
    featured: [
      { name: "Koobideh Kebab", priceCents: p(14.99) },
      { name: "Chicken Barg", priceCents: p(15.99) },
      { name: "Ghormeh Sabzi", priceCents: p(13.99) },
      { name: "Fesenjan", priceCents: p(14.49) },
      { name: "Saffron Rice", priceCents: p(4.99) },
      { name: "Persian Tea", priceCents: p(2.49) },
    ],
    menu: [
      { name: "Kebabs", items: [
        { name: "Koobideh Kebab", desc: "Two skewers ground beef, grilled tomato.", priceCents: p(14.99) },
        { name: "Chicken Barg", desc: "Marinated chicken, saffron.", priceCents: p(15.99) },
        { name: "Soltani", desc: "Koobideh and barg combo.", priceCents: p(18.99) },
      ] },
      { name: "Stews", items: [
        { name: "Ghormeh Sabzi", desc: "Herb stew, kidney beans, lamb.", priceCents: p(13.99) },
        { name: "Fesenjan", desc: "Walnut and pomegranate, chicken.", priceCents: p(14.49) },
      ] },
      { name: "Rice Dishes", items: [
        { name: "Saffron Basmati Rice", priceCents: p(4.99) },
        { name: "Baghali Polo", desc: "Dill and fava bean rice.", priceCents: p(6.49) },
      ] },
      { name: "Appetizers", items: [
        { name: "Kashk Bademjan", desc: "Eggplant dip.", priceCents: p(6.99) },
        { name: "Mast-o-Khiar", desc: "Yogurt and cucumber.", priceCents: p(4.49) },
      ] },
      { name: "Drinks", items: [
        { name: "Persian Tea", priceCents: p(2.49) },
        { name: "Doogh", desc: "Yogurt soda.", priceCents: p(3.49) },
      ] },
    ],
    faq: [
      { q: "What are your signature items?", a: "Our koobideh and barg kebabs with saffron rice are the classics to start with." },
      { q: "Do you have vegetarian dishes?", a: "Yes, including herb stews and rice dishes prepared without meat on request." },
      { q: "Are dishes made to order?", a: "Kebabs are grilled to order, so freshness is part of the experience." },
    ],
  },
  pizza: {
    key: "pizza",
    label: "Pizza",
    heroLead: "Hand-tossed, stone-baked pizza",
    heroSub: "Fresh dough daily, house sauce, and real mozzarella.",
    featured: [
      { name: "Margherita", priceCents: p(13.99) },
      { name: "Pepperoni", priceCents: p(14.99) },
      { name: "Supreme", priceCents: p(17.99) },
      { name: "Garlic Knots", priceCents: p(5.99) },
      { name: "Caesar Salad", priceCents: p(7.49) },
      { name: "Tiramisu", priceCents: p(5.49) },
    ],
    menu: [
      { name: "Pizzas", items: [
        { name: "Margherita", desc: "Tomato, fresh mozzarella, basil.", priceCents: p(13.99) },
        { name: "Pepperoni", desc: "House sauce, mozzarella, pepperoni.", priceCents: p(14.99) },
        { name: "Supreme", desc: "Pepperoni, sausage, peppers, onions.", priceCents: p(17.99) },
      ] },
      { name: "Starters", items: [
        { name: "Garlic Knots", priceCents: p(5.99) },
        { name: "Mozzarella Sticks", priceCents: p(6.99) },
      ] },
      { name: "Salads", items: [
        { name: "Caesar Salad", priceCents: p(7.49) },
        { name: "House Salad", priceCents: p(6.49) },
      ] },
      { name: "Desserts", items: [
        { name: "Tiramisu", priceCents: p(5.49) },
        { name: "Cannoli", priceCents: p(3.99) },
      ] },
    ],
    faq: [
      { q: "What are your signature items?", a: "Our margherita and pepperoni pies on fresh daily dough are the go-to orders." },
      { q: "Do you offer gluten-free crust?", a: "Gluten-free crust may be available; ask when you order." },
      { q: "Can I build my own pizza?", a: "Yes, you can start with a base and add the toppings you like." },
    ],
  },
  cafe: {
    key: "cafe",
    label: "Cafe & Coffee",
    heroLead: "Craft coffee and fresh bites",
    heroSub: "Espresso drinks, cold brew, and a small kitchen menu.",
    featured: [
      { name: "Cappuccino", priceCents: p(4.49) },
      { name: "Cold Brew", priceCents: p(4.99) },
      { name: "Iced Latte", priceCents: p(5.49) },
      { name: "Avocado Toast", priceCents: p(8.99) },
      { name: "Breakfast Sandwich", priceCents: p(7.49) },
      { name: "Croissant", priceCents: p(3.49) },
    ],
    menu: [
      { name: "Espresso", items: [
        { name: "Espresso", priceCents: p(3.49) },
        { name: "Cappuccino", priceCents: p(4.49) },
        { name: "Latte", priceCents: p(4.99) },
      ] },
      { name: "Cold", items: [
        { name: "Cold Brew", priceCents: p(4.99) },
        { name: "Iced Latte", priceCents: p(5.49) },
      ] },
      { name: "Kitchen", items: [
        { name: "Avocado Toast", desc: "Sourdough, avocado, chili flakes.", priceCents: p(8.99) },
        { name: "Breakfast Sandwich", desc: "Egg, cheese, choice of meat.", priceCents: p(7.49) },
      ] },
      { name: "Bakery", items: [
        { name: "Croissant", priceCents: p(3.49) },
        { name: "Blueberry Muffin", priceCents: p(3.29) },
      ] },
    ],
    faq: [
      { q: "What are your signature drinks?", a: "Our cold brew and house latte are the most ordered, with rotating seasonal specials." },
      { q: "Do you have non-dairy milk?", a: "Yes, oat, almond, and soy are available on any drink." },
      { q: "Is there a food menu?", a: "Yes, a small kitchen menu with toast, sandwiches, and pastries." },
    ],
  },
  bakery: {
    key: "bakery",
    label: "Bakery & Desserts",
    heroLead: "Fresh-baked, every day",
    heroSub: "Cakes, cookies, and pastries made from scratch.",
    featured: [
      { name: "Chocolate Cake Slice", priceCents: p(5.99) },
      { name: "Cinnamon Roll", priceCents: p(4.49) },
      { name: "Cheesecake", priceCents: p(6.49) },
      { name: "Cookie Box", priceCents: p(8.99) },
      { name: "Croissant", priceCents: p(3.49) },
      { name: "Iced Coffee", priceCents: p(4.49) },
    ],
    menu: [
      { name: "Cakes", items: [
        { name: "Chocolate Cake Slice", priceCents: p(5.99) },
        { name: "Cheesecake", priceCents: p(6.49) },
        { name: "Carrot Cake", priceCents: p(5.99) },
      ] },
      { name: "Pastries", items: [
        { name: "Croissant", priceCents: p(3.49) },
        { name: "Cinnamon Roll", priceCents: p(4.49) },
      ] },
      { name: "Cookies", items: [
        { name: "Chocolate Chip", priceCents: p(2.49) },
        { name: "Cookie Box (6)", priceCents: p(8.99) },
      ] },
      { name: "Drinks", items: [
        { name: "Iced Coffee", priceCents: p(4.49) },
        { name: "Hot Chocolate", priceCents: p(3.99) },
      ] },
    ],
    faq: [
      { q: "What are your signature items?", a: "Our layer cakes and fresh cinnamon rolls are the most popular each day." },
      { q: "Do you take custom cake orders?", a: "Yes, custom cakes can be arranged with advance notice." },
      { q: "Are there nut-free options?", a: "Several items are nut-free; ask so we can point you to them." },
    ],
  },
  other: {
    key: "other",
    label: "Other",
    heroLead: "Made fresh, served fast",
    heroSub: "A menu built around your favorites.",
    featured: [
      { name: "House Signature", priceCents: p(11.99) },
      { name: "Chef's Plate", priceCents: p(12.99) },
      { name: "Fresh Bowl", priceCents: p(10.49) },
      { name: "Side & Drink", priceCents: p(4.99) },
      { name: "Daily Special", priceCents: p(9.99) },
      { name: "Sweet Finish", priceCents: p(4.49) },
    ],
    menu: [
      { name: "Mains", items: [
        { name: "House Signature", priceCents: p(11.99) },
        { name: "Chef's Plate", priceCents: p(12.99) },
        { name: "Fresh Bowl", priceCents: p(10.49) },
      ] },
      { name: "Sides", items: [
        { name: "Fries", priceCents: p(3.99) },
        { name: "Side Salad", priceCents: p(4.49) },
      ] },
      { name: "Drinks", items: [
        { name: "Soft Drink", priceCents: p(2.49) },
        { name: "Fresh Juice", priceCents: p(3.99) },
      ] },
    ],
    faq: [
      { q: "What are your signature items?", a: "Ask our staff for the day's most popular plates; the menu changes with the season." },
      { q: "Do you have options for dietary needs?", a: "Yes, we can point you to lighter, vegetarian, or lower-heat options." },
      { q: "Is everything made to order?", a: "Most items are prepared fresh when you order for the best quality." },
    ],
  },
};

export const CUISINE_KEYS = Object.keys(CUISINES);
export const CUISINE_OPTIONS = CUISINE_KEYS.map((k) => ({ value: k, label: CUISINES[k].label }));

// Shared "why choose us" catering cards (generic, works for any cuisine).
export const CATERING_CARDS = [
  { title: "Fast Service", body: "We cater efficiently to every event size." },
  { title: "Bold Flavors", body: "Signature recipes in every bite." },
  { title: "Friendly Team", body: "We handle setup, service, and cleanup." },
  { title: "Customizable Menu", body: "Tailor your event menu with ease." },
];

// Photo pool (real food photos in /public/demo). Assigned round-robin.
export const PHOTO_POOL = [
  "/demo/food-main.jpg", "/demo/bowl-chicken.jpg", "/demo/food-enjoy.jpg",
  "/demo/bowl-rice.jpg", "/demo/bowl-curry.jpg", "/demo/bowl-noodle.jpg",
  "/demo/food-vibe.jpg", "/demo/bowl-salad.jpg", "/demo/bowl-chili-chicken.jpg",
  "/demo/bowl-salmon.jpg", "/demo/bowl-buddha.jpg", "/demo/bowl-halwa.jpg",
];
