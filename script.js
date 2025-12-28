// ===== LOGIN =====
const loginDiv = document.getElementById("login");
const appArea = document.getElementById("appArea");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

function checkLogin() {
  if (localStorage.getItem("isLoggedIn") === "true") {
    loginDiv.style.display = "none";
    appArea.style.display = "block";
    startApp();
  } else {
    loginDiv.style.display = "block";
    appArea.style.display = "none";
  }
}

loginBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) {
    alert("Lütfen kullanıcı adı girin");
    return;
  }
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("username", name);
  checkLogin();
};

checkLogin();

// ===== APP =====
function startApp() {
  // Filmler dizisi
  const movies = [
    { title: "Inception", video: "https://www.youtube.com/embed/YoHD9XEInc0" },
    { title: "Interstellar", video: "https://www.youtube.com/embed/zSWdZVtXT7E" },
    { title: "Joker", video: "https://www.youtube.com/embed/zAGVQLHvwOY" }
  ];

  const username = localStorage.getItem("username");
  let favorites = JSON.parse(localStorage.getItem(`favorites_${username}`)) || [];

  // MENU
  const menu = document.createElement("div");
  menu.className = "menu";

  const allBtn = document.createElement("button"); allBtn.textContent = "Tüm Filmler"; allBtn.className = "active";
  const favBtn = document.createElement("button"); favBtn.textContent = "Favoriler";
  const logoutBtn = document.createElement("button"); logoutBtn.textContent = "Çıkış";

  menu.appendChild(allBtn);
  menu.appendChild(favBtn);
  menu.appendChild(logoutBtn);

  // Arama kutusu
  const searchInput = document.createElement("input");
  searchInput.placeholder = "Favorilerde ara...";
  searchInput.style.marginLeft = "10px";
  searchInput.style.padding = "5px";
  searchInput.style.borderRadius = "6px";
  searchInput.style.border = "none";
  searchInput.style.background = "#333";
  searchInput.style.color = "white";
  searchInput.style.display = "none"; 
  menu.appendChild(searchInput);
  searchInput.oninput = renderActive;

  appArea.appendChild(menu);

  logoutBtn.onclick = () => { localStorage.setItem("isLoggedIn", "false"); location.reload(); }

  // APP
  const app = document.createElement("div"); app.className = "app"; appArea.appendChild(app);

  // MODAL
  const modal = document.createElement("div"); modal.className = "modal";
  modal.innerHTML = `<div class="modal-content"><span class="close">&times;</span><iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe></div>`;
  document.body.appendChild(modal);
  const iframe = modal.querySelector("iframe");

  modal.querySelector(".close").onclick = () => { iframe.src = ""; modal.style.display = "none"; }

  let activePage = "all";

  // RENDER FONKSİYONU
  function render(list) {
    app.innerHTML = "";
    list.forEach(movie => {
      const item = document.createElement("div");
      item.className = "movie";

      // overlay-wrapper
      const overlayWrapper = document.createElement("div");
      overlayWrapper.className = "overlay-wrapper";

      const play = document.createElement("div");
      play.className = "play-overlay";
      play.textContent = "▶ İZLE";
      play.onclick = () => { iframe.src = movie.video; modal.style.display = "flex"; };

      overlayWrapper.appendChild(play);

      // title
      const title = document.createElement("span");
      title.textContent = movie.title;

      // favorite button
      const btn = document.createElement("button");
      btn.textContent = favorites.includes(movie.title) ? "Favorilerden Çıkar" : "Favorilere Ekle";
      btn.onclick = (e) => {
        e.stopPropagation(); // overlay clickini engelle
        if (favorites.includes(movie.title)) favorites = favorites.filter(f => f !== movie.title);
        else favorites.push(movie.title);
        localStorage.setItem(`favorites_${username}`, JSON.stringify(favorites));
        renderActive();
      };

      item.appendChild(overlayWrapper);
      item.appendChild(title);
      item.appendChild(btn);
      app.appendChild(item);
    });
  }

  function renderActive() {
    let list;
    if (activePage === "all") {
      list = movies;
      searchInput.style.display = "none";
    } else {
      list = movies.filter(m => favorites.includes(m.title));
      searchInput.style.display = "inline-block";
    }

    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) list = list.filter(m => m.title.toLowerCase().includes(searchTerm));

    list.sort((a, b) => a.title.localeCompare(b.title));

    render(list);
  }

  allBtn.onclick = () => { activePage = "all"; allBtn.classList.add("active"); favBtn.classList.remove("active"); renderActive(); }
  favBtn.onclick = () => { activePage = "fav"; favBtn.classList.add("active"); allBtn.classList.remove("active"); renderActive(); }

  render(movies);

  // ===== ADMIN PANEL =====
  const adminDiv = document.getElementById("admin");
  const newTitleInput = document.getElementById("newTitle");
  const newVideoInput = document.getElementById("newVideo");
  const addMovieBtn = document.getElementById("addMovieBtn");

  addMovieBtn.onclick = () => {
    const title = newTitleInput.value.trim();
    const video = newVideoInput.value.trim();

    if (!title || !video) {
      alert("Film adı ve video linki girin!");
      return;
    }

    movies.push({ title, video });

    newTitleInput.value = "";
    newVideoInput.value = "";

    renderActive();

    alert(`"${title}" filmi eklendi!`);
  };
}

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch((err) => console.log('Service Worker error', err));
}
