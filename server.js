const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const now = Date.now();

const categories = [
  { _id: 'breakfast', name: '创意早餐', description: '每天都想认真吃的早饭', coverImage: '/assets/images/recipes/euro-bread-sandwich/cover.jpg', sort: 10, isVisible: true },
  { _id: 'quick-10min', name: '10分钟快手料理', description: '忙的时候也能好好吃饭', coverImage: '/assets/images/recipes/furu-kongxincai/cover.jpg', sort: 20, isVisible: true },
  { _id: 'castiron', name: '铸铁锅系列', description: '一口锅做出漂亮家常菜', coverImage: '/assets/images/recipes/waterless-baked-fish/cover.jpg', sort: 30, isVisible: true },
  { _id: 'salad', name: '轻食色拉', description: '清爽、低负担、有满足感', coverImage: '/assets/images/recipes/fresh-salsa/cover.jpg', sort: 40, isVisible: true },
  { _id: 'soup', name: '汤料理', description: '热乎乎的一碗治愈感', coverImage: '/assets/images/recipes/waterless-baked-fish/IMG_2005.jpeg', sort: 50, isVisible: true }
];

const tags = ['早餐', '快手', '10分钟', '新手友好', '低脂', '高蛋白', '色拉', '铸铁锅', '汤', '午餐', '晚餐'];

let recipes = [
  {
    _id: 'recipe-furu-kongxincai',
    title: '腐乳空心菜',
    subtitle: '蒜香浓郁，带着淡淡腐乳香，菜梗脆嫩又下饭',
    categoryId: 'quick-10min',
    categoryName: '10分钟快手料理',
    tags: ['空心菜', '腐乳', '快手', '素菜'],
    cookware: ['铁锅', '不粘锅'],
    timeRequired: '8分钟',
    difficulty: '新手友好',
    ingredients: ['空心菜', '蒜', '腐乳'],
    seasonings: ['盐', '糖', '食用油'],
    steps: [
      { order: 1, text: '空心菜洗净沥干，菜梗和菜叶分开。', image: '/assets/images/recipes/furu-kongxincai/step-ingredients.jpg' },
      { order: 2, text: '锅热放油，蒜末爆香后先炒菜梗。', image: '/assets/images/recipes/furu-kongxincai/step-table.jpg' },
      { order: 3, text: '加入腐乳汁和菜叶，快速翻炒出锅。', image: '/assets/images/recipes/furu-kongxincai/step-finished.jpg' }
    ],
    introImages: ['/assets/images/recipes/furu-kongxincai/intro-01.jpeg', '/assets/images/recipes/furu-kongxincai/intro-02.jpeg'],
    finalImage: '/assets/images/recipes/furu-kongxincai/final.jpeg',
    tips: '大火快炒，菜叶下锅后不要久炒。',
    commonMistakes: '火太小会出水，口感不脆。',
    coverImage: '/assets/images/recipes/furu-kongxincai/cover.jpg',
    videoTitle: '',
    douyinVideoSchema: '',
    douyinVideoId: '',
    showVideoButton: false,
    isRecommended: true,
    sortWeight: 100,
    status: 'published',
    viewCount: 0,
    favoriteCount: 0,
    shareCount: 0,
    videoClickCount: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: now
  },
  {
    _id: 'recipe-fresh-salsa',
    title: '爽口莎莎酱',
    subtitle: '番茄、洋葱和香菜拌一拌，搭配肉类和面包都清爽',
    categoryId: 'salad',
    categoryName: '轻食色拉',
    tags: ['番茄', '清爽', '开胃', '低脂'],
    cookware: ['沙拉碗'],
    timeRequired: '10分钟',
    difficulty: '新手友好',
    ingredients: ['番茄', '洋葱', '香菜', '柠檬'],
    seasonings: ['盐', '黑胡椒', '橄榄油'],
    steps: [
      { order: 1, text: '番茄和洋葱切小丁。', image: '/assets/images/recipes/fresh-salsa/IMG_1989.jpeg' },
      { order: 2, text: '加入香菜、柠檬汁、盐和橄榄油。', image: '/assets/images/recipes/fresh-salsa/IMG_1991.jpeg' },
      { order: 3, text: '拌匀后静置 5 分钟更入味。', image: '/assets/images/recipes/fresh-salsa/IMG_1993.jpeg' }
    ],
    introImages: ['/assets/images/recipes/fresh-salsa/IMG_1988.jpeg', '/assets/images/recipes/fresh-salsa/IMG_1990.jpeg'],
    finalImage: '/assets/images/recipes/fresh-salsa/IMG_1992.jpeg',
    tips: '洋葱切好后可以用冷水泡一下，味道更柔和。',
    commonMistakes: '番茄水分太多会稀，切丁后可稍微控水。',
    coverImage: '/assets/images/recipes/fresh-salsa/cover.jpg',
    videoTitle: '',
    douyinVideoSchema: '',
    douyinVideoId: '',
    showVideoButton: false,
    isRecommended: true,
    sortWeight: 90,
    status: 'published',
    viewCount: 0,
    favoriteCount: 0,
    shareCount: 0,
    videoClickCount: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: now - 1000
  }
];

let homeSections = [
  { _id: 'section-recommend', key: 'recommend', title: '大小姐推荐', subtitle: '先从这几道开始做', recipeIds: ['recipe-furu-kongxincai', 'recipe-fresh-salsa'], sort: 10, isVisible: true },
  { _id: 'section-quick', key: 'quick', title: '10分钟就能吃上', subtitle: '忙的时候也要好好吃饭', recipeIds: ['recipe-furu-kongxincai'], sort: 20, isVisible: true }
];

let settings = {
  brandName: '吃饭了大小姐',
  douyinName: '吃饭了大小姐',
  douyinProfileSchema: '',
  douyinGroupName: '吃饭了大小姐公开群',
  douyinGroupSchema: '',
  serviceDouyinName: '吃饭了大小姐',
  serviceDouyinProfileSchema: '',
  communityText: '想每天收到吃饭灵感？加入大小姐饭友群。'
};

const favoritesByUser = new Map();
const adminToken = 'chifan-admin-token';

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

function handleRecipes(body) {
  const action = body.action;
  if (action === 'home') {
    const sections = homeSections
      .filter((section) => section.isVisible)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .map((section) => ({
        ...section,
        recipes: section.recipeIds.map(getRecipe).filter(Boolean).filter((recipe) => recipe.status === 'published')
      }));
    return ok({
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
    return ok({ list: sortRecipes(list, body.sort || 'default'), total: list.length });
  }
  if (action === 'detail') {
    return ok(getRecipe(body.id) || null);
  }
  if (action === 'search') {
    const list = searchRecipes(body.keyword);
    return ok({ list, total: list.length });
  }
  if (action === 'recordView') {
    const recipe = getRecipe(body.recipeId);
    if (recipe) recipe.viewCount = (recipe.viewCount || 0) + 1;
    return ok({});
  }
  if (action === 'recordShare') {
    const recipe = getRecipe(body.recipeId);
    if (recipe) recipe.shareCount = (recipe.shareCount || 0) + 1;
    return ok({});
  }
  if (action === 'recordVideoClick') {
    const recipe = getRecipe(body.recipeId);
    if (recipe) recipe.videoClickCount = (recipe.videoClickCount || 0) + 1;
    return ok({});
  }
  return fail('未知 recipes action');
}

function handleFavorites(body) {
  const userId = getUserId(body);
  const ids = getFavoriteIds(userId);
  if (body.action === 'list') {
    return ok({ list: ids.map(getRecipe).filter(Boolean), total: ids.length });
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
    return ok({ favorited, favoriteCount: recipe ? recipe.favoriteCount : 0 });
  }
  return fail('未知 favorites action');
}

function requireAdmin(body) {
  return body.token === adminToken;
}

function handleAdmin(body) {
  if (body.action === 'login') {
    if (body.username === 'admin' && body.password === 'ChangeMe123!') {
      return ok({ token: adminToken, admin: { username: 'admin', nickname: '大小姐运营', role: 'admin' } });
    }
    return fail('账号或密码不正确');
  }
  if (!requireAdmin(body)) return fail('请先登录后台');

  if (body.action === 'stats') {
    return ok({
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
    return ok({ recipe: next, saved: true });
  }
  if (body.action === 'deleteRecipe') {
    recipes = recipes.filter((recipe) => recipe._id !== body.id);
    return ok({ deleted: true });
  }
  if (body.action === 'updateRecipeStatus') {
    const recipe = getRecipe(body.id);
    if (recipe) recipe.status = body.status;
    return ok({ updated: true });
  }
  if (body.action === 'listCategories') return ok({ list: categories });
  if (body.action === 'saveCategory') return ok({ category: body.category, saved: true });
  if (body.action === 'listTags') return ok({ list: tags.map((name, index) => ({ _id: `tag-${index}`, name, useCount: 0, isHot: index < 6 })) });
  if (body.action === 'saveTag') return ok({ tag: body.tag, saved: true });
  if (body.action === 'listHomeSections') return ok({ list: homeSections });
  if (body.action === 'saveHomeSection') {
    const section = body.section || {};
    const id = section._id || `section-${Date.now()}`;
    const next = { ...section, _id: id };
    const index = homeSections.findIndex((item) => item._id === id);
    if (index >= 0) homeSections[index] = next;
    else homeSections.push(next);
    return ok({ section: next, saved: true });
  }
  if (body.action === 'getSettings') return ok(settings);
  if (body.action === 'saveSettings') {
    settings = { ...settings, ...(body.settings || {}) };
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

router.post('/recipes', (ctx) => {
  ctx.body = handleRecipes(ctx.request.body || {});
});

router.post('/favorites', (ctx) => {
  ctx.body = handleFavorites(ctx.request.body || {});
});

router.post('/admin', (ctx) => {
  ctx.body = handleAdmin(ctx.request.body || {});
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`chifan-recipes-api listening on ${port}`);
});
