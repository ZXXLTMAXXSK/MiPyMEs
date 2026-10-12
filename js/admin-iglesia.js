
/* =========================================================
   MiPyMEs — Vista del cliente para Iglesia/Comunidad
   Archivo: js/iglesia-cliente.js
   ========================================================= */

const supabaseIglesiaCliente = supabaseClient;

const paramsIglesia = new URLSearchParams(window.location.search);
const businessIdIglesia = paramsIglesia.get("business_id");

let clienteIglesia = null;
let perfilClienteIglesia = null;
let negocioClienteIglesia = null;
let eventosClienteIglesia = [];
let inscripcionesClienteIglesia = [];

const elementoIglesia = (id) => document.getElementById(id);

/* Fecha local en formato YYYY-MM-DD */
function fechaLocalIglesia() {
    const fecha = new Date();

    fecha.setMinutes(
        fecha.getMinutes() - fecha.getTimezoneOffset()
    );

    return fecha.toISOString().slice(0, 10);
}

/* Escapa contenido para evitar insertar HTML no confiable */
function escIglesia(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

/* Muestra errores de forma controlada */
async function mostrarErrorIglesia(error) {
    console.error("Error en Iglesia/Comunidad:", error);

    const mensaje =
        error?.message ||
        error?.details ||
        "Ocurrió un error inesperado.";

    if (typeof Swal !== "undefined") {
        await Swal.fire({
            icon: "error",
            title: "No se pudo completar la operación",
            text: mensaje
        });
    } else {
        alert(mensaje);
    }
}

/* Inicialización */
document.addEventListener(
    "DOMContentLoaded",
    iniciarVistaIglesiaCliente
);

async function iniciarVistaIglesiaCliente() {
    try {
        if (!supabaseIglesiaCliente) {
            throw new Error(
                "No se encontró supabaseClient. Comprueba que js/supabase.js se cargue antes de este archivo."
            );
        }

        if (!businessIdIglesia) {
            throw new Error(
                "Falta el identificador del negocio. Abre la página con ?business_id=ID_DEL_NEGOCIO."
            );
        }

        const { data: sesion, error: errorSesion } =
            await supabaseIglesiaCliente.auth.getUser();

        if (errorSesion) throw errorSesion;

        if (!sesion.user) {
            if (typeof Swal !== "undefined") {
                await Swal.fire({
                    icon: "info",
                    title: "Inicia sesión",
                    text: "Necesitas iniciar sesión para consultar los eventos."
                });
            }

            window.location.href = "login.html";
            return;
        }

        clienteIglesia = sesion.user;

        const { data: perfil, error: errorPerfil } =
            await supabaseIglesiaCliente
                .from("profiles")
                .select("id,full_name,phone,role")
                .eq("id", clienteIglesia.id)
                .maybeSingle();

        if (errorPerfil) throw errorPerfil;

        if (!perfil) {
            throw new Error(
                "No existe un perfil para este usuario en la tabla profiles."
            );
        }

        if (perfil.role !== "client") {
            if (typeof Swal !== "undefined") {
                await Swal.fire({
                    icon: "warning",
                    title: "Cuenta de cliente requerida",
                    text: "Inicia sesión con una cuenta de cliente para inscribirte."
                });
            }

            window.location.href = "index.html";
            return;
        }

        perfilClienteIglesia = perfil;

        const nombreCliente = elementoIglesia("nombreCliente");

        if (nombreCliente) {
            nombreCliente.textContent =
                perfil.full_name || clienteIglesia.email || "Cliente";
        }

        conectarAccionesClienteIglesia();

        await cargarNegocioClienteIglesia();
        await cargarEventosClienteIglesia();
        await cargarMisInscripcionesIglesia();

    } catch (error) {
        console.error("Inicialización de Iglesia:", error);

        if (typeof Swal !== "undefined") {
            await Swal.fire({
                icon: "error",
                title: "No se pudo cargar Iglesia",
                text: error.message || "Comprueba tu conexión con Supabase."
            });
        } else {
            alert(error.message || "No se pudo cargar Iglesia.");
        }
    }
}

/* Botones de la interfaz */
function conectarAccionesClienteIglesia() {
    const btnActualizar = elementoIglesia("btnActualizar");
    const btnCerrarSesion = elementoIglesia("btnCerrarSesion");

    if (btnActualizar) {
        btnActualizar.addEventListener("click", async () => {
            try {
                await cargarEventosClienteIglesia();
                await cargarMisInscripcionesIglesia();
            } catch (error) {
                await mostrarErrorIglesia(error);
            }
        });
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", async () => {
            let confirmado = true;

            if (typeof Swal !== "undefined") {
                const respuesta = await Swal.fire({
                    title: "¿Cerrar sesión?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Cerrar sesión",
                    cancelButtonText: "Cancelar"
                });

                confirmado = respuesta.isConfirmed;
            } else {
                confirmado = confirm("¿Deseas cerrar sesión?");
            }

            if (!confirmado) return;

            const { error } =
                await supabaseIglesiaCliente.auth.signOut();

            if (error) {
                await mostrarErrorIglesia(error);
                return;
            }

            localStorage.removeItem("mipymes_user");
            window.location.href = "index.html";
        });
    }
}

/* Cargar información del negocio */
async function cargarNegocioClienteIglesia() {
    const { data, error } = await supabaseIglesiaCliente
        .from("businesses")
        .select(`
            id,
            name,
            description,
            phone,
            email,
            address,
            active,
            modules(slug)
        `)
        .eq("id", businessIdIglesia)
        .eq("active", true)
        .maybeSingle();

    if (error) throw error;

    if (!data) {
        throw new Error(
            "No se encontró el negocio o no está activo, o no tienes permiso para consultarlo."
        );
    }

    const modulo = Array.isArray(data.modules)
        ? data.modules[0]
        : data.modules;

    const slug = String(modulo?.slug || "").toLowerCase();

    if (!["iglesia", "comunidad", "church"].includes(slug)) {
        throw new Error(
            `El negocio no pertenece al módulo de Iglesia. Módulo recibido: ${slug || "sin módulo"}.`
        );
    }

    negocioClienteIglesia = data;

    const nombre = elementoIglesia("nombreIglesia");
    const descripcion = elementoIglesia("descripcionIglesia");
    const contacto = elementoIglesia("contactoIglesia");

    if (nombre) nombre.textContent = data.name || "Iglesia/Comunidad";

    if (descripcion) {
        descripcion.textContent =
            data.description ||
            "Consulta los próximos eventos de esta comunidad.";
    }

    if (contacto) {
        contacto.textContent = [
            data.address,
            data.phone,
            data.email
        ].filter(Boolean).join(" · ");
    }
}

/* Cargar eventos publicados */
async function cargarEventosClienteIglesia() {
    const contenedor = elementoIglesia("eventosCliente");

    if (!contenedor) {
        throw new Error(
            "No se encontró el elemento HTML con id='eventosCliente'. Comprueba iglesia-cliente.html."
        );
    }

    contenedor.innerHTML = "<p>Cargando eventos...</p>";

    const hoy = fechaLocalIglesia();

    console.log("[Iglesia] Negocio:", businessIdIglesia);
    console.log("[Iglesia] Fecha local:", hoy);

    /*
      Primero consultamos eventos activos del negocio sin filtrar
      por fecha. Esto permite distinguir entre un problema de fecha
      y un problema de permisos o de consulta.
    */
    const { data: todos, error: errorEventos } =
        await supabaseIglesiaCliente
            .from("church_events")
            .select(`
                id,
                business_id,
                name,
                description,
                event_date,
                start_time,
                end_time,
                capacity,
                active
            `)
            .eq("business_id", businessIdIglesia)
            .eq("active", true)
            .order("event_date", { ascending: true })
            .order("start_time", { ascending: true });

    if (errorEventos) {
        console.error(
            "[Iglesia] Error consultando church_events:",
            errorEventos
        );

        throw errorEventos;
    }

    console.log("[Iglesia] Eventos activos recibidos:", todos);

    /*
      Filtramos en JavaScript para evitar depender de un filtro
      de fecha mal formado. Los eventos sin fecha se muestran
      para que no desaparezcan silenciosamente.
    */
    eventosClienteIglesia = (todos || []).filter((evento) => {
        if (!evento.event_date) return true;

        return String(evento.event_date).slice(0, 10) >= hoy;
    });

    if (!eventosClienteIglesia.length) {
        contenedor.innerHTML = `
            <div class="vacio">
                <h3>No hay próximos eventos</h3>
                <p>
                    La comunidad no tiene eventos activos con fecha de hoy
                    o posterior. Vuelve a consultar más tarde.
                </p>
            </div>
        `;

        return;
    }

    /*
      Consultamos la disponibilidad de cada evento.
      Si la función RPC falla, mostramos el evento igualmente
      y dejamos que la inscripción valide el aforo en el servidor.
    */
    const cantidades = await Promise.all(
        eventosClienteIglesia.map(async (evento) => {
            try {
                const { data, error } =
                    await supabaseIglesiaCliente.rpc(
                        "get_church_event_availability",
                        { p_event_id: evento.id }
                    );

                if (error) {
                    console.warn(
                        "[Iglesia] No se pudo consultar disponibilidad:",
                        evento.id,
                        error
                    );

                    return [evento.id, null];
                }

                const fila = Array.isArray(data) ? data[0] : data;

                return [evento.id, fila || null];

            } catch (error) {
                console.warn(
                    "[Iglesia] Error de disponibilidad:",
                    evento.id,
                    error
                );

                return [evento.id, null];
            }
        })
    );

    const cantidadesPorEvento = new Map(cantidades);

    /*
      Consultamos las inscripciones propias. No se solicita
      información personal de otros asistentes.
    */
    const { data: propias, error: errorPropias } =
        await supabaseIglesiaCliente
            .from("church_attendance")
            .select("id,event_id,attendance_status")
            .eq("customer_id", clienteIglesia.id);

    if (errorPropias) {
        console.error(
            "[Iglesia] Error consultando inscripciones propias:",
            errorPropias
        );

        throw errorPropias;
    }

    inscripcionesClienteIglesia = propias || [];

    contenedor.innerHTML = eventosClienteIglesia.map((evento) => {
        const propia = inscripcionesClienteIglesia.find(
            (registro) =>
                registro.event_id === evento.id &&
                registro.attendance_status !== "absent"
        );

        const cantidad = cantidadesPorEvento.get(evento.id);

        const disponibles = cantidad &&
            cantidad.available !== undefined
                ? Number(cantidad.available)
                : null;

        let boton;

        if (propia) {
            boton = `
                <button type="button" disabled>
                    Ya estás inscrito
                </button>
            `;
        } else if (disponibles !== null && disponibles <= 0) {
            boton = `
                <button type="button" disabled>
                    Aforo completo
                </button>
            `;
        } else {
            boton = `
                <button
                    type="button"
                    data-inscribir="${escIglesia(evento.id)}"
                >
                    Inscribirme
                </button>
            `;
        }

        const hora = evento.start_time
            ? String(evento.start_time).slice(0, 5)
            : "Por confirmar";

        const fin = evento.end_time
            ? String(evento.end_time).slice(0, 5)
            : "";

        const horario = fin ? `${hora} - ${fin}` : hora;

        return `
            <article class="evento-card">
                <span class="estado">Evento activo</span>

                <h3>${escIglesia(evento.name || "Evento")}</h3>

                <p>
                    ${escIglesia(
                        evento.description || "Sin descripción."
                    )}
                </p>

                <div class="evento-meta">
                    <span>
                        📅 ${escIglesia(
                            evento.event_date || "Fecha por confirmar"
                        )}
                    </span>

                    <span>🕒 ${escIglesia(horario)}</span>

                    <span>
                        👥 Aforo: ${Number(evento.capacity || 0)}
                    </span>

                    <span>
                        ${
                            disponibles === null
                                ? "Disponibilidad validada al inscribirte."
                                : `${disponibles} lugares disponibles`
                        }
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

/* Inscripción del cliente a un evento */
async function inscribirClienteIglesia(eventId) {
    const evento = eventosClienteIglesia.find(
        (item) => item.id === eventId
    );

    if (!evento) return;

    let confirmado = true;

    if (typeof Swal !== "undefined") {
        const respuesta = await Swal.fire({
            title: "Confirmar inscripción",
            text: `¿Deseas inscribirte a "${evento.name}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, inscribirme",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#244b78"
        });

        confirmado = respuesta.isConfirmed;
    } else {
        confirmado = confirm(
            `¿Deseas inscribirte a "${evento.name}"?`
        );
    }

    if (!confirmado) return;

    const { data, error } =
        await supabaseIglesiaCliente.rpc(
            "register_church_event",
            {
                p_event_id: eventId,
                p_attendee_name:
                    perfilClienteIglesia.full_name ||
                    clienteIglesia.email ||
                    "Cliente",
                p_attendee_phone:
                    perfilClienteIglesia.phone || null
            }
        );

    if (error) {
        await mostrarErrorIglesia(error);
        return;
    }

    console.log("[Iglesia] Resultado de inscripción:", data);

    if (typeof Swal !== "undefined") {
        await Swal.fire({
            icon: "success",
            title: "¡Inscripción realizada!",
            text: "Puedes consultar tu registro en Mis inscripciones."
        });
    } else {
        alert("¡Inscripción realizada!");
    }

    await cargarEventosClienteIglesia();
    await cargarMisInscripcionesIglesia();
}

/* Mostrar inscripciones del cliente */
async function cargarMisInscripcionesIglesia() {
    const contenedor = elementoIglesia("misInscripciones");

    if (!contenedor) {
        console.warn(
            "No se encontró el elemento HTML con id='misInscripciones'."
        );
        return;
    }

    contenedor.innerHTML = "<p>Cargando tus inscripciones...</p>";

    const { data, error } =
        await supabaseIglesiaCliente
            .from("church_attendance")
            .select(`
                id,
                event_id,
                attendee_name,
                registered_at,
                attendance_status
            `)
            .eq("customer_id", clienteIglesia.id)
            .order("registered_at", { ascending: false });

    if (error) throw error;

    const eventosDelNegocio = new Map(
        eventosClienteIglesia.map((evento) => [evento.id, evento])
    );

    /*
      Consultamos también los eventos de inscripciones anteriores.
      No dependemos de que sigan apareciendo en la lista de próximos.
    */
    const idsFaltantes = [
        ...new Set(
            (data || [])
                .map((registro) => registro.event_id)
                .filter((id) => !eventosDelNegocio.has(id))
        )
    ];

    if (idsFaltantes.length) {
        const { data: anteriores, error: errorAnteriores } =
            await supabaseIglesiaCliente
                .from("church_events")
                .select("id,business_id,name,event_date,start_time,end_time")
                .in("id", idsFaltantes)
                .eq("business_id", businessIdIglesia);

        if (errorAnteriores) throw errorAnteriores;

        (anteriores || []).forEach((evento) => {
            eventosDelNegocio.set(evento.id, evento);
        });
    }

    const misRegistros = (data || []).filter((registro) =>
        eventosDelNegocio.has(registro.event_id)
    );

    if (!misRegistros.length) {
        contenedor.innerHTML = `
            <div class="vacio">
                Todavía no tienes inscripciones a eventos de esta comunidad.
            </div>
        `;

        return;
    }

    const nombresEstado = {
        pending: "Pendiente",
        attended: "Asististe",
        absent: "Cancelada o ausente"
    };

    contenedor.innerHTML = misRegistros.map((registro) => {
        const evento = eventosDelNegocio.get(registro.event_id);

        const estado =
            nombresEstado[registro.attendance_status] || "Pendiente";

        const puedeCancelar =
            registro.attendance_status === "pending";

        return `
            <article class="inscripcion-card">
                <div>
                    <h3>
                        ${escIglesia(evento?.name || "Evento")}
                    </h3>

                    <p>
                        Fecha:
                        ${escIglesia(
                            evento?.event_date || "No disponible"
                        )}
                    </p>

                    <p>
                        Estado: <strong>${escIglesia(estado)}</strong>
                    </p>

                    <p>
                        Registro:
                        ${escIglesia(
                            registro.registered_at
                                ? new Date(
                                    registro.registered_at
                                  ).toLocaleString("es-MX")
                                : "No disponible"
                        )}
                    </p>
                </div>

                ${
                    puedeCancelar
                        ? `
                            <button
                                class="cancelar"
                                type="button"
                                data-cancelar="${escIglesia(registro.id)}"
                            >
                                Cancelar inscripción
                            </button>
                        `
                        : ""
                }
            </article>
        `;
    }).join("");

    contenedor.querySelectorAll("[data-cancelar]").forEach((boton) => {
        boton.addEventListener("click", () => {
            cancelarInscripcionIglesia(boton.dataset.cancelar);
        });
    });
}

/* Cancelar una inscripción pendiente */
async function cancelarInscripcionIglesia(registroId) {
    let confirmado = true;

    if (typeof Swal !== "undefined") {
        const respuesta = await Swal.fire({
            title: "¿Cancelar inscripción?",
            text: "Tu lugar volverá a estar disponible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "Volver"
        });

        confirmado = respuesta.isConfirmed;
    } else {
        confirmado = confirm("¿Deseas cancelar tu inscripción?");
    }

    if (!confirmado) return;

    const { data, error } =
        await supabaseIglesiaCliente
            .from("church_attendance")
            .update({ attendance_status: "absent" })
            .eq("id", registroId)
            .eq("customer_id", clienteIglesia.id)
            .eq("attendance_status", "pending")
            .select("id");

    if (error) {
        await mostrarErrorIglesia(error);
        return;
    }

    if (!data || data.length === 0) {
        await mostrarErrorIglesia(
            new Error(
                "No se pudo cancelar el registro. Puede que ya esté cancelado o que la política de seguridad no permita modificarlo."
            )
        );
        return;
    }

    if (typeof Swal !== "undefined") {
        await Swal.fire({
            icon: "success",
            title: "Inscripción cancelada"
        });
    } else {
        alert("Inscripción cancelada.");
    }

    await cargarEventosClienteIglesia();
    await cargarMisInscripcionesIglesia();
}
