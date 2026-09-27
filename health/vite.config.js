import { resolve } from 'node:path';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
// ../src/lib: ana siteyle paylaşılan TÜRSAB/iletişim sabitleri (src/lib/agency.js, contact-forms.js); geliştirme sunucusu da okuyabilsin.
export default defineConfig({base:'/saglik-turizmi/',server:{fs:{allow:[searchForWorkspaceRoot(import.meta.dirname),resolve(import.meta.dirname,'../src/lib')]}},build:{outDir:'../public/saglik-turizmi',emptyOutDir:true},input:{home:resolve(import.meta.dirname,'index.html'),blog:resolve(import.meta.dirname,'blog.html'),article:resolve(import.meta.dirname,'article.html'),privacy:resolve(import.meta.dirname,'aydinlatma.html')}});
