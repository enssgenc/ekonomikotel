import { resolve } from 'node:path';
import { defineConfig } from 'vite';
export default defineConfig({base:'/saglik-turizmi/',build:{outDir:'../public/saglik-turizmi',emptyOutDir:true},input:{home:resolve(import.meta.dirname,'index.html'),blog:resolve(import.meta.dirname,'blog.html'),article:resolve(import.meta.dirname,'article.html')}});
