// Util
import "normalize.css";
import './css/style.css';
// Pages
import './pages/home.js';

const router = () => {
  const main = document.querySelector("main");
  const hash = window.location.hash || "#home";
  console.log(hash);
  switch (hash) {
    case "#home":
      main.innerHTML = "<page-home />";
      break;
    case "#data":
      main.innerHTML = "<page-data/>";
      break;
  }
};

window.addEventListener("hashchange", router);
router();
