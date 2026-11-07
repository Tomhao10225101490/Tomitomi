import {describe,it,expect} from 'vitest';
import {account,progress,score} from '../lib/rules';
describe('validation and recommendation rules',()=>{
 it('rejects invalid account input',()=>{expect(account.safeParse({email:'bad',password:'short',username:'../',name:''}).success).toBe(false)});
 it('accepts valid input',()=>{expect(account.safeParse({email:'a@b.com',password:'longpassword',username:'alice',name:'Alice'}).success).toBe(true)});
 it('bounds playback progress',()=>{expect(progress(-1,12)).toBe(0);expect(progress(99,12)).toBe(12);expect(progress(NaN,12)).toBe(0)});
 it('ranks category interests higher',()=>{const v={category:'Music',views:100,createdAt:new Date()};expect(score(v,['Music'],false)).toBeGreaterThan(score(v,[],false))});
 it('ranks subscriptions higher',()=>{const v={category:'Music',views:100,createdAt:new Date()};expect(score(v,[],true)).toBeGreaterThan(score(v,[],false))});
 it('ranks freshness higher with otherwise identical metadata',()=>{expect(score({category:'AI',views:10,createdAt:new Date()},[],false)).toBeGreaterThan(score({category:'AI',views:10,createdAt:new Date(0)},[],false))});
});
