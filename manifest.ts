export default {
  manifest_version: 3,
  name: 'Assiste Comigo',
  description: 'Assista a filmes, séries e animes com quem você gosta',
  version: '1.0',
  action: {
    default_popup: 'index.html',
  },
  content_scripts: [
    {
      js: ['./content.js'],
      matches: ['<all_urls>'],
      run_at: 'document_end',
    },
  ],
  permissions: ['storage', 'scripting', 'activeTab'],
  background: {
    service_worker: './background.js',
  },
  host_permissions: ['<all_urls>'],
};
