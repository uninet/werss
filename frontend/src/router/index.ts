import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Bloggers from '../views/Bloggers.vue'
import Contents from '../views/Contents.vue'
import Settings from '../views/Settings.vue'
import ArticleReader from '../views/ArticleReader.vue'
import RSSMarket from '../views/RSSMarket.vue'
import Login from '../views/Login.vue'
import WechatHelp from '../views/WechatHelp.vue'
import PopularWechat from '../views/PopularWechat.vue'
import PopularGithub from '../views/PopularGithub.vue'
import PopularZhihu from '../views/PopularZhihu.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/bloggers',
    name: 'Bloggers',
    component: Bloggers,
    meta: { requiresAuth: true }
  },
  {
    path: '/contents',
    name: 'Contents',
    component: Contents,
    meta: { requiresAuth: true }
  },
  {
    path: '/article/:id',
    name: 'ArticleReader',
    component: ArticleReader,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/rss-market',
    name: 'RSSMarket',
    component: RSSMarket,
    meta: { requiresAuth: true }
  },
  {
    path: '/wechat-help',
    name: 'WechatHelp',
    component: WechatHelp,
    meta: { requiresAuth: true }
  },
  {
    path: '/popular-wechat',
    name: 'PopularWechat',
    component: PopularWechat,
    meta: { requiresAuth: true }
  },
  {
    path: '/popular-github',
    name: 'PopularGithub',
    component: PopularGithub,
    meta: { requiresAuth: true }
  },
  {
    path: '/popular-zhihu',
    name: 'PopularZhihu',
    component: PopularZhihu,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录但访问登录页，跳转到首页
    next('/')
  } else {
    next()
  }
})

export default router
