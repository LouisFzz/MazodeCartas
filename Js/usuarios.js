document.addEventListener("DOMContentLoaded", () => {
	// LOGIN
	const loginForm = document.getElementById("formLogin");
	if (loginForm) {
		loginForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const usuarioCorreo = document.getElementById("usuariocorreo").value.trim();
			const pass = document.getElementById("contraseña").value;

			let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
			const encontrado = usuarios.find(
				u => (u.usuario === usuarioCorreo || u.correo === usuarioCorreo)
			);

			const msg = document.getElementById("loginMessage");

			if (!encontrado) {
				msg.textContent = "❌ La cuenta no existe.";
				return;
			}
			if (encontrado.password !== pass) {
				msg.textContent = "⚠️ Contraseña incorrecta.";
				return;
			}

			msg.textContent = "✅ Bienvenido " + encontrado.usuario;
			setTimeout(() => {
				window.location.href = "cartas.html"; // ir al tablero
			}, 1000);
		});
	}

	// REGISTRO
	const regForm = document.getElementById("formLoginreg");
	if (regForm) {
		regForm.addEventListener("submit", (e) => {
			e.preventDefault();
			const usuario = document.getElementById("usuario").value.trim();
			const correo = document.getElementById("correo").value.trim();
			const pass = document.getElementById("contraseña").value;

			let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
			const msg = document.getElementById("loginMessage");

			// Validar duplicados
			if (usuarios.find(u => u.usuario === usuario)) {
				msg.textContent = "⚠️ El usuario ya existe.";
				return;
			}
			if (usuarios.find(u => u.correo === correo)) {
				msg.textContent = "⚠️ El correo ya está registrado.";
				return;
			}

			// Guardar usuario
			usuarios.push({ usuario, correo, password: pass });
			localStorage.setItem("usuarios", JSON.stringify(usuarios));

			msg.textContent = "✅ Registro exitoso.";
			setTimeout(() => {
				window.location.href = "index.html"; // volver al login
			}, 1200);
		});
	}
});
