/** @type {import('tailwindcss').Config} */
module.exports={darkMode:'media',content:['./app/**/*.{js,jsx}','./components/**/*.{js,jsx}'],
 theme:{extend:{keyframes:{pop:{'0%':{opacity:0,transform:'translate(-50%,12px)'},'100%':{opacity:1,transform:'translate(-50%,0)'}},up:{'0%':{opacity:0,transform:'translateY(10px)'},'100%':{opacity:1,transform:'translateY(0)'}}},
 animation:{pop:'pop .25s ease-out',up:'up .35s ease-out both'}}},plugins:[]};
