/* ================= FitFuel data ================= */

/* ---------- FOOD DB (per 100 g unless noted) ---------- */
const FOODS = [
  {n:"Boiled Egg",e:"",k:155,p:13,c:1.1,f:11,serve:50,det:1},
  {n:"Egg White",e:"",k:52,p:11,c:0.7,f:0.2,serve:60},
  {n:"Omelette",e:"",k:154,p:10,c:2,f:11,serve:120,det:1},
  {n:"Egg Bhurji",e:"",k:160,p:11,c:3,f:11,serve:150,det:1},
  {n:"Egg Curry",e:"",k:150,p:10,c:5,f:10,serve:200,det:1},
  {n:"Chicken Breast (cooked)",e:"",k:165,p:31,c:0,f:3.6,serve:150,det:1},
  {n:"Butter Chicken",e:"",k:180,p:15,c:8,f:10,serve:200,det:1},
  {n:"Chicken Curry",e:"",k:150,p:16,c:6,f:7,serve:200,det:1},
  {n:"Tandoori Chicken",e:"",k:180,p:26,c:2,f:8,serve:150,det:1},
  {n:"Chicken Seekh Kebab",e:"",k:220,p:18,c:4,f:14,serve:150,det:1},
  {n:"Fish Fry",e:"",k:210,p:20,c:8,f:11,serve:150,det:1},
  {n:"Fish Curry (Rohu)",e:"",k:160,p:15,c:5,f:9,serve:200,det:1},
  {n:"Grilled Prawns",e:"",k:120,p:23,c:2,f:2,serve:150},
  {n:"Paneer",e:"",k:265,p:18,c:3.6,f:21,serve:100,det:1},
  {n:"Palak Paneer",e:"",k:150,p:7,c:8,f:11,serve:200,det:1},
  {n:"Paneer Butter Masala",e:"",k:230,p:9,c:10,f:18,serve:200,det:1},
  {n:"Paneer Tikka",e:"",k:220,p:18,c:6,f:14,serve:150,det:1},
  {n:"Tofu",e:"⬜",k:76,p:8,c:1.9,f:4.8,serve:100},
  {n:"Greek Yogurt",e:"",k:59,p:10,c:3.6,f:0.4,serve:150,det:1},
  {n:"Curd (Dahi)",e:"",k:60,p:3.5,c:4.7,f:3.3,serve:150,det:1},
  {n:"Toned Milk",e:"",k:61,p:3.2,c:4.8,f:3.3,serve:250,det:1},
  {n:"Cheese Slice",e:"",k:403,p:25,c:1.3,f:33,serve:30},
  {n:"Whey Protein Shake",e:"",k:400,p:80,c:8,f:5,serve:30,det:1},
  {n:"Protein Bar",e:"",k:350,p:30,c:40,f:10,serve:60},
  {n:"Roti / Chapati",e:"",k:297,p:11,c:51,f:6,serve:40,det:1},
  {n:"Paratha (Aloo)",e:"",k:330,p:7,c:40,f:15,serve:100,det:1},
  {n:"Thepla",e:"",k:310,p:9,c:45,f:9,serve:60},
  {n:"Puri (2 pc)",e:"",k:360,p:6,c:45,f:17,serve:40},
  {n:"White Rice (cooked)",e:"",k:130,p:2.7,c:28,f:0.3,serve:150,det:1},
  {n:"Basmati Rice (cooked)",e:"",k:130,p:2.7,c:28,f:0.3,serve:150},
  {n:"Brown Rice (cooked)",e:"",k:123,p:2.7,c:26,f:1,serve:150},
  {n:"Jeera Rice",e:"",k:160,p:3,c:30,f:3,serve:150,det:1},
  {n:"Veg Biryani",e:"",k:170,p:4,c:28,f:5,serve:250,det:1},
  {n:"Chicken Biryani",e:"",k:190,p:10,c:26,f:6,serve:250,det:1},
  {n:"Poha",e:"",k:180,p:3,c:35,f:4,serve:150,det:1},
  {n:"Upma",e:"",k:180,p:4,c:30,f:5,serve:150,det:1},
  {n:"Idli (2 pc)",e:"",k:58,p:2,c:12,f:0.4,serve:120,det:1},
  {n:"Plain Dosa",e:"",k:168,p:4,c:26,f:5,serve:100,det:1},
  {n:"Masala Dosa",e:"",k:190,p:4,c:28,f:7,serve:150,det:1},
  {n:"Medu Vada (2 pc)",e:"",k:260,p:8,c:30,f:12,serve:80},
  {n:"Samosa (1 pc)",e:"",k:308,p:5,c:32,f:17,serve:60,det:1},
  {n:"Pav Bhaji",e:"",k:250,p:5,c:35,f:10,serve:200,det:1},
  {n:"Vada Pav",e:"",k:300,p:7,c:35,f:14,serve:120,det:1},
  {n:"Pani Puri",e:"",k:150,p:3,c:25,f:5,serve:100},
  {n:"Chole",e:"",k:130,p:6,c:16,f:5,serve:200,det:1},
  {n:"Rajma",e:"",k:130,p:6,c:18,f:4,serve:200,det:1},
  {n:"Dal Tadka",e:"",k:110,p:6,c:14,f:4,serve:200,det:1},
  {n:"Dal Fry",e:"",k:120,p:6,c:14,f:5,serve:200,det:1},
  {n:"Sambar",e:"",k:90,p:4,c:13,f:3,serve:200,det:1},
  {n:"Kadhi",e:"",k:100,p:4,c:12,f:4,serve:200},
  {n:"Mix Veg Sabzi",e:"",k:120,p:3,c:12,f:7,serve:200,det:1},
  {n:"Aloo Gobi",e:"",k:130,p:3,c:14,f:7,serve:200,det:1},
  {n:"Baingan Bharta",e:"",k:120,p:3,c:10,f:8,serve:200},
  {n:"Bhindi Fry",e:"",k:130,p:3,c:10,f:9,serve:150},
  {n:"Sabudana Khichdi",e:"",k:180,p:3,c:35,f:4,serve:150},
  {n:"Oats (dry)",e:"",k:389,p:17,c:66,f:7,serve:40,det:1},
  {n:"Cornflakes",e:"",k:357,p:7,c:84,f:0.6,serve:30},
  {n:"Muesli",e:"",k:340,p:10,c:60,f:7,serve:50},
  {n:"Bread (White)",e:"",k:265,p:9,c:49,f:3.2,serve:30,det:1},
  {n:"Brown Bread",e:"",k:250,p:9,c:45,f:4,serve:30},
  {n:"Peanut Butter",e:"",k:588,p:25,c:20,f:50,serve:20,det:1},
  {n:"Almonds (8 pc)",e:"",k:579,p:21,c:22,f:50,serve:28},
  {n:"Walnuts",e:"",k:654,p:15,c:14,f:65,serve:28},
  {n:"Cashews",e:"",k:553,p:18,c:30,f:44,serve:28},
  {n:"Banana",e:"",k:89,p:1.1,c:23,f:0.3,serve:120,det:1},
  {n:"Apple",e:"",k:52,p:0.3,c:14,f:0.2,serve:180,det:1},
  {n:"Orange",e:"",k:47,p:0.9,c:12,f:0.1,serve:150,det:1},
  {n:"Mango",e:"",k:60,p:0.8,c:15,f:0.4,serve:200,det:1},
  {n:"Papaya",e:"",k:43,p:0.5,c:11,f:0.3,serve:200},
  {n:"Watermelon",e:"",k:30,p:0.6,c:8,f:0.2,serve:250,det:1},
  {n:"Pomegranate",e:"",k:83,p:1.7,c:19,f:1.2,serve:150},
  {n:"Guava",e:"",k:68,p:2.6,c:14,f:1,serve:150},
  {n:"Grapes",e:"",k:69,p:0.7,c:18,f:0.2,serve:150},
  {n:"Chocolate",e:"",k:546,p:5,c:61,f:31,serve:30,det:1},
  {n:"Ice Cream",e:"",k:207,p:3.5,c:24,f:11,serve:100,det:1},
  {n:"Cheese Pizza (1 slice)",e:"",k:266,p:11,c:33,f:10,serve:120,det:1},
  {n:"Veg Burger",e:"",k:250,p:8,c:30,f:11,serve:200,det:1},
  {n:"Chicken Burger",e:"",k:260,p:14,c:28,f:10,serve:220,det:1},
  {n:"French Fries",e:"",k:312,p:3.4,c:41,f:15,serve:100,det:1},
  {n:"Veg Momos (4 pc)",e:"",k:150,p:4,c:25,f:4,serve:150,det:1},
  {n:"Veg Noodles",e:"",k:140,p:4,c:22,f:4,serve:200,det:1},
  {n:"Fried Rice",e:"",k:160,p:4,c:26,f:5,serve:200,det:1},
  {n:"Veg Manchurian",e:"",k:200,p:6,c:22,f:10,serve:150},
  {n:"Chai (milk tea)",e:"",k:60,p:2,c:8,f:2.5,serve:150,det:1},
  {n:"Coffee (black)",e:"",k:2,p:0.2,c:0,f:0,serve:200},
  {n:"Green Tea",e:"",k:1,p:0,c:0,f:0,serve:250},
  {n:"Cold Drink",e:"",k:42,p:0,c:10.6,f:0,serve:250,det:1},
  {n:"Orange Juice",e:"",k:45,p:0.7,c:10,f:0.2,serve:250},
  {n:"Lassi",e:"",k:70,p:3,c:10,f:2,serve:250,det:1},
  {n:"Buttermilk",e:"",k:32,p:2,c:3,f:1,serve:250},
  {n:"Honey",e:"",k:304,p:0.3,c:82,f:0,serve:20},
  {n:"Sugar",e:"",k:387,p:0,c:100,f:0,serve:10},
  {n:"Ghee",e:"",k:900,p:0,c:0,f:100,serve:10},
  {n:"Vegetable Oil",e:"",k:884,p:0,c:0,f:100,serve:10},
  {n:"Mango Lassi",e:"",k:90,p:3,c:14,f:2,serve:250}
];

/* ---------- INGREDIENTS (per 100 g raw) ---------- */
const INGREDIENTS = [
  {n:"Wheat Flour (Atta)",k:364,p:13,c:76,f:1.5},
  {n:"Maida (Refined Flour)",k:364,p:10,c:76,f:1},
  {n:"Semolina (Suji)",k:360,p:12,c:72,f:0.4},
  {n:"Rice (raw)",k:360,p:7,c:80,f:0.7},
  {n:"Basmati Rice (raw)",k:360,p:7,c:80,f:0.7},
  {n:"Sugar",k:387,p:0,c:100,f:0},
  {n:"Salt",k:0,p:0,c:0,f:0},
  {n:"Vegetable Oil",k:884,p:0,c:0,f:100},
  {n:"Ghee",k:900,p:0,c:0,f:100},
  {n:"Butter",k:717,p:0.9,c:0.1,f:81},
  {n:"Chicken Breast",k:165,p:31,c:0,f:3.6},
  {n:"Chicken (with bone)",k:150,p:24,c:0,f:6},
  {n:"Egg (whole)",k:155,p:13,c:1.1,f:11},
  {n:"Egg White",k:52,p:11,c:0.7,f:0.2},
  {n:"Paneer",k:265,p:18,c:3.6,f:21},
  {n:"Cheese",k:403,p:25,c:1.3,f:33},
  {n:"Potato",k:77,p:2,c:17,f:0.1},
  {n:"Onion",k:40,p:1.1,c:9,f:0.1},
  {n:"Tomato",k:18,p:0.9,c:3.9,f:0.2},
  {n:"Milk",k:61,p:3.2,c:4.8,f:3.3},
  {n:"Curd (Dahi)",k:60,p:3.5,c:4.7,f:3.3},
  {n:"Cream (Malai)",k:340,p:2,c:3,f:35},
  {n:"Dal (dry)",k:343,p:22,c:63,f:1.5},
  {n:"Besan (Gram Flour)",k:387,p:22,c:58,f:6},
  {n:"Soya Chunks",k:345,p:52,c:33,f:0.5},
  {n:"Oats",k:389,p:17,c:66,f:7},
  {n:"Bread",k:265,p:9,c:49,f:3.2},
  {n:"Peanut Butter",k:588,p:25,c:20,f:50},
  {n:"Almonds",k:579,p:21,c:22,f:50},
  {n:"Cashews",k:553,p:18,c:30,f:44},
  {n:"Groundnut",k:567,p:26,c:16,f:49},
  {n:"Coconut (grated)",k:354,p:3.3,c:15,f:33},
  {n:"Raisins",k:299,p:3,c:79,f:0.5},
  {n:"Corn",k:86,p:3.2,c:19,f:1.2},
  {n:"Green Peas",k:81,p:5,c:14,f:0.4},
  {n:"Carrot",k:41,p:0.9,c:10,f:0.2},
  {n:"Capsicum",k:20,p:1,c:5,f:0.3},
  {n:"Spinach (Palak)",k:23,p:2.9,c:3.6,f:0.4},
  {n:"Cauliflower",k:25,p:1.9,c:5,f:0.3},
  {n:"Cabbage",k:25,p:1.3,c:5.8,f:0.1},
  {n:"French Beans",k:31,p:1.8,c:7,f:0.2},
  {n:"Mushroom",k:22,p:3.1,c:3.3,f:0.3},
  {n:"Ginger",k:80,p:1.8,c:18,f:0.8},
  {n:"Garlic",k:149,p:6.4,c:33,f:0.5},
  {n:"Green Chilli",k:40,p:2,c:9,f:0.4},
  {n:"Spices (masala)",k:250,p:10,c:50,f:5},
  {n:"Soya Sauce",k:53,p:8,c:4.9,f:0.6},
  {n:"Tomato Ketchup",k:112,p:1,c:26,f:0.2},
  {n:"Mayonnaise",k:680,p:1,c:0.2,f:75},
  {n:"Honey",k:304,p:0.3,c:82,f:0},
  {n:"Dark Chocolate",k:546,p:5,c:61,f:31},
  {n:"Whey Protein",k:400,p:80,c:8,f:5},
  {n:"Flattened Rice (Poha)",k:346,p:6,c:80,f:0.6},
  {n:"Sabudana",k:346,p:0.2,c:87,f:0.1},
  {n:"Fish (raw)",k:96,p:20,c:0,f:1.3},
  {n:"Prawns (raw)",k:85,p:20,c:0.2,f:0.3}
];

/* ---------- EXERCISE ILLUSTRATIONS (v2) ---------- */
const SK='#e9eefb', FAR='#75849e', ACC='#22d37f', EQ='#38bdf8';
function art(inner){
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg"><defs>
  <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#182541"/><stop offset="1" stop-color="#0c1424"/></linearGradient>
  <radialGradient id="mG"><stop offset="0" stop-color="#22d37f" stop-opacity=".55"/><stop offset="1" stop-color="#22d37f" stop-opacity="0"/></radialGradient>
  <marker id="aH" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#fbbf24"/></marker>
  </defs>
  <rect width="240" height="150" fill="url(#bgG)"/>
  <path d="M0 118 Q60 106 120 114 T240 108 L240 150 L0 150 Z" fill="#0a1120" opacity=".45"/>
  <ellipse cx="120" cy="134" rx="90" ry="7" fill="#05090f" opacity=".6"/>
  <g stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
}
const ln=(x1,y1,x2,y2,c,w)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c||SK}" stroke-width="${w||10}"/>`;
const hd=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r||10}" fill="${SK}"/>`;
const mus=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#mG)"/>`;
const eq=(x1,y1,x2,y2,w)=>ln(x1,y1,x2,y2,EQ,w||6);
const eqc=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${EQ}" stroke-width="6"/>`;
const arrow=d=>`<path d="${d}" fill="none" stroke="#fbbf24" stroke-width="3.5" stroke-dasharray="7 6" marker-end="url(#aH)"/>`;
const spine=(x1,y1,x2,y2)=>ln(x1,y1,x2,y2,SK,14);

const POSES = {
  curl: art(mus(120,60,22)+hd(120,36)+spine(120,48,120,88)+ln(120,88,107,134)+ln(120,88,133,134)
    +ln(120,58,106,76,FAR,9)+ln(106,76,114,58,FAR,9)+ln(120,58,134,76,SK,9)+ln(134,76,126,58,SK,9)
    +eq(107,56,121,56,7)+eq(119,58,133,58,7)),
  squat: art(mus(140,92,22)+hd(96,40)+spine(100,52,116,84)+ln(116,84,150,92,FAR,9)+ln(150,92,146,134,FAR,9)
    +ln(116,84,148,96,SK,9)+ln(148,96,144,134,SK,9)+ln(104,60,138,66,SK,9)+arrow("M158 60 q14 14 4 30")),
  lunge: art(mus(142,102,22)+hd(120,36)+spine(120,48,120,86)+ln(120,86,156,104,SK,9)+ln(156,104,158,134,SK,9)
    +ln(120,86,92,110,FAR,9)+ln(92,110,76,134,FAR,9)+ln(116,56,112,84,FAR,8)+ln(124,56,128,84,SK,8)),
  pushup: art(mus(76,86,20)+hd(54,74,10)+spine(66,80,124,94)+ln(124,94,176,124,SK,9)
    +ln(66,80,64,132,SK,9)+ln(76,84,82,132,FAR,9)),
  plank: art(mus(104,94,22)+hd(54,78,10)+spine(66,84,124,96)+ln(66,86,60,124,SK,9)+ln(60,124,92,124,SK,9)
    +ln(124,96,176,124,SK,9)+ln(74,88,74,126,FAR,8)),
  jack: art(hd(120,34)+spine(120,46,120,84)+ln(120,56,96,32,SK,9)+ln(120,56,144,32,SK,9)
    +ln(120,84,96,132,SK,9)+ln(120,84,144,132,SK,9)),
  burpee: art(hd(120,36)+spine(120,48,120,84)+ln(120,58,100,34,SK,9)+ln(120,58,140,34,SK,9)
    +ln(120,84,104,106,SK,9)+ln(104,106,102,134,SK,9)+ln(120,84,136,106,SK,9)+ln(136,106,138,134,SK,9)
    +arrow("M74 122 q-16 -18 -4 -40")+arrow("M166 122 q16 -18 4 -40")),
  jump: art(mus(120,80,22)+hd(120,36)+spine(120,48,120,78)+ln(120,58,100,40,SK,9)+ln(120,58,140,40,SK,9)
    +ln(120,78,102,92,SK,9)+ln(102,92,114,110,SK,9)+ln(120,78,138,92,SK,9)+ln(138,92,126,110,SK,9)
    +arrow("M66 128 q-10 -24 6 -44")),
  bench: art(mus(102,90,20)+eq(60,110,180,110,7)+eq(74,110,74,134,6)+eq(166,110,166,134,6)
    +hd(74,96,10)+spine(86,102,156,102)+ln(100,102,100,74,SK,9)+eq(78,70,122,70,7)+eqc(84,70,7)+eqc(116,70,7)
    +ln(156,102,172,116,SK,9)+ln(172,116,172,134,SK,9)),
  deadlift: art(mus(128,72,22)+hd(90,54,10)+spine(102,60,152,80)+ln(152,80,160,106,SK,9)+ln(160,106,156,134,SK,9)
    +ln(152,80,146,106,FAR,8)+ln(146,106,144,134,FAR,8)+ln(106,66,104,106,SK,9)
    +eq(74,110,134,110,6)+eqc(82,110,8)+eqc(126,110,8)),
  press: art(mus(120,54,22)+hd(120,38)+spine(120,50,120,88)+ln(120,88,106,134)+ln(120,88,134,134)
    +ln(120,60,104,44,SK,9)+ln(104,44,106,24,SK,9)+ln(120,60,136,44,SK,9)+ln(136,44,134,24,SK,9)
    +eq(96,22,116,22,7)+eq(124,22,144,22,7)),
  row: art(mus(126,76,22)+hd(84,58,10)+spine(96,64,150,84)+ln(150,84,158,108,SK,9)+ln(158,108,154,134,SK,9)
    +ln(150,84,146,108,FAR,8)+ln(146,108,142,134,FAR,8)+ln(100,70,104,96,SK,9)+ln(104,96,118,84,SK,9)
    +eq(96,94,114,94,6)),
  pulldown: art(mus(114,84,22)+eq(58,20,182,20,7)+eq(192,20,192,134,6)+eq(110,110,162,110,7)
    +hd(120,52,10)+spine(120,64,124,106)+ln(120,70,100,48,SK,9)+ln(100,48,74,26,SK,9)
    +ln(120,70,140,48,SK,9)+ln(140,48,166,26,SK,9)+ln(124,106,164,114,SK,9)+ln(164,114,164,134,SK,9)),
  pullup: art(mus(120,74,22)+eq(56,20,184,20,7)+hd(120,44,10)+ln(114,54,110,26,SK,9)+ln(126,54,130,26,SK,9)
    +spine(120,56,120,96)+ln(120,96,140,112,SK,9)+ln(140,112,126,128,SK,9)),
  run: art(mus(130,84,20)+hd(92,40,10)+spine(102,48,134,80)+ln(134,80,164,98,SK,9)+ln(164,98,156,132,SK,9)
    +ln(134,80,110,102,FAR,9)+ln(110,102,92,124,FAR,9)+ln(108,56,126,66,SK,9)+ln(126,66,138,56,SK,9)
    +ln(108,56,90,68,FAR,9)+ln(90,68,82,58,FAR,9)+arrow("M56 78 h30")),
  highknees: art(mus(124,76,20)+hd(96,38,10)+spine(104,46,116,78)+ln(116,78,148,66,SK,9)+ln(148,66,136,96,SK,9)
    +ln(116,78,108,110,SK,9)+ln(108,110,104,134,SK,9)+ln(108,54,126,62,SK,9)+ln(108,54,92,66,FAR,9)
    +arrow("M162 78 q14 -16 2 -34")),
  stretch: art(mus(150,100,20)+hd(98,80,10)+spine(110,78,150,76)+ln(150,76,152,134,SK,9)+ln(146,76,146,134,FAR,8)
    +ln(110,78,104,116,SK,9)+ln(104,116,110,130,SK,9)),
  bridge: art(mus(134,96,24)+hd(66,120,10)+spine(78,124,124,96)+ln(124,96,164,104,SK,9)+ln(164,104,168,134,SK,9)
    +ln(82,126,108,130,FAR,8)),
  climber: art(mus(106,96,20)+hd(54,72,10)+spine(66,78,124,92)+ln(66,78,64,130,SK,9)
    +ln(124,92,176,124,FAR,9)+ln(124,92,100,108,SK,9)+ln(100,108,92,132,SK,9)),
  situp: art(mus(98,96,20)+hd(76,78,10)+spine(86,86,124,116)+ln(124,116,162,102,SK,9)+ln(162,102,168,132,SK,9)
    +ln(88,88,78,76,FAR,8)+arrow("M110 64 q-16 6 -20 22")),
  twist: art(mus(102,106,20)+hd(74,74,10)+spine(84,84,110,120)+ln(110,120,150,102,SK,9)+ln(150,102,168,116,SK,9)
    +ln(90,90,116,104,SK,9)+eqc(122,108,6)+arrow("M96 116 q-14 8 -6 20")),
  dip: art(mus(114,74,20)+eq(140,104,202,104,7)+eq(190,104,190,134,6)+hd(96,54,10)+spine(104,62,120,96)
    +ln(106,68,136,104,SK,9)+ln(120,96,164,120,SK,9)+ln(164,120,174,134,SK,9)),
  raise: art(mus(120,54,22)+hd(120,36)+spine(120,48,120,88)+ln(120,88,106,134)+ln(120,88,134,134)
    +ln(120,58,86,60,SK,9)+ln(120,58,154,60,SK,9)+eq(78,60,94,60,7)+eq(146,60,162,60,7)
    +arrow("M104 46 q4 -14 14 -16")+arrow("M136 46 q-4 -14 -14 -16")),
  legraise: art(mus(120,84,20)+eq(56,20,184,20,7)+hd(114,40,10)+ln(108,50,106,26,SK,9)+ln(122,50,124,26,SK,9)
    +spine(114,52,114,94)+ln(114,94,152,96,SK,9)+ln(114,98,148,108,FAR,8)+arrow("M160 86 q14 -12 4 -30")),
  downdog: art(mus(152,90,20)+hd(76,94,10)+ln(66,132,84,78,SK,9)+spine(84,78,132,50)+ln(132,50,178,132,SK,9)),
  child: art(hd(86,114,10)+spine(100,110,164,100)+ln(164,100,168,132,SK,9)+ln(100,112,64,128,SK,9)
    +ln(104,116,72,132,FAR,8)),
  catcow: art(mus(116,78,22)+hd(64,86,10)+`<path d="M76 90 Q116 66 156 88" stroke="${SK}" stroke-width="14" fill="none"/>`
    +ln(76,90,72,132,SK,9)+ln(156,88,162,132,SK,9)+ln(156,88,150,132,FAR,8)),
  cobra: art(mus(124,110,20)+ln(150,126,206,132,SK,9)+spine(150,126,104,96)+hd(92,88,10)
    +ln(108,102,104,130,SK,9)+ln(114,104,120,130,FAR,8)),
  birds: art(mus(112,92,20)+hd(64,86,10)+spine(76,92,144,92)+ln(76,92,72,132,SK,9)
    +ln(146,92,196,110,SK,9)+ln(74,90,40,72,SK,9)+ln(148,92,154,132,FAR,8)),
  wallsit: art(mus(106,92,22)+eq(56,16,56,134,7)+hd(76,44,10)+spine(78,56,80,92)+ln(80,92,126,92,SK,9)
    +ln(126,92,126,134,SK,9)+ln(78,66,104,78,SK,9)+arrow("M96 108 q14 8 10 24")),
  crab: art(mus(118,98,20)+hd(72,92,10)+ln(84,100,76,132,SK,9)+spine(84,100,150,100)+ln(150,100,196,132,SK,9)),
  roller: art(mus(126,106,22)+ln(78,130,90,96,SK,9)+spine(90,96,160,114)+hd(176,116,10)
    +ln(160,114,196,126,SK,9)+eqc(206,126,10)),
  rope: art(hd(120,40,10)+spine(120,52,120,88)+ln(120,88,110,130,SK,9)+ln(120,88,130,130,SK,9)
    +ln(120,60,106,76,SK,9)+ln(120,60,134,76,SK,9)
    +`<path d="M64 78 Q120 156 176 78 Q120 6 64 78" fill="none" stroke="${EQ}" stroke-width="4"/>`),
  bike: art(mus(132,92,18)+eqc(74,110,24)+eqc(176,110,24)+eq(74,110,124,78,5)+eq(124,78,176,110,5)
    +eq(104,76,150,76,5)+eq(150,76,160,64,5)+hd(110,44,9)+ln(116,52,130,72,SK,12)
    +ln(120,56,156,70,SK,8)+ln(130,72,134,96,SK,9)),
  rower: art(mus(100,80,18)+eq(46,124,204,124,6)+eq(188,96,188,120,5)+hd(74,66,9)+ln(84,74,116,90,SK,12)
    +ln(116,96,184,104,SK,9)+ln(90,78,124,88,SK,8)+eq(120,84,142,92,5)),
  stairs: art(mus(124,84,20)+`<path d="M150 134 V116 H176 V98 H202 V80 H228" fill="none" stroke="${EQ}" stroke-width="6"/>`
    +hd(96,42,10)+spine(102,52,108,86)+ln(108,86,140,80,SK,9)+ln(140,80,146,102,SK,9)
    +ln(108,86,100,116,SK,9)+ln(100,116,98,134,SK,9)+ln(104,58,126,68,SK,9)),
  crawl: art(mus(80,92,18)+hd(60,86,10)+spine(72,88,144,84)+ln(72,88,70,132,SK,9)
    +ln(144,84,152,116,SK,9)+ln(152,116,150,134,SK,9)+ln(84,90,90,132,FAR,8)+ln(136,86,128,118,FAR,8)),
  inchworm: art(mus(60,102,18)+ln(54,132,64,74,SK,9)+spine(64,74,130,122)+hd(146,126,10)+ln(130,122,148,132,SK,8)),
  hipthrust: art(mus(142,104,24)+eq(140,96,204,96,7)+eq(192,96,192,134,6)+hd(54,126,9)
    +spine(78,130,128,100)+ln(128,100,164,118,SK,9)+ln(164,118,164,134,SK,9)+ln(84,130,110,134,FAR,8)
    +arrow("M120 74 q16 4 22 18")),
  goblet: art(mus(140,92,22)+hd(96,40)+spine(100,52,116,84)+ln(116,84,150,92,FAR,9)+ln(150,92,146,134,FAR,9)
    +ln(116,84,148,96,SK,9)+ln(148,96,144,134,SK,9)+ln(104,60,118,70,SK,9)+ln(110,56,120,44,SK,9)
    +eqc(122,66,9)),
  swing: art(mus(140,96,22)+hd(92,52,10)+spine(104,58,150,78)+ln(150,78,156,106,SK,9)+ln(156,106,152,134,SK,9)
    +ln(150,78,146,106,FAR,8)+ln(146,106,142,134,FAR,8)+ln(110,64,84,86,SK,9)
    +eqc(76,96,9)+`<path d="M70 88 q6 -12 14 -4" fill="none" stroke="${EQ}" stroke-width="5"/>`
    +arrow("M56 78 q-14 -22 6 -40")),
  skater: art(mus(138,88,20)+hd(100,42,10)+spine(108,50,134,80)+ln(134,80,160,110,SK,9)+ln(160,110,142,132,SK,9)
    +ln(134,80,114,112,FAR,9)+ln(114,112,124,134,FAR,9)+ln(112,58,138,70,SK,9)+ln(112,58,88,76,FAR,9)
    +arrow("M60 128 h34"))
};

/* ---------- WORKOUT LIBRARY ---------- */
const WORKOUTS = [
  // ===== CHEST =====
  {n:"Barbell Bench Press",t:["gym"],c:"strength",g:"chest",lvl:"Intermediate",eq:"Barbell + bench",sets:"4 × 6–10",rest:"2–3 min",p:"bench",
   s:["Lie on the bench, eyes under the bar.","Grip slightly wider than shoulders, unrack and lower to mid-chest.","Press up and slightly back until arms lock out.","Control the negative for 2 seconds."],
   w:["Primary mass builder for the entire chest.","Builds pressing strength that carries to other lifts.","Works front delts and triceps as secondary movers."]},
  {n:"Incline Dumbbell Press",t:["gym"],c:"strength",g:"chest",lvl:"Intermediate",eq:"Dumbbells + incline bench",sets:"3 × 8–12",rest:"90 s",p:"bench",
   s:["Set the bench to a 30° incline.","Press the dumbbells up with a slight arch.","Lower until elbows are just below shoulder line.","Squeeze at the top without clashing the weights."],
   w:["Targets the upper chest for a fuller look.","Unilateral work fixes left/right strength imbalance.","Safer on shoulders than flat barbell for many people."]},
  {n:"Cable Chest Fly",t:["gym"],c:"strength",g:"chest",lvl:"Beginner",eq:"Cable machine",sets:"3 × 12–15",rest:"60 s",p:"raise",
   s:["Set pulleys to chest height.","Stand with a slight forward lean, arms slightly bent.","Hug a large circle until hands meet in front.","Resist the way back — don't let the stack yank you."],
   w:["Constant tension through the whole range.","Isolates the pecs with minimal tricep help.","Great finisher to pump blood into the muscle."]},
  {n:"Push-Ups",t:["home","gym"],c:"strength",g:"chest",lvl:"Beginner",eq:"Bodyweight",sets:"4 × 10–25",rest:"60 s",p:"pushup",
   s:["Hands under shoulders, body in a straight line.","Lower until chest is a fist above the floor.","Keep elbows at ~45° from your body.","Drive the floor away and lock out."],
   w:["Works chest, triceps and core together.","No equipment — train anywhere, any time.","Scapular movement keeps shoulders healthy."]},
  {n:"Machine Chest Press",t:["gym"],c:"strength",g:"chest",lvl:"Beginner",eq:"Chest press machine",sets:"3 × 10–12",rest:"60 s",p:"bench",
   s:["Adjust the seat so handles hit mid-chest.","Grip and press until arms extend.","Lower slowly until elbows pass the handles.","Keep your back flat on the pad."],
   w:["Safest way for beginners to learn pressing.","Machine path guides perfect form.","Good for training close to failure alone."]},
  {n:"Pec Deck (Butterfly)",t:["gym"],c:"strength",g:"chest",lvl:"Beginner",eq:"Pec deck machine",sets:"3 × 12–15",rest:"60 s",p:"raise",
   s:["Sit with chest proud, elbows level with shoulders.","Bring elbows together in front of you.","Hold the squeeze for one second.","Return slowly without touching the pads."],
   w:["Pure chest isolation without grip demand.","Perfect for mind-muscle connection.","Safe to drop to failure with no spotter."]},
  {n:"Dips (Chest Focus)",t:["home","gym"],c:"strength",g:"chest",lvl:"Intermediate",eq:"Parallel bars / chair",sets:"3 × 8–15",rest:"90 s",p:"dip",
   s:["Grip bars and lift yourself up.","Lean your torso forward about 30°.","Lower until shoulders are just below elbows.","Press up while keeping the forward lean."],
   w:["Builds lower chest and triceps together.","A classic bodyweight strength benchmark.","Load with a weight belt when bodyweight gets easy."]},
  // ===== BACK =====
  {n:"Deadlift",t:["gym"],c:"strength",g:"back",lvl:"Advanced",eq:"Barbell",sets:"4 × 4–6",rest:"3 min",p:"deadlift",
   s:["Stand with mid-foot under the bar, feet hip-width.","Hinge and grip just outside your legs, back flat.","Push the floor away and stand up tall.","Hinge the hips back to lower the bar under control."],
   w:["Works the entire posterior chain — back, glutes, hamstrings.","Builds real-world strength and a thick back.","Hormonal response from loading heavy full-body lifts."]},
  {n:"Bent-Over Barbell Row",t:["gym"],c:"strength",g:"back",lvl:"Intermediate",eq:"Barbell",sets:"4 × 8–10",rest:"2 min",p:"row",
   s:["Hinge to about 45° with a flat back.","Pull the bar to your lower ribs.","Squeeze the shoulder blades together.","Lower under control without rounding."],
   w:["Adds thickness across the whole back.","Balances out all the pushing work.","Strengthens the spinal erectors isometrically."]},
  {n:"Lat Pulldown",t:["gym"],c:"strength",g:"back",lvl:"Beginner",eq:"Cable pulldown",sets:"3 × 10–12",rest:"90 s",p:"pulldown",
   s:["Thighs locked under the pads, slight lean back.","Grip wider than shoulders, pull elbows to hips.","Hold one second, feeling the lats.","Return slowly until arms fully stretch."],
   w:["Builds back width (the V-taper).","Teaches the pulling motion for pull-ups.","Adjustable weight for any level."]},
  {n:"Seated Cable Row",t:["gym"],c:"strength",g:"back",lvl:"Beginner",eq:"Cable row station",sets:"3 × 10–12",rest:"90 s",p:"row",
   s:["Sit tall, feet on the platform, knees soft.","Pull the handle to your navel.","Drive elbows straight back, chest out.","Extend the arms slowly — no torso swinging."],
   w:["Hits mid-back and lats with constant tension.","Vertical torso is easy on the lower back.","Great posture corrector for desk workers."]},
  {n:"Pull-Ups",t:["home","gym"],c:"strength",g:"back",lvl:"Intermediate",eq:"Bar",sets:"4 × AMRAP",rest:"2 min",p:"pullup",
   s:["Grab the bar slightly wider than shoulders.","Pull your chest to the bar, elbows down.","Chin clears the bar at the top.","Lower fully to a dead hang each rep."],
   w:["King of bodywidth back exercises.","Builds lats, biceps and grip at once.","A measurable strength benchmark."]},
  {n:"Lat Pulldown (Close Grip)",t:["gym"],c:"strength",g:"back",lvl:"Beginner",eq:"V-bar attachment",sets:"3 × 10–12",rest:"90 s",p:"pulldown",
   s:["Attach the V-handle and sit down.","Pull the handle to your upper chest.","Keep elbows tucked close to the body.","Stretch fully at the top of the movement."],
   w:["Emphasises the lower lats.","Easier on the shoulders than wide grip.","Good stepping stone toward pull-ups."]},
  {n:"T-Bar Row",t:["gym"],c:"strength",g:"back",lvl:"Intermediate",eq:"T-bar row machine",sets:"4 × 8–10",rest:"2 min",p:"row",
   s:["Lie chest-down on the pad or hinge over the bar.","Pull the handles toward your belly.","Retract shoulder blades hard at the top.","Lower slowly — don't let gravity do the work."],
   w:["Heavy rowing for a thick, dense back.","Chest support protects the lower back.","Hits rhomboids and traps hard."]},
  {n:"Face Pull",t:["gym"],c:"strength",g:"back",lvl:"Beginner",eq:"Rope + cable",sets:"3 × 15–20",rest:"60 s",p:"pulldown",
   s:["Set the pulley to face height.","Pull the rope toward your forehead, elbows high.","Externally rotate so knuckles face back.","Squeeze rear delts for one second."],
   w:["Bulletproofs the shoulders and rotator cuffs.","Counteracts hunched desk posture.","Builds rear delts for 3D shoulders."]},
  // ===== LEGS =====
  {n:"Back Squat",t:["gym"],c:"strength",g:"legs",lvl:"Intermediate",eq:"Barbell + rack",sets:"4 × 6–10",rest:"3 min",p:"squat",
   s:["Bar on upper traps, feet shoulder-width, toes slightly out.","Brace your core and break at hips and knees together.","Descend until thighs are at least parallel.","Drive through mid-foot and stand tall."],
   w:["The #1 lower-body strength and mass builder.","Works quads, glutes, hamstrings and core.","Builds full-body tension and athleticism."]},
  {n:"Front Squat",t:["gym"],c:"strength",g:"legs",lvl:"Advanced",eq:"Barbell",sets:"4 × 6–8",rest:"3 min",p:"squat",
   s:["Bar rests on front delts, elbows high.","Squat straight down with a very upright torso.","Keep knees tracking over toes.","Stand up without dropping the elbows."],
   w:["Quad-dominant with huge core demand.","Forces perfect upright technique.","Carries over directly to Olympic lifts."]},
  {n:"Leg Press",t:["gym"],c:"strength",g:"legs",lvl:"Beginner",eq:"Leg press machine",sets:"4 × 10–15",rest:"2 min",p:"squat",
   s:["Feet mid-platform, shoulder-width apart.","Lower until knees reach 90° without hips lifting.","Press through your whole foot.","Never lock the knees hard at the top."],
   w:["Load the legs heavy with zero back stress.","Safe to train to failure with the safety stops.","Great for adding leg volume fast."]},
  {n:"Romanian Deadlift",t:["gym"],c:"strength",g:"legs",lvl:"Intermediate",eq:"Barbell / dumbbells",sets:"3 × 8–12",rest:"2 min",p:"deadlift",
   s:["Stand tall, soft knees, bar against thighs.","Push your hips back, sliding the bar down the legs.","Go until you feel a deep hamstring stretch.","Squeeze glutes and stand back up."],
   w:["Builds hamstrings and glutes safely.","Teaches the hip hinge — key movement pattern.","Reduces lower-back strain vs conventional deadlift."]},
  {n:"Walking Lunges",t:["home","gym"],c:"strength",g:"legs",lvl:"Beginner",eq:"Bodyweight / dumbbells",sets:"3 × 12 each leg",rest:"90 s",p:"lunge",
   s:["Step forward and lower until both knees hit 90°.","Keep your torso tall, core braced.","Push through the front heel to step through.","Repeat alternating legs as you walk."],
   w:["Trains each leg independently.","Improves balance, coordination and hip mobility.","Burns extra calories from stabiliser work."]},
  {n:"Bulgarian Split Squat",t:["home","gym"],c:"strength",g:"legs",lvl:"Intermediate",eq:"Bench + dumbbells",sets:"3 × 10 each",rest:"90 s",p:"lunge",
   s:["Rear foot up on a bench, front foot a stride ahead.","Lower straight down until the rear knee kisses the floor.","Push through the front heel to stand.","Keep hips square — don't twist."],
   w:["Brutal glute and quad builder per leg.","Fixes side-to-side muscle imbalances.","Low weight, high effect — gentle on the spine."]},
  {n:"Leg Extension",t:["gym"],c:"strength",g:"legs",lvl:"Beginner",eq:"Leg extension machine",sets:"3 × 12–15",rest:"60 s",p:"legraise",
   s:["Align the pad just above your ankles.","Extend fully and squeeze the quads for a second.","Lower slowly — never slam the stack.","Keep hips down on the seat."],
   w:["Isolates the quads for definition.","Safe around knee rehab (light loads).","Great pre-exhaust before squats."]},
  {n:"Lying Leg Curl",t:["gym"],c:"strength",g:"legs",lvl:"Beginner",eq:"Leg curl machine",sets:"3 × 12–15",rest:"60 s",p:"bridge",
   s:["Lie face-down, pad just above heels.","Curl heels toward your glutes.","Squeeze hamstrings at the top.","Lower slowly — don't let the stack drop."],
   w:["Isolates hamstrings to balance quad strength.","Protects knees by strengthening the back of the leg.","Reduces hamstring injury risk in sport."]},
  {n:"Standing Calf Raise",t:["home","gym"],c:"strength",g:"legs",lvl:"Beginner",eq:"Machine / step",sets:"4 × 15–20",rest:"60 s",p:"stairs",
   s:["Balls of your feet on the edge of a step.","Drop heels deep for a full stretch.","Rise as high as possible onto your toes.","Pause at the top, then lower slowly."],
   w:["Builds lower-leg size and stability.","Strong calves improve sprinting and jumping.","Also strengthens the Achilles tendon."]},
  // ===== SHOULDERS =====
  {n:"Overhead Press",t:["gym"],c:"strength",g:"shoulders",lvl:"Intermediate",eq:"Barbell",sets:"4 × 6–10",rest:"2 min",p:"press",
   s:["Bar at collarbone, grip just outside shoulders.","Squeeze glutes and brace, then press straight up.","Move your head back slightly as the bar passes.","Lock out overhead, then lower under control."],
   w:["Builds pressing power and capped delts.","Works triceps and upper chest too.","A true test of upper-body strength."]},
  {n:"Dumbbell Shoulder Press",t:["home","gym"],c:"strength",g:"shoulders",lvl:"Beginner",eq:"Dumbbells / bench",sets:"3 × 8–12",rest:"90 s",p:"press",
   s:["Sit with back supported, dumbbells at ear level.","Press up until arms lock, without clanging.","Lower to just below ear height.","Keep core braced — no arching."],
   w:["Full range of motion past the bar's limit.","Unilateral control keeps both shoulders even.","Easy to adjust weight in small steps."]},
  {n:"Lateral Raise",t:["home","gym"],c:"strength",g:"shoulders",lvl:"Beginner",eq:"Light dumbbells",sets:"4 × 12–20",rest:"60 s",p:"raise",
   s:["Light weights, slight bend in elbows.","Raise out to your sides to shoulder height.","Lead with the elbows, pinkies slightly up.","Lower slowly — 3 seconds down."],
   w:["Isolates the side delts for width.","Creates the broad-shouldered silhouette.","Light weight + high reps works best."]},
  {n:"Front Raise",t:["home","gym"],c:"strength",g:"shoulders",lvl:"Beginner",eq:"Dumbbell / plate",sets:"3 × 12",rest:"60 s",p:"raise",
   s:["Hold a weight in each hand or one plate.","Raise to shoulder height in front of you.","No swinging — torso stays still.","Lower under control."],
   w:["Targets the front delt head.","Adds detail to the front of the shoulder.","Improves overhead stability."]},
  {n:"Reverse Fly (Rear Delt)",t:["gym"],c:"strength",g:"shoulders",lvl:"Beginner",eq:"Dumbbells / machine",sets:"3 × 15",rest:"60 s",p:"row",
   s:["Hinge forward to about 90°, arms hang down.","Raise arms out wide like spreading wings.","Squeeze shoulder blades at the top.","Lower slowly — don't rock."],
   w:["Fills out the rear delt for 3D shoulders.","Balances all the front-delt pressing work.","Improves posture and shoulder health."]},
  {n:"Arnold Press",t:["gym"],c:"strength",g:"shoulders",lvl:"Intermediate",eq:"Dumbbells + bench",sets:"3 × 10",rest:"90 s",p:"press",
   s:["Start with palms facing you at chin height.","Press while rotating palms outward.","Finish with arms locked overhead.","Reverse the rotation on the way down."],
   w:["Hits all three delt heads in one move.","Extra rotation = more time under tension.","Breaks plateaus from normal presses."]},
  {n:"Barbell Shrugs",t:["gym"],c:"strength",g:"shoulders",lvl:"Beginner",eq:"Barbell",sets:"3 × 12–15",rest:"60 s",p:"deadlift",
   s:["Hold the bar at thigh level with a strong grip.","Shrug shoulders straight up toward your ears.","Hold the squeeze for one second.","Lower fully — no rolling the shoulders."],
   w:["Builds the traps for a powerful neck-line.","Improves grip and carrying strength.","Helps stabilise heavy pulls."]},
  // ===== ARMS =====
  {n:"Barbell Curl",t:["gym"],c:"strength",g:"arms",lvl:"Beginner",eq:"Barbell / EZ bar",sets:"3 × 8–12",rest:"60 s",p:"curl",
   s:["Stand tall, elbows pinned to your sides.","Curl the bar to shoulder height.","Squeeze the biceps hard at the top.","Lower slowly — don't swing the weight."],
   w:["The classic mass builder for biceps.","Overloads both arms evenly.","Simple progression — add weight steadily."]},
  {n:"Dumbbell Hammer Curl",t:["home","gym"],c:"strength",g:"arms",lvl:"Beginner",eq:"Dumbbells",sets:"3 × 10–12",rest:"60 s",p:"curl",
   s:["Neutral grip, palms facing each other.","Curl both dumbbells up together.","Keep wrists straight the whole time.","Lower under full control."],
   w:["Targets the brachialis for thicker arms.","Builds forearm and grip strength.","Kindler on wrists than straight-bar curls."]},
  {n:"Tricep Rope Pushdown",t:["gym"],c:"strength",g:"arms",lvl:"Beginner",eq:"Cable + rope",sets:"3 × 12–15",rest:"60 s",p:"pulldown",
   s:["Elbows glued to your sides.","Push the rope down until arms lock.","Spread the rope apart at the bottom.","Return slowly — elbows never move."],
   w:["Constant cable tension on the triceps.","Isolates without shoulder strain.","Spread at the bottom hits the outer head."]},
  {n:"Skull Crushers",t:["gym"],c:"strength",g:"arms",lvl:"Intermediate",eq:"EZ bar / dumbbells",sets:"3 × 8–12",rest:"90 s",p:"bench",
   s:["Lie back, bar over forehead, arms vertical.","Bend only at the elbows, lowering toward your head.","Stop just above the hairline.","Extend back to the start without moving shoulders."],
   w:["Heavy loading for triceps mass.","Long-head focus = bigger-looking arms.","Builds lockout strength for bench press."]},
  {n:"Overhead Tricep Extension",t:["home","gym"],c:"strength",g:"arms",lvl:"Beginner",eq:"One dumbbell",sets:"3 × 10–12",rest:"60 s",p:"press",
   s:["Hold one dumbbell with both hands overhead.","Lower it behind your head, elbows pointing up.","Extend back to full lockout.","Keep elbows narrow — don't flare."],
   w:["Stretches the long head of the triceps.","Builds the horseshoe shape behind the arm.","Works without a bench or cable."]},
  {n:"Preacher Curl",t:["gym"],c:"strength",g:"arms",lvl:"Intermediate",eq:"Preacher bench + bar",sets:"3 × 10–12",rest:"60 s",p:"curl",
   s:["Arms on the pad, armpits snug against the top.","Curl the weight with no body swing.","Squeeze at the top, then lower slowly.","Don't hyperextend at the bottom."],
   w:["Eliminates cheating — strict isolation.","Peak-contraction builder for biceps.","Safe to take near failure alone."]},
  {n:"Diamond Push-Ups",t:["home"],c:"strength",g:"arms",lvl:"Intermediate",eq:"Bodyweight",sets:"3 × 8–15",rest:"60 s",p:"pushup",
   s:["Hands together under your chest forming a diamond.","Lower until chest touches the hands.","Keep elbows tight to your ribs.","Press up and lock the elbows."],
   w:["Hits triceps hard with zero equipment.","Also works inner chest and shoulders.","Progression toward harder calisthenics."]},
  {n:"Bench Dips",t:["home"],c:"strength",g:"arms",lvl:"Beginner",eq:"Chair / bench",sets:"3 × 12–20",rest:"60 s",p:"dip",
   s:["Hands on a bench edge, fingers forward.","Slide hips off the bench, legs extended.","Bend elbows to lower your hips toward the floor.","Press back up until arms lock."],
   w:["Great home triceps builder.","Scalable — bend knees to make it easier.","Also stretches the front shoulders."]},
  // ===== CORE =====
  {n:"Plank",t:["home","gym"],c:"strength",g:"core",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 30–60 s",rest:"45 s",p:"plank",
   s:["Forearms on the floor, elbows under shoulders.","Body forms one straight line head to heels.","Squeeze glutes and brace your abs.","Breathe normally — don't hold your breath."],
   w:["Builds deep core stability for every lift.","Protects the lower back during training.","Improves posture in daily life."]},
  {n:"Hanging Leg Raise",t:["gym"],c:"strength",g:"core",lvl:"Advanced",eq:"Pull-up bar",sets:"3 × 10–15",rest:"90 s",p:"legraise",
   s:["Hang with straight arms, no swinging.","Raise straight legs to at least 90°.","Curl the pelvis up slightly at the top.","Lower slowly — control beats momentum."],
   w:["Hardest move for lower-ab development.","Also crushes grip and lats.","Eliminates momentum teaches true control."]},
  {n:"Russian Twist",t:["home","gym"],c:"strength",g:"core",lvl:"Beginner",eq:"Bodyweight / plate",sets:"3 × 20 total",rest:"60 s",p:"twist",
   s:["Sit with knees bent, lean back to 45°.","Feet off the floor for extra challenge.","Rotate torso and touch the floor beside each hip.","Move from the ribs, not just the arms."],
   w:["Trains the obliques for waist definition.","Improves rotational sports power.","Works the deep stabilisers."]},
  {n:"Bicycle Crunch",t:["home"],c:"strength",g:"core",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 20 total",rest:"45 s",p:"situp",
   s:["Hands light behind your head, lower back pressed down.","Bring right elbow toward left knee.","Straighten the other leg out low.","Alternate smoothly — no yanking the neck."],
   w:["Rated one of the most effective ab exercises.","Hits rectus abdominis + obliques together.","No equipment needed."]},
  {n:"Mountain Climbers",t:["home","gym"],c:"hiit",g:"core",lvl:"Beginner",eq:"Bodyweight",sets:"4 × 30 s",rest:"30 s",p:"climber",
   s:["Start in a strong high-plank position.","Drive one knee toward your chest fast.","Switch legs quickly, like running horizontally.","Keep hips level — don't bounce them up."],
   w:["Core training + cardio in one move.","Spikes heart rate for fat burning.","Builds shoulder stability too."]},
  {n:"Cable Crunch",t:["gym"],c:"strength",g:"core",lvl:"Beginner",eq:"Cable rope",sets:"3 × 12–15",rest:"60 s",p:"twist",
   s:["Kneel under the cable, rope behind your head.","Crunch your ribs toward your hips.","Exhale hard at the bottom of the squeeze.","Return slowly — hips stay still."],
   w:["Allows real weight for ab overload.","Isolates abs while keeping hips fixed.","Adds resistance bodyweight can't match."]},
  {n:"Ab Roller",t:["home","gym"],c:"strength",g:"core",lvl:"Intermediate",eq:"Ab wheel",sets:"3 × 8–12",rest:"60 s",p:"roller",
   s:["Kneel, wheel under shoulders, core braced.","Roll out as far as you can control.","Keep the lower back from sagging.","Pull back with your abs, not your arms."],
   w:["Extreme anti-extension core strength.","Works abs, lats and shoulders together.","Builds an armour-plated midsection."]},
  {n:"Sit-Ups",t:["home"],c:"strength",g:"core",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 20",rest:"45 s",p:"situp",
   s:["Lie down, knees bent, feet anchored.","Curl your spine up one vertebra at a time.","Touch elbows to knees at the top.","Lower slowly — don't flop down."],
   w:["Builds full range-of-motion ab strength.","Scales easily for beginners.","Easy to add sets as you improve."]},
  {n:"Bird Dog",t:["home"],c:"strength",g:"core",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 12 each",rest:"45 s",p:"birds",
   s:["On all fours, spine neutral.","Extend right arm and left leg together.","Hold two seconds without twisting hips.","Return and switch sides."],
   w:["Trains core stability without spinal load.","Great for lower-back rehab and prevention.","Teaches hip and shoulder control."]},
  {n:"Side Plank",t:["home"],c:"strength",g:"core",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 30 s/side",rest:"45 s",p:"plank",
   s:["Lie on your side, elbow under shoulder.","Lift hips into a straight line.","Stack or stagger your feet.","Hold while keeping hips high."],
   w:["Directly targets the obliques.","Strengthens the quadratus lumborum.","Builds anti-lateral-flexion stability."]},
  // ===== FULL BODY / HOME =====
  {n:"Bodyweight Squat",t:["home"],c:"strength",g:"fullbody",lvl:"Beginner",eq:"Bodyweight",sets:"4 × 15–25",rest:"60 s",p:"squat",
   s:["Feet shoulder-width, arms forward.","Sit back and down as if into a chair.","Go to at least parallel with the floor.","Push through mid-foot to stand."],
   w:["The foundation of every leg program.","Masters the pattern before adding weight.","Improves mobility and daily function."]},
  {n:"Pike Push-Up",t:["home"],c:"strength",g:"shoulders",lvl:"Intermediate",eq:"Bodyweight",sets:"3 × 8–12",rest:"60 s",p:"pushup",
   s:["Start in a downward-dog position, hips high.","Bend elbows to lower the crown of your head.","Keep hips piked the whole time.","Press back up to straight arms."],
   w:["Vertical pressing without any weights.","Builds shoulder strength for handstand work.","Also stretches hamstrings and calves."]},
  {n:"Glute Bridge",t:["home"],c:"strength",g:"legs",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 15–20",rest:"45 s",p:"bridge",
   s:["Lie on your back, knees bent, feet flat.","Drive through heels to lift your hips.","Squeeze glutes hard at the top.","Lower slowly without resting on the floor."],
   w:["Wakes up dormant glutes from sitting.","Easy on the lower back.","Great primer before squats or runs."]},
  {n:"Superman Hold",t:["home"],c:"strength",g:"back",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 30 s",rest:"45 s",p:"bridge",
   s:["Lie face down, arms extended overhead.","Lift arms, chest and legs off the floor.","Squeeze glutes and mid-back.","Hold, then lower with control."],
   w:["Strengthens the entire posterior chain.","Fights hunched desk posture.","Protects the lower back."]},
  {n:"Wall Sit",t:["home"],c:"strength",g:"legs",lvl:"Beginner",eq:"Wall",sets:"3 × 30–60 s",rest:"60 s",p:"wallsit",
   s:["Back flat against a wall, slide down to 90°.","Thighs parallel to the floor.","Weight in your heels, hands off legs.","Hold the position and breathe."],
   w:["Builds isometric quad endurance.","Zero impact on knees and joints.","Great finisher with no equipment."]},
  {n:"Inchworm",t:["home"],c:"flexibility",g:"fullbody",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 8",rest:"45 s",p:"inchworm",
   s:["Stand tall, hinge and touch the floor.","Walk your hands out to a plank.","Walk your feet toward your hands (legs straight).","Stand up and repeat."],
   w:["Dynamic warm-up for the whole body.","Stretches hamstrings while activating the core.","Mobilises shoulders and wrists."]},
  {n:"Bear Crawl",t:["home"],c:"strength",g:"fullbody",lvl:"Intermediate",eq:"Bodyweight",sets:"3 × 20 m",rest:"60 s",p:"crawl",
   s:["All fours, knees hovering an inch off the floor.","Move right hand and left foot together.","Keep hips low and back flat.","Crawl forward and backward under control."],
   w:["Full-body coordination and core work.","Builds rock-solid shoulder stability.","Great conditioning without jumping."]},
  {n:"Crab Walk",t:["home"],c:"strength",g:"fullbody",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 20 m",rest:"60 s",p:"crab",
   s:["Sit, hands behind you, hips lifted.","Walk sideways leading with hand and foot.","Keep hips high the whole time.","Reverse direction after each pass."],
   w:["Strengthens triceps, glutes and shoulders.","Fun, low-impact conditioning.","Great mobility drill for the hips."]},
  {n:"Burpees",t:["home","gym"],c:"hiit",g:"fullbody",lvl:"Intermediate",eq:"Bodyweight",sets:"4 × 10–15",rest:"45 s",p:"burpee",
   s:["Drop into a squat and kick feet back to plank.","Do a full push-up (optional).","Snap feet back to your hands.","Jump up with arms overhead."],
   w:["Burns maximum calories in minimum time.","Works every major muscle group.","Builds explosive conditioning."]},
  {n:"Jumping Jacks",t:["home","gym"],c:"cardio",g:"fullbody",lvl:"Beginner",eq:"Bodyweight",sets:"3 × 60 s",rest:"30 s",p:"jack",
   s:["Stand tall, arms at your sides.","Jump feet wide while raising arms overhead.","Jump back to the start position.","Keep a light, springy rhythm."],
   w:["Perfect warm-up to raise heart rate.","Full-body low-skill cardio.","Improves coordination and rhythm."]},
  {n:"Squat Jumps",t:["home"],c:"hiit",g:"legs",lvl:"Intermediate",eq:"Bodyweight",sets:"4 × 12",rest:"45 s",p:"jump",
   s:["Squat to parallel with arms back.","Explode up as high as you can.","Land softly with bent knees.","Immediately sink into the next rep."],
   w:["Builds explosive power in the legs.","High calorie burn in short bursts.","Improves sprinting and jumping ability."]},
  {n:"Box Jumps",t:["gym"],c:"hiit",g:"legs",lvl:"Intermediate",eq:"Plyo box",sets:"4 × 8",rest:"90 s",p:"jump",
   s:["Stand a foot from a stable box.","Swing arms and jump onto the box.","Land softly in a quarter squat.","Step down — never jump down tired."],
   w:["Trains fast-twitch muscle fibers.","Develops rate of force (athleticism).","Sharpens coordination and agility."]},
  {n:"Tuck Jumps",t:["home"],c:"hiit",g:"fullbody",lvl:"Advanced",eq:"Bodyweight",sets:"4 × 10",rest:"45 s",p:"jump",
   s:["Start standing with arms ready.","Jump up and pull both knees to your chest.","Land soft with bent knees.","Reset briefly, then go again."],
   w:["Explosive full-body calorie burner.","Maximal lower-body power output.","Spikes heart rate fast for conditioning."]},
  {n:"High Knees",t:["home","gym"],c:"hiit",g:"fullbody",lvl:"Beginner",eq:"Bodyweight",sets:"4 × 30 s",rest:"30 s",p:"highknees",
   s:["Run in place driving knees to hip height.","Stay on the balls of your feet.","Swing arms in rhythm with your legs.","Keep your chest tall — don't lean back."],
   w:["Fast cardio + hip-flexor activation.","Great finisher after lifting.","Improves running mechanics."]},
  {n:"Jump Rope",t:["home","gym"],c:"cardio",g:"fullbody",lvl:"Beginner",eq:"Rope",sets:"3 × 2–3 min",rest:"45 s",p:"rope",
   s:["Elbows close, spin from the wrists, not arms.","Jump just high enough for the rope to pass.","Land softly on the balls of your feet.","Keep a steady rhythm and breathe."],
   w:["Elite conditioning with tiny footprint.","Burns ~10–15 kcal per minute.","Builds calf endurance and coordination."]},
  {n:"Plank Jacks",t:["home"],c:"hiit",g:"core",lvl:"Intermediate",eq:"Bodyweight",sets:"4 × 30 s",rest:"30 s",p:"plank",
   s:["Hold a solid forearm plank.","Jump feet wide apart.","Jump them back together.","Keep hips still — no bouncing."],
   w:["Core stability + cardio together.","Keeps abs under tension while heart rate climbs.","Sculpts waist while burning fat."]},
  // ===== CARDIO MACHINES =====
  {n:"Treadmill Run",t:["gym"],c:"cardio",g:"fullbody",lvl:"Beginner",eq:"Treadmill",sets:"20–40 min",rest:"—",p:"run",
   s:["Warm up with a 5-min brisk walk.","Set a pace where you can speak in short phrases.","Run with upright posture, mid-foot strike.","Cool down with a walk and stretch."],
   w:["Best all-round calorie torcher.","Strengthens heart and lungs.","Builds running endurance safely."]},
  {n:"Cycling / Spin Bike",t:["gym","home"],c:"cardio",g:"legs",lvl:"Beginner",eq:"Bike",sets:"20–45 min",rest:"—",p:"bike",
   s:["Set seat height so knee has slight bend at bottom.","Keep a light grip on the handles.","Pedal in smooth circles, cadence 70–90 rpm.","Add resistance for climbs, keep posture tall."],
   w:["Zero-impact cardio for heavy people.","Builds quad and calf endurance.","Great on knee-rehab days."]},
  {n:"Rowing Machine",t:["gym"],c:"cardio",g:"back",lvl:"Intermediate",eq:"Rower",sets:"20–30 min",rest:"—",p:"rower",
   s:["Drive with legs first, then lean back, then pull to ribs.","Reverse the order on the return: arms, lean, legs.","Keep the chain path level.","Aim for 24–28 strokes per minute."],
   w:["Full-body — legs 60%, back 30%, arms 10%.","Incredible conditioning with low impact.","Burns serious calories per hour."]},
  {n:"Stair Climber",t:["gym"],c:"cardio",g:"legs",lvl:"Beginner",eq:"Stair machine",sets:"15–30 min",rest:"—",p:"stairs",
   s:["Stand tall, don't hunch on the handrails.","Full steps — entire foot lands on each stair.","Keep a steady climbing rhythm.","Resistance up = more glute work."],
   w:["Tones glutes, hamstrings and calves.","High calorie burn with no jumping.","Builds lower-body muscular endurance."]},
  {n:"Elliptical Trainer",t:["gym"],c:"cardio",g:"fullbody",lvl:"Beginner",eq:"Elliptical",sets:"20–40 min",rest:"—",p:"bike",
   s:["Set resistance — don't just coast.","Push and pull the handles with your arms.","Keep heels down on the pedals.","Maintain an upright, tall posture."],
   w:["Low-impact, joint-friendly cardio.","Works upper and lower body together.","Easy to sustain for long sessions."]},
  {n:"Battle Ropes",t:["gym"],c:"hiit",g:"fullbody",lvl:"Intermediate",eq:"Battle ropes",sets:"6 × 20 s",rest:"40 s",p:"jack",
   s:["Hold one rope in each hand, athletic stance.","Create waves by alternating arms fast.","Slam both ropes together for power waves.","Keep core tight — don't arch the back."],
   w:["Explosive full-body conditioning.","Massive calorie burn in short rounds.","Builds shoulder and grip endurance."]},
  // ===== FLEXIBILITY =====
  {n:"Cat-Cow Stretch",t:["home"],c:"flexibility",g:"back",lvl:"Beginner",eq:"Mat",sets:"2 × 10",rest:"—",p:"catcow",
   s:["On all fours, hands under shoulders.","Inhale — drop belly, lift chest and tailbone.","Exhale — round spine to the ceiling.","Move slowly with your breath."],
   w:["Mobilises the entire spine.","Relieves back stiffness from sitting.","Perfect warm-up before lifting."]},
  {n:"Child's Pose",t:["home"],c:"flexibility",g:"back",lvl:"Beginner",eq:"Mat",sets:"2 × 45 s",rest:"—",p:"child",
   s:["Kneel, big toes together, knees wide.","Sit hips back toward your heels.","Walk hands forward, forehead on the floor.","Breathe deep into your back ribs."],
   w:["Gentle stretch for hips, thighs and ankles.","Calms the nervous system.","Releases lower-back tension."]},
  {n:"Downward Dog",t:["home"],c:"flexibility",g:"fullbody",lvl:"Beginner",eq:"Mat",sets:"3 × 30 s",rest:"—",p:"downdog",
   s:["From all fours, lift hips high to an inverted V.","Press chest toward thighs, heels toward floor.","Spread fingers wide, arms straight.","Hold and breathe evenly."],
   w:["Stretches hamstrings, calves and shoulders.","Builds shoulder and arm strength.","Energises the whole body."]},
  {n:"Seated Hamstring Stretch",t:["home"],c:"flexibility",g:"legs",lvl:"Beginner",eq:"Mat",sets:"2 × 45 s/side",rest:"—",p:"stretch",
   s:["Sit with one leg out, other foot against inner thigh.","Hinge forward from the hips, back long.","Reach toward your shin — not the toes.","Hold without bouncing."],
   w:["Relieves tight hamstrings and lower back.","Improves squat depth and deadlift form.","Reduces post-workout soreness."]},
  {n:"Cobra Stretch",t:["home"],c:"flexibility",g:"back",lvl:"Beginner",eq:"Mat",sets:"2 × 30 s",rest:"—",p:"cobra",
   s:["Lie face down, palms under shoulders.","Press up, lifting chest while hips stay down.","Keep elbows slightly bent, shoulders down.","Look gently forward and breathe."],
   w:["Stretches abs and hip flexors.","Counters the hunched sitting posture.","Mobilises the lumbar spine."]},
  {n:"Standing Quad Stretch",t:["home"],c:"flexibility",g:"legs",lvl:"Beginner",eq:"None",sets:"2 × 30 s/side",rest:"—",p:"stretch",
   s:["Stand tall, hold a wall if needed.","Pull one heel toward your glute.","Keep knees together and hips pushed forward.","Hold, then switch legs."],
   w:["Releases tight quads from squats and sitting.","Improves knee health and stride length.","Quick to do anywhere."]},
  {n:"Pigeon Pose",t:["home"],c:"flexibility",g:"legs",lvl:"Intermediate",eq:"Mat",sets:"2 × 60 s/side",rest:"—",p:"child",
   s:["From plank, bring right knee behind right wrist.","Extend the left leg straight back.","Square the hips and fold forward.","Breathe into the deep glute stretch."],
   w:["The deepest common hip-opener.","Eases sciatica and glute tightness.","Improves squat and lunge depth."]},
  {n:"Hip Flexor Stretch (Kneeling)",t:["home"],c:"flexibility",g:"legs",lvl:"Beginner",eq:"Mat",sets:"2 × 45 s/side",rest:"—",p:"lunge",
   s:["Kneel with front foot planted, back knee down.","Tuck the pelvis and shift weight forward.","Feel the stretch at the front of the back hip.","Keep chest tall — don't lean forward."],
   w:["Releases hip flexors shortened by sitting.","Restores proper squat and running mechanics.","Reduces lower-back strain."]},
  {n:"Chest Doorway Stretch",t:["home"],c:"flexibility",g:"chest",lvl:"Beginner",eq:"Doorway",sets:"2 × 45 s",rest:"—",p:"raise",
   s:["Place forearm on a doorframe, elbow at 90°.","Step through gently until you feel the stretch.","Keep the shoulder down, away from the ear.","Hold, then switch arms."],
   w:["Opens the chest after pressing workouts.","Improves overhead reach and posture.","Relieves shoulder-rounding tension."]},
  {n:"Shoulder Pass-Through",t:["home"],c:"flexibility",g:"shoulders",lvl:"Beginner",eq:"Towel / stick",sets:"2 × 10",rest:"—",p:"press",
   s:["Hold a towel wide overhead with straight arms.","Slowly rotate arms back over your head and behind you.","Go only as far as it stays comfortable.","Reverse back to the start."],
   w:["Deep shoulder mobility drill.","Prepares shoulders for overhead lifts.","Improves posture and range of motion."]},
  {n:"Neck Rolls & Shoulder Rolls",t:["home"],c:"flexibility",g:"shoulders",lvl:"Beginner",eq:"None",sets:"2 × 8 each way",rest:"—",p:"catcow",
   s:["Sit or stand tall, drop chin to chest.","Roll the head slowly in a half-circle ear-to-ear.","Then roll shoulders up, back and down.","Never roll the head fully backward."],
   w:["Releases neck and trap tension fast.","Great desk-break reset.","Improves blood flow to the upper body."]}
];

/* ---------- TIPS ---------- */
const TIPS = [
  "Aim for 0.7–1 g of water per kg of bodyweight, plus 500 ml per workout day.",
  "Eat protein with every meal — it keeps you full and protects muscle.",
  "Log food BEFORE you eat it — you make better choices when you see the numbers.",
  "Take a 10-minute walk after meals to blunt the blood-sugar spike.",
  "Sleep 7–9 hours — recovery is where the results actually happen.",
  "Progressive overload: add a rep or a little weight every week."
];


/* ---------- FOOD TAGS: veg / non-veg + variety categories ---------- */
const NONVEG_FOODS = new Set(['Boiled Egg','Egg White','Omelette','Egg Bhurji','Egg Curry','Chicken Breast (cooked)','Butter Chicken','Chicken Curry','Tandoori Chicken','Chicken Seekh Kebab','Fish Fry','Fish Curry (Rohu)','Grilled Prawns','Chicken Biryani','Chicken Burger']);
const FOOD_CATS = {
  'Boiled Egg':'healthy|protein','Egg White':'healthy|protein','Omelette':'oily|protein','Egg Bhurji':'oily|protein','Egg Curry':'oily|main',
  'Chicken Breast (cooked)':'healthy|protein','Butter Chicken':'oily|main','Chicken Curry':'oily|main','Tandoori Chicken':'healthy|protein',
  'Chicken Seekh Kebab':'oily|snack|protein','Fish Fry':'oily|protein','Fish Curry (Rohu)':'oily|main','Grilled Prawns':'healthy|protein',
  'Paneer':'healthy|protein|dairy','Palak Paneer':'healthy|main','Paneer Butter Masala':'oily|main','Paneer Tikka':'healthy|protein','Tofu':'healthy|protein',
  'Greek Yogurt':'healthy|dairy|snack','Curd (Dahi)':'healthy|dairy','Toned Milk':'healthy|dairy|drink','Cheese Slice':'dairy|snack',
  'Whey Protein Shake':'protein|drink','Protein Bar':'snack|protein',
  'Roti / Chapati':'grain|main','Paratha (Aloo)':'oily|grain','Thepla':'grain|snack','Puri (2 pc)':'oily|grain',
  'White Rice (cooked)':'grain|main','Basmati Rice (cooked)':'grain|main','Brown Rice (cooked)':'healthy|grain|main','Jeera Rice':'grain|main',
  'Veg Biryani':'main|grain','Chicken Biryani':'main|grain','Poha':'grain|main','Upma':'grain|main','Idli (2 pc)':'healthy|grain',
  'Plain Dosa':'grain','Masala Dosa':'oily|grain','Medu Vada (2 pc)':'oily|snack','Samosa (1 pc)':'junk|snack','Pav Bhaji':'junk|main',
  'Vada Pav':'junk|snack','Pani Puri':'junk|snack','Chole':'healthy|protein|main','Rajma':'healthy|protein|main','Dal Tadka':'healthy|protein|main',
  'Dal Fry':'healthy|main','Sambar':'healthy|main','Kadhi':'main','Mix Veg Sabzi':'healthy|main','Aloo Gobi':'healthy|main','Baingan Bharta':'healthy|main',
  'Bhindi Fry':'oily','Sabudana Khichdi':'grain','Oats (dry)':'healthy|grain','Cornflakes':'grain|snack','Muesli':'healthy|grain|snack',
  'Bread (White)':'grain','Brown Bread':'healthy|grain','Peanut Butter':'healthy|protein|snack','Almonds (8 pc)':'healthy|snack',
  'Walnuts':'healthy|snack','Cashews':'healthy|snack',
  'Banana':'fruit','Apple':'fruit','Orange':'fruit','Mango':'fruit','Papaya':'fruit','Watermelon':'fruit','Pomegranate':'fruit','Guava':'fruit','Grapes':'fruit',
  'Chocolate':'junk|dessert|snack','Ice Cream':'junk|dessert','Cheese Pizza (1 slice)':'junk','Veg Burger':'junk','Chicken Burger':'junk',
  'French Fries':'junk|oily|snack','Veg Momos (4 pc)':'snack','Veg Noodles':'junk','Fried Rice':'oily|main','Veg Manchurian':'junk|snack',
  'Chai (milk tea)':'drink','Coffee (black)':'drink','Green Tea':'drink|healthy','Cold Drink':'junk|drink','Orange Juice':'drink|fruit',
  'Lassi':'drink|dairy','Buttermilk':'drink|dairy|healthy','Honey':'dessert','Sugar':'dessert','Ghee':'oily','Vegetable Oil':'oily','Mango Lassi':'drink|dessert'
};
function foodTags(name){
  return { veg: !NONVEG_FOODS.has(name), cats: (FOOD_CATS[name]||'other').split('|') };
}

/* ---------- MICRONUTRIENTS (estimate per 100 g) ---------- */
const NUTRIENT_RDA = [
  {k:'protein',   l:'Protein',            u:'g',    rda:60,  note:'body-weight based; see your macro goal'},
  {k:'carbs',     l:'Carbohydrates',      u:'g',    rda:260},
  {k:'fat',       l:'Total Fat',          u:'g',    rda:78},
  {k:'satfat',    l:'Saturated Fat',      u:'g',    rda:20,  warn:1},
  {k:'fiber',     l:'Dietary Fiber',      u:'g',    rda:30},
  {k:'sugar',     l:'Sugars',             u:'g',    rda:50,  warn:1},
  {k:'omega3',    l:'Omega-3 (ALA+EPA/DHA)', u:'mg', rda:1000},
  {k:'omega6',    l:'Omega-6',            u:'mg',   rda:10000},
  {k:'cholesterol',l:'Cholesterol',       u:'mg',   rda:300, warn:1},
  {k:'sodium',    l:'Sodium (Salt)',      u:'mg',   rda:2300, warn:1},
  {k:'potassium', l:'Potassium',          u:'mg',   rda:3500},
  {k:'calcium',   l:'Calcium',            u:'mg',   rda:1000},
  {k:'iron',      l:'Iron',               u:'mg',   rda:18},
  {k:'magnesium', l:'Magnesium',          u:'mg',   rda:420},
  {k:'zinc',      l:'Zinc',               u:'mg',   rda:11},
  {k:'phosphorus',l:'Phosphorus',         u:'mg',   rda:700},
  {k:'selenium',  l:'Selenium',           u:'mcg',  rda:55},
  {k:'vitA',      l:'Vitamin A',          u:'mcg',  rda:900},
  {k:'vitC',      l:'Vitamin C',          u:'mg',   rda:90},
  {k:'vitD',      l:'Vitamin D',          u:'mcg',  rda:20},
  {k:'vitE',      l:'Vitamin E',          u:'mg',   rda:15},
  {k:'vitB12',    l:'Vitamin B12',        u:'mcg',  rda:2.4},
  {k:'vitB6',     l:'Vitamin B6',         u:'mg',   rda:1.7},
  {k:'folate',    l:'Folate (B9)',        u:'mcg',  rda:400},
  {k:'thiamin',   l:'Thiamin (B1)',       u:'mg',   rda:1.2},
  {k:'riboflavin',l:'Riboflavin (B2)',    u:'mg',   rda:1.3},
  {k:'niacin',    l:'Niacin (B3)',        u:'mg',   rda:16}
];
const MICRO_CLASS = {
  egg:      {satfat:3.3,sugar:1,fiber:0,omega3:200,omega6:700,cholesterol:370,sodium:140,potassium:130,calcium:50,iron:1.8,magnesium:11,zinc:1.3,phosphorus:170,selenium:31,vitA:140,vitC:0,vitD:2,vitE:1.1,vitB12:1.1,vitB6:0.12,folate:44,thiamin:0.04,riboflavin:0.5,niacin:0.1},
  poultry:  {satfat:1,sugar:0,fiber:0,omega3:70,omega6:250,cholesterol:85,sodium:70,potassium:280,calcium:12,iron:0.7,magnesium:25,zinc:1,phosphorus:220,selenium:22,vitA:10,vitC:0,vitD:0.1,vitE:0.3,vitB12:0.3,vitB6:0.4,folate:8,thiamin:0.06,riboflavin:0.1,niacin:8},
  fish:     {satfat:0.8,sugar:0,fiber:0,omega3:1500,omega6:150,cholesterol:60,sodium:80,potassium:300,calcium:20,iron:0.5,magnesium:25,zinc:0.5,phosphorus:200,selenium:35,vitA:15,vitC:0,vitD:5,vitE:0.5,vitB12:2,vitB6:0.3,folate:10,thiamin:0.1,riboflavin:0.1,niacin:4},
  dairy:    {satfat:2,sugar:5,fiber:0,omega3:30,omega6:100,cholesterol:10,sodium:50,potassium:150,calcium:120,iron:0,magnesium:10,zinc:0.4,phosphorus:100,selenium:4,vitA:50,vitC:0,vitD:1.5,vitE:0.1,vitB12:0.5,vitB6:0.06,folate:12,thiamin:0.05,riboflavin:0.2,niacin:0.1},
  cheese:   {satfat:16,sugar:1,fiber:0,omega3:60,omega6:400,cholesterol:95,sodium:700,potassium:100,calcium:500,iron:0.2,magnesium:20,zinc:2.5,phosphorus:350,selenium:15,vitA:250,vitC:0,vitD:0.6,vitE:0.7,vitB12:1.5,vitB6:0.1,folate:25,thiamin:0.03,riboflavin:0.4,niacin:0.1},
  paneer:   {satfat:6,sugar:1,fiber:0,omega3:40,omega6:300,cholesterol:25,sodium:25,potassium:120,calcium:200,iron:0.4,magnesium:20,zinc:0.6,phosphorus:150,selenium:5,vitA:80,vitC:0,vitD:0.2,vitE:0.2,vitB12:0.4,vitB6:0.04,folate:10,thiamin:0.02,riboflavin:0.2,niacin:0.1},
  tofu:     {satfat:0.7,sugar:0.5,fiber:1,omega3:200,omega6:1000,cholesterol:0,sodium:5,potassium:150,calcium:150,iron:2,magnesium:30,zinc:1,phosphorus:130,selenium:10,vitA:0,vitC:0.1,vitD:0,vitE:0.5,vitB12:0,vitB6:0.05,folate:15,thiamin:0.06,riboflavin:0.1,niacin:0.4},
  legume:   {satfat:0.2,sugar:1,fiber:8,omega3:100,omega6:500,cholesterol:0,sodium:5,potassium:350,calcium:50,iron:2.5,magnesium:45,zinc:1.2,phosphorus:170,selenium:5,vitA:0,vitC:1,vitD:0,vitE:0.2,vitB12:0,vitB6:0.15,folate:180,thiamin:0.2,riboflavin:0.1,niacin:1.5},
  grain:    {satfat:0.3,sugar:0.5,fiber:3,omega3:30,omega6:300,cholesterol:0,sodium:5,potassium:80,calcium:15,iron:1,magnesium:25,zinc:0.5,phosphorus:80,selenium:8,vitA:0,vitC:0,vitD:0,vitE:0.3,vitB12:0,vitB6:0.1,folate:35,thiamin:0.2,riboflavin:0.06,niacin:2},
  fruit:    {satfat:0.1,sugar:10,fiber:2.5,omega3:20,omega6:50,cholesterol:0,sodium:2,potassium:200,calcium:12,iron:0.3,magnesium:12,zinc:0.1,phosphorus:15,selenium:0.5,vitA:30,vitC:30,vitD:0,vitE:0.5,vitB12:0,vitB6:0.1,folate:20,thiamin:0.04,riboflavin:0.03,niacin:0.5},
  veg:      {satfat:0.2,sugar:2,fiber:3,omega3:40,omega6:150,cholesterol:0,sodium:10,potassium:250,calcium:40,iron:1,magnesium:20,zinc:0.4,phosphorus:40,selenium:1,vitA:80,vitC:20,vitD:0,vitE:1,vitB12:0,vitB6:0.15,folate:60,thiamin:0.06,riboflavin:0.06,niacin:0.8},
  nut:      {satfat:5,sugar:4,fiber:7,omega3:50,omega6:12000,cholesterol:0,sodium:5,potassium:450,calcium:70,iron:2,magnesium:130,zinc:2.5,phosphorus:250,selenium:5,vitA:0,vitC:1,vitD:0,vitE:6,vitB12:0,vitB6:0.2,folate:40,thiamin:0.4,riboflavin:0.2,niacin:1},
  junk:     {satfat:8,sugar:6,fiber:1,omega3:50,omega6:4000,cholesterol:30,sodium:450,potassium:120,calcium:20,iron:0.8,magnesium:15,zinc:0.6,phosphorus:60,selenium:3,vitA:10,vitC:2,vitD:0,vitE:1,vitB12:0.2,vitB6:0.1,folate:20,thiamin:0.1,riboflavin:0.1,niacin:2},
  drink:    {satfat:0.2,sugar:8,fiber:0,omega3:10,omega6:30,cholesterol:1,sodium:10,potassium:80,calcium:20,iron:0.2,magnesium:8,zinc:0.1,phosphorus:20,selenium:0.5,vitA:10,vitC:20,vitD:0.3,vitE:0.1,vitB12:0.1,vitB6:0.03,folate:15,thiamin:0.02,riboflavin:0.08,niacin:0.3},
  sweet:    {satfat:6,sugar:35,fiber:0.5,omega3:20,omega6:500,cholesterol:15,sodium:50,potassium:80,calcium:60,iron:0.5,magnesium:10,zinc:0.5,phosphorus:60,selenium:1,vitA:60,vitC:0,vitD:0.3,vitE:0.5,vitB12:0.3,vitB6:0.03,folate:10,thiamin:0.03,riboflavin:0.15,niacin:0.2},
  oil:      {satfat:60,sugar:0,fiber:0,omega3:400,omega6:10000,cholesterol:250,sodium:0,potassium:0,calcium:0,iron:0,magnesium:0,zinc:0,phosphorus:0,selenium:0,vitA:800,vitC:0,vitD:2,vitE:4,vitB12:0,vitB6:0,folate:0,thiamin:0,riboflavin:0,niacin:0},
  protein:  {satfat:2,sugar:3,fiber:1,omega3:80,omega6:400,cholesterol:15,sodium:180,potassium:200,calcium:150,iron:1,magnesium:40,zinc:1.5,phosphorus:200,selenium:10,vitA:20,vitC:0,vitD:1,vitE:1,vitB12:1,vitB6:0.5,folate:50,thiamin:0.3,riboflavin:0.4,niacin:3}
};
const FOOD_CLASS = {
  'Boiled Egg':'egg','Egg White':'egg','Omelette':'egg','Egg Bhurji':'egg','Egg Curry':'egg',
  'Chicken Breast (cooked)':'poultry','Butter Chicken':'poultry','Chicken Curry':'poultry','Tandoori Chicken':'poultry','Chicken Seekh Kebab':'poultry',
  'Fish Fry':'fish','Fish Curry (Rohu)':'fish','Grilled Prawns':'fish',
  'Paneer':'paneer','Palak Paneer':'paneer','Paneer Butter Masala':'paneer','Paneer Tikka':'paneer','Tofu':'tofu',
  'Greek Yogurt':'dairy','Curd (Dahi)':'dairy','Toned Milk':'dairy','Cheese Slice':'cheese','Whey Protein Shake':'protein','Protein Bar':'protein',
  'Roti / Chapati':'grain','Paratha (Aloo)':'grain','Thepla':'grain','Puri (2 pc)':'grain','White Rice (cooked)':'grain','Basmati Rice (cooked)':'grain',
  'Brown Rice (cooked)':'grain','Jeera Rice':'grain','Veg Biryani':'grain','Chicken Biryani':'poultry','Poha':'grain','Upma':'grain','Idli (2 pc)':'grain',
  'Plain Dosa':'grain','Masala Dosa':'grain','Medu Vada (2 pc)':'junk','Samosa (1 pc)':'junk','Pav Bhaji':'veg','Vada Pav':'junk','Pani Puri':'junk',
  'Chole':'legume','Rajma':'legume','Dal Tadka':'legume','Dal Fry':'legume','Sambar':'legume','Kadhi':'dairy','Mix Veg Sabzi':'veg','Aloo Gobi':'veg',
  'Baingan Bharta':'veg','Bhindi Fry':'veg','Sabudana Khichdi':'grain','Oats (dry)':'grain','Cornflakes':'grain','Muesli':'grain','Bread (White)':'grain',
  'Brown Bread':'grain','Peanut Butter':'nut','Almonds (8 pc)':'nut','Walnuts':'nut','Cashews':'nut',
  'Banana':'fruit','Apple':'fruit','Orange':'fruit','Mango':'fruit','Papaya':'fruit','Watermelon':'fruit','Pomegranate':'fruit','Guava':'fruit','Grapes':'fruit',
  'Chocolate':'sweet','Ice Cream':'sweet','Cheese Pizza (1 slice)':'junk','Veg Burger':'junk','Chicken Burger':'junk','French Fries':'junk',
  'Veg Momos (4 pc)':'grain','Veg Noodles':'junk','Fried Rice':'grain','Veg Manchurian':'junk',
  'Chai (milk tea)':'drink','Coffee (black)':'drink','Green Tea':'drink','Cold Drink':'drink','Orange Juice':'fruit','Lassi':'dairy','Buttermilk':'dairy',
  'Honey':'sweet','Sugar':'sweet','Ghee':'oil','Vegetable Oil':'oil','Mango Lassi':'sweet'
};
const MICRO_OVERRIDE = {
  'Banana':{potassium:358,vitC:9,vitB6:0.4,fiber:3,sugar:12,folate:20,magnesium:32},
  'Orange':{potassium:237,vitC:53,fiber:2,sugar:9,vitA:200},
  'Guava':{potassium:417,vitC:62,fiber:5,vitA:310,folate:40},
  'Papaya':{potassium:257,vitC:43,vitA:47,folate:38},
  'Pomegranate':{potassium:360,vitC:17,fiber:4,folate:38},
  'Apple':{potassium:165,vitC:5,fiber:2.4,sugar:10},
  'Watermelon':{potassium:170,vitC:8,sugar:6},
  'Mango':{potassium:277,vitC:37,vitA:54,folate:43,sugar:14},
  'Grapes':{potassium:288,vitC:3,sugar:16},
  'Oats (dry)':{fiber:11,iron:4.7,magnesium:177,zinc:4,folate:56,thiamin:0.8},
  'Peanut Butter':{fiber:6,potassium:649,magnesium:154,zinc:2.9,vitE:6},
  'Almonds (8 pc)':{calcium:96,magnesium:107,vitE:7,fiber:4},
  'Walnuts':{omega3:9000,omega6:11000,magnesium:158},
  'Cashews':{magnesium:292,iron:6.7,zinc:5.8},
  'Toned Milk':{calcium:120,vitB12:0.5,vitD:1.5},
  'Curd (Dahi)':{calcium:110,vitB12:0.4,probiotics_note:1},
  'Greek Yogurt':{calcium:110,vitB12:0.7,potassium:141},
  'Cheese Slice':{calcium:520,calcium_note:1},
  'Whey Protein Shake':{calcium:160,vitB12:1.2,iron:1},
  'Chicken Breast (cooked)':{potassium:320,vitB6:0.6,selenium:28},
  'Fish Curry (Rohu)':{omega3:1200,iodine_note:1},
  'Grilled Prawns':{omega3:900,selenium:40},
  'Dal Tadka':{folate:200,iron:2.8},
  'Chole':{folate:220,iron:3.2,fiber:9},
  'Rajma':{folate:190,iron:3,protein_note:1},
  'Green Tea':{vitC:0,sugar:0,antioxidant_note:1},
  'Cold Drink':{sugar:11,sodium:15},
  'Ghee':{vitA:840,satfat:60},
  'Buttermilk':{calcium:110,sodium:40}
};
const FOOD_MICRO = {};
(function(){
  for (const f of FOODS) {
    const base = { ...(MICRO_CLASS[FOOD_CLASS[f.n]] || MICRO_CLASS.veg) };
    Object.assign(base, MICRO_OVERRIDE[f.n] || {});
    FOOD_MICRO[f.n] = base;
  }
})();

/* ---------- more workouts ---------- */
const WORKOUTS2 = [
  {n:'Barbell Back Squat',t:['gym'],c:'strength',g:'legs',lvl:'Intermediate',eq:'Barbell + rack',sets:'4 × 6–8',rest:'2–3 min',p:'squat',
   s:['Set the bar on the rack at upper-chest height and grip it evenly.','Step under the bar, rest it on your traps, unrack and step back.','Sit down and back until thighs reach parallel, knees tracking over toes.','Drive through mid-foot and squeeze glutes at the top.'],
   w:['King of all leg exercises — quads, glutes and hamstrings together.','Builds total-body strength and bone density.','Carries over to sprinting, jumping and everyday lifting.']},
  {n:'Front Squat',t:['gym'],c:'strength',g:'legs',lvl:'Advanced',eq:'Barbell',sets:'4 × 5–8',rest:'2–3 min',p:'goblet',
   s:['Rack the bar on your front delts, elbows high, fingertips under the bar.','Brace your core hard and squat straight down.','Keep your torso tall — elbows must not drop.','Stand up tall and reset your brace each rep.'],
   w:['Hits the quads and upper back harder than a back squat.','Teaches an upright, safe squat posture.','Great accessory for improving your regular squat.']},
  {n:'Romanian Deadlift',t:['gym'],c:'strength',g:'legs',lvl:'Intermediate',eq:'Barbell',sets:'3 × 8–10',rest:'2 min',p:'deadlift',
   s:['Hold the bar at your hips with a shoulder-width grip.','Push your hips back and slide the bar down your thighs.','Lower until you feel a deep hamstring stretch (mid-shin is plenty).','Squeeze your glutes and drive hips forward to stand.'],
   w:['Best builder of hamstrings and glutes.','Teaches a strong hip hinge that protects your lower back.','Improves posture and deadlift lockout.']},
  {n:'Incline Dumbbell Press',t:['gym'],c:'strength',g:'chest',lvl:'Intermediate',eq:'Dumbbells + incline bench',sets:'3 × 8–12',rest:'90 s',p:'bench',
   s:['Set the bench to about a 30° incline and sit back with a dumbbell on each thigh.','Kick the weights up and hold them at shoulder level.','Lower slowly until your elbows are just below your chest.','Press up and slightly together without clanging the weights.'],
   w:['Builds the upper chest for a fuller, rounder look.','More shoulder-friendly than flat bench for many people.','Unilateral work fixes left/right strength gaps.']},
  {n:'Lat Pulldown',t:['gym'],c:'strength',g:'back',lvl:'Beginner',eq:'Cable pulldown machine',sets:'3 × 10–12',rest:'90 s',p:'pulldown',
   s:['Sit and lock your thighs under the pad.','Grip the bar wider than shoulders, lean back slightly.','Pull the bar to your upper chest, elbows down and back.','Control the bar back up until arms are fully stretched.'],
   w:['Builds back width (the V-taper look).','A safer progression toward pull-ups.','Improves posture by strengthening the mid-back.']},
  {n:'Pull-Up',t:['gym','home'],c:'strength',g:'back',lvl:'Intermediate',eq:'Pull-up bar',sets:'3 × max',rest:'2 min',p:'pullup',
   s:['Grab the bar slightly wider than shoulders, hang with straight arms.','Pull your chest toward the bar by driving elbows down.','Keep your core braced — no swinging or kipping.','Lower yourself slowly to a full hang.'],
   w:['Best bodyweight test of relative upper-body strength.','Works lats, biceps, rear delts and grip at once.','Master this and rows/dips feel easy.']},
  {n:'Cable Chest Fly',t:['gym'],c:'strength',g:'chest',lvl:'Beginner',eq:'Cable machine',sets:'3 × 12–15',rest:'60 s',p:'bench',
   s:['Set both pulleys slightly above shoulder height.','Step forward into a staggered stance, arms open with a soft elbow bend.','Hug a big beach ball — bring hands together in front of your chest.','Squeeze for one second, then return slowly.'],
   w:['Constant tension on the chest through the whole rep.','Great finisher after presses for a pump.','Stretches the pecs safely with adjustable resistance.']},
  {n:'Dumbbell Lunge',t:['gym','home'],c:'strength',g:'legs',lvl:'Beginner',eq:'Dumbbells',sets:'3 × 10 each leg',rest:'90 s',p:'lunge',
   s:['Stand tall, a dumbbell in each hand.','Take a long step forward and lower until both knees are at 90°.','Keep your front knee over your ankle, torso upright.','Push back to standing and repeat on the other side.'],
   w:['Trains each leg independently, fixing imbalances.','Builds glutes, quads and balance together.','Scales easily — bodyweight to heavy dumbbells.']},
  {n:'Bulgarian Split Squat',t:['gym','home'],c:'strength',g:'legs',lvl:'Intermediate',eq:'Bench + dumbbells',sets:'3 × 8–10 each',rest:'90 s',p:'lunge',
   s:['Stand about two feet in front of a bench and place your rear foot on it.','Hold dumbbells at your sides and lower straight down.','Go until your front thigh is near parallel; keep most weight on the front leg.','Drive up through the front heel without pushing off the back foot.'],
   w:['Brutally effective for glutes and single-leg strength.','Improves hip mobility and balance.','One of the best home leg exercises with minimal equipment.']},
  {n:'Barbell Hip Thrust',t:['gym'],c:'strength',g:'legs',lvl:'Intermediate',eq:'Barbell + bench',sets:'4 × 8–12',rest:'2 min',p:'hipthrust',
   s:['Sit on the floor with your upper back against a bench and roll the bar over your hips.','Plant your feet hip-width, shins vertical at the top.','Drive through your heels and squeeze your glutes hard at the top.','Hold one second, then lower with control.'],
   w:['Number one exercise for building strong glutes.','Protects the lower back while loading the hips.','Improves sprinting, squat and deadlift performance.']},
  {n:'Kettlebell Swing',t:['gym','home'],c:'hiit',g:'fullbody',lvl:'Intermediate',eq:'Kettlebell',sets:'5 × 15',rest:'60 s',p:'swing',
   s:['Stand with feet slightly wider than shoulders, bell on the floor in front.','Hinge at the hips, grab the handle and hike the bell back between your legs.','Snap your hips forward and let the bell float to chest height.','Let it swing back down and repeat without squatting.'],
   w:['Explosive hip power plus a huge cardio effect.','Trains the entire posterior chain in one move.','Burns serious calories in short sessions.']},
  {n:'Farmer\'s Walk',t:['gym','home'],c:'strength',g:'fullbody',lvl:'Beginner',eq:'Heavy dumbbells / farmer handles',sets:'4 × 40 m',rest:'90 s',p:'crawl',
   s:['Pick up a heavy dumbbell in each hand safely.','Stand tall — shoulders back, chest up, core braced.','Walk with short, quick steps without swaying.','Set the weights down under control.'],
   w:['Builds crushing grip, traps and core stability.','Simplest strength exercise that still works everything.','Great conditioning finisher.']},
  {n:'Face Pull',t:['gym'],c:'strength',g:'shoulders',lvl:'Beginner',eq:'Cable + rope',sets:'3 × 15–20',rest:'60 s',p:'row',
   s:['Set a rope at eye level on a cable stack.','Pull the rope toward your face, elbows high and wide.','Finish with knuckles beside your ears, squeeze rear delts.','Return slowly with control.'],
   w:['Bulletproofs the shoulders and fixes rounded posture.','Strengthens rear delts most pressing work ignores.','Do it light — quality beats weight here.']},
  {n:'Lateral Raise',t:['gym','home'],c:'strength',g:'shoulders',lvl:'Beginner',eq:'Light dumbbells',sets:'3 × 15–20',rest:'45 s',p:'raise',
   s:['Stand tall with a light dumbbell in each hand, slight bend in elbows.','Raise your arms out to the sides until level with your shoulders.','Lead with your elbows, pinkies tilted slightly up.','Lower slowly — no swinging.'],
   w:['Builds the side delts that create broad, capped shoulders.','Key for the classic V-taper look.','Light weight done strict beats heavy swinging.']},
  {n:'Tricep Pushdown',t:['gym'],c:'strength',g:'arms',lvl:'Beginner',eq:'Cable + rope/bar',sets:'3 × 10–15',rest:'60 s',p:'curl',
   s:['Face a high cable with elbows pinned to your sides.','Push the attachment down until arms are straight.','Squeeze the triceps for a second at the bottom.','Let it rise slowly back to 90° — never let elbows drift forward.'],
   w:['Direct isolation for the triceps — biggest arm muscle.','Adds size to the back of your arms.','Easy on the elbows when form is strict.']},
  {n:'Hammer Curl',t:['gym','home'],c:'strength',g:'arms',lvl:'Beginner',eq:'Dumbbells',sets:'3 × 10–12',rest:'60 s',p:'curl',
   s:['Stand tall, dumbbells at your sides with palms facing your body.','Curl the weights up keeping elbows still and palms facing each other.','Squeeze at the top, then lower for 2 seconds.'],
   w:['Builds forearm and braid thickness for bigger arms.','Strengthens the brachialis for a wider arm silhouette.','Gentler on wrists than regular curls.']},
  {n:'Dumbbell Row',t:['gym','home'],c:'strength',g:'back',lvl:'Beginner',eq:'Dumbbell + bench',sets:'3 × 10 each',rest:'90 s',p:'row',
   s:['Place your left knee and hand on a bench, right foot on the floor.','Hold a dumbbell in your right hand, arm hanging straight.','Row the weight to your hip, elbow brushing your ribs.','Lower slowly with control and finish both sides.'],
   w:['Thickens the mid-back and improves posture.','Each side works alone so nothing hides weak points.','A safe, beginner-friendly back builder.']},
  {n:'Mountain Climbers',t:['home','gym'],c:'hiit',g:'core',lvl:'Beginner',eq:'None',sets:'4 × 40 s',rest:'30 s',p:'climber',
   s:['Start in a strong high-plush position, hands under shoulders.','Drive one knee toward your chest, then switch legs fast.','Keep hips low and shoulders stacked over hands.','Breathe steadily and stay quick.'],
   w:['Cardio and core together — no equipment needed.','Elevates heart rate fast for fat-burn circuits.','Builds hip flexor endurance for running.']},
  {n:'Skater Jumps',t:['home','gym'],c:'hiit',g:'fullbody',lvl:'Intermediate',eq:'None',sets:'4 × 40 s',rest:'30 s',p:'skater',
   s:['Stand on one leg with the other foot behind and across.','Jump sideways to the other leg, landing soft and balanced.','Swing your arms like a speed skater.','Land quietly and immediately push off again.'],
   w:['Explosive lateral power that prevents knee injuries.','Burns calories fast while training balance.','Great warm-up for sports and running.']},
  {n:'Jump Rope',t:['home','gym'],c:'cardio',g:'fullbody',lvl:'Beginner',eq:'Skipping rope',sets:'5 × 2 min',rest:'60 s',p:'rope',
   s:['Hold the handles at hip height, elbows close to your body.','Spin the rope from your wrists, not your arms.','Jump just high enough for the rope to pass — soft landings.','Stay on the balls of your feet and keep a steady rhythm.'],
   w:['World-class cardio in minimal space.','Improves footwork, coordination and calf strength.','Burns up to 15 calories a minute at a fast pace.']},
  {n:'Box Jump',t:['gym','home'],c:'hiit',g:'legs',lvl:'Intermediate',eq:'Sturdy box/bench',sets:'5 × 5',rest:'90 s',p:'jump',
   s:['Stand about a foot from a sturdy box, feet hip-width.','Swing your arms and explode upward, landing softly on the box.','Stand up tall on the box to finish the rep.','Step down — never jump down — and reset.'],
   w:['Develops explosive jumping power for sports.','Trains fast-twitch muscle fibers.','Improves sprinting and acceleration.']},
  {n:'Dead Bug',t:['home','gym'],c:'flexibility',g:'core',lvl:'Beginner',eq:'None',sets:'3 × 12 each side',rest:'45 s',p:'birds',
   s:['Lie on your back, arms to the ceiling, knees at 90°.','Press your lower back flat into the floor.','Slowly lower one arm and the opposite leg toward the floor.','Return and switch sides without losing the flat-back position.'],
   w:['Safely trains deep core stability without strain.','Teaches bracing that protects your spine in heavy lifts.','Great for beginners and lower-back issues.']},
  {n:'Side Plank',t:['home','gym'],c:'flexibility',g:'core',lvl:'Beginner',eq:'None',sets:'3 × 30–45 s each',rest:'30 s',p:'plank',
   s:['Lie on your side, prop yourself on your forearm with elbow under shoulder.','Lift your hips until your body forms one straight line.','Hold, keeping hips high and core tight.','Switch sides and repeat.'],
   w:['Builds anti-side-bend core strength.','Strengthens the obliques and protects the lower back.','Improves balance for single-leg movements.']},
  {n:'World\'s Greatest Stretch',t:['home','gym'],c:'flexibility',g:'fullbody',lvl:'Beginner',eq:'None',sets:'2 × 5 each side',rest:'30 s',p:'stretch',
   s:['Step into a deep lunge, back leg straight.','Place both hands inside your front foot.','Rotate one arm to the ceiling, eyes following your hand.','Return, switch legs and repeat on the other side.'],
   w:['Opens hips, hamstrings, spine and shoulders in one move.','Perfect warm-up before any leg or full-body day.','Improves squat depth and reduces stiffness.']},
  {n:'Glute Bridge March',t:['home'],c:'strength',g:'legs',lvl:'Beginner',eq:'None',sets:'3 × 12 each leg',rest:'45 s',p:'bridge',
   s:['Lie on your back, knees bent, feet flat and close to your glutes.','Lift your hips into a bridge and squeeze your glutes.','Lift one foot slightly off the floor without dropping your hips.','Lower and alternate legs while staying bridged.'],
   w:['Teaches glute activation while the core resists rotation.','Great rehab and warm-up move before heavy squats.','No equipment, done anywhere.']}
];
WORKOUTS.push(...WORKOUTS2);

/* human-readable labels (plain words, no cryptic codes) */
const CAT_LABEL = { strength:'Strength', hiit:'HIIT (Fat Burn)', cardio:'Cardio', flexibility:'Flexibility & Core' };
const GROUP_LABEL = { chest:'Chest', back:'Back', legs:'Legs', shoulders:'Shoulders', arms:'Arms', core:'Core', fullbody:'Full Body' };
const TYPE_LABEL = { gym:'Gym', home:'Home' };
const FOOD_CAT_LABEL = { healthy:'Healthy', oily:'Oily / Fried', junk:'Junk Food', snack:'Snacks', drink:'Drinks', fruit:'Fruits', dairy:'Dairy', grain:'Grains & Roti', dessert:'Desserts', protein:'High Protein', main:'Full Meals', other:'Other' };
const DISCLAIMER = ' Note: Nutrition values shown in FitFuel are rough estimates from common food databases and may vary by brand, cooking method and portion. Do not rely on this alone. If you have any medical condition, allergy, or special diet needs, please talk to a doctor or registered dietitian before making changes.';
