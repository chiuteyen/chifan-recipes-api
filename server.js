const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

let MongoClient = null;
try {
  ({ MongoClient } = require('mongodb'));
} catch (error) {
  // The service can still run with in-memory data before dependencies are installed.
}

const now = Date.now();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getRecipeImageBaseUrl() {
  return `${process.env.RECIPE_IMAGE_BASE_URL || process.env.IMAGE_BASE_URL || ''}`.replace(/\/$/, '');
}

function toStorageImageUrl(value) {
  if (!value || typeof value !== 'string') return value;
  if (/^https?:\/\//i.test(value)) return value;

  const recipeAssetPrefix = '/assets/images/recipes/';
  const imageBaseUrl = getRecipeImageBaseUrl();
  if (!imageBaseUrl || !value.startsWith(recipeAssetPrefix)) return value;

  return `${imageBaseUrl}/${value.slice(recipeAssetPrefix.length)}`;
}

function withStorageImageUrls(value) {
  if (typeof value === 'string') return toStorageImageUrl(value);
  if (Array.isArray(value)) return value.map(withStorageImageUrls);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((next, key) => {
      next[key] = withStorageImageUrls(value[key]);
      return next;
    }, {});
  }
  return value;
}

function okPublic(data) {
  return ok(withStorageImageUrls(data));
}

let categories = [
  {
    "_id": "creative-breakfast",
    "name": "创意早餐",
    "description": "把早餐做得轻松、有趣、好看。",
    "coverImage": "/assets/images/category-breakfast.svg",
    "sort": 10,
    "isVisible": true
  },
  {
    "_id": "quick-10min",
    "name": "快手料理",
    "description": "忙的时候也能好好吃饭。",
    "coverImage": "/assets/images/category-quick.svg",
    "sort": 20,
    "isVisible": true
  },
  {
    "_id": "cast-iron",
    "name": "铸铁锅系列",
    "description": "一口锅做出香气和仪式感。",
    "coverImage": "/assets/images/category-castiron.svg",
    "sort": 30,
    "isVisible": true
  },
  {
    "_id": "salad",
    "name": "轻食色拉",
    "description": "清爽但不寡淡的日常轻食。",
    "coverImage": "/assets/images/category-salad.svg",
    "sort": 40,
    "isVisible": true
  },
  {
    "_id": "soup",
    "name": "汤料理",
    "description": "一碗热汤，把今天照顾好。",
    "coverImage": "/assets/images/category-soup.svg",
    "sort": 50,
    "isVisible": true
  }
];

let tags = [
  "早餐",
  "快手",
  "10分钟",
  "新手友好",
  "低脂",
  "高蛋白",
  "色拉",
  "莎莎酱",
  "鸡胸肉",
  "虾仁",
  "鸡蛋",
  "三明治",
  "欧包",
  "吐司",
  "蛋沙拉",
  "卷饼",
  "牛肉",
  "牛油果",
  "金枪鱼",
  "三角奶酪",
  "小番茄",
  "番茄",
  "彩椒",
  "香菜",
  "柠檬",
  "芝士",
  "桂鱼",
  "无水焗",
  "南风肉",
  "铸铁锅",
  "汤",
  "午餐",
  "晚餐",
  "带饭",
  "不辣",
  "空气炸锅",
  "沙拉汁",
  "油醋汁",
  "苹果醋",
  "橄榄油",
  "饮品",
  "热饮",
  "苹果",
  "红枣",
  "桂圆",
  "便利包",
  "冷冻",
  "养生壶"
];

let recipes = [
  {
    "_id": "recipe-furu-kongxincai",
    "title": "腐乳空心菜",
    "subtitle": "蒜香浓郁，带着淡淡腐乳香，菜梗脆嫩又下饭",
    "categoryId": "quick-10min",
    "categoryName": "快手料理",
    "tags": [
      "空心菜",
      "腐乳",
      "快手",
      "素菜",
      "下饭",
      "夏天"
    ],
    "cookware": [
      "铁锅",
      "不粘锅"
    ],
    "timeRequired": "8分钟",
    "difficulty": "新手友好",
    "ingredients": [
      "空心菜",
      "蒜",
      "姜",
      "清水"
    ],
    "seasonings": [
      "食用油",
      "梅子味腐乳"
    ],
    "introImages": [
      "/assets/images/recipes/furu-kongxincai/intro-01.jpeg",
      "/assets/images/recipes/furu-kongxincai/intro-02.jpeg"
    ],
    "steps": [
      {
        "order": 1,
        "text": "空心菜摘洗干净，蒜头和姜打成蒜末姜末。",
        "image": ""
      },
      {
        "order": 2,
        "text": "1 块梅子味腐乳、1 大匙腐乳汁，加少量清水调开备用。",
        "image": ""
      },
      {
        "order": 3,
        "text": "锅中倒少许油，放入蒜末姜末炒香，再放入腐乳和一点腐乳汁，快速炒开。",
        "image": ""
      },
      {
        "order": 4,
        "text": "先下空心菜梗大火翻炒 30 秒，再放入菜叶快速翻炒至微微变软。",
        "image": ""
      },
      {
        "order": 5,
        "text": "空心菜微微塌下去后，沿锅边淋一圈水，盖上锅盖焖一下下，即可出锅。",
        "image": ""
      }
    ],
    "finalImage": "/assets/images/recipes/furu-kongxincai/final.jpeg",
    "tips": "先炒梗再炒叶，口感更脆嫩；腐乳本身有咸味，一般不用另外加盐；全程大火快炒，颜色会更翠绿。",
    "commonMistakes": "火小或炒太久容易出水发黄；腐乳没有先炒开会有结块；水只要沿锅边淋一圈，不要倒太多。",
    "coverImage": "/assets/images/recipes/furu-kongxincai/cover.jpg",
    "videoTitle": "腐乳空心菜",
    "showVideoButton": false,
    "isRecommended": true,
    "sortWeight": 96,
    "status": "published",
    "viewCount": 620,
    "favoriteCount": 146,
    "shareCount": 28,
    "videoClickCount": 0,
    "createdAt": 1782117491515,
    "updatedAt": 1782119291515,
    "publishedAt": 1782117491515,
    "douyinVideoSchema": "",
    "douyinVideoId": ""
  },
  {
    "_id": "recipe-egg-salad-sandwich",
    "title": "蛋沙拉三明治灵感",
    "subtitle": "鸡蛋、蛋黄酱和粗粒芥末酱拌一拌，铺在脆吐司上就很香",
    "categoryId": "creative-breakfast",
    "categoryName": "创意早餐",
    "tags": [
      "早餐",
      "三明治",
      "鸡蛋",
      "吐司",
      "快手",
      "新手友好"
    ],
    "cookware": [
      "不粘锅"
    ],
    "timeRequired": "10分钟",
    "difficulty": "完全没难度",
    "ingredients": [
      "鸡蛋",
      "全麦吐司",
      "希腊酸奶"
    ],
    "seasonings": [
      "低卡蛋黄酱",
      "粗粒芥末酱",
      "黑胡椒",
      "酱油"
    ],
    "introImages": [
      "/assets/images/recipes/sandwich-inspiration/IMG_1951.jpeg",
      "/assets/images/recipes/sandwich-inspiration/IMG_1959.jpeg"
    ],
    "steps": [
      {
        "order": 1,
        "text": "准备鸡蛋、全麦吐司、希腊酸奶、低卡蛋黄酱、粗粒芥末酱、黑胡椒和少量酱油。",
        "image": "/assets/images/recipes/sandwich-inspiration/IMG_1960.jpeg"
      },
      {
        "order": 2,
        "text": "鸡蛋煮熟后剥壳，放到不烫手再处理，口感会更清爽。",
        "image": "/assets/images/recipes/sandwich-inspiration/IMG_1961.jpeg"
      },
      {
        "order": 3,
        "text": "把蛋黄取出，加入低卡蛋黄酱、粗粒芥末酱，也可以加几滴酱油提鲜。",
        "image": "/assets/images/recipes/sandwich-inspiration/IMG_1962.jpeg"
      },
      {
        "order": 4,
        "text": "先把蛋黄和酱料压碎拌匀，调成带颗粒感的顺滑酱底。",
        "image": "/assets/images/recipes/sandwich-inspiration/IMG_1963.jpeg"
      },
      {
        "order": 5,
        "text": "蛋白切成小块，不要切得太细，保留一点颗粒会更好吃。",
        "image": "/assets/images/recipes/sandwich-inspiration/IMG_1964.jpeg"
      },
      {
        "order": 6,
        "text": "把蛋白倒回酱底里，轻轻翻拌成蛋沙拉。",
        "image": "/assets/images/recipes/sandwich-inspiration/IMG_1965.jpeg"
      },
      {
        "order": 7,
        "text": "吐司烤到表面脆脆的，抹一层希腊酸奶增加清爽感。",
        "image": "/assets/images/recipes/sandwich-inspiration/IMG_1966.jpeg"
      },
      {
        "order": 8,
        "text": "铺上蛋沙拉，最后撒黑胡椒，直接开吃。",
        "image": "/assets/images/recipes/sandwich-inspiration/IMG_1967.jpeg"
      }
    ],
    "finalImage": "/assets/images/recipes/sandwich-inspiration/IMG_1968.jpeg",
    "tips": "吐司烤脆会更香；怕腻可以用低卡蛋黄酱和全麦吐司；希腊酸奶薄薄一层就够，能让整体更轻盈。",
    "commonMistakes": "蛋黄酱一次加太多会腻，可以边拌边调整；蛋白切得太碎会失去口感；吐司没烤的话也能吃，但香气会弱一点。",
    "coverImage": "/assets/images/recipes/sandwich-inspiration/cover.jpg",
    "videoTitle": "蛋沙拉三明治灵感",
    "showVideoButton": false,
    "isRecommended": true,
    "sortWeight": 99,
    "status": "published",
    "viewCount": 760,
    "favoriteCount": 188,
    "shareCount": 36,
    "videoClickCount": 0,
    "createdAt": 1782118391515,
    "updatedAt": 1782119891515,
    "publishedAt": 1782118391515,
    "douyinVideoSchema": "",
    "douyinVideoId": ""
  },
  {
    "_id": "recipe-beef-avocado-wrap",
    "title": "卷饼的搭配",
    "subtitle": "一面软软蛋香，一面焦脆，牛肉、洋葱、口蘑和牛油果芝士都在里面",
    "categoryId": "creative-breakfast",
    "categoryName": "创意早餐",
    "tags": [
      "早餐",
      "卷饼",
      "牛肉",
      "牛油果",
      "芝士",
      "快手"
    ],
    "cookware": [
      "不粘锅"
    ],
    "timeRequired": "15分钟",
    "difficulty": "日常友好",
    "ingredients": [
      "卷饼",
      "鸡蛋",
      "牛肉糜",
      "口蘑",
      "洋葱",
      "葱",
      "牛油果",
      "芝士片",
      "牛奶"
    ],
    "seasonings": [
      "橄榄油",
      "料理米酒",
      "黑胡椒",
      "海盐"
    ],
    "introImages": [
      "/assets/images/recipes/wrap-pairing/IMG_1969.jpeg",
      "/assets/images/recipes/wrap-pairing/IMG_1970.jpeg"
    ],
    "steps": [
      {
        "order": 1,
        "text": "准备卷饼、鸡蛋、牛肉糜、口蘑、洋葱、葱、牛油果、芝士片，以及黑胡椒、海盐、橄榄油和料理米酒。",
        "image": "/assets/images/recipes/wrap-pairing/IMG_1971.jpeg"
      },
      {
        "order": 2,
        "text": "牛肉糜先加一点料理米酒抓一抓，下锅炒散后放口蘑、洋葱一起炒香，用黑胡椒和海盐调味，最后加葱花。",
        "image": "/assets/images/recipes/wrap-pairing/IMG_1972.jpeg"
      },
      {
        "order": 3,
        "text": "不粘锅喷一点油，先把卷饼小火烘一下，再倒入蛋液，让蛋液铺满卷饼周围；牛奶可加可不加，要加也只加一点点。",
        "image": "/assets/images/recipes/wrap-pairing/IMG_1973.jpeg"
      },
      {
        "order": 4,
        "text": "蛋液定型后，把炒好的馅料铺到蛋饼上，再放牛油果和芝士片，撒一点黑胡椒。",
        "image": "/assets/images/recipes/wrap-pairing/IMG_1974.jpeg"
      },
      {
        "order": 5,
        "text": "盖上另一张卷饼，轻轻压一压，翻面继续小火烘，让两面都变得金黄焦脆。",
        "image": "/assets/images/recipes/wrap-pairing/IMG_1975.jpeg"
      },
      {
        "order": 6,
        "text": "出锅切块，一面是软软蛋香，一面是焦脆口感，趁热吃最香。",
        "image": "/assets/images/recipes/wrap-pairing/IMG_1976.jpeg"
      },
      {
        "order": 7,
        "text": "想要同款搭配，可以做一杯水菠萝啤：冷冻菠萝加一点啤酒打碎，倒进杯子里再补一点啤酒。",
        "image": "/assets/images/recipes/wrap-pairing/IMG_1978.jpeg"
      },
      {
        "order": 8,
        "text": "菠萝啤的做法小抄放在这里，喜欢清爽搭配的时候可以一起做。",
        "image": "/assets/images/recipes/wrap-pairing/IMG_1979.jpeg"
      }
    ],
    "finalImage": "/assets/images/recipes/wrap-pairing/IMG_1977.jpeg",
    "tips": "卷饼先小火烘一下会更香；蛋液只要铺满周围即可，牛奶千万不要多；馅料先炒香再铺上去，口感会更集中。",
    "commonMistakes": "火太大容易外面焦、里面不热；牛奶加多会让蛋液不容易定型；翻面时先压一压再转锅，会更稳。",
    "coverImage": "/assets/images/recipes/wrap-pairing/cover.jpg",
    "videoTitle": "卷饼的搭配",
    "showVideoButton": false,
    "isRecommended": true,
    "sortWeight": 100,
    "status": "published",
    "viewCount": 690,
    "favoriteCount": 172,
    "shareCount": 34,
    "videoClickCount": 0,
    "createdAt": 1782119291515,
    "updatedAt": 1782120191515,
    "publishedAt": 1782119291515,
    "douyinVideoSchema": "",
    "douyinVideoId": ""
  },
  {
    "_id": "recipe-euro-bread-sandwich",
    "title": "欧包三明治",
    "subtitle": "流心蛋、烤小番茄、牛油果和焦脆芝士，早餐吃完心情都会变好",
    "categoryId": "creative-breakfast",
    "categoryName": "创意早餐",
    "tags": [
      "早餐",
      "欧包",
      "三明治",
      "鸡蛋",
      "牛油果",
      "小番茄",
      "芝士"
    ],
    "cookware": [
      "不粘锅"
    ],
    "timeRequired": "20分钟",
    "difficulty": "日常友好",
    "ingredients": [
      "欧包",
      "鸡蛋",
      "小番茄",
      "牛油果",
      "马苏里拉芝士"
    ],
    "seasonings": [
      "橄榄油",
      "黑胡椒",
      "海盐"
    ],
    "introImages": [
      "/assets/images/recipes/euro-bread-sandwich/IMG_1981.jpeg",
      "/assets/images/recipes/euro-bread-sandwich/IMG_1982.jpeg"
    ],
    "steps": [
      {
        "order": 1,
        "text": "小番茄提前对半切开，加橄榄油、黑胡椒和海盐，200 度烤 15 分钟，让酸甜味更浓。",
        "image": "/assets/images/recipes/euro-bread-sandwich/IMG_1983.jpeg"
      },
      {
        "order": 2,
        "text": "平底不粘锅喷少许油，欧包中间稍微挖掉一点，直接打入鸡蛋，全程小火慢慢烘。",
        "image": "/assets/images/recipes/euro-bread-sandwich/IMG_1984.jpeg"
      },
      {
        "order": 3,
        "text": "鸡蛋慢慢定型后，放上烤好的小番茄、牛油果和马苏里拉芝士。",
        "image": "/assets/images/recipes/euro-bread-sandwich/IMG_1985.jpeg"
      },
      {
        "order": 4,
        "text": "再撒一点马苏里拉碎，等锅底芝士慢慢融化后，把欧包放上去一起烘，煎到芝士焦香粘在面包上。",
        "image": "/assets/images/recipes/euro-bread-sandwich/IMG_1986.jpeg"
      }
    ],
    "finalImage": "/assets/images/recipes/euro-bread-sandwich/IMG_1987.jpeg",
    "tips": "小番茄提前烤会更浓郁多汁；欧包挖洞不要挖穿；全程小火，蛋会更嫩，芝士也更容易焦香。",
    "commonMistakes": "火太大容易把面包煎焦但鸡蛋没熟；芝士太早翻动会散；牛油果放太早会变软，建议鸡蛋定型后再放。",
    "coverImage": "/assets/images/recipes/euro-bread-sandwich/cover.jpg",
    "videoTitle": "欧包三明治",
    "showVideoButton": false,
    "isRecommended": true,
    "sortWeight": 101,
    "status": "published",
    "viewCount": 720,
    "favoriteCount": 168,
    "shareCount": 32,
    "videoClickCount": 0,
    "createdAt": 1782120191515,
    "updatedAt": 1782120791515,
    "publishedAt": 1782120191515,
    "douyinVideoSchema": "",
    "douyinVideoId": ""
  },
  {
    "_id": "recipe-fresh-salsa",
    "title": "爽口莎莎酱",
    "subtitle": "彩椒、番茄、白洋葱和香菜拌一拌，清爽解腻，卷饼三明治都好搭",
    "categoryId": "salad",
    "categoryName": "轻食色拉",
    "tags": [
      "色拉",
      "莎莎酱",
      "快手",
      "低脂",
      "彩椒",
      "番茄",
      "柠檬"
    ],
    "cookware": [],
    "timeRequired": "8分钟",
    "difficulty": "完全没难度",
    "ingredients": [
      "彩椒",
      "番茄",
      "白洋葱",
      "香菜"
    ],
    "seasonings": [
      "橄榄油",
      "黑胡椒",
      "海盐",
      "柠檬汁"
    ],
    "introImages": [
      "/assets/images/recipes/fresh-salsa/IMG_1988.jpeg",
      "/assets/images/recipes/fresh-salsa/IMG_1990.jpeg"
    ],
    "steps": [
      {
        "order": 1,
        "text": "所有蔬菜切成约 1 cm 小丁，香菜切成小段；不爱香菜的话，可以换成黄瓜丁。",
        "image": "/assets/images/recipes/fresh-salsa/IMG_1989.jpeg"
      },
      {
        "order": 2,
        "text": "把彩椒、番茄、白洋葱和香菜放进大碗，加入橄榄油、黑胡椒和海盐。",
        "image": "/assets/images/recipes/fresh-salsa/IMG_1991.jpeg"
      },
      {
        "order": 3,
        "text": "挤入柠檬汁，轻轻翻拌均匀。可以直接当色拉吃，也很适合夹进卷饼或三明治里。",
        "image": "/assets/images/recipes/fresh-salsa/IMG_1993.jpeg"
      }
    ],
    "finalImage": "/assets/images/recipes/fresh-salsa/IMG_1992.jpeg",
    "tips": "蔬菜切丁大小尽量一致，吃起来会更清爽；柠檬汁分次加，边拌边尝酸度；拌好后静置 5 分钟会更入味。",
    "commonMistakes": "洋葱切太大辛辣感会抢味；盐一次加太多会出水；香菜梗太长会影响口感，不爱香菜可以换成黄瓜丁。",
    "coverImage": "/assets/images/recipes/fresh-salsa/cover.jpg",
    "videoTitle": "爽口莎莎酱",
    "showVideoButton": false,
    "isRecommended": true,
    "sortWeight": 102,
    "status": "published",
    "viewCount": 540,
    "favoriteCount": 132,
    "shareCount": 24,
    "videoClickCount": 0,
    "createdAt": 1782120491515,
    "updatedAt": 1782120911515,
    "publishedAt": 1782120491515,
    "douyinVideoSchema": "",
    "douyinVideoId": ""
  },
  {
    "_id": "recipe-mini-triangle",
    "title": "迷你三角洲",
    "subtitle": "全麦卷饼折成小三角，奶酪、金枪鱼和烤番茄一口爆汁",
    "categoryId": "creative-breakfast",
    "categoryName": "创意早餐",
    "tags": [
      "早餐",
      "卷饼",
      "金枪鱼",
      "三角奶酪",
      "小番茄",
      "芝士",
      "烤箱"
    ],
    "cookware": [
      "电蒸箱"
    ],
    "timeRequired": "20分钟",
    "difficulty": "日常友好",
    "ingredients": [
      "全麦卷饼",
      "乐芝牛三角奶酪",
      "金枪鱼罐头",
      "小番茄",
      "帕玛森芝士"
    ],
    "seasonings": [
      "橄榄油",
      "黑胡椒",
      "海盐",
      "欧芹碎"
    ],
    "introImages": [
      "/assets/images/recipes/mini-triangle/IMG_1994.jpeg",
      "/assets/images/recipes/mini-triangle/IMG_1995.jpeg"
    ],
    "steps": [
      {
        "order": 1,
        "text": "全麦卷饼先对折，再对折成小扇形，沿边切开后展开，方便折出迷你三角形。",
        "image": "/assets/images/recipes/mini-triangle/IMG_1996.jpeg"
      },
      {
        "order": 2,
        "text": "小番茄对半切开，加黑胡椒、海盐和橄榄油，200 度烤 15 分钟，烤过会更香也更爆汁。",
        "image": "/assets/images/recipes/mini-triangle/IMG_1998.jpeg"
      },
      {
        "order": 3,
        "text": "每片卷饼抹半块乐芝牛三角奶酪，抹匀后把三边往里折成小三角。",
        "image": "/assets/images/recipes/mini-triangle/IMG_1997.jpeg"
      },
      {
        "order": 4,
        "text": "放上金枪鱼和烤好的小番茄，番茄建议一定先烤，咬开会更香。",
        "image": "/assets/images/recipes/mini-triangle/IMG_1999.jpeg"
      },
      {
        "order": 5,
        "text": "撒上帕玛森芝士或芝士碎，再把小三角放到烤盘上。",
        "image": "/assets/images/recipes/mini-triangle/IMG_2001.jpeg"
      },
      {
        "order": 6,
        "text": "直接在烤盘上烤到表面微焦、边缘变脆，出炉后撒欧芹碎。",
        "image": "/assets/images/recipes/mini-triangle/IMG_2002.jpeg"
      },
      {
        "order": 7,
        "text": "烤到外面脆脆的，奶酪从边缘微微冒出来就可以吃了。",
        "image": "/assets/images/recipes/mini-triangle/IMG_2003.jpeg"
      }
    ],
    "finalImage": "/assets/images/recipes/mini-triangle/IMG_2004.jpeg",
    "tips": "小番茄先烤再放会更香；奶酪不用太多，半块就够；烤盘可以提前薄薄擦油，边缘会更脆。",
    "commonMistakes": "卷饼折得太松容易散；番茄没烤直接放会水感重；芝士撒太多会盖住金枪鱼香味。",
    "coverImage": "/assets/images/recipes/mini-triangle/cover.jpg",
    "videoTitle": "迷你三角洲",
    "showVideoButton": false,
    "isRecommended": true,
    "sortWeight": 104,
    "status": "published",
    "viewCount": 610,
    "favoriteCount": 148,
    "shareCount": 28,
    "videoClickCount": 0,
    "createdAt": 1782120671515,
    "updatedAt": 1782120971515,
    "publishedAt": 1782120671515,
    "douyinVideoSchema": "",
    "douyinVideoId": ""
  },
  {
    "_id": "recipe-waterless-baked-fish",
    "title": "无水焗鱼",
    "subtitle": "铸铁锅靠鱼自身水分和酒气焗熟，南风肉油脂一衬，鲜味很有层次",
    "categoryId": "cast-iron",
    "categoryName": "铸铁锅系列",
    "tags": [
      "晚餐",
      "铸铁锅",
      "无水焗",
      "桂鱼",
      "南风肉",
      "鱼"
    ],
    "cookware": [
      "铸铁锅"
    ],
    "timeRequired": "18分钟",
    "difficulty": "日常进阶",
    "ingredients": [
      "桂鱼",
      "南风肉",
      "葱",
      "姜"
    ],
    "seasonings": [
      "盐",
      "薄油",
      "米酒",
      "白葡萄酒",
      "蒸鱼豉油",
      "热油"
    ],
    "introImages": [
      "/assets/images/recipes/waterless-baked-fish/IMG_2005.jpeg",
      "/assets/images/recipes/waterless-baked-fish/IMG_2006.jpeg"
    ],
    "steps": [
      {
        "order": 1,
        "text": "桂鱼处理干净，鱼鳍两侧各划一刀，鱼肚剖开，两面轻撒少许盐。",
        "image": "/assets/images/recipes/waterless-baked-fish/IMG_2007.jpeg"
      },
      {
        "order": 2,
        "text": "鱼腹打开整理平整，让受热更均匀，也更容易入味。",
        "image": "/assets/images/recipes/waterless-baked-fish/IMG_2008.jpeg"
      },
      {
        "order": 3,
        "text": "鱼身两面轻撒少许盐，不要太重，后面还有南风肉和蒸鱼豉油。",
        "image": "/assets/images/recipes/waterless-baked-fish/IMG_2009.jpeg"
      },
      {
        "order": 4,
        "text": "铸铁锅喷一层薄油，先铺葱段防粘增香，再放入鱼，撒姜丝，铺上南风肉薄片。",
        "image": "/assets/images/recipes/waterless-baked-fish/IMG_2011.jpeg"
      },
      {
        "order": 5,
        "text": "淋一圈米酒和白葡萄酒，盖盖大火加热到有明显滋滋声和蒸汽冒出，大约 2 到 3 分钟。",
        "image": "/assets/images/recipes/waterless-baked-fish/IMG_2010.jpeg"
      },
      {
        "order": 6,
        "text": "立刻转小火焗 7 到 8 分钟，靠酒气和鱼自身水分把鱼焗熟，锅盖要密封好。",
        "image": "/assets/images/recipes/waterless-baked-fish/IMG_2012.jpeg"
      },
      {
        "order": 7,
        "text": "开盖后撒葱花，淋蒸鱼豉油，再泼一勺热油完成。",
        "image": "/assets/images/recipes/waterless-baked-fish/IMG_2013.jpeg"
      }
    ],
    "finalImage": "/assets/images/recipes/waterless-baked-fish/IMG_2005.jpeg",
    "tips": "第一次做可以多加一点酒更稳；南风肉的油脂和咸香会帮鱼提鲜；锅一定要密封好，铸铁锅最适合。",
    "commonMistakes": "火候只用大火到底会干；锅盖不密封蒸汽不足；盐不要下重，南风肉和蒸鱼豉油都有咸味。",
    "coverImage": "/assets/images/recipes/waterless-baked-fish/cover.jpg",
    "videoTitle": "无水焗鱼",
    "showVideoButton": false,
    "isRecommended": true,
    "sortWeight": 105,
    "status": "published",
    "viewCount": 680,
    "favoriteCount": 162,
    "shareCount": 30,
    "videoClickCount": 0,
    "createdAt": 1782120791515,
    "updatedAt": 1782121031515,
    "publishedAt": 1782120791515,
    "douyinVideoSchema": "",
    "douyinVideoId": ""
  },
  {
    "_id": "recipe-homemade-vinaigrette",
    "title": "自制油醋汁",
    "subtitle": "橄榄油和苹果醋 2:1 摇一摇，酸甜清爽都能按自己口味调",
    "categoryId": "salad",
    "categoryName": "轻食色拉",
    "tags": [
      "色拉",
      "沙拉汁",
      "油醋汁",
      "苹果醋",
      "橄榄油",
      "快手",
      "新手友好"
    ],
    "cookware": [],
    "timeRequired": "5分钟",
    "difficulty": "完全没难度",
    "ingredients": [
      "橄榄油",
      "苹果醋",
      "粗粒芥末酱",
      "黑胡椒",
      "海盐"
    ],
    "seasonings": [
      "枫糖浆或蜂蜜",
      "欧芹碎",
      "柠檬汁",
      "酱油"
    ],
    "introImages": [
      "/assets/images/recipes/homemade-vinaigrette/IMG_2065.jpeg",
      "/assets/images/recipes/homemade-vinaigrette/IMG_2067.jpeg"
    ],
    "steps": [
      {
        "order": 1,
        "text": "基础版准备橄榄油、苹果醋、黑胡椒、海盐和粗粒芥末酱，苹果醋也可以换成白葡萄酒醋。",
        "image": "/assets/images/recipes/homemade-vinaigrette/IMG_2066.jpeg"
      },
      {
        "order": 2,
        "text": "橄榄油和苹果醋按 2:1 倒进带盖小瓶，加少许黑胡椒、海盐和约小半勺粗粒芥末酱。",
        "image": "/assets/images/recipes/homemade-vinaigrette/IMG_2069.jpeg"
      },
      {
        "order": 3,
        "text": "盖紧后用力摇匀，让油和醋乳化；尝一下酸度，想更酸可以补一点苹果醋或柠檬汁。",
        "image": "/assets/images/recipes/homemade-vinaigrette/IMG_2065.jpeg"
      },
      {
        "order": 4,
        "text": "想做升级版，在基础版里加一点枫糖浆或蜂蜜、欧芹碎；想要中式风味，可以加少许酱油。",
        "image": "/assets/images/recipes/homemade-vinaigrette/IMG_2068.jpeg"
      },
      {
        "order": 5,
        "text": "拌金枪鱼、牛油果、鸡蛋和生菜都很搭，吃之前再淋，口感更清爽。",
        "image": "/assets/images/recipes/homemade-vinaigrette/IMG_2070.jpeg"
      },
      {
        "order": 6,
        "text": "搭配鸡胸肉色拉也合适，减脂餐不用靠成品酱，也能有酸香和层次。",
        "image": "/assets/images/recipes/homemade-vinaigrette/IMG_2071.jpeg"
      }
    ],
    "finalImage": "/assets/images/recipes/homemade-vinaigrette/IMG_2065.jpeg",
    "tips": "油和醋 2:1 是最稳的基础比例，怕酸就多一点油，想清爽就多一点醋；用带盖小瓶摇会更容易乳化；每次少量做，现摇现吃香气最好。",
    "commonMistakes": "瓶盖没拧紧会漏，先少量试比例；盐和芥末不要一次下太多，调完再尝；淋太早会让生菜出水，建议吃之前再拌。",
    "coverImage": "/assets/images/recipes/homemade-vinaigrette/cover.jpg",
    "videoTitle": "自制油醋汁",
    "showVideoButton": false,
    "isRecommended": true,
    "sortWeight": 106,
    "status": "published",
    "viewCount": 520,
    "favoriteCount": 138,
    "shareCount": 24,
    "videoClickCount": 0,
    "createdAt": 1782120971515,
    "updatedAt": 1782121061515,
    "publishedAt": 1782120971515,
    "douyinVideoSchema": "",
    "douyinVideoId": ""
  },
  {
    "_id": "recipe-wellness-drink-pack",
    "title": "养生便利包",
    "subtitle": "半个苹果、6 颗灰枣、5 颗桂圆提前分装冷冻，想喝时随手一包",
    "categoryId": "soup",
    "categoryName": "汤料理",
    "tags": [
      "饮品",
      "热饮",
      "苹果",
      "红枣",
      "桂圆",
      "便利包",
      "冷冻",
      "养生壶"
    ],
    "cookware": [
      "养生壶"
    ],
    "timeRequired": "10分钟",
    "difficulty": "完全没难度",
    "ingredients": [
      "苹果",
      "灰枣",
      "桂圆"
    ],
    "seasonings": [
      "清水"
    ],
    "introImages": [
      "/assets/images/recipes/wellness-drink-pack/IMG_2179.jpeg",
      "/assets/images/recipes/wellness-drink-pack/IMG_2180.jpeg"
    ],
    "steps": [
      {
        "order": 1,
        "text": "按一包的量准备半个苹果、6 颗灰枣和 5 颗桂圆，全部洗干净。",
        "image": "/assets/images/recipes/wellness-drink-pack/IMG_2180.jpeg"
      },
      {
        "order": 2,
        "text": "苹果不用去皮，洗净后切块；灰枣和桂圆一起放进真空袋或密封袋。",
        "image": "/assets/images/recipes/wellness-drink-pack/IMG_2179.jpeg"
      },
      {
        "order": 3,
        "text": "抽真空后放进冰箱冷冻。周末有空可以多做几包，平时就不用每天切水果、洗水果。",
        "image": "/assets/images/recipes/wellness-drink-pack/IMG_2181.jpeg"
      },
      {
        "order": 4,
        "text": "想喝的时候拿一包放进养生壶，加清水煮；没有养生壶也可以用热水泡开。",
        "image": "/assets/images/recipes/wellness-drink-pack/IMG_2182.jpeg"
      },
      {
        "order": 5,
        "text": "苹果、红枣和桂圆会煮出自然果甜味，清爽不冲，适合不爱喝白开水的时候换着喝。",
        "image": "/assets/images/recipes/wellness-drink-pack/IMG_2183.jpeg"
      },
      {
        "order": 6,
        "text": "桂圆和红枣本身已经有甜味，不建议再加冰糖；觉得甜或容易腻，桂圆可以减到 3 到 4 颗。",
        "image": "/assets/images/recipes/wellness-drink-pack/IMG_2185.jpeg"
      }
    ],
    "finalImage": "/assets/images/recipes/wellness-drink-pack/IMG_2184.jpeg",
    "tips": "做成便利包比每天现切更容易坚持；苹果保留果皮口感和香气更完整，但一定要洗干净；一包可以煮一壶，温着慢慢喝。",
    "commonMistakes": "水果没有沥干就冷冻容易结冰霜；袋子封口不严会串味；红枣和桂圆已经有甜味，再加糖容易甜腻。",
    "coverImage": "/assets/images/recipes/wellness-drink-pack/cover.jpg",
    "videoTitle": "养生便利包",
    "showVideoButton": false,
    "isRecommended": true,
    "sortWeight": 107,
    "status": "published",
    "viewCount": 480,
    "favoriteCount": 126,
    "shareCount": 22,
    "videoClickCount": 0,
    "createdAt": 1782121031515,
    "updatedAt": 1782121076515,
    "publishedAt": 1782121031515,
    "douyinVideoSchema": "",
    "douyinVideoId": ""
  }
];

let homeSections = [
  {
    "_id": "section-today",
    "key": "today",
    "title": "今天先吃这几道",
    "subtitle": "最近最值得打开的几道",
    "recipeIds": [
      "recipe-wellness-drink-pack",
      "recipe-homemade-vinaigrette",
      "recipe-waterless-baked-fish",
      "recipe-mini-triangle",
      "recipe-fresh-salsa",
      "recipe-euro-bread-sandwich",
      "recipe-beef-avocado-wrap",
      "recipe-egg-salad-sandwich",
      "recipe-furu-kongxincai"
    ],
    "sort": 10,
    "isVisible": true
  },
  {
    "_id": "section-video",
    "key": "video",
    "title": "抖音同款",
    "subtitle": "看过视频，再按图文复刻",
    "recipeIds": [
      "recipe-waterless-baked-fish",
      "recipe-mini-triangle",
      "recipe-beef-avocado-wrap"
    ],
    "sort": 20,
    "isVisible": true
  },
  {
    "_id": "section-quick",
    "key": "quick",
    "title": "10分钟就能吃上",
    "subtitle": "忙的时候也要好好吃饭",
    "recipeIds": [
      "recipe-wellness-drink-pack",
      "recipe-homemade-vinaigrette",
      "recipe-mini-triangle",
      "recipe-fresh-salsa",
      "recipe-egg-salad-sandwich",
      "recipe-furu-kongxincai"
    ],
    "sort": 30,
    "isVisible": true
  }
];

let settings = {
  "brandName": "吃饭了大小姐",
  "douyinName": "吃饭了大小姐",
  "douyinProfileSchema": "",
  "douyinGroupName": "吃饭了大小姐公开群",
  "douyinGroupSchema": "",
  "serviceDouyinName": "吃饭了大小姐",
  "serviceDouyinProfileSchema": "",
  "homeFeaturedRecipeIds": [
    "recipe-wellness-drink-pack",
    "recipe-homemade-vinaigrette",
    "recipe-waterless-baked-fish",
    "recipe-mini-triangle",
    "recipe-fresh-salsa",
    "recipe-euro-bread-sandwich",
    "recipe-beef-avocado-wrap",
    "recipe-egg-salad-sandwich",
    "recipe-furu-kongxincai"
  ],
  "homeFeaturedRecipeId": "recipe-wellness-drink-pack",
  "communityText": "想每天收到吃饭灵感？加入大小姐饭友群。"
};

const defaultState = clone({ categories, tags, recipes, homeSections, settings });
const seedVersion = 'wechat-recipes-20260622-v1';
const favoritesByUser = new Map();
const adminToken = 'chifan-admin-token';

let mongoDbPromise = null;
let mongoSeeded = false;

function normalizeAddress(address) {
  let next = `${address || ''}`.trim();
  if (!next) return '';
  if (/^mongodb(\+srv)?:\/\//i.test(next)) return next;
  next = next.replace(/\/(\d+)$/, ':$1');
  if (!next.includes(':')) next = `${next}:27017`;
  return next;
}

function getMongoConfig() {
  const directUri = process.env.MONGODB_URI || process.env.DB_MONGODB_URI;
  const databaseName = process.env.DB_MONGODB_DATABASE || process.env.MONGODB_DATABASE || 'chifan_recipes';

  if (directUri) {
    return { uri: directUri, databaseName };
  }

  const address = normalizeAddress(process.env.DB_MONGODB_ADDRESS);
  const account = process.env.DB_MONGODB_ACCOUNT;
  const password = process.env.DB_MONGODB_PASSWORD;

  if (!address || !account || !password) {
    return { uri: '', databaseName };
  }

  const user = encodeURIComponent(account);
  const pass = encodeURIComponent(password);
  return {
    uri: `mongodb://${user}:${pass}@${address}/${databaseName}?authSource=admin`,
    databaseName
  };
}

async function getMongoDb() {
  if (!MongoClient) return null;

  const config = getMongoConfig();
  if (!config.uri) return null;

  if (!mongoDbPromise) {
    mongoDbPromise = MongoClient.connect(config.uri, {
      serverSelectionTimeoutMS: 5000
    })
      .then((client) => client.db(config.databaseName))
      .catch((error) => {
        mongoDbPromise = null;
        console.warn(`MongoDB connection skipped: ${error.message}`);
        return null;
      });
  }

  return mongoDbPromise;
}

async function replaceCollection(name, docs) {
  const db = await getMongoDb();
  if (!db) return;
  const collection = db.collection(name);
  await collection.deleteMany({});
  if (docs.length) {
    await collection.insertMany(clone(docs));
  }
}

async function saveRecipesToMongo() {
  await replaceCollection('recipes', recipes);
}

async function saveCategoriesToMongo() {
  await replaceCollection('categories', categories);
}

async function saveTagsToMongo() {
  await replaceCollection('tags', tags.map((name, index) => ({ _id: name, name, sort: index })));
}

async function saveHomeSectionsToMongo() {
  await replaceCollection('homeSections', homeSections);
}

async function saveSettingsToMongo() {
  const db = await getMongoDb();
  if (!db) return;
  const nextSettings = { ...settings };
  delete nextSettings._id;
  await db.collection('settings').updateOne(
    { _id: 'settings' },
    { $set: nextSettings },
    { upsert: true }
  );
}

async function saveFavoriteToMongo(userId, recipeIds) {
  const db = await getMongoDb();
  if (!db) return;
  await db.collection('favorites').updateOne(
    { _id: userId },
    { $set: { recipeIds, updatedAt: Date.now() } },
    { upsert: true }
  );
}

function withoutId(doc) {
  const next = { ...doc };
  delete next._id;
  return next;
}

async function upsertSeedDocs(db, collectionName, docs) {
  await Promise.all(docs.map((doc) => db.collection(collectionName).updateOne(
    { _id: doc._id },
    {
      $set: withoutId(clone(doc)),
      $setOnInsert: { _id: doc._id }
    },
    { upsert: true }
  )));
}

async function applySeedMigration(db) {
  const settingsDoc = await db.collection('settings').findOne({ _id: 'settings' });
  if (settingsDoc && settingsDoc.seedVersion === seedVersion) return;

  await Promise.all([
    upsertSeedDocs(db, 'recipes', defaultState.recipes),
    upsertSeedDocs(db, 'categories', defaultState.categories),
    upsertSeedDocs(
      db,
      'tags',
      defaultState.tags.map((name, index) => ({ _id: name, name, sort: index }))
    ),
    upsertSeedDocs(db, 'homeSections', defaultState.homeSections)
  ]);

  const settingsOnInsert = { ...defaultState.settings };
  delete settingsOnInsert.homeFeaturedRecipeIds;
  delete settingsOnInsert.homeFeaturedRecipeId;

  await db.collection('settings').updateOne(
    { _id: 'settings' },
    {
      $setOnInsert: settingsOnInsert,
      $set: {
        seedVersion,
        homeFeaturedRecipeIds: defaultState.settings.homeFeaturedRecipeIds,
        homeFeaturedRecipeId: defaultState.settings.homeFeaturedRecipeId
      }
    },
    { upsert: true }
  );
}

async function ensureMongoSeeded(db) {
  if (mongoSeeded) return;

  const recipeCount = await db.collection('recipes').countDocuments({});
  if (!recipeCount) {
    await db.collection('recipes').insertMany(clone(defaultState.recipes));
  }

  const categoryCount = await db.collection('categories').countDocuments({});
  if (!categoryCount) {
    await db.collection('categories').insertMany(clone(defaultState.categories));
  }

  const tagCount = await db.collection('tags').countDocuments({});
  if (!tagCount) {
    await db.collection('tags').insertMany(
      defaultState.tags.map((name, index) => ({ _id: name, name, sort: index }))
    );
  }

  const sectionCount = await db.collection('homeSections').countDocuments({});
  if (!sectionCount) {
    await db.collection('homeSections').insertMany(clone(defaultState.homeSections));
  }

  await db.collection('settings').updateOne(
    { _id: 'settings' },
    { $setOnInsert: defaultState.settings },
    { upsert: true }
  );

  await applySeedMigration(db);

  mongoSeeded = true;
}

async function loadStateFromMongo() {
  const db = await getMongoDb();
  if (!db) return;

  try {
    await ensureMongoSeeded(db);

    const [recipeDocs, categoryDocs, tagDocs, sectionDocs, settingsDoc, favoriteDocs] = await Promise.all([
      db.collection('recipes').find({}).toArray(),
      db.collection('categories').find({}).toArray(),
      db.collection('tags').find({}).sort({ sort: 1 }).toArray(),
      db.collection('homeSections').find({}).toArray(),
      db.collection('settings').findOne({ _id: 'settings' }),
      db.collection('favorites').find({}).toArray()
    ]);

    recipes = recipeDocs.length ? recipeDocs : clone(defaultState.recipes);
    categories = categoryDocs.length ? categoryDocs : clone(defaultState.categories);
    tags = tagDocs.length ? tagDocs.map((tag) => tag.name || tag._id).filter(Boolean) : clone(defaultState.tags);
    homeSections = sectionDocs.length ? sectionDocs : clone(defaultState.homeSections);

    if (settingsDoc) {
      const { _id, ...rest } = settingsDoc;
      settings = { ...defaultState.settings, ...rest };
    }

    favoritesByUser.clear();
    favoriteDocs.forEach((doc) => {
      favoritesByUser.set(doc._id, Array.isArray(doc.recipeIds) ? doc.recipeIds : []);
    });
  } catch (error) {
    console.warn(`MongoDB sync skipped: ${error.message}`);
  }
}

function ok(data) {
  return { success: true, data };
}

function fail(message) {
  return { success: false, message };
}

function sortRecipes(list, sort) {
  const next = list.slice();
  if (sort === 'latest') return next.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
  if (sort === 'favorite') return next.sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0));
  if (sort === 'view') return next.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  return next.sort((a, b) => (b.sortWeight || 0) - (a.sortWeight || 0));
}

function publishedRecipes() {
  return recipes.filter((recipe) => recipe.status === 'published');
}

function getRecipe(id) {
  return recipes.find((recipe) => recipe._id === id);
}

function getUserId(body) {
  return body.openid || body.userId || 'demo-user';
}

function getFavoriteIds(userId) {
  if (!favoritesByUser.has(userId)) favoritesByUser.set(userId, []);
  return favoritesByUser.get(userId);
}

function searchRecipes(keyword) {
  const key = `${keyword || ''}`.trim().toLowerCase();
  if (!key) return [];
  return publishedRecipes().filter((recipe) => {
    return [recipe.title, recipe.subtitle, recipe.categoryName, ...(recipe.tags || []), ...(recipe.ingredients || [])]
      .some((item) => `${item || ''}`.toLowerCase().includes(key));
  });
}

async function handleRecipes(body) {
  await loadStateFromMongo();

  const action = body.action;
  if (action === 'home') {
    const sections = homeSections
      .filter((section) => section.isVisible)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .map((section) => ({
        ...section,
        recipes: section.recipeIds.map(getRecipe).filter(Boolean).filter((recipe) => recipe.status === 'published')
      }));
    return okPublic({
      categories,
      recommended: sortRecipes(publishedRecipes().filter((recipe) => recipe.isRecommended), 'default').slice(0, 5),
      latest: sortRecipes(publishedRecipes(), 'latest').slice(0, 6),
      sections,
      settings
    });
  }
  if (action === 'list') {
    let list = body.includeAll ? recipes.slice() : publishedRecipes();
    if (body.status) list = recipes.filter((recipe) => recipe.status === body.status);
    if (body.categoryId) list = list.filter((recipe) => recipe.categoryId === body.categoryId);
    if (body.keyword) list = searchRecipes(body.keyword);
    return okPublic({ list: sortRecipes(list, body.sort || 'default'), total: list.length });
  }
  if (action === 'detail') {
    return okPublic(getRecipe(body.id) || null);
  }
  if (action === 'search') {
    const list = searchRecipes(body.keyword);
    return okPublic({ list, total: list.length });
  }
  if (action === 'recordView') {
    const recipe = getRecipe(body.recipeId);
    if (recipe) recipe.viewCount = (recipe.viewCount || 0) + 1;
    await saveRecipesToMongo();
    return ok({});
  }
  if (action === 'recordShare') {
    const recipe = getRecipe(body.recipeId);
    if (recipe) recipe.shareCount = (recipe.shareCount || 0) + 1;
    await saveRecipesToMongo();
    return ok({});
  }
  if (action === 'recordVideoClick') {
    const recipe = getRecipe(body.recipeId);
    if (recipe) recipe.videoClickCount = (recipe.videoClickCount || 0) + 1;
    await saveRecipesToMongo();
    return ok({});
  }
  return fail('未知 recipes action');
}

async function handleFavorites(body) {
  await loadStateFromMongo();

  const userId = getUserId(body);
  const ids = getFavoriteIds(userId);
  if (body.action === 'list') {
    return okPublic({ list: ids.map(getRecipe).filter(Boolean), total: ids.length });
  }
  if (body.action === 'status') {
    return ok({ favorited: ids.includes(body.recipeId) });
  }
  if (body.action === 'toggle') {
    const index = ids.indexOf(body.recipeId);
    const recipe = getRecipe(body.recipeId);
    let favorited = false;
    if (index >= 0) {
      ids.splice(index, 1);
      if (recipe) recipe.favoriteCount = Math.max(0, (recipe.favoriteCount || 0) - 1);
    } else {
      ids.unshift(body.recipeId);
      favorited = true;
      if (recipe) recipe.favoriteCount = (recipe.favoriteCount || 0) + 1;
    }
    await Promise.all([saveFavoriteToMongo(userId, ids), saveRecipesToMongo()]);
    return ok({ favorited, favoriteCount: recipe ? recipe.favoriteCount : 0 });
  }
  return fail('未知 favorites action');
}

function requireAdmin(body) {
  return body.token === adminToken;
}

async function handleAdmin(body) {
  await loadStateFromMongo();

  if (body.action === 'login') {
    if (body.username === 'admin' && body.password === 'ChangeMe123!') {
      return ok({ token: adminToken, admin: { username: 'admin', nickname: '大小姐运营', role: 'admin' } });
    }
    return fail('账号或密码不正确');
  }
  if (!requireAdmin(body)) return fail('请先登录后台');

  if (body.action === 'stats') {
    return okPublic({
      totalRecipes: recipes.length,
      publishedRecipes: publishedRecipes().length,
      totalViews: recipes.reduce((sum, item) => sum + (item.viewCount || 0), 0),
      totalFavorites: recipes.reduce((sum, item) => sum + (item.favoriteCount || 0), 0),
      totalShares: recipes.reduce((sum, item) => sum + (item.shareCount || 0), 0),
      totalVideoClicks: recipes.reduce((sum, item) => sum + (item.videoClickCount || 0), 0),
      hotRecipes: sortRecipes(recipes, 'view').slice(0, 5),
      hotSearches: ['早餐', '10分钟', '色拉', '汤']
    });
  }
  if (body.action === 'listRecipes') {
    return handleRecipes({ action: 'list', includeAll: true, keyword: body.keyword, status: body.status, sort: body.sort });
  }
  if (body.action === 'saveRecipe') {
    const input = body.recipe || {};
    const id = input._id || `recipe-${Date.now()}`;
    const next = { ...input, _id: id, updatedAt: Date.now() };
    const index = recipes.findIndex((recipe) => recipe._id === id);
    if (index >= 0) recipes[index] = { ...recipes[index], ...next };
    else recipes.unshift(next);
    await saveRecipesToMongo();
    return okPublic({ recipe: next, saved: true });
  }
  if (body.action === 'deleteRecipe') {
    recipes = recipes.filter((recipe) => recipe._id !== body.id);
    homeSections = homeSections.map((section) => ({
      ...section,
      recipeIds: (section.recipeIds || []).filter((recipeId) => recipeId !== body.id)
    }));
    await Promise.all([saveRecipesToMongo(), saveHomeSectionsToMongo()]);
    return ok({ deleted: true });
  }
  if (body.action === 'updateRecipeStatus') {
    const recipe = getRecipe(body.id);
    if (recipe) recipe.status = body.status;
    await saveRecipesToMongo();
    return ok({ updated: true });
  }
  if (body.action === 'listCategories') return ok({ list: categories });
  if (body.action === 'saveCategory') {
    const input = body.category || {};
    const id = input._id || `category-${Date.now()}`;
    const next = { ...input, _id: id };
    const index = categories.findIndex((item) => item._id === id);
    if (index >= 0) categories[index] = next;
    else categories.push(next);
    await saveCategoriesToMongo();
    return ok({ category: next, saved: true });
  }
  if (body.action === 'listTags') return ok({ list: tags.map((name, index) => ({ _id: `tag-${index}`, name, useCount: 0, isHot: index < 6 })) });
  if (body.action === 'saveTag') {
    const input = body.tag || {};
    const name = `${input.name || ''}`.trim();
    if (!name) return fail('请填写标签名称');
    if (!tags.includes(name)) tags.push(name);
    await saveTagsToMongo();
    return ok({ tag: { ...input, _id: name, name }, saved: true });
  }
  if (body.action === 'listHomeSections') return ok({ list: homeSections });
  if (body.action === 'saveHomeSection') {
    const section = body.section || {};
    const id = section._id || `section-${Date.now()}`;
    const next = { ...section, _id: id };
    const index = homeSections.findIndex((item) => item._id === id);
    if (index >= 0) homeSections[index] = next;
    else homeSections.push(next);
    await saveHomeSectionsToMongo();
    return ok({ section: next, saved: true });
  }
  if (body.action === 'getSettings') return ok(settings);
  if (body.action === 'saveSettings') {
    settings = { ...settings, ...(body.settings || {}) };
    await saveSettingsToMongo();
    return ok({ settings, saved: true });
  }
  return fail('未知 admin action');
}

const app = new Koa();
const router = new Router();

app.use(bodyParser({ jsonLimit: '10mb' }));

router.get('/', (ctx) => {
  ctx.body = ok({ name: 'chifan-recipes-api', status: 'ok' });
});

router.post('/example', (ctx) => {
  ctx.body = ok({ example: ctx.request.body || {} });
});

router.post('/recipes', async (ctx) => {
  ctx.body = await handleRecipes(ctx.request.body || {});
});

router.post('/favorites', async (ctx) => {
  ctx.body = await handleFavorites(ctx.request.body || {});
});

router.post('/admin', async (ctx) => {
  ctx.body = await handleAdmin(ctx.request.body || {});
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`chifan-recipes-api listening on ${port}`);
});
