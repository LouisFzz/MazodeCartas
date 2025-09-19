
// Límite máximo de cartas en la tabla
const MAX_CARDS = 13;

// Estado principal
let cartas = [];

// Referencias DOM
const form = document.getElementById("formRegistro");
const tablaBody = document.querySelector("#tablaCartas tbody");
const pokerCards = document.getElementById("pokerCards");
const msgBox = document.getElementById("formMessage");

// ------------------ Helpers ------------------
function showMessage(text, type = "error", timeout = 3000) {
	msgBox.textContent = text;
	msgBox.classList.toggle("ok", type === "ok");
	if (timeout) {
		setTimeout(() => {
			msgBox.textContent = "";
			msgBox.classList.remove("ok");
		}, timeout);
	}
}

// Normaliza el valor de "numero" que ingresa el usuario.
// Si coincide con alguna imagen (por data-index o data-num), devuelve la clave data-index.
// Si no, devuelve el texto en mayúsculas (clave libre).
function normalizeNumeroInput(raw) {
	if (!raw) return raw;
	const t = raw.trim();
	// buscar coincidencia entre images
	const imgs = Array.from(pokerCards.querySelectorAll("img"));
	// comparar por data-index exacto
	const byIndex = imgs.find(img => img.dataset.index === t);
	if (byIndex) return byIndex.dataset.index;
	// comparar por data-num (A, 2, J, etc.) sin sensibilidad
	const byNum = imgs.find(img => (img.dataset.num || "").toString().toUpperCase() === t.toUpperCase());
	if (byNum) return byNum.dataset.index;
	// si no hay match con imagen, guardar clave textual en mayúsculas
	return t.toUpperCase();
}

// Obtener etiqueta visible para un numero (si existe imagen con esa clave)
function getVisibleNumeroLabel(key) {
	const img = pokerCards.querySelector(`img[data-index="${key}"]`);
	return img ? (img.dataset.num || key) : key;
}

// Obtener etiqueta carta (nombre) si existe imagen
function getCartaLabelForKey(key) {
	const img = pokerCards.querySelector(`img[data-index="${key}"]`);
	return img ? (img.dataset.carta || getVisibleNumeroLabel(key)) : null;
}

// Busca si ya existe carta por clave (numero normalizado)
function findCardByKey(key) {
	return cartas.find(c => c.numero === key);
}


// ------------------ Render ------------------
function renderTabla() {
	// ordenar por cantidad descendente
	cartas.sort((a,b) => (Number(b.cantidad)||0) - (Number(a.cantidad)||0));

	// Vaciar y rellenar
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

	// Si ya alcanzamos el máximo, indicar en UI
	if (cartas.length >= MAX_CARDS) {
		showMessage(`Máximo ${MAX_CARDS} cartas alcanzado. No se pueden agregar más.`, "error", 3500);
	}
	saveToStorage();
}

// Escapa texto para colocar en HTML
function escapeHtml(text) {
	const d = document.createElement("div");
	d.innerText = text;
	return d.innerHTML;
}

// ------------------ Operaciones sobre cartas ------------------
// Añade una nueva carta (si clave nueva) o incrementa si ya existe.
// Devuelve true si se incrementó/añadió, false si no (por límite o duplicado).
function addOrIncrementByKey(key, cartaLabel=null, caller='action') {
	const existing = findCardByKey(key);
	if (existing) {
		existing.cantidad = (Number(existing.cantidad)||0) + 1;
		showMessage(`Incrementado ${getVisibleNumeroLabel(key)} → ${existing.cantidad}`, "ok", 1200);
		renderTabla();
		return true;
	}
	// no existe -> crear si hay espacio
	if (cartas.length >= MAX_CARDS) {
		showMessage(`No se puede agregar: ya hay ${MAX_CARDS} cartas.`, "error", 3500);
		return false;
	}
	// crear nueva entrada; si cartaLabel es null intentar sacar de imagen
	let label = cartaLabel || getCartaLabelForKey(key) || key;
	cartas.push({ numero: key, carta: label, cantidad: 1 });
	showMessage(`Carta ${getVisibleNumeroLabel(key)} agregada.`, "ok", 1200);
	renderTabla();
	return true;
}

// Añadir vía formulario: chequea duplicados por clave
function addFromForm(rawNumero, rawCarta) {
	const key = normalizeNumeroInput(rawNumero);
	// si la clave ya está en uso, bloquear (no permitir mismo número con otra carta)
	if (findCardByKey(key)) {
		showMessage(`Ya existe una carta con el número "${getVisibleNumeroLabel(key)}".`, "error", 3500);
		return false;
	}
	if (cartas.length >= MAX_CARDS) {
		showMessage(`No se puede agregar: ya hay ${MAX_CARDS} cartas.`, "error", 3500);
		return false;
	}
	// si el usuario escribió un nombre vacío para carta, intentar obtener la de la imagen
	const cartaLabel = rawCarta && rawCarta.trim() ? rawCarta.trim() : (getCartaLabelForKey(key) || rawCarta);
	cartas.push({ numero: key, carta: cartaLabel, cantidad: 1 });
	showMessage(`Carta ${getVisibleNumeroLabel(key)} registrada.`, "ok", 1400);
	renderTabla();
	return true;
}

// ------------------ Eventos ------------------
document.addEventListener("DOMContentLoaded", () => {
	cartas = []; // vaciar siempre al inicio
	bindCardClicks();
	renderTabla();
});

// Form submit (sin recargar)
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

// Click en imagen de carta
function bindCardClicks() {
	const imgs = pokerCards.querySelectorAll("img");
	imgs.forEach(img => {
		img.addEventListener("click", () => {
			const key = img.dataset.index; // la clave principal de la imagen
			// si existe una carta con esta clave -> incrementar
			const found = findCardByKey(key);
			if (found) {
				found.cantidad = (Number(found.cantidad)||0) + 1;
				showMessage(`Incrementado ${getVisibleNumeroLabel(key)} → ${found.cantidad}`, "ok", 1200);
				renderTabla();
				return;
			}
			// si no existe, crear autom. solo si hay espacio
			if (cartas.length >= MAX_CARDS) {
				showMessage(`No se puede agregar: ya hay ${MAX_CARDS} cartas.`, "error", 3500);
				return;
			}
			// crear nueva con etiqueta tomada de data-carta
			addOrIncrementByKey(key, img.dataset.carta || img.dataset.num || key, 'click');
		});
	});
}
