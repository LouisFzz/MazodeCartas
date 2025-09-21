// Límite máximo de cartas en la tabla
const MAX_CARDS = 13;

// Estado principal
let cartas = [];

// Referencias DOM (pueden ser null si no estamos en cartas.html)
const form = document.getElementById("formRegistro");
const tablaBody = document.querySelector("#tablaCartas tbody");
const pokerCards = document.getElementById("pokerCards");
const msgBox = document.getElementById("formMessage");

// ------------------ Helpers ------------------
function showMessage(text, type = "error", timeout = 3000) {
	if (!msgBox) return; // ⛔ evita errores si no existe
	msgBox.textContent = text;
	msgBox.classList.toggle("ok", type === "ok");
	if (timeout) {
		setTimeout(() => {
			msgBox.textContent = "";
			msgBox.classList.remove("ok");
		}, timeout);
	}
}

function normalizeNumeroInput(raw) {
	if (!raw || !pokerCards) return raw;
	const t = raw.trim();
	const imgs = Array.from(pokerCards.querySelectorAll("img"));
	const byIndex = imgs.find(img => img.dataset.index === t);
	if (byIndex) return byIndex.dataset.index;
	const byNum = imgs.find(img => (img.dataset.num || "").toUpperCase() === t.toUpperCase());
	if (byNum) return byNum.dataset.index;
	return t.toUpperCase();
}

function getVisibleNumeroLabel(key) {
	if (!pokerCards) return key;
	const img = pokerCards.querySelector(`img[data-index="${key}"]`);
	return img ? (img.dataset.num || key) : key;
}

function getCartaLabelForKey(key) {
	if (!pokerCards) return null;
	const img = pokerCards.querySelector(`img[data-index="${key}"]`);
	return img ? (img.dataset.carta || getVisibleNumeroLabel(key)) : null;
}

function findCardByKey(key) {
	return cartas.find(c => c.numero === key);
}

// ------------------ Render ------------------
function renderTabla() {
	if (!tablaBody) return; // ⛔ solo en cartas.html
	cartas.sort((a,b) => (Number(b.cantidad)||0) - (Number(a.cantidad)||0));
	tablaBody.innerHTML = "";
	cartas.forEach(item => {
		const tr = document.createElement("tr");
		const visibleNum = getVisibleNumeroLabel(item.numero);
		const cartaText = item.carta || getCartaLabelForKey(item.numero) || "";
		tr.innerHTML = `
			<td>${visibleNum}</td>
			<td>${escapeHtml(cartaText)}</td>
			<td>${escapeHtml(String(item.cantidad))}</td>
		`;
		tablaBody.appendChild(tr);
	});
	if (cartas.length >= MAX_CARDS) {
		showMessage(`Máximo ${MAX_CARDS} cartas alcanzado.`, "error", 3500);
	}
}

function escapeHtml(text) {
	const d = document.createElement("div");
	d.innerText = text;
	return d.innerHTML;
}

// ------------------ Operaciones ------------------
function addFromForm(rawNumero, rawCarta) {
	const numValue = Number(rawNumero);
	if (isNaN(numValue) || numValue <= 0) {
		showMessage("El número debe ser válido.", "error", 3000);
		return false;
	}
	const key = normalizeNumeroInput(numValue.toString());
	if (findCardByKey(key)) {
		showMessage(`Ya existe una carta con el número "${getVisibleNumeroLabel(key)}".`, "error", 3500);
		return false;
	}
	if (cartas.length >= MAX_CARDS) {
		showMessage(`No se pueden agregar más de ${MAX_CARDS} cartas.`, "error", 3500);
		return false;
	}
	const cartaLabel = rawCarta && rawCarta.trim() ? rawCarta.trim() : (getCartaLabelForKey(key) || rawCarta);
	cartas.push({ numero: key, carta: cartaLabel, cantidad: 1 });
	showMessage(`Carta ${getVisibleNumeroLabel(key)} registrada.`, "ok", 1400);
	renderTabla();
	return true;
}

function bindCardClicks() {
	if (!pokerCards) return;
	const imgs = pokerCards.querySelectorAll("img");
	imgs.forEach(img => {
		img.addEventListener("click", () => {
			const key = img.dataset.index;
			const found = findCardByKey(key);
			if (found) {
				found.cantidad++;
				showMessage(`Incrementado ${getVisibleNumeroLabel(key)} → ${found.cantidad}`, "ok", 1200);
				renderTabla();
				return;
			}
			if (cartas.length >= MAX_CARDS) {
				showMessage(`No se puede agregar: límite ${MAX_CARDS}.`, "error", 3500);
				return;
			}
			cartas.push({ numero: key, carta: img.dataset.carta || img.dataset.num || key, cantidad: 1 });
			showMessage(`Carta ${getVisibleNumeroLabel(key)} agregada.`, "ok", 1200);
			renderTabla();
		});
	});
}

// ------------------ Eventos ------------------
document.addEventListener("DOMContentLoaded", () => {
	// Solo si estamos en cartas.html (porque ahí existen los elementos)
	if (form && tablaBody && pokerCards) {
		cartas = [];
		bindCardClicks();
		renderTabla();

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const rawNumero = document.getElementById("numero").value;
			const rawCarta = document.getElementById("carta").value;
			if (!rawNumero || !rawCarta) {
				showMessage("Rellena ambos campos.", "error", 2000);
				return;
			}
			addFromForm(rawNumero, rawCarta);
			form.reset();
		});
	}
});
