
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'
import { useGeneralStore } from './stores/general'
import { messages }from './messages'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap';
import './assets/main.css'

const app = createApp(App)

app.use(createPinia());
app.use(router);

const state = useGeneralStore();
var defaultLanguage = localStorage.getItem("language") ?? 'en';
state.$patch({ language: defaultLanguage })

// Create i18n instance with options
const i18n = createI18n({
  locale: defaultLanguage, // set locale
  fallbackLocale: 'en', // set fallback locale
  messages, // set locale messages
})

app.use(i18n);
app.mount('#app')
