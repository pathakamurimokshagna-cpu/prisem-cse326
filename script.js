// Pick an image based on the item name (with a fallback if no match)
function getItemImage(name) {
  let n = name.toLowerCase();
  if (n.includes("watch")) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop";
  if (n.includes("paint") || n.includes("art")) return "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop";
  if (n.includes("game") || n.includes("console") || n.includes("gaming") || n.includes("controller")) {
    return "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop";
  }
  if (n.includes("chair") || n.includes("wood") || n.includes("table")) return "https://images.unsplash.com/photo-1503602642458-232111445657?w=500&auto=format&fit=crop";
  if (n.includes("camera")) return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop";
  if (n.includes("shoe") || n.includes("sneaker")) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop";
}

// Fallback picture if offline or image link fails
function fallbackPic(imgEl) {
  imgEl.onerror = null;
  imgEl.src = "https://via.placeholder.com/400x250?text=" + encodeURIComponent(imgEl.alt || "Auction Item");
}

let items = [
  { id: 1, name: "Vintage Watch", cat: "Watches", price: 100, top: "", open: true, winner: "", paid: false, reviews: [], info: "1960s classic watch." },
  { id: 2, name: "Oil Painting", cat: "Art", price: 50, top: "", open: true, winner: "", paid: false, reviews: [], info: "Framed countryside art." },
  { id: 3, name: "Game Console", cat: "Tech", price: 70, top: "", open: true, winner: "", paid: false, reviews: [], info: "Retro 90s console." },
  { id: 4, name: "Wooden Chair", cat: "Furniture", price: 40, top: "", open: true, winner: "", paid: false, reviews: [], info: "Solid wood chair." }
];

let orders = [];
let user = "Alice";
let page = "shop";
let viewId = null;
let q = "", cat = "All", sort = "name";

function go(p) { page = p; viewId = null; render(); }

function shopView() {
  let list = items.filter(x => x.name.toLowerCase().includes(q.toLowerCase()) && (cat === "All" || x.cat === cat));
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);

  let cats = ["All", ...new Set(items.map(x => x.cat))];
  let html = `<div class="row">
    <input placeholder="Search..." value="${q}" onchange="q=this.value; render()">
    <select onchange="cat=this.value; render()">${cats.map(c => `<option ${c === cat ? "selected" : ""}>${c}</option>`).join("")}</select>
    <select onchange="sort=this.value; render()">
      <option value="name" ${sort === "name" ? "selected" : ""}>Name</option>
      <option value="low" ${sort === "low" ? "selected" : ""}>Price: Low-High</option>
      <option value="high" ${sort === "high" ? "selected" : ""}>Price: High-Low</option>
    </select>
  </div><div class="grid">`;

  for (let x of list) {
    html += `<div class="card">
      <img class="thumb" src="${getItemImage(x.name)}" alt="${x.name}" onerror="fallbackPic(this)">
      <b>${x.name}</b> <span class="${x.open ? "open" : "closed"}">[${x.open ? "Open" : "Closed"}]</span>
      <p>${x.cat} — <b>$${x.price}</b></p>
      <button onclick="viewId=${x.id}; render()">View</button>
    </div>`;
  }
  return html + "</div>";
}

function detailView() {
  let x = items.find(i => i.id === viewId);
  let avg = x.reviews.length ? (x.reviews.reduce((s, r) => s + r.stars, 0) / x.reviews.length).toFixed(1) : "None";
  let html = `<button class="gray" onclick="go('shop')">Back</button>
    <div class="card">
      <img class="big" src="${getItemImage(x.name)}" alt="${x.name}" onerror="fallbackPic(this)">
      <h3>${x.name}</h3>
      <p>${x.info}</p>
      <p>Price: <b>$${x.price}</b> ${x.top ? "(Top: " + x.top + ")" : ""}</p>`;

  if (x.open) {
    html += `<input id="bidVal" type="number" placeholder="Your bid">
      <button onclick="bid(${x.id})">Bid</button>
      <button class="gray" onclick="quickBid(${x.id})">+$5</button>`;
  } else {
    html += `<p class="closed">Closed — Winner: ${x.winner || "None"}</p>`;
  }

  html += `<h4>Reviews (Avg: ${avg})</h4>`;
  for (let r of x.reviews) html += `<p>${"★".repeat(r.stars)} - ${r.msg} <i>(${r.who})</i></p>`;

  if (x.winner === user && x.paid) {
    html += `<select id="stars"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select>
      <input id="revMsg" placeholder="Review...">
      <button onclick="addRev(${x.id})">Post</button>`;
  }
  return html + "</div>";
}

function bid(id) {
  if (user === "Admin") return alert("Admin cannot bid");
  let x = items.find(i => i.id === id);
  let val = Number(document.getElementById("bidVal").value);
  if (val <= x.price) return alert("Bid higher than $" + x.price);
  x.price = val; x.top = user;
  render();
}

function quickBid(id) {
  if (user === "Admin") return alert("Admin cannot bid");
  let x = items.find(i => i.id === id);
  x.price += 5; x.top = user;
  render();
}

function addRev(id) {
  let x = items.find(i => i.id === id);
  let msg = document.getElementById("revMsg").value.trim();
  if (!msg) return;
  x.reviews.push({ who: user, stars: Number(document.getElementById("stars").value), msg });
  render();
}

function cartView() {
  let mine = items.filter(i => i.winner === user && !i.paid);
  let total = mine.reduce((s, i) => s + i.price, 0);
  let html = "<h3>My Cart</h3>";

  if (!mine.length) html += "<p>No unpaid won items.</p>";
  else {
    html += `<table><tr><th>Item</th><th>Price</th></tr>` +
      mine.map(i => `<tr><td><img class="mini" src="${getItemImage(i.name)}" alt="${i.name}" onerror="fallbackPic(this)">${i.name}</td><td>$${i.price}</td></tr>`).join("") +
      `</table><p><b>Total: $${total}</b></p><button onclick="checkout()">Checkout</button>`;
  }

  html += "<h3>My Orders</h3>";
  for (let o of orders.filter(o => o.user === user)) {
    html += `<div class="card">Order #${o.id}: ${o.names} — $${o.total} (${o.status})</div>`;
  }
  return html;
}

function checkout() {
  let mine = items.filter(i => i.winner === user && !i.paid);
  let addr = prompt("Shipping address:");
  if (!addr) return;
  mine.forEach(i => i.paid = true);
  orders.push({ id: orders.length + 1, user, names: mine.map(i => i.name).join(", "), total: mine.reduce((s, i) => s + i.price, 0), status: "Processing" });
  alert("Order placed!");
  render();
}

function adminView() {
  if (user !== "Admin") return "<p class='closed'>Switch user to Admin.</p>";
  let html = `<h3>Add Item</h3><div class="row">
    <input id="n" placeholder="Name (e.g. Game Console)">
    <input id="c" placeholder="Category">
    <input id="p" type="number" placeholder="Price">
    <button onclick="addItem()">Add</button>
  </div><h3>Items</h3>`;

  for (let x of items) {
    html += `<div class="card">
      <img class="mini" src="${getItemImage(x.name)}" alt="${x.name}" onerror="fallbackPic(this)">
      <b>${x.name}</b> — $${x.price} (${x.open ? "Open" : "Closed"})
      ${x.open ? `<button onclick="endBid(${x.id})">End</button>` : ""}
      <button class="red" onclick="delItem(${x.id})">Delete</button>
    </div>`;
  }

  html += "<h3>Orders</h3>";
  for (let o of orders) {
    html += `<div class="card">#${o.id} (${o.user}): ${o.names} — $${o.total} [${o.status}]
      ${o.status === "Processing" ? `<button onclick="ship(${o.id})">Ship</button>` : ""}</div>`;
  }
  return html;
}

function addItem() {
  let name = document.getElementById("n").value.trim();
  let catVal = document.getElementById("c").value.trim() || "General";
  let price = Number(document.getElementById("p").value);
  if (!name || price <= 0) return alert("Enter name and price");
  items.push({ id: Date.now(), name, cat: catVal, price, top: "", open: true, winner: "", paid: false, reviews: [], info: "New item." });
  render();
}

function endBid(id) { let x = items.find(i => i.id === id); x.open = false; x.winner = x.top; render(); }
function delItem(id) { items = items.filter(i => i.id !== id); render(); }
function ship(id) { orders.find(o => o.id === id).status = "Shipped"; render(); }

function render() {
  let app = document.getElementById("app");
  if (viewId) app.innerHTML = detailView();
  else if (page === "shop") app.innerHTML = shopView();
  else if (page === "cart") app.innerHTML = cartView();
  else if (page === "admin") app.innerHTML = adminView();
}

render();
