import {createRequire} from 'module';
const require=createRequire(import.meta.url);
const {FlatCompat}=require('@eslint/eslintrc');
const compat=new FlatCompat({baseDirectory:process.cwd()});
const config=[{ignores:['.next/**','node_modules/**','public/**','logs/**','next-env.d.ts']},...compat.extends('next/core-web-vitals','next/typescript'),{rules:{'@typescript-eslint/no-explicit-any':'off','@typescript-eslint/no-unused-vars':'off','react-hooks/exhaustive-deps':'off','@next/next/no-img-element':'off','@next/next/no-html-link-for-pages':'off'}}];

export default config;
