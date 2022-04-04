import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Library from '../views/Library.vue'
import Dashboard from '../views/Dashboard.vue'
import Groups from '../views/Groups.vue'
import Sessions from '../views/Sessions.vue'
import Settings from '../views/Settings.vue'
import LearnMore from '../views/LearnMore.vue'
import Documentation from '../views/Documentation.vue'
import Visualization from '../views/Visualization.vue'
import DocsVisualization from '../components/Documentation/Visualization.vue'
import DocsSimilarity from '../components/Documentation/Similarity.vue'
import DocsGroups from '../components/Documentation/Groups.vue'
import DocsSessions from '../components/Documentation/Sessions.vue'
import DocsExploration from '../components/Documentation/Exploration.vue'
import DocsLenses from '../components/Documentation/Lenses.vue'
import Recommendations from '../views/Recommendations.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/groups/:groupID?',
    name: 'Groups',
    component: Groups
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: Sessions
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/learn-more',
    name: 'LearnMore',
    component: LearnMore
  },
  {
    path: '/documentation',
    name: 'Documentation',
    component: Documentation,
    children: [{
      path: 'visualization',
      component: DocsVisualization
    },
    {
      path: 'similarity',
      component: DocsSimilarity
    },
    {
      path: 'groups',
      component: DocsGroups
    },
    {
      path: 'sessions',
      component: DocsSessions
    },
    {
      path: 'exploration',
      component: DocsExploration
    },
    {
      path: 'lenses',
      component: DocsLenses
    },
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/library',
    name: 'Library',
    component: Library
  },
  {
    path: '/vis/:sessionID?',
    name: 'Visualization',
    component: Visualization
  },
  {
    path: '/recommendations',
    name: 'Recommendations',
    component: Recommendations
  }
]

const router = new VueRouter({
  routes
})

export default router
