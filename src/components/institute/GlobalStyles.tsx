// src/components/institute/GlobalStyles.tsx

import { useEffect } from 'react';

export default function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement('style');

    style.innerHTML = `
      html{
        scroll-behavior:smooth;
      }

      body{
        margin:0;
        overflow-x:hidden;
        background:#faf7f2;
        color:#2d2a26;
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;

        -webkit-font-smoothing:antialiased;
        -moz-osx-font-smoothing:grayscale;

        text-rendering:optimizeLegibility;
      }

      *{
        box-sizing:border-box;
      }

      *::selection{
        background:#b58a3d;
        color:white;
      }

      img{
        user-select:none;
        -webkit-user-drag:none;
      }

      ::-webkit-scrollbar{
        width:0;
        height:0;
      }

      a{
        color:inherit;
      }

      button{
        font:inherit;
      }

      input,
      textarea,
      select{
        font:inherit;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}