
/* MiPyMEs: vista de cliente para Iglesia/Comunidad.
   Usa las tablas existentes de Supabase. */

const supabaseIglesiaCliente = supabaseClient;

const paramsIglesia = new URLSearchParams(location.search);
const businessIdIglesia = paramsIglesia.get("business_id");

let clienteIglesia = null;
let perfilClienteIglesia = null;
let negocioClienteIglesia = null;
let eventosClienteIglesia = [];
let inscripcionesClienteIglesia = [];

const elementoIglesia = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", iniciarVistaIglesiaCliente);

async function iniciarVistaIglesiaCliente() {
    try {
        if (!businessIdIglesia) {
            throw new Error("No se especificó el negocio de Iglesia.");
        }

        const { data: { user }, error } =
            await supabaseIglesiaCliente.auth.getUser();

        if (error || !user) {
            await Swal.fire({
                icon: "info",
                title: "Inicia sesión",
                text: "Necesitas una cuenta de MiPyMEs para consultar tus inscripciones."
            });

            location.href = "login.html";
            return;
        }

        clienteIglesia = user;

        const { data: perfil, error: errorPerfil } =
            await supabaseIglesiaCliente
                .from("profiles")
                .select("id,full_name,phone,role")
                .eq("id", user.id)
                .single();

        if (errorPerfil || !perfil) {
            throw errorPerfil || new Error("No se encontró el perfil.");
        }

        if (perfil.role !== "client") {
            await Swal.fire({
                icon: "warning",
                title: "Cuenta de cliente requerida",
                text: "Inicia sesión con tu cuenta de cliente para inscribirte a eventos."
            });

            location.href = "index.html";
            return;
        }

        perfilClienteIglesia = perfil;

        elementoIglesia("nombreCliente").textContent =
            perfil.full_name || user.email || "Cliente";

        conectarAccionesClienteIglesia();

        await cargarNegocioClienteIglesia();
        await cargarEventosClienteIglesia();
        await cargarMisInscripcionesIglesia();

    } catch (error) {
        console.error("Vista de Iglesia:", error);

        await Swal.fire({
            icon: "error",
            title: "No se pudo cargar Iglesia",
            text: error.message || "Comprueba tu conexión con Supabase."
        });
    }
}

function conectarAccionesClienteIglesia() {
    elementoIglesia("btnActualizar").addEventListener("click", async () => {
        try {
            await cargarEventosClienteIglesia();
            await cargarMisInscripcionesIglesia();
        } catch (error) {
            console.error(error);
            mostrarErrorIglesia(error);
        }
    });

    elementoIglesia("btnCerrarSesion").addEventListener("click", async () => {
        const confirmacion = await Swal.fire({
            title: "¿Cerrar sesión?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Cerrar sesión",
            cancelButtonText: "Cancelar"
        });

        if (!confirmacion.isConfirmed) return;

        const { error } = await supabaseIglesiaCliente.auth.signOut();

        if (error) {
            mostrarErrorIglesia(error);
            return;
        }

        localStorage.removeItem("mipymes_user");
        location.href = "index.html";
    });
}

async function cargarNegocioClienteIglesia() {
    const { data, error } = await supabaseIglesiaCliente
        .from("businesses")
        .select("id,name,description,phone,email,address,active,modules(slug)")
        .eq("id", businessIdIglesia)
        .eq("active", true)
        .single();

    if (error) throw error;

    const slug = String(data.modules?.slug || "").toLowerCase();

    if (!["iglesia", "comunidad", "church"].includes(slug)) {
        throw new Error("El negocio seleccionado no pertenece al módulo de Iglesia.");
    }

    negocioClienteIglesia = data;

    elementoIglesia("nombreIglesia").textContent = data.name;
    elementoIglesia("descripcionIglesia").textContent =
        data.description || "Consulta los próximos eventos de esta comunidad.";

    elementoIglesia("contactoIglesia").textContent =
        [data.address, data.phone, data.email].filter(Boolean).join(" · ");
}

async function cargarEventosClienteIglesia() {
    const contenedor = elementoIglesia("eventosCliente");

    contenedor.innerHTML = "<p>Cargando eventos...</p>";

    const hoy = new Date().toLocaleDateString("en-CA");

    const { data, error } = await supabaseIglesiaCliente
        .from("church_events")
        .select("id,business_id,name,description,event_date,start_time,end_time,capacity,active")
        .eq("business_id", businessIdIglesia)
        .eq("active", true)
        .gte("event_date", hoy)
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

    if (error) throw error;

    eventosClienteIglesia = data || [];

    if (!eventosClienteIglesia.length) {
        contenedor.innerHTML = `
            <div class="vacio">
                No hay próximos eventos publicados por el momento.
            </div>
        `;
        return;
    }

    // Obtiene solo cantidades agregadas, nunca datos personales
    // de los demás asistentes.
    const cantidades = await Promise.all(
        eventosClienteIglesia.map(async (evento) => {
            const { data: resultado, error: errorCantidad } =
                await supabaseIglesiaCliente.rpc(
                    "get_church_event_availability",
                    { p_event_id: evento.id }
                );

            if (errorCantidad) throw errorCantidad;

            const fila = Array.isArray(resultado)
                ? resultado[0]
                : resultado;

            return [evento.id, fila || null];
        })
    );

    const cantidadesPorEvento = new Map(cantidades);

    const { data: propias, error: errorPropias } =
        await supabaseIglesiaCliente
            .from("church_attendance")
            .select("id,event_id,attendance_status")
            .eq("customer_id", clienteIglesia.id);

    if (errorPropias) throw errorPropias;

    inscripcionesClienteIglesia = propias || [];

    contenedor.innerHTML = eventosClienteIglesia.map((evento) => {
        const propia = inscripcionesClienteIglesia.find(
            (registro) =>
                registro.event_id === evento.id &&
                registro.attendance_status !== "absent"
        );

        const cantidad = cantidadesPorEvento.get(evento.id);
        const disponibles = cantidad
            ? Number(cantidad.available)
            : null;

        let boton = "";

        if (propia) {
            boton = `<button type="button" disabled>Ya estás inscrito</button>`;
        } else if (disponibles !== null && disponibles <= 0) {
            boton = `<button type="button" disabled>Aforo completo</button>`;
        } else {
            boton = `
                <button type="button" data-inscribir="${escIglesia(evento.id)}">
                    Inscribirme
                </button>
            `;
        }

        return `
            <article class="evento-card">
                <span class="estado">Evento activo</span>
                <h3>${escIglesia(evento.name)}</h3>
                <p>${escIglesia(evento.description || "Sin descripción.")}</p>

                <div class="evento-meta">
                    <span>📅 ${escIglesia(evento.event_date || "Fecha por confirmar")}</span>
                    <span>🕒 ${escIglesia(String(evento.start_time || "").slice(0, 5))}</span>
                    <span>👥 Aforo: ${Number(evento.capacity || 0)}</span>
                    <span>
                        ${disponibles === null
                            ? "Consulta la disponibilidad al inscribirte."
                            : `${disponibles} lugares disponibles`}
                    </span>
                </div>

                ${boton}
            </article>
        `;
    }).join("");

    contenedor.querySelectorAll("[data-inscribir]").forEach((boton) => {
        boton.addEventListener("click", () => {
            inscribirClienteIglesia(boton.dataset.inscribir);
        });
    });
}

async function inscribirClienteIglesia(eventId) {
    const evento = eventosClienteIglesia.find((e) => e.id === eventId);
    if (!evento) return;

    const confirmacion = await Swal.fire({
        title: "Confirmar inscripción",
        text: `¿Deseas inscribirte a "${evento.name}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, inscribirme",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#244b78"
    });

    if (!confirmacion.isConfirmed) return;

    const { error } = await supabaseIglesiaCliente.rpc(
        "register_church_event",
        {
            p_event_id: eventId,
            p_attendee_name:
                perfilClienteIglesia.full_name || clienteIglesia.email,
            p_attendee_phone: perfilClienteIglesia.phone || null
        }
    );

    if (error) {
        console.error("Error al inscribirse:", error);
        mostrarErrorIglesia(error);
        return;
    }

    await Swal.fire({
        icon: "success",
        title: "¡Inscripción confirmada!",
        text: "Ya puedes consultar tu registro en Mis inscripciones."
    });

    await cargarEventosClienteIglesia();
    await cargarMisInscripcionesIglesia();
}

async function cargarMisInscripcionesIglesia() {
    const contenedor = elementoIglesia("misInscripciones");

    const { data, error } = await supabaseIglesiaCliente
        .from("church_attendance")
        .select("id,event_id,attendee_name,registered_at,attendance_status")
        .eq("customer_id", clienteIglesia.id)
        .order("registered_at", { ascending: false });

    if (error) throw error;

    const eventosDelNegocio = new Map(
        eventosClienteIglesia.map((e) => [e.id, e])
    );

    // También mostramos inscripciones anteriores a los eventos próximos.
    const idsFaltantes = [...new Set(
        (data || [])
            .map((a) => a.event_id)
            .filter((id) => !eventosDelNegocio.has(id))
    )];

    if (idsFaltantes.length) {
        const { data: anteriores, error: errorAnteriores } =
            await supabaseIglesiaCliente
                .from("church_events")
                .select("id,name,event_date,start_time")
                .in("id", idsFaltantes);

        if (errorAnteriores) throw errorAnteriores;

        (anteriores || []).forEach((evento) => {
            eventosDelNegocio.set(evento.id, evento);
        });
    }

    const misRegistros = (data || []).filter((registro) => {
        // Esta página muestra registros de la Iglesia seleccionada.
        // El negocio se verifica mediante el evento.
        return eventosDelNegocio.has(registro.event_id);
    });

    if (!misRegistros.length) {
        contenedor.innerHTML = `
            <div class="vacio">
                Todavía no tienes inscripciones a eventos.
            </div>
        `;
        return;
    }

    contenedor.innerHTML = misRegistros.map((registro) => {
        const evento = eventosDelNegocio.get(registro.event_id);

        const estado = {
            pending: "Pendiente",
            attended: "Asististe",
            absent: "Cancelada o ausente"
        }[registro.attendance_status] || "Pendiente";

        const puedeCancelar =
            registro.attendance_status === "pending";

        return `
            <article class="inscripcion-card">
                <div>
                    <h3>${escIglesia(evento?.name || "Evento")}</h3>
                    <p>Fecha: ${escIglesia(evento?.event_date || "No disponible")}</p>
                    <p>Estado: <strong>${estado}</strong></p>
                    <p>Registro: ${escIglesia(registro.registered_at || "")}</p>
                </div>

                ${puedeCancelar
                    ? `<button class="cancelar" type="button"
                         data-cancelar="${escIglesia(registro.id)}">
                         Cancelar inscripción
                       </button>`
                    : ""}
            </article>
        `;
    }).join("");

    contenedor.querySelectorAll("[data-cancelar]").forEach((boton) => {
        boton.addEventListener("click", () => {
            cancelarInscripcionIglesia(boton.dataset.cancelar);
        });
    });
}

async function cancelarInscripcionIglesia(registroId) {
    const confirmacion = await Swal.fire({
        title: "¿Cancelar inscripción?",
        text: "Tu lugar volverá a estar disponible.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Volver"
    });

    if (!confirmacion.isConfirmed) return;

    const { error } = await supabaseIglesiaCliente
        .from("church_attendance")
        .update({ attendance_status: "absent" })
        .eq("id", registroId)
        .eq("customer_id", clienteIglesia.id)
        .eq("attendance_status", "pending");

    if (error) {
        console.error("Error cancelando inscripción:", error);
        mostrarErrorIglesia(error);
        return;
    }

    await Swal.fire({
        icon: "success",
        title: "Inscripción cancelada"
    });

    await cargarEventosClienteIglesia();
    await cargarMisInscripcionesIglesia();
}

function escIglesia(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function mostrarErrorIglesia(error) {
    const mensaje = error?.message || "Ocurrió un error.";

    Swal.fire({
        icon: "error",
        title: "No se pudo completar la operación",
        text: mensaje
    });
}
