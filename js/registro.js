
const registroForm = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");
const btnRegistro = document.getElementById("btnRegistro");

const datosNegocio = document.getElementById("datosNegocio");
const opcionesCuenta = document.querySelectorAll('input[name="tipoCuenta"]');

const nombreNegocioInput = document.getElementById("businessName");
const slugNegocioInput = document.getElementById("businessSlug");

function mostrarMensaje(texto, tipo = "") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}

function esPropietario() {
    return document.querySelector(
        'input[name="tipoCuenta"]:checked'
    )?.value === "business_owner";
}

function generarSlug(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function actualizarTipoCuenta() {
    const propietario = esPropietario();

    datosNegocio.hidden = !propietario;

    const camposNegocio = datosNegocio.querySelectorAll(
        "input, select, textarea"
    );

    camposNegocio.forEach((campo) => {
        campo.required = propietario;
    });

    mostrarMensaje("");
}

opcionesCuenta.forEach((opcion) => {
    opcion.addEventListener("change", actualizarTipoCuenta);
});

nombreNegocioInput.addEventListener("input", () => {
    // Genera el identificador automáticamente a partir del nombre.
    slugNegocioInput.value = generarSlug(nombreNegocioInput.value);
});

actualizarTipoCuenta();

registroForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!window.supabase || !window.supabaseClient && typeof supabaseClient === "undefined") {
        mostrarMensaje("No se pudo cargar Supabase. Revisa los scripts.", "error");
        return;
    }

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const propietario = esPropietario();

    if (!fullName || !email || !phone || !password || !confirmPassword) {
        mostrarMensaje("Completa todos los campos personales.", "error");
        return;
    }

    if (password.length < 6) {
        mostrarMensaje("La contraseña debe tener al menos 6 caracteres.", "error");
        return;
    }

    if (password !== confirmPassword) {
        mostrarMensaje("Las contraseñas no coinciden.", "error");
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        mostrarMensaje("Ingresa un teléfono de 10 dígitos.", "error");
        return;
    }

    let negocioPendiente = null;

    if (propietario) {
        negocioPendiente = {
            module_slug: document.getElementById("moduleSlug").value,
            name: nombreNegocioInput.value.trim(),
            slug: slugNegocioInput.value.trim().toLowerCase(),
            description: document.getElementById("businessDescription").value.trim(),
            phone: document.getElementById("businessPhone").value.trim(),
            email: document.getElementById("businessEmail").value.trim().toLowerCase(),
            address: document.getElementById("businessAddress").value.trim()
        };

        if (
            !negocioPendiente.module_slug ||
            !negocioPendiente.name ||
            !negocioPendiente.slug ||
            !negocioPendiente.phone ||
            !negocioPendiente.email ||
            !negocioPendiente.address
        ) {
            mostrarMensaje("Completa los datos obligatorios del negocio.", "error");
            return;
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(negocioPendiente.slug)) {
            mostrarMensaje(
                "El identificador del negocio solo admite letras sin acentos, números y guiones.",
                "error"
            );
            return;
        }

        if (!/^\d{10}$/.test(negocioPendiente.phone)) {
            mostrarMensaje(
                "El teléfono del negocio debe tener 10 dígitos.",
                "error"
            );
            return;
        }
    }

    btnRegistro.disabled = true;
    mostrarMensaje("Creando tu cuenta...", "");

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone
                }
            }
        });

        if (error) throw error;

        if (!data.user) {
            throw new Error("Supabase no devolvió los datos de la cuenta.");
        }

        if (propietario) {
            // Solo guardamos los datos del negocio, nunca la contraseña.
            localStorage.setItem(
                "mipymes_pending_business",
                JSON.stringify({
                    email,
                    business: negocioPendiente
                })
            );
        }

        if (data.session) {
            if (propietario) {
                await registrarNegocioPendiente(negocioPendiente);
                mostrarMensaje(
                    "Cuenta y negocio creados. Redirigiendo al panel...",
                    "exito"
                );
                setTimeout(() => {
                    window.location.href = "admin.html";
                }, 900);
            } else {
                mostrarMensaje(
                    "Cuenta creada correctamente. Redirigiendo...",
                    "exito"
                );
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 900);
            }
        } else {
            mostrarMensaje(
                propietario
                    ? "Cuenta creada. Confirma tu correo y después inicia sesión con el mismo correo para terminar el registro del negocio."
                    : "Cuenta creada. Revisa tu correo para confirmar la cuenta y después inicia sesión.",
                "exito"
            );

            btnRegistro.disabled = false;
        }
    } catch (error) {
        console.error("Error en el registro:", error);

        const errorText = String(error.message || "").toLowerCase();

        if (
            errorText.includes("already registered") ||
            errorText.includes("already been registered") ||
            errorText.includes("user already exists")
        ) {
            mostrarMensaje("Ese correo ya tiene una cuenta. Intenta iniciar sesión.", "error");
        } else {
            mostrarMensaje(
                error.message || "No se pudo completar el registro.",
                "error"
            );
        }

        btnRegistro.disabled = false;
    }
});

async function registrarNegocioPendiente(negocio) {
    const { data, error } = await supabaseClient.rpc(
        "register_my_business",
        {
            p_module_slug: negocio.module_slug,
            p_name: negocio.name,
            p_slug: negocio.slug,
            p_description: negocio.description || null,
            p_phone: negocio.phone || null,
            p_email: negocio.email || null,
            p_address: negocio.address || null
        }
    );

    if (error) {
        throw error;
    }

    localStorage.removeItem("mipymes_pending_business");
    return data;
}
