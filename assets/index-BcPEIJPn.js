import{R as o}from"./index-BGsQlR2t.js";import"./iframe-fj4Q5HIO.js";import"./index-CfOrKyLd.js";import"./index-DrFu-skq.js";const e={},c=o.createContext(e);function m(t){const n=o.useContext(c);return o.useMemo(function(){return typeof t=="function"?t(n):{...n,...t}},[n,t])}function s(t){let n;return t.disableParentContext?n=typeof t.components=="function"?t.components(e):t.components||e:n=m(t.components),o.createElement(c.Provider,{value:n},t.children)}export{s as MDXProvider,m as useMDXComponents};
