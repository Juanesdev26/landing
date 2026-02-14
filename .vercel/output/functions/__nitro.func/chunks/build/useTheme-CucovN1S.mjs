import{ref as e,computed as t,readonly as a}from"vue";const h=()=>{const r=e("light"),l=t(()=>"dark"===r.value);return{theme:a(r),isDark:l,toggleTheme:()=>{r.value=l.value?"light":"dark"},setTheme:e=>{"light"!==e&&"dark"!==e||(r.value=e)},initTheme:()=>{},watchSystemTheme:()=>{}}};export{h};
//# sourceMappingURL=useTheme-CucovN1S.mjs.map
