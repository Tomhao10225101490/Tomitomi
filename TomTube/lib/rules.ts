import {z} from 'zod';
export const account=z.object({email:z.string().email().max(200),password:z.string().min(10).max(100),username:z.string().regex(/^[a-z0-9_]{3,30}$/),name:z.string().min(1).max(80)});
export function score(v:{category:string;views:number;createdAt:Date},categories:string[],subscribed:boolean){return (categories.includes(v.category)?40:0)+(subscribed?30:0)+Math.log1p(v.views)*2+20/(1+(Date.now()-v.createdAt.getTime())/86400000);}
export const progress=(value:number,duration:number)=>Math.max(0,Math.min(duration,Number.isFinite(value)?value:0));
