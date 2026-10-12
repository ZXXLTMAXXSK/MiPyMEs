// =====================================================

// MiPyMEs - Vista del cliente

// =====================================================



console.log("MiPyMEs - Inicio iniciado");





// =====================================================

// ELEMENTOS

// =====================================================



const modulesGrid =

    document.getElementById("modulesGrid");



const businessesGrid =

    document.getElementById("businessesGrid");



const usuarioNav =

    document.getElementById("usuarioNav");



const misCitasContainer =

    document.getElementById("misCitasContainer");



const historialContainer =

    document.getElementById("historialContainer");



const negocioModal =

    document.getElementById("negocioModal");



const negocioDetalle =

    document.getElementById("negocioDetalle");



const btnCerrarNegocio =

    document.getElementById("btnCerrarNegocio");





// =====================================================

// USUARIO ACTUAL

// =====================================================



let usuarioActual = null;



let perfilActual = null;





// =====================================================

// HISTORIAL

// =====================================================



let historialActual = [];



let filtroHistorial = "todos";





// =====================================================

// INICIAR

// =====================================================



document.addEventListener(

    "DOMContentLoaded",

    iniciarInicio

);





async function iniciarInicio() {



    await cargarUsuarioNav();



    await cargarModulos();



    await cargarNegocios();



    if (usuarioActual) {



        await cargarMisCitas();



        await cargarHistorial();



    } else {



        ocultarMisCitas();



        ocultarHistorial();



    }



}





// =====================================================

// USUARIO EN NAV

// =====================================================



async function cargarUsuarioNav() {



    if (!usuarioNav) return;





    const {

        data: {

            user

        },

        error

    } =

        await supabaseClient

            .auth

            .getUser();





    if (error) {



        console.error(

            "Error obteniendo usuario:",

            error

        );



        return;

    }





    // =============================================

    // USUARIO NO AUTENTICADO

    // =============================================



    if (!user) {



        usuarioActual = null;



        usuarioNav.innerHTML = `



            <a href="login.html">

                Iniciar sesión

            </a>



            <a

                href="registro.html"

                class="btn-nav"

            >

                Crear cuenta

            </a>



        `;



        return;

    }





    // =============================================

    // USUARIO AUTENTICADO

    // =============================================



    usuarioActual = user;





    const {

        data: perfil,

        error: perfilError

    } =

        await supabaseClient

            .from("profiles")

            .select(

                "id, full_name, phone, role"

            )

            .eq(

                "id",

                user.id

            )

            .single();





    if (perfilError) {



        console.error(

            "Error obteniendo perfil:",

            perfilError

        );



        return;

    }





    perfilActual = perfil;





    const nombre =

        perfil?.full_name ||

        "Usuario";





    usuarioNav.innerHTML = `



        <span class="saludo">



            Hola,

            ${escapeHTML(nombre)}

            👋



        </span>



        <button

            type="button"

            id="btnCerrarSesion"

            class="btn-cerrar"

        >

            Cerrar sesión

        </button>



    `;





    const btnCerrarSesion =

        document.getElementById(

            "btnCerrarSesion"

        );





    if (btnCerrarSesion) {



        btnCerrarSesion.addEventListener(

            "click",

            cerrarSesion

        );



    }





    // =============================================

    // PERSONALIZAR HERO

    // =============================================



    const heroTitulo =

        document.getElementById(

            "heroTitulo"

        );



    const heroDescripcion =

        document.getElementById(

            "heroDescripcion"

        );





    if (heroTitulo) {



        heroTitulo.innerHTML = `



            Hola,



            <strong>

                ${escapeHTML(nombre)}.

            </strong>



        `;



    }





    if (heroDescripcion) {



        heroDescripcion.textContent =

            "Encuentra servicios, negocios y horarios disponibles para realizar tus reservas.";



    }



}





// =====================================================

// CERRAR SESIÓN

// =====================================================



async function cerrarSesion() {



    const confirmacion =

        await Swal.fire({



            title:

                "¿Cerrar sesión?",



            text:

                "Tendrás que iniciar sesión nuevamente para realizar reservas.",



            icon:

                "question",



            showCancelButton:

                true,



            confirmButtonText:

                "Sí, cerrar sesión",



            cancelButtonText:

                "Cancelar",



            confirmButtonColor:

                "#24446d",



            cancelButtonColor:

                "#6b7280",



            reverseButtons:

                true



        });





    if (!confirmacion.isConfirmed) {



        return;



    }





    const {

        error

    } =

        await supabaseClient

            .auth

            .signOut();





    if (error) {



        console.error(

            "Error cerrando sesión:",

            error

        );



        return;

    }





    localStorage.removeItem(

        "mipymes_user"

    );





    window.location.href =

        "index.html";



}





// =====================================================

// CARGAR MÓDULOS

// =====================================================



async function cargarModulos() {



    try {



        console.log(

            "Consultando modules..."

        );





        const {

            data,

            error

        } =

            await supabaseClient

                .from("modules")

                .select(

                    "id, name, slug, description"

                )

                .order(

                    "name"

                );





        if (error) {



            console.error(

                "Error modules:",

                error

            );



            throw error;

        }





        if (

            !data ||

            data.length === 0

        ) {



            modulesGrid.innerHTML = `



                <div class="empty">



                    No hay módulos registrados.



                </div>



            `;



            return;

        }





        modulesGrid.innerHTML =

            data.map(

                module => {



                    let icono = "•";





                    if (

                        module.slug ===

                        "barberia"

                    ) {



                        icono = "✂";



                    }





                    if (

                        module.slug ===

                        "iglesia"

                    ) {



                        icono = "✦";



                    }





                    if (

                        module.slug ===

                        "restaurante"

                    ) {



                        icono = "▣";



                    }





                    return `



                        <article

                            class="module-card"

                        >



                            <div

                                class="module-icon"

                            >



                                ${icono}



                            </div>



                            <div>



                                <h3>



                                    ${escapeHTML(

                                        module.name

                                    )}



                                </h3>



                                <p>



                                    ${escapeHTML(

                                        module.description ||

                                        ""

                                    )}



                                </p>



                            </div>



                        </article>



                    `;



                }

            ).join("");





    } catch (error) {



        console.error(

            "ERROR AL CARGAR MÓDULOS:",

            error

        );





        modulesGrid.innerHTML = `



            <div class="error">



                No se pudieron cargar

                los módulos.



            </div>



        `;



    }



}





// =====================================================

// CARGAR NEGOCIOS

// =====================================================



async function cargarNegocios() {



    try {



        console.log(

            "Consultando businesses..."

        );





        const {

            data,

            error

        } =

            await supabaseClient

                .from("businesses")

                .select(`

                    id,

                    name,

                    slug,

                    description,

                    phone,

                    email,

                    address,

                    logo_url,

                    cover_url,

                    active

                `)

                .eq(

                    "active",

                    true

                )

                .order(

                    "name"

                );





        if (error) {



            console.error(

                "Error businesses:",

                error

            );



            throw error;

        }





        if (

            !data ||

            data.length === 0

        ) {



            businessesGrid.innerHTML = `



                <div

                    class="empty-businesses"

                >



                    <h3>

                        No hay negocios disponibles

                    </h3>



                    <p>

                        Los negocios aparecerán

                        aquí cuando sean registrados.

                    </p>



                </div>



            `;



            return;

        }





        businessesGrid.innerHTML =

            data.map(

                business => {



                    return `



                        <article

                            class="business-card"

                        >



                            <div

                                class="business-cover"

                            >



                                ${

                                    business.cover_url



                                    ?



                                    `



                                        <img

                                            src="${escapeAttribute(

                                                business.cover_url

                                            )}"

                                            alt="${escapeAttribute(

                                                business.name

                                            )}"

                                        >



                                    `



                                    :



                                    `



                                        <div

                                            class="cover-placeholder"

                                        >



                                            ${escapeHTML(

                                                business.name

                                            )}



                                        </div>



                                    `

                                }



                            </div>





                            <div

                                class="business-info"

                            >



                                <div

                                    class="business-logo"

                                >



                                    ${

                                        business.logo_url



                                        ?



                                        `



                                            <img

                                                src="${escapeAttribute(

                                                    business.logo_url

                                                )}"

                                                alt="${escapeAttribute(

                                                    business.name

                                                )}"

                                            >



                                        `



                                        :



                                        `



                                            <span>



                                                ${escapeHTML(

                                                    business.name

                                                        .charAt(0)

                                                        .toUpperCase()

                                                )}



                                            </span>



                                        `

                                    }



                                </div>





                                <div

                                    class="business-text"

                                >



                                    <h3>



                                        ${escapeHTML(

                                            business.name

                                        )}



                                    </h3>





                                    <p>



                                        ${escapeHTML(

                                            business.description ||

                                            "Negocio registrado en MiPyMEs."

                                        )}



                                    </p>





                                    ${

                                        business.address



                                        ?



                                        `



                                            <small>



                                                ${escapeHTML(

                                                    business.address

                                                )}



                                            </small>



                                        `



                                        :



                                        ""

                                    }



                                </div>



                            </div>





                            <button

                                type="button"

                                class="business-button"

                                onclick="abrirNegocio(

                                    '${business.id}'

                                )"

                            >



                                Ver negocio



                                <span>

                                    →

                                </span>



                            </button>





                        </article>



                    `;



                }

            ).join("");





    } catch (error) {



        console.error(

            "ERROR AL CARGAR NEGOCIOS:",

            error

        );





        businessesGrid.innerHTML = `



            <div class="error">



                <h3>

                    No se pudieron cargar

                    los negocios.

                </h3>



                <p>

                    Revisa la consola del navegador.

                </p>



            </div>



        `;



    }



}





// =====================================================

// ABRIR NEGOCIO

// =====================================================



async function abrirNegocio(id) {



    localStorage.setItem(

        "mipymes_business_id",

        id

    );





    // =============================================

    // OBTENER NEGOCIO

    // =============================================



    const {

        data: negocio,

        error

    } =

        await supabaseClient

            .from("businesses")

            .select(`

                id,

                name,

                description,

                phone,

                email,

                address,

                logo_url,

                cover_url

            `)

            .eq(

                "id",

                id

            )

            .eq(

                "active",

                true

            )

            .single();





    if (error) {



        console.error(

            "Error negocio:",

            error

        );





        Swal.fire({



            icon:

                "error",



            title:

                "No se pudo cargar",



            text:

                "No fue posible obtener la información del negocio.",



            confirmButtonColor:

                "#24446d"



        });





        return;

    }





    negocioDetalle.innerHTML = `



        <div class="loading">



            Cargando información...



        </div>



    `;





    negocioModal.classList.add(

        "active"

    );





    // =============================================

    // CARGAR SERVICIOS

    // =============================================



    const {

        data: servicios,

        error: serviciosError

    } =

        await supabaseClient

            .from("barber_services")

            .select(`

                id,

                name,

                description,

                price,

                duration_minutes,

                active

            `)

            .eq(

                "business_id",

                negocio.id

            )

            .eq(

                "active",

                true

            )

            .order(

                "name"

            );





    if (serviciosError) {



        console.error(

            "Error servicios:",

            serviciosError

        );



    }





    // =============================================

    // CARGAR EMPLEADOS

    // =============================================



    /*

        La tabla real barber_employees tiene:



        id

        business_id

        name

        description

        photo_url

        active

        created_at



        No tiene:



        specialty

        position

        phone

    */





    const {

        data: empleados,

        error: empleadosError

    } =

        await supabaseClient

            .from("barber_employees")

            .select(`

                id,

                business_id,

                name,

                description,

                photo_url,

                active

            `)

            .eq(

                "business_id",

                negocio.id

            )

            .eq(

                "active",

                true

            )

            .order(

                "name"

            );





    if (empleadosError) {



        console.error(

            "Error empleados:",

            empleadosError

        );



    }





    // =============================================

    // GENERAR SERVICIOS

    // =============================================



    let serviciosHTML = "";





    if (

        servicios &&

        servicios.length

    ) {



        serviciosHTML =

            servicios.map(

                servicio => `



                    <article

                        class="cliente-servicio"

                    >



                        <div>



                            <h4>



                                ${escapeHTML(

                                    servicio.name

                                )}



                            </h4>





                            <p>



                                ${escapeHTML(

                                    servicio.description ||

                                    "Servicio disponible."

                                )}



                            </p>





                            <div

                                class="servicio-meta"

                            >



                                <strong>



                                    $${Number(

                                        servicio.price || 0

                                    ).toFixed(2)}



                                </strong>





                                <span>



                                    ${servicio.duration_minutes || 0}

                                    min



                                </span>



                            </div>



                        </div>





                        <button

                            type="button"

                            class="btn-reservar"

                            onclick="iniciarReserva(

                                '${servicio.id}'

                            )"

                        >



                            Reservar



                        </button>





                    </article>



                `

            ).join("");



    } else {



        serviciosHTML = `



            <div class="empty-detalle">



                <p>

                    Este negocio todavía no

                    tiene servicios disponibles.

                </p>



            </div>



        `;



    }





    // =============================================

    // GENERAR EMPLEADOS

    // =============================================



    let empleadosHTML = "";





    if (

        empleados &&

        empleados.length

    ) {



        empleadosHTML =

            empleados.map(

                empleado => {



                    const inicial =

                        empleado.name

                            ? empleado.name

                                .charAt(0)

                                .toUpperCase()

                            : "?";





                    return `



                        <div

                            class="empleado-card"

                        >



                            <div

                                class="empleado-avatar"

                            >



                                ${

                                    empleado.photo_url



                                    ?



                                    `



                                        <img

                                            src="${escapeAttribute(

                                                empleado.photo_url

                                            )}"

                                            alt="${escapeAttribute(

                                                empleado.name

                                            )}"

                                        >



                                    `



                                    :



                                    `



                                        ${escapeHTML(

                                            inicial

                                        )}



                                    `

                                }



                            </div>





                            <div>



                                <strong>



                                    ${escapeHTML(

                                        empleado.name ||

                                        "Empleado"

                                    )}



                                </strong>





                                <span>



                                    ${escapeHTML(

                                        empleado.description ||

                                        "Profesional"

                                    )}



                                </span>



                            </div>



                        </div>



                    `;



                }

            ).join("");



    } else {



        empleadosHTML = `



            <p class="detalle-muted">



                No hay empleados disponibles.



            </p>



        `;



    }





    // =============================================

    // DETALLE COMPLETO

    // =============================================



    negocioDetalle.innerHTML = `



        <div

            class="detalle-cover"

        >



            ${

                negocio.cover_url



                ?



                `



                    <img

                        src="${escapeAttribute(

                            negocio.cover_url

                        )}"

                        alt="${escapeAttribute(

                            negocio.name

                        )}"

                    >



                `



                :



                `



                    <div

                        class="detalle-cover-placeholder"

                    >



                        ${escapeHTML(

                            negocio.name

                        )}



                    </div>



                `

            }



        </div>





        <div

            class="detalle-header"

        >



            <div

                class="detalle-logo"

            >



                ${

                    negocio.logo_url



                    ?



                    `



                        <img

                            src="${escapeAttribute(

                                negocio.logo_url

                            )}"

                            alt="${escapeAttribute(

                                negocio.name

                            )}"

                        >



                    `



                    :



                    `



                        <span>



                            ${escapeHTML(

                                negocio.name

                                    .charAt(0)

                                    .toUpperCase()

                            )}



                        </span>



                    `

                }



            </div>





            <div>



                <span class="eyebrow">

                    Negocio

                </span>



                <h2>



                    ${escapeHTML(

                        negocio.name

                    )}



                </h2>



                <p>



                    ${escapeHTML(

                        negocio.description ||

                        "Negocio disponible en MiPyMEs."

                    )}



                </p>



            </div>



        </div>





        <div

            class="detalle-contacto"

        >



            ${

                negocio.address



                ?



                `



                    <span>



                        📍



                        ${escapeHTML(

                            negocio.address

                        )}



                    </span>



                `



                :



                ""

            }





            ${

                negocio.phone



                ?



                `



                    <span>



                        ☎



                        ${escapeHTML(

                            negocio.phone

                        )}



                    </span>



                `



                :



                ""

            }



        </div>





        <section

            class="detalle-section"

        >



            <div

                class="detalle-section-header"

            >



                <div>



                    <span class="eyebrow">

                        Servicios

                    </span>



                    <h3>

                        ¿Qué deseas reservar?

                    </h3>



                </div>



            </div>





            <div

                class="cliente-servicios"

            >



                ${serviciosHTML}



            </div>



        </section>





        <section

            class="detalle-section"

        >



            <div

                class="detalle-section-header"

            >



                <div>



                    <span class="eyebrow">

                        Equipo

                    </span>



                    <h3>

                        Profesionales disponibles

                    </h3>



                </div>



            </div>





            <div

                class="empleados-cliente"

            >



                ${empleadosHTML}



            </div>



        </section>



    `;



}





// =====================================================

// =====================================================
// INICIAR RESERVA
// =====================================================

async function iniciarReserva(servicioId) {

    // ---------------------------------------------
    // VERIFICAR SESIÓN
    // ---------------------------------------------

    if (!usuarioActual) {

        const resultado = await Swal.fire({

            icon: "info",

            title: "Inicia sesión",

            text: "Necesitas una cuenta para poder reservar un servicio.",

            showCancelButton: true,

            confirmButtonText: "Iniciar sesión",

            cancelButtonText: "Cancelar",

            confirmButtonColor: "#24446d",

            cancelButtonColor: "#6b7280",

            reverseButtons: true

        });

        if (resultado.isConfirmed) {
            window.location.href = "login.html";
        }

        return;
    }


    // ---------------------------------------------
    // OBTENER SERVICIO
    // ---------------------------------------------

    const {
        data: servicio,
        error: servicioError
    } = await supabaseClient

        .from("barber_services")

        .select(`
            id,
            business_id,
            name,
            description,
            price,
            duration_minutes,
            active
        `)

        .eq("id", servicioId)

        .eq("active", true)

        .single();


    if (servicioError || !servicio) {

        console.error("Error obteniendo servicio:", servicioError);

        Swal.fire({

            icon: "error",

            title: "No se pudo cargar",

            text: "No fue posible obtener la información del servicio.",

            confirmButtonColor: "#24446d"

        });

        return;
    }


    // ---------------------------------------------
    // OBTENER EMPLEADOS
    // ---------------------------------------------

    const {
        data: empleados,
        error: empleadosError
    } = await supabaseClient

        .from("barber_employees")

        .select(`
            id,
            business_id,
            name,
            description,
            photo_url,
            active
        `)

        .eq("business_id", servicio.business_id)

        .eq("active", true)

        .order("name");


    if (empleadosError) {

        console.error("Error obteniendo empleados:", empleadosError);

        Swal.fire({

            icon: "error",

            title: "No se pudieron cargar los empleados",

            text: "Intenta nuevamente.",

            confirmButtonColor: "#24446d"

        });

        return;
    }


    if (!empleados || empleados.length === 0) {

        Swal.fire({

            icon: "info",

            title: "Sin empleados disponibles",

            text: "Este negocio todavía no tiene empleados disponibles para reservar.",

            confirmButtonColor: "#24446d"

        });

        return;
    }


    // ---------------------------------------------
    // FECHA MÍNIMA
    // ---------------------------------------------

    const hoy = new Date();

    const fechaMinima =
        hoy.getFullYear() +
        "-" +
        String(hoy.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(hoy.getDate()).padStart(2, "0");


    // ---------------------------------------------
    // OPCIONES DE EMPLEADOS
    // ---------------------------------------------

    const empleadosOptions = empleados.map(

        empleado => `

            <option value="${escapeAttribute(empleado.id)}">
                ${escapeHTML(empleado.name)}
            </option>

        `

    ).join("");


    // ---------------------------------------------
    // VENTANA DE RESERVA
    // ---------------------------------------------

    const resultado = await Swal.fire({

        title: "Reservar servicio",

        width: 620,

        showCancelButton: true,

        confirmButtonText: "Confirmar reserva",

        cancelButtonText: "Cancelar",

        confirmButtonColor: "#24446d",

        cancelButtonColor: "#6b7280",

        reverseButtons: true,

        focusConfirm: false,

        html: `

            <div style="text-align:left;">

                <div style="
                    padding:16px;
                    background:#f6f8fb;
                    border-radius:12px;
                    margin-bottom:20px;
                ">

                    <div style="
                        font-size:13px;
                        color:#64748b;
                        margin-bottom:5px;
                    ">
                        SERVICIO
                    </div>

                    <div style="
                        font-size:20px;
                        font-weight:700;
                        color:#1f2937;
                    ">
                        ${escapeHTML(servicio.name)}
                    </div>

                    <div style="
                        margin-top:6px;
                        color:#64748b;
                    ">
                        $${Number(servicio.price || 0).toFixed(2)}
                        ·
                        ${Number(servicio.duration_minutes || 0)} minutos
                    </div>

                </div>


                <label style="
                    display:block;
                    margin-bottom:7px;
                    font-weight:600;
                    color:#334155;
                ">
                    Empleado
                </label>

                <select
                    id="reservaEmpleado"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px;
                        border:1px solid #d5dce5;
                        border-radius:8px;
                        margin-bottom:18px;
                        font-size:15px;
                        background:white;
                    "
                >

                    <option value="">
                        Selecciona un empleado
                    </option>

                    ${empleadosOptions}

                </select>


                <label style="
                    display:block;
                    margin-bottom:7px;
                    font-weight:600;
                    color:#334155;
                ">
                    Fecha
                </label>

                <input
                    id="reservaFecha"
                    type="date"
                    min="${fechaMinima}"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px;
                        border:1px solid #d5dce5;
                        border-radius:8px;
                        margin-bottom:18px;
                        font-size:15px;
                    "
                >


                <label style="
                    display:block;
                    margin-bottom:7px;
                    font-weight:600;
                    color:#334155;
                ">
                    Horario disponible
                </label>

                <select
                    id="reservaHorario"
                    disabled
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px;
                        border:1px solid #d5dce5;
                        border-radius:8px;
                        margin-bottom:18px;
                        font-size:15px;
                        background:white;
                    "
                >

                    <option value="">
                        Primero selecciona empleado y fecha
                    </option>

                </select>


                <label style="
                    display:block;
                    margin-bottom:7px;
                    font-weight:600;
                    color:#334155;
                ">
                    Teléfono
                </label>

                <input
                    id="reservaTelefono"
                    type="tel"
                    value="${escapeAttribute(perfilActual?.phone || "")}"
                    placeholder="Tu número de teléfono"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px;
                        border:1px solid #d5dce5;
                        border-radius:8px;
                        font-size:15px;
                    "
                >

                <div
                    id="reservaMensaje"
                    style="
                        margin-top:14px;
                        font-size:14px;
                        color:#64748b;
                    "
                >
                    Selecciona empleado y fecha para consultar los horarios.
                </div>

            </div>

        `,

        didOpen: () => {

            const empleadoSelect =
                document.getElementById("reservaEmpleado");

            const fechaInput =
                document.getElementById("reservaFecha");

            const horarioSelect =
                document.getElementById("reservaHorario");

            const mensaje =
                document.getElementById("reservaMensaje");


            async function cargarHorarios() {

                const empleadoId = empleadoSelect.value;

                const fecha = fechaInput.value;


                horarioSelect.innerHTML = `
                    <option value="">
                        Consultando horarios...
                    </option>
                `;

                horarioSelect.disabled = true;


                if (!empleadoId || !fecha) {

                    horarioSelect.innerHTML = `
                        <option value="">
                            Primero selecciona empleado y fecha
                        </option>
                    `;

                    mensaje.textContent =
                        "Selecciona empleado y fecha para consultar los horarios.";

                    return;
                }


                // -----------------------------------------
                // FECHA VÁLIDA
                // -----------------------------------------

                const fechaSeleccionada =
                    new Date(fecha + "T00:00:00");

                const fechaActual =
                    new Date(fechaMinima + "T00:00:00");


                if (fechaSeleccionada < fechaActual) {

                    horarioSelect.innerHTML = `
                        <option value="">
                            Fecha no válida
                        </option>
                    `;

                    mensaje.textContent =
                        "No puedes seleccionar una fecha anterior a hoy.";

                    return;
                }


                // -----------------------------------------
                // DÍA DE LA SEMANA
                // 0 = domingo ... 6 = sábado
                // -----------------------------------------

                const diaSemana =
                    fechaSeleccionada.getDay();


                // -----------------------------------------
                // HORARIO DEL EMPLEADO
                // -----------------------------------------

                const {
                    data: horarios,
                    error: horariosError
                } = await supabaseClient

                    .from("barber_schedules")

                    .select(`
                        id,
                        employee_id,
                        day_of_week,
                        start_time,
                        end_time,
                        active
                    `)

                    .eq("employee_id", empleadoId)

                    .eq("day_of_week", diaSemana)

                    .eq("active", true)

                    .order("start_time");


                if (horariosError) {

                    console.error(
                        "Error horarios:",
                        horariosError
                    );

                    horarioSelect.innerHTML = `
                        <option value="">
                            Error al consultar horarios
                        </option>
                    `;

                    mensaje.textContent =
                        "No se pudieron consultar los horarios.";

                    return;
                }


                if (!horarios || horarios.length === 0) {

                    horarioSelect.innerHTML = `
                        <option value="">
                            No trabaja este día
                        </option>
                    `;

                    mensaje.textContent =
                        "El empleado no tiene horario disponible para este día.";

                    return;
                }


                // -----------------------------------------
                // GENERAR HORARIOS DISPONIBLES
                // -----------------------------------------

                const duracion =
                    Number(servicio.duration_minutes || 30);

                const horariosDisponibles = [];


                for (const horario of horarios) {

                    const inicio =
                        convertirMinutos(horario.start_time);

                    const fin =
                        convertirMinutos(horario.end_time);


                    for (
                        let minuto = inicio;
                        minuto + duracion <= fin;
                        minuto += 15
                    ) {

                        const horaInicio =
                            minutosAHora(minuto);

                        const horaFin =
                            minutosAHora(minuto + duracion);


                        // No mostrar horarios pasados si se reserva para hoy.
                        if (
                            fecha === fechaMinima &&
                            convertirMinutos(horaInicio) <=
                                hoy.getHours() * 60 + hoy.getMinutes()
                        ) {
                            continue;
                        }


                        const disponible =
                            await comprobarDisponibilidadHorario(

                                servicio.business_id,

                                empleadoId,

                                fecha,

                                horaInicio,

                                horaFin

                            );


                        if (disponible) {

                            horariosDisponibles.push({

                                start_time: horaInicio,

                                end_time: horaFin

                            });

                        }

                    }

                }


                // -----------------------------------------
                // MOSTRAR HORARIOS
                // -----------------------------------------

                if (horariosDisponibles.length === 0) {

                    horarioSelect.innerHTML = `
                        <option value="">
                            No hay horarios disponibles
                        </option>
                    `;

                    mensaje.textContent =
                        "No quedan horarios disponibles para este día.";

                    return;
                }


                horarioSelect.innerHTML = `

                    <option value="">
                        Selecciona un horario
                    </option>

                    ${
                        horariosDisponibles
                            .map(
                                horario => `

                                    <option
                                        value="${horario.start_time}|${horario.end_time}"
                                    >
                                        ${formatearHora(horario.start_time)}
                                        -
                                        ${formatearHora(horario.end_time)}
                                    </option>

                                `
                            )
                            .join("")
                    }

                `;

                horarioSelect.disabled = false;

                mensaje.textContent =
                    `${horariosDisponibles.length} horario(s) disponible(s).`;

            }


            empleadoSelect.addEventListener(
                "change",
                cargarHorarios
            );

            fechaInput.addEventListener(
                "change",
                cargarHorarios
            );

        },


        // ---------------------------------------------
        // VALIDAR ANTES DE GUARDAR
        // ---------------------------------------------

        preConfirm: async () => {

            const empleadoId =
                document.getElementById("reservaEmpleado")?.value;

            const fecha =
                document.getElementById("reservaFecha")?.value;

            const horario =
                document.getElementById("reservaHorario")?.value;

            const telefono =
                document.getElementById("reservaTelefono")?.value.trim();


            if (!empleadoId) {

                Swal.showValidationMessage(
                    "Selecciona un empleado."
                );

                return false;
            }


            if (!fecha) {

                Swal.showValidationMessage(
                    "Selecciona una fecha."
                );

                return false;
            }


            if (!horario) {

                Swal.showValidationMessage(
                    "Selecciona un horario disponible."
                );

                return false;
            }


            if (!telefono) {

                Swal.showValidationMessage(
                    "Escribe tu número de teléfono."
                );

                return false;
            }


            const [
                startTime,
                endTime
            ] = horario.split("|");


            // Comprobación final por si otro usuario reservó
            // el horario mientras esta ventana estaba abierta.
            const disponible =
                await comprobarDisponibilidadHorario(

                    servicio.business_id,

                    empleadoId,

                    fecha,

                    startTime,

                    endTime

                );


            if (!disponible) {

                Swal.showValidationMessage(
                    "Ese horario acaba de ser ocupado. Selecciona otro."
                );

                return false;
            }


            return {

                employeeId: empleadoId,

                fecha,

                startTime,

                endTime,

                telefono

            };

        }

    });


    if (!resultado.isConfirmed) {
        return;
    }


    // ---------------------------------------------
    // GUARDAR RESERVA
    // ---------------------------------------------

    Swal.fire({

        title: "Guardando reserva...",

        text: "Estamos registrando tu cita.",

        allowOutsideClick: false,

        allowEscapeKey: false,

        didOpen: () => {
            Swal.showLoading();
        }

    });


    const datos = resultado.value;

    const nombreCliente =
        perfilActual?.full_name ||
        usuarioActual.email ||
        "Cliente";


    const {
        data: nuevaCita,
        error: reservaError
    } = await supabaseClient

        .from("barber_appointments")

        .insert({

            business_id:
                servicio.business_id,

            service_id:
                servicio.id,

            employee_id:
                datos.employeeId,

            customer_id:
                usuarioActual.id,

            appointment_date:
                datos.fecha,

            start_time:
                datos.startTime,

            end_time:
                datos.endTime,

            status:
                "pending",

            customer_name:
                nombreCliente,

            customer_phone:
                datos.telefono,

            notes:
                null

        })

        .select()

        .single();


    if (reservaError) {

        console.error(
            "Error creando reserva:",
            reservaError
        );

        Swal.fire({

            icon: "error",

            title: "No se pudo realizar la reserva",

            text:
                reservaError.message ||
                "Ocurrió un error al guardar la cita.",

            confirmButtonColor: "#24446d"

        });

        return;
    }


    localStorage.removeItem("mipymes_service_id");


    // Actualizar Mis citas inmediatamente.
    await cargarMisCitas();


    await Swal.fire({

        icon: "success",

        title: "¡Reserva realizada!",

        html: `

            <p style="margin-bottom:8px;">
                Tu solicitud quedó registrada correctamente.
            </p>

            <strong>
                ${escapeHTML(servicio.name)}
            </strong>

            <br>

            ${formatearFecha(datos.fecha)}

            <br>

            ${formatearHora(datos.startTime)}
            -
            ${formatearHora(datos.endTime)}

            <br><br>

            <span style="
                color:#b45309;
                font-weight:600;
            ">
                Estado: Pendiente
            </span>

        `,

        confirmButtonText: "Aceptar",

        confirmButtonColor: "#24446d"

    });

}


// =====================================================
// UTILIDADES DE HORARIOS
// =====================================================

function convertirMinutos(hora) {

    if (!hora) {
        return 0;
    }

    const partes =
        hora.substring(0, 5).split(":");

    return (
        Number(partes[0]) * 60 +
        Number(partes[1])
    );
}


function minutosAHora(minutos) {

    const horas =
        Math.floor(minutos / 60);

    const minutosRestantes =
        minutos % 60;

    return (
        String(horas).padStart(2, "0") +
        ":" +
        String(minutosRestantes).padStart(2, "0") +
        ":00"
    );
}


async function comprobarDisponibilidadHorario(
    businessId,
    employeeId,
    fecha,
    startTime,
    endTime
) {

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "is_barber_slot_available",
        {
            p_business_id:
                businessId,

            p_employee_id:
                employeeId,

            p_appointment_date:
                fecha,

            p_start_time:
                startTime,

            p_end_time:
                endTime
        }
    );


    if (error) {

        console.error(
            "Error comprobando disponibilidad:",
            error
        );

        return false;
    }


    return data === true;
}


// MIS CITAS

// =====================================================



async function cargarMisCitas() {



    if (!usuarioActual) {



        return;



    }





    const {

        data,

        error

    } =

        await supabaseClient

            .from(

                "barber_appointments"

            )

            .select(`

                id,

                appointment_date,

                start_time,

                end_time,

                status,

                customer_name,



                barber_services (

                    name,

                    price

                ),



                barber_employees (

                    name

                ),



                businesses (

                    name

                )

            `)

            .eq(

                "customer_id",

                usuarioActual.id

            )

            .eq(

                "status",

                "pending"

            )

            .order(

                "appointment_date",

                {

                    ascending: true

                }

            )

            .order(

                "start_time",

                {

                    ascending: true

                }

            );





    if (error) {



        console.error(

            "Error mis citas:",

            error

        );





        misCitasContainer.innerHTML = `



            <div class="error">



                No se pudieron cargar

                tus citas.



            </div>



        `;



        return;

    }





    if (

        !data ||

        data.length === 0

    ) {



        misCitasContainer.innerHTML = `



            <div

                class="empty-citas"

            >



                <div

                    class="empty-citas-icon"

                >

                    ◷

                </div>



                <h3>

                    No tienes citas pendientes

                </h3>



                <p>

                    Cuando realices una reserva

                    pendiente, aparecerá aquí.

                </p>



                <a

                    href="#negocios"

                    class="btn btn-primary"

                >

                    Explorar negocios

                </a>



            </div>



        `;



        return;



    }





    misCitasContainer.innerHTML =

        data.map(

            cita => `



                <article

                    class="cita-card"

                >



                    <div

                        class="cita-main"

                    >



                        <div>



                            <span

                                class="cita-negocio"

                            >



                                ${escapeHTML(

                                    cita.businesses?.name ||

                                    "Negocio"

                                )}



                            </span>





                            <h3>



                                ${escapeHTML(

                                    cita

                                        .barber_services

                                        ?.name ||

                                    "Servicio"

                                )}



                            </h3>





                            <p>



                                ${

                                    cita

                                        .barber_employees

                                        ?.name



                                    ?



                                    `



                                        Con



                                        <strong>

                                            ${escapeHTML(

                                                cita

                                                    .barber_employees

                                                    .name

                                            )}

                                        </strong>



                                    `



                                    :



                                    "Empleado por asignar"

                                }



                            </p>



                        </div>





                        <span

                            class="estado-cita estado-${escapeAttribute(

                                cita.status ||

                                "pending"

                            )}"

                        >



                            ${obtenerTextoEstadoCliente(

                                cita.status

                            )}



                        </span>



                    </div>





                    <div

                        class="cita-details"

                    >



                        <span>



                            📅



                            ${formatearFecha(

                                cita.appointment_date

                            )}



                        </span>





                        <span>



                            🕐



                            ${formatearHora(

                                cita.start_time

                            )}



                            -



                            ${formatearHora(

                                cita.end_time

                            )}



                        </span>





                        ${

                            cita

                                .barber_services

                                ?.price !== null &&



                            cita

                                .barber_services

                                ?.price !== undefined



                            ?



                            `



                                <span>



                                    $



                                    ${Number(

                                        cita

                                            .barber_services

                                            .price

                                    ).toFixed(2)}



                                </span>



                            `



                            :



                            ""

                        }



                    </div>



                </article>



            `

        ).join("");



}





// =====================================================

// MI HISTORIAL

// =====================================================



async function cargarHistorial() {



    if (!usuarioActual) {



        return;



    }





    const {

        data,

        error

    } =

        await supabaseClient

            .from(

                "barber_appointments"

            )

            .select(`

                id,

                appointment_date,

                start_time,

                end_time,

                status,

                customer_name,



                barber_services (

                    name,

                    price

                ),



                barber_employees (

                    name

                ),



                businesses (

                    name

                )

            `)

            .eq(

                "customer_id",

                usuarioActual.id

            )

            .in(

                "status",

                [

                    "confirmed",

                    "rejected"

                ]

            )

            .order(

                "appointment_date",

                {

                    ascending: false

                }

            )

            .order(

                "start_time",

                {

                    ascending: false

                }

            );





    if (error) {



        console.error(

            "Error historial:",

            error

        );





        historialContainer.innerHTML = `



            <div class="error">



                No se pudo cargar

                tu historial.



            </div>



        `;



        return;

    }





    historialActual =

        (data || []).map(

            cita => ({



                ...cita,



                modulo:

                    "barberia"



            })

        );





    configurarFiltrosHistorial();



    renderizarHistorial();



}





// =====================================================

// CONFIGURAR FILTROS DEL HISTORIAL

// =====================================================



function configurarFiltrosHistorial() {



    const filtros =

        document.querySelectorAll(

            ".historial-filtro"

        );





    filtros.forEach(

        filtro => {



            filtro.addEventListener(

                "click",

                () => {



                    const modulo =

                        filtro.dataset.modulo ||

                        "todos";





                    filtroHistorial =

                        modulo;





                    filtros.forEach(

                        boton => {



                            boton.classList.remove(

                                "active"

                            );



                        }

                    );





                    filtro.classList.add(

                        "active"

                    );





                    renderizarHistorial();



                }

            );



        }

    );



}





// =====================================================

// RENDERIZAR HISTORIAL

// =====================================================



function renderizarHistorial() {



    if (!historialContainer) {



        return;



    }





    let registros =

        historialActual;





    // =============================================

    // FILTRAR POR MÓDULO

    // =============================================



    if (

        filtroHistorial !==

        "todos"

    ) {



        registros =

            historialActual.filter(

                registro =>

                    registro.modulo ===

                    filtroHistorial

            );



    }





    // =============================================

    // SIN REGISTROS

    // =============================================



    if (

        !registros ||

        registros.length === 0

    ) {



        let mensaje =

            "Todavía no tienes registros en tu historial.";





        if (

            filtroHistorial ===

            "iglesia"

        ) {



            mensaje =

                "Todavía no tienes registros de Iglesia.";



        }





        if (

            filtroHistorial ===

            "restaurante"

        ) {



            mensaje =

                "Todavía no tienes registros de Restaurante.";



        }





        if (

            filtroHistorial ===

            "barberia"

        ) {



            mensaje =

                "Todavía no tienes registros de Barbería.";



        }





        historialContainer.innerHTML = `



            <div

                class="empty-citas"

            >



                <div

                    class="empty-citas-icon"

                >

                    ◷

                </div>



                <h3>

                    Sin registros

                </h3>



                <p>

                    ${escapeHTML(

                        mensaje

                    )}

                </p>



            </div>



        `;



        return;



    }





    // =============================================

    // MOSTRAR HISTORIAL

    // =============================================



    historialContainer.innerHTML =

        registros.map(

            registro =>

                generarTarjetaHistorial(

                    registro

                )

        ).join("");



}





// =====================================================

// GENERAR TARJETA DE HISTORIAL

// =====================================================



function generarTarjetaHistorial(

    registro

) {



    const estado =

        registro.status ||

        "confirmed";





    const textoEstado =

        obtenerTextoEstadoCliente(

            estado

        );





    const moduloTexto =

        obtenerNombreModulo(

            registro.modulo

        );





    const servicio =

        registro

            .barber_services

            ?.name ||

        "Servicio";





    const negocio =

        registro

            .businesses

            ?.name ||

        "Negocio";





    const empleado =

        registro

            .barber_employees

            ?.name ||

        "Empleado por asignar";





    const precio =

        registro

            .barber_services

            ?.price;





    return `



        <article

            class="historial-card"

        >



            <div

                class="historial-card-main"

            >



                <div>



                    <span

                        class="historial-modulo"

                    >



                        ${escapeHTML(

                            moduloTexto

                        )}



                    </span>





                    <span

                        class="cita-negocio"

                    >



                        ${escapeHTML(

                            negocio

                        )}



                    </span>





                    <h3>



                        ${escapeHTML(

                            servicio

                        )}



                    </h3>





                    <p>



                        Con



                        <strong>

                            ${escapeHTML(

                                empleado

                            )}

                        </strong>



                    </p>



                </div>





                <span

                    class="estado-cita estado-${escapeAttribute(

                        estado

                    )}"

                >



                    ${escapeHTML(

                        textoEstado

                    )}



                </span>



            </div>





            <div

                class="historial-card-details"

            >



                <span>



                    📅



                    ${formatearFecha(

                        registro.appointment_date

                    )}



                </span>





                <span>



                    🕐



                    ${formatearHora(

                        registro.start_time

                    )}



                    -



                    ${formatearHora(

                        registro.end_time

                    )}



                </span>





                ${

                    precio !== null &&

                    precio !== undefined



                    ?



                    `



                        <span>



                            $



                            ${Number(

                                precio

                            ).toFixed(2)}



                        </span>



                    `



                    :



                    ""

                }



            </div>



        </article>



    `;



}





// =====================================================

// NOMBRE DEL MÓDULO

// =====================================================



function obtenerNombreModulo(

    modulo

) {



    switch (modulo) {



        case "barberia":



            return "Barbería";





        case "iglesia":



            return "Iglesia";





        case "restaurante":



            return "Restaurante";





        default:



            return "Módulo";



    }



}





// =====================================================

// OCULTAR MIS CITAS

// =====================================================



function ocultarMisCitas() {



    const seccion =

        document.getElementById(

            "misCitas"

        );



    const link =

        document.getElementById(

            "linkMisCitas"

        );





    if (seccion) {



        seccion.style.display =

            "none";



    }





    if (link) {



        link.style.display =

            "none";



    }



}





// =====================================================

// OCULTAR HISTORIAL

// =====================================================



function ocultarHistorial() {



    const seccion =

        document.getElementById(

            "historial"

        );



    const link =

        document.getElementById(

            "linkHistorial"

        );





    if (seccion) {



        seccion.style.display =

            "none";



    }





    if (link) {



        link.style.display =

            "none";



    }



}





// =====================================================

// TEXTO ESTADO CLIENTE

// =====================================================



function obtenerTextoEstadoCliente(

    status

) {



    switch (status) {



        case "confirmed":



            return "Aceptada";





        case "rejected":



            return "Rechazada";





        case "cancelled":



        case "canceled":



            return "Cancelada";





        case "pending":



        default:



            return "Pendiente";



    }



}





// =====================================================

// FORMATEAR FECHA

// =====================================================



function formatearFecha(

    fecha

) {



    if (!fecha) {



        return "";



    }





    const partes =

        fecha.split("-");





    if (

        partes.length !== 3

    ) {



        return fecha;



    }





    const [

        year,

        month,

        day

    ] = partes;





    const fechaLocal =

        new Date(

            Number(year),

            Number(month) - 1,

            Number(day)

        );





    return fechaLocal.toLocaleDateString(

        "es-MX",

        {

            day: "numeric",

            month: "long",

            year: "numeric"

        }

    );



}





// =====================================================

// FORMATEAR HORA

// =====================================================



function formatearHora(

    hora

) {



    if (!hora) {



        return "";



    }





    return hora.substring(

        0,

        5

    );



}





// =====================================================

// CERRAR MODAL

// =====================================================



function cerrarNegocio() {



    negocioModal.classList.remove(

        "active"

    );



}





// =====================================================

// EVENTOS DEL MODAL

// =====================================================



if (btnCerrarNegocio) {



    btnCerrarNegocio.addEventListener(

        "click",

        cerrarNegocio

    );



}





if (negocioModal) {



    negocioModal.addEventListener(

        "click",

        event => {



            if (

                event.target ===

                negocioModal

            ) {



                cerrarNegocio();



            }



        }

    );



}





document.addEventListener(

    "keydown",

    event => {



        if (

            event.key ===

            "Escape"

        ) {



            cerrarNegocio();



        }



    }

);





// =====================================================

// SEGURIDAD HTML

// =====================================================



function escapeHTML(

    text

) {



    const div =

        document.createElement(

            "div"

        );





    div.textContent =

        text ?? "";





    return div.innerHTML;



}





function escapeAttribute(

    text

) {



    return String(

        text ?? ""

    )

        .replace(

            /&/g,

            "&amp;"

        )

        .replace(

            /"/g,

            "&quot;"

        )

        .replace(

            /</g,

            "&lt;"

        )

        .replace(

            />/g,

            "&gt;"

        );



}