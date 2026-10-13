// =====================================================

// MiPyMEs - Administración

// =====================================================



let usuarioActual = null;

let negocioActual = null;

let empleados = [];





// =====================================================

// SWEETALERT - TOAST

// =====================================================



const Toast = Swal.mixin({

    toast: true,

    position: "top-end",

    showConfirmButton: false,

    timer: 2200,

    timerProgressBar: true,

    background: "#ffffff",

    color: "#14213d"

});





// =====================================================

// INICIO

// =====================================================



document.addEventListener(

    "DOMContentLoaded",

    iniciarAdmin

);





async function iniciarAdmin() {



    const {

        data: { user },

        error

    } = await supabaseClient.auth.getUser();



    if (error || !user) {



        window.location.href = "login.html";



        return;

    }



    usuarioActual = user;





    // =================================================

    // PERFIL

    // =================================================



    const {

        data: perfil,

        error: perfilError

    } = await supabaseClient

        .from("profiles")

        .select("*")

        .eq("id", user.id)

        .single();



    if (perfilError || !perfil) {



        await supabaseClient.auth.signOut();



        window.location.href = "login.html";



        return;

    }





    // =================================================

    // PERMISOS

    // =================================================



    if (

        perfil.role !== "admin" &&

        perfil.role !== "business_owner"

    ) {



        await Swal.fire({

            icon: "warning",

            title: "Acceso restringido",

            text: "No tienes permisos para acceder al panel.",

            confirmButtonText: "Entendido",

            confirmButtonColor: "#264f7d"

        });



        window.location.href = "index.html";



        return;

    }





    // =================================================

    // NOMBRE

    // =================================================



    document

        .getElementById("nombreUsuario")

        .textContent =

            perfil.full_name ||

            "Administrador";





    // =================================================

    // NEGOCIO

    // =================================================



    await cargarNegocio();



    if (!negocioActual) {



        await Swal.fire({

            icon: "error",

            title: "Negocio no encontrado",

            text:

                "No se encontró un negocio asociado a esta cuenta.",

            confirmButtonColor: "#264f7d"

        });



        return;

    }





    await cargarTodo();

}





// =====================================================

// NEGOCIO

// =====================================================



async function cargarNegocio() {
    const { data, error } = await supabaseClient
        .from("businesses")
        .select(`
            *,
            modules (
                id,
                name,
                slug
            )
        `)
        .eq("owner_id", usuarioActual.id)
        .eq("active", true)
        .maybeSingle();

    if (error) {
        console.error("Error al cargar el negocio:", error);
        negocioActual = null;
        return;
    }

    negocioActual = data;

    if (negocioActual) {
        const elementoNombre = document.getElementById("nombreNegocio");
        if (elementoNombre) {
            elementoNombre.textContent = negocioActual.name;
        }

        console.log("Negocio cargado:", negocioActual.name);
        console.log("Tipo de negocio:", negocioActual.modules?.slug);
    } else {
        console.warn(
            "No se encontró un negocio activo para el usuario:",
            usuarioActual.id
        );
    }
}





// =====================================================

// CARGAR TODO

// =====================================================



async function cargarTodo() {



    await cargarServicios();



    await cargarEmpleados();



    await cargarHorarios();



    await cargarCitas();

}





// =====================================================

// SERVICIOS

// =====================================================



async function cargarServicios() {



    const container =

        document.getElementById(

            "serviciosContainer"

        );



    const {

        data,

        error

    } = await supabaseClient

        .from("barber_services")

        .select("*")

        .eq(

            "business_id",

            negocioActual.id

        )

        .order(

            "created_at",

            {

                ascending: false

            }

        );



    if (error) {



        console.error(

            "Error servicios:",

            error

        );



        container.innerHTML =

            "<p>No se pudieron cargar los servicios.</p>";



        return;

    }



    document

        .getElementById("totalServicios")

        .textContent =

            data.length;



    if (!data.length) {



        container.innerHTML =

            "<p>Aún no tienes servicios registrados.</p>";



        return;

    }



    container.innerHTML =

        data.map(

            servicio => `



                <div class="item-card">



                    <div>



                        <h3>

                            ${escapeHTML(

                                servicio.name

                            )}

                        </h3>



                        <p>

                            ${escapeHTML(

                                servicio.description ||

                                "Sin descripción"

                            )}

                        </p>



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



                    <div class="item-actions">



                        <button

                            type="button"

                            class="btn-edit"

                            onclick="editarServicio(

                                '${servicio.id}'

                            )">



                            Editar



                        </button>



                        <button

                            type="button"

                            class="btn-delete"

                            onclick="cambiarEstadoServicio(

                                '${servicio.id}',

                                ${servicio.active !== false}

                            )">



                            ${

                                servicio.active === false

                                    ? "Activar"

                                    : "Desactivar"

                            }



                        </button>



                    </div>



                </div>



            `

        ).join("");

}





// =====================================================

// NUEVO SERVICIO

// =====================================================



document

    .getElementById("btnNuevoServicio")

    .addEventListener(

        "click",

        () => {



            document

                .getElementById(

                    "formServicio"

                )

                .reset();



            document

                .getElementById(

                    "servicioId"

                )

                .value = "";



            document

                .getElementById(

                    "tituloModalServicio"

                )

                .textContent =

                    "Agregar servicio";



            abrirModal(

                "modalServicio"

            );

        }

    );





// =====================================================

// GUARDAR SERVICIO

// =====================================================



document

    .getElementById("formServicio")

    .addEventListener(

        "submit",

        async event => {



            event.preventDefault();



            const id =

                document

                    .getElementById(

                        "servicioId"

                    )

                    .value;



            const servicio = {



                business_id:

                    negocioActual.id,



                name:

                    document

                        .getElementById(

                            "servicioNombre"

                        )

                        .value

                        .trim(),



                description:

                    document

                        .getElementById(

                            "servicioDescripcion"

                        )

                        .value

                        .trim(),



                price:

                    Number(

                        document

                            .getElementById(

                                "servicioPrecio"

                            )

                            .value

                    ),



                duration_minutes:

                    Number(

                        document

                            .getElementById(

                                "servicioDuracion"

                            )

                            .value

                    ),



                active:

                    true

            };



            let resultado;



            if (id) {



                resultado =

                    await supabaseClient

                        .from(

                            "barber_services"

                        )

                        .update(

                            servicio

                        )

                        .eq(

                            "id",

                            id

                        )

                        .eq(

                            "business_id",

                            negocioActual.id

                        );



            } else {



                resultado =

                    await supabaseClient

                        .from(

                            "barber_services"

                        )

                        .insert(

                            servicio

                        );

            }



            if (resultado.error) {



                console.error(

                    resultado.error

                );



                Swal.fire({

                    icon: "error",

                    title:

                        "No se pudo guardar",

                    text:

                        resultado.error.message,

                    confirmButtonColor:

                        "#264f7d"

                });



                return;

            }



            cerrarModal(

                "modalServicio"

            );



            await cargarServicios();



            Toast.fire({

                icon: "success",

                title:

                    id

                        ? "Servicio actualizado"

                        : "Servicio agregado"

            });

        }

    );





// =====================================================

// EDITAR SERVICIO

// =====================================================



async function editarServicio(id) {



    const {

        data,

        error

    } = await supabaseClient

        .from("barber_services")

        .select("*")

        .eq(

            "id",

            id

        )

        .eq(

            "business_id",

            negocioActual.id

        )

        .single();



    if (error) {



        Swal.fire({

            icon: "error",

            title: "Error",

            text:

                "No se pudo cargar el servicio.",

            confirmButtonColor:

                "#264f7d"

        });



        return;

    }



    document

        .getElementById(

            "servicioId"

        )

        .value =

            data.id;



    document

        .getElementById(

            "servicioNombre"

        )

        .value =

            data.name || "";



    document

        .getElementById(

            "servicioDescripcion"

        )

        .value =

            data.description || "";



    document

        .getElementById(

            "servicioPrecio"

        )

        .value =

            data.price || "";



    document

        .getElementById(

            "servicioDuracion"

        )

        .value =

            data.duration_minutes || "";



    document

        .getElementById(

            "tituloModalServicio"

        )

        .textContent =

            "Editar servicio";



    abrirModal(

        "modalServicio"

    );

}





// =====================================================

// ESTADO SERVICIO

// =====================================================



async function cambiarEstadoServicio(

    id,

    activo

) {



    const confirmacion =

        await Swal.fire({



            title:

                activo

                    ? "¿Desactivar servicio?"

                    : "¿Activar servicio?",



            text:

                activo

                    ? "El servicio dejará de estar disponible para los clientes."

                    : "El servicio volverá a estar disponible.",



            icon:

                "question",



            showCancelButton:

                true,



            confirmButtonText:

                activo

                    ? "Sí, desactivar"

                    : "Sí, activar",



            cancelButtonText:

                "Cancelar",



            confirmButtonColor:

                activo

                    ? "#b42318"

                    : "#264f7d",



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

    } = await supabaseClient

        .from(

            "barber_services"

        )

        .update({

            active:

                !activo

        })

        .eq(

            "id",

            id

        )

        .eq(

            "business_id",

            negocioActual.id

        );



    if (error) {



        Swal.fire({

            icon:

                "error",

            title:

                "No se pudo actualizar",

            text:

                error.message,

            confirmButtonColor:

                "#264f7d"

        });



        return;

    }



    await cargarServicios();



    Toast.fire({

        icon:

            "success",

        title:

            activo

                ? "Servicio desactivado"

                : "Servicio activado"

    });

}





// =====================================================

// EMPLEADOS

// =====================================================



async function cargarEmpleados() {



    const container =

        document.getElementById(

            "empleadosContainer"

        );



    const {

        data,

        error

    } = await supabaseClient

        .from(

            "barber_employees"

        )

        .select("*")

        .eq(

            "business_id",

            negocioActual.id

        )

        .order(

            "created_at",

            {

                ascending: false

            }

        );



    if (error) {



        console.error(

            "Error empleados:",

            error

        );



        container.innerHTML =

            "<p>No se pudieron cargar los empleados.</p>";



        return;

    }



    empleados =

        data || [];



    document

        .getElementById(

            "totalEmpleados"

        )

        .textContent =

            empleados.filter(

                empleado =>

                    empleado.active !== false

            ).length;



    if (!empleados.length) {



        container.innerHTML =

            "<p>No hay empleados registrados.</p>";



        return;

    }



    container.innerHTML =

        empleados.map(

            empleado => {



                const activo =

                    empleado.active !== false;



                return `



                    <div class="item-card ${

                        activo

                            ? ""

                            : "empleado-inactivo"

                    }">



                        <div>



                            <h3>

                                ${escapeHTML(

                                    empleado.name ||

                                    "Sin nombre"

                                )}

                            </h3>



                            <p>

                                ${escapeHTML(

                                    empleado.specialty ||

                                    empleado.position ||

                                    "Barbero"

                                )}

                            </p>



                            <span>

                                ${escapeHTML(

                                    empleado.phone ||

                                    "Sin teléfono"

                                )}

                            </span>



                            <br>



                            <small

                                class="estado-empleado">



                                ${

                                    activo

                                        ? "● Activo"

                                        : "● Inactivo"

                                }



                            </small>



                        </div>



                        <div class="item-actions">



                            <button

                                type="button"

                                class="btn-edit"

                                onclick="editarEmpleado(

                                    '${empleado.id}'

                                )">



                                Editar



                            </button>



                            <button

                                type="button"

                                class="btn-delete"

                                onclick="cambiarEstadoEmpleado(

                                    '${empleado.id}',

                                    ${activo}

                                )">



                                ${

                                    activo

                                        ? "Desactivar"

                                        : "Activar"

                                }



                            </button>



                        </div>



                    </div>



                `;

            }

        ).join("");

}





// =====================================================

// NUEVO EMPLEADO

// =====================================================



document

    .getElementById(

        "btnNuevoEmpleado"

    )

    .addEventListener(

        "click",

        () => {



            document

                .getElementById(

                    "formEmpleado"

                )

                .reset();



            document

                .getElementById(

                    "empleadoId"

                )

                .value = "";



            document

                .getElementById(

                    "tituloModalEmpleado"

                )

                .textContent =

                    "Agregar empleado";



            abrirModal(

                "modalEmpleado"

            );

        }

    );





// =====================================================

// GUARDAR / EDITAR EMPLEADO

// =====================================================



document

    .getElementById(

        "formEmpleado"

    )

    .addEventListener(

        "submit",

        async event => {



            event.preventDefault();



            const id =

                document

                    .getElementById(

                        "empleadoId"

                    )

                    .value;



            const nombre =

                document

                    .getElementById(

                        "empleadoNombre"

                    )

                    .value

                    .trim();



            const telefono =

                document

                    .getElementById(

                        "empleadoTelefono"

                    )

                    .value

                    .trim();



            const especialidad =

                document

                    .getElementById(

                        "empleadoEspecialidad"

                    )

                    .value

                    .trim();



            if (!nombre) {



                Swal.fire({

                    icon:

                        "warning",

                    title:

                        "Falta el nombre",

                    text:

                        "Escribe el nombre del empleado.",

                    confirmButtonColor:

                        "#264f7d"

                });



                return;

            }



            let resultado;



            // =========================================

            // EDITAR

            // =========================================



            if (id) {



                resultado =

                    await supabaseClient

                        .from(

                            "barber_employees"

                        )

                        .update({



                            name:

                                nombre,



                            phone:

                                telefono,



                            specialty:

                                especialidad



                        })

                        .eq(

                            "id",

                            id

                        )

                        .eq(

                            "business_id",

                            negocioActual.id

                        );



            }



            // =========================================

            // CREAR

            // =========================================



            else {



                resultado =

                    await supabaseClient

                        .from(

                            "barber_employees"

                        )

                        .insert({



                            business_id:

                                negocioActual.id,



                            name:

                                nombre,



                            phone:

                                telefono,



                            specialty:

                                especialidad,



                            active:

                                true



                        })

                        .select("id")

                        .single();

            }



            if (resultado.error) {



                console.error(

                    "Error guardando empleado:",

                    resultado.error

                );



                Swal.fire({

                    icon:

                        "error",

                    title:

                        "No se pudo guardar",

                    text:

                        resultado.error.message,

                    confirmButtonColor:

                        "#264f7d"

                });



                return;

            }



            // =========================================

            // HORARIO AUTOMÁTICO

            //

            // 1 = Lunes

            // 2 = Martes

            // 3 = Miércoles

            // 4 = Jueves

            // 5 = Viernes

            //

            // 09:00 - 18:00

            // =========================================



            if (

                !id &&

                resultado.data?.id

            ) {



                const empleadoId =

                    resultado.data.id;



                const horariosBase = [

                    1,

                    2,

                    3,

                    4,

                    5

                ].map(

                    dia => ({



                        employee_id:

                            empleadoId,



                        day_of_week:

                            dia,



                        start_time:

                            "09:00:00",



                        end_time:

                            "18:00:00",



                        active:

                            true

                    })

                );



                const {

                    error: errorHorario

                } = await supabaseClient

                    .from(

                        "barber_schedules"

                    )

                    .insert(

                        horariosBase

                    );



                if (errorHorario) {



                    console.error(

                        "Error creando horario del empleado:",

                        errorHorario

                    );



                    cerrarModal(

                        "modalEmpleado"

                    );



                    await cargarEmpleados();



                    await cargarHorarios();



                    Swal.fire({

                        icon:

                            "warning",

                        title:

                            "Empleado agregado",

                        text:

                            "El empleado fue creado, pero no se pudo generar automáticamente su horario de lunes a viernes.",

                        confirmButtonColor:

                            "#264f7d"

                    });



                    return;

                }

            }



            cerrarModal(

                "modalEmpleado"

            );



            await cargarEmpleados();



            await cargarHorarios();



            Toast.fire({

                icon:

                    "success",



                title:

                    id

                        ? "Empleado actualizado"

                        : "Empleado agregado"

            });

        }

    );





// =====================================================

// EDITAR EMPLEADO

// =====================================================



async function editarEmpleado(

    id

) {



    const empleado =

        empleados.find(

            item =>

                item.id === id

        );



    if (!empleado) {



        Swal.fire({

            icon:

                "error",

            title:

                "Empleado no encontrado",

            text:

                "No se encontró la información del empleado.",

            confirmButtonColor:

                "#264f7d"

        });



        return;

    }



    document

        .getElementById(

            "empleadoId"

        )

        .value =

            empleado.id;



    document

        .getElementById(

            "empleadoNombre"

        )

        .value =

            empleado.name || "";



    document

        .getElementById(

            "empleadoTelefono"

        )

        .value =

            empleado.phone || "";



    document

        .getElementById(

            "empleadoEspecialidad"

        )

        .value =

            empleado.specialty ||

            empleado.position ||

            "";



    document

        .getElementById(

            "tituloModalEmpleado"

        )

        .textContent =

            "Editar empleado";



    abrirModal(

        "modalEmpleado"

    );

}





// =====================================================

// ESTADO EMPLEADO

// =====================================================



async function cambiarEstadoEmpleado(

    id,

    activo

) {



    const confirmacion =

        await Swal.fire({



            title:

                activo

                    ? "¿Desactivar empleado?"

                    : "¿Activar empleado?",



            text:

                activo

                    ? "Ya no estará disponible para nuevas citas."

                    : "Volverá a estar disponible para nuevas citas.",



            icon:

                "question",



            showCancelButton:

                true,



            confirmButtonText:

                activo

                    ? "Sí, desactivar"

                    : "Sí, activar",



            cancelButtonText:

                "Cancelar",



            confirmButtonColor:

                activo

                    ? "#b42318"

                    : "#264f7d",



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

    } = await supabaseClient

        .from(

            "barber_employees"

        )

        .update({

            active:

                !activo

        })

        .eq(

            "id",

            id

        )

        .eq(

            "business_id",

            negocioActual.id

        );



    if (error) {



        Swal.fire({

            icon:

                "error",

            title:

                "No se pudo actualizar",

            text:

                error.message,

            confirmButtonColor:

                "#264f7d"

        });



        return;

    }



    await cargarEmpleados();



    await cargarHorarios();



    Toast.fire({

        icon:

            "success",

        title:

            activo

                ? "Empleado desactivado"

                : "Empleado activado"

    });

}





// =====================================================

// HORARIOS

// =====================================================



async function cargarHorarios() {



    const container =

        document.getElementById(

            "horariosContainer"

        );



    const ids =

        empleados

            .filter(

                empleado =>

                    empleado.active !== false

            )

            .map(

                empleado =>

                    empleado.id

            );



    if (!ids.length) {



        container.innerHTML =

            "<p>No hay empleados activos para mostrar horarios.</p>";



        document

            .getElementById(

                "totalHorarios"

            )

            .textContent =

                0;



        return;

    }



    const {

        data,

        error

    } =

        await supabaseClient

            .from(

                "barber_schedules"

            )

            .select(`

                *,

                barber_employees (

                    name

                )

            `)

            .in(

                "employee_id",

                ids

            )

            .order(

                "day_of_week"

            );



    if (error) {



        console.error(

            "Error horarios:",

            error

        );



        container.innerHTML =

            "<p>No se pudieron cargar los horarios.</p>";



        return;

    }



    document

        .getElementById(

            "totalHorarios"

        )

        .textContent =

            data.length;



    if (!data.length) {



        container.innerHTML =

            "<p>No hay horarios registrados.</p>";



        return;

    }





    // ================================================

    // DÍAS

    // ================================================



    const dias = [



        "Domingo",



        "Lunes",



        "Martes",



        "Miércoles",



        "Jueves",



        "Viernes",



        "Sábado"



    ];





    // ================================================

    // AGRUPAR POR EMPLEADO

    // ================================================



    const horariosPorEmpleado = {};



    data.forEach(

        horario => {



            const empleadoId =

                horario.employee_id;



            if (

                !horariosPorEmpleado[

                    empleadoId

                ]

            ) {



                horariosPorEmpleado[

                    empleadoId

                ] = {



                    nombre:

                        horario

                            .barber_employees

                            ?.name ||

                        "Sin nombre",



                    horarios: []



                };

            }



            horariosPorEmpleado[

                empleadoId

            ]

                .horarios

                .push(

                    horario

                );

        }

    );





    // ================================================

    // TABLA RESUMIDA

    // ================================================



    container.innerHTML = `



        <div class="table-wrapper">



            <table>



                <thead>



                    <tr>



                        <th>

                            Empleado

                        </th>



                        <th>

                            Días laborales

                        </th>



                        <th>

                            Hora de inicio

                        </th>



                        <th>

                            Hora final

                        </th>



                    </tr>



                </thead>



                <tbody>



                    ${

                        Object.values(

                            horariosPorEmpleado

                        )

                        .map(

                            empleado => {



                                const horarios =

                                    empleado

                                        .horarios

                                        .sort(

                                            (a, b) =>

                                                a.day_of_week -

                                                b.day_of_week

                                        );



                                const nombresDias =

                                    horarios.map(

                                        horario =>

                                            dias[

                                                horario.day_of_week

                                            ]

                                    );



                                let diasTexto =

                                    nombresDias.join(

                                        ", "

                                    );





                                // =================================

                                // LUNES A VIERNES

                                // =================================



                                if (



                                    nombresDias.length === 5 &&



                                    nombresDias.includes(

                                        "Lunes"

                                    ) &&



                                    nombresDias.includes(

                                        "Martes"

                                    ) &&



                                    nombresDias.includes(

                                        "Miércoles"

                                    ) &&



                                    nombresDias.includes(

                                        "Jueves"

                                    ) &&



                                    nombresDias.includes(

                                        "Viernes"

                                    )



                                ) {



                                    diasTexto =

                                        "Lunes a Viernes";

                                }





                                // =================================

                                // HORARIO

                                // =================================



                                const primerHorario =

                                    horarios[0];



                                const todosMismoHorario =

                                    horarios.every(

                                        horario =>

                                            horario.start_time ===

                                                primerHorario.start_time &&



                                            horario.end_time ===

                                                primerHorario.end_time

                                    );



                                const horaInicio =

                                    todosMismoHorario

                                        ? primerHorario.start_time

                                        : "Variable";



                                const horaFinal =

                                    todosMismoHorario

                                        ? primerHorario.end_time

                                        : "Variable";





                                return `



                                    <tr>



                                        <td>



                                            <strong>

                                                ${escapeHTML(

                                                    empleado.nombre

                                                )}

                                            </strong>



                                        </td>



                                        <td>

                                            ${escapeHTML(

                                                diasTexto

                                            )}

                                        </td>



                                        <td>

                                            ${horaInicio}

                                        </td>



                                        <td>

                                            ${horaFinal}

                                        </td>



                                    </tr>



                                `;

                            }

                        )

                        .join("")

                    }



                </tbody>



            </table>



        </div>



    `;

}





// =====================================================

// CITAS

// =====================================================



async function cargarCitas() {



    const container =

        document.getElementById(

            "citasContainer"

        );



    const {

        data,

        error

    } =

        await supabaseClient

            .from(

                "barber_appointments"

            )

            .select(`

                *,

                barber_services (

                    name

                ),

                barber_employees (

                    name

                )

            `)

            .eq(

                "business_id",

                negocioActual.id

            )

            .order(

                "appointment_date",

                {

                    ascending:

                        true

                }

            )

            .order(

                "start_time",

                {

                    ascending:

                        true

                }

            );



    if (error) {



        console.error(

            "Error citas:",

            error

        );



        container.innerHTML =

            "<p>No se pudieron cargar las citas.</p>";



        return;

    }



    document

        .getElementById(

            "totalCitas"

        )

        .textContent =

            data.length;



    if (!data.length) {



        container.innerHTML =

            "<p>No hay citas registradas.</p>";



        return;

    }



    container.innerHTML = `



        <div class="table-wrapper">



            <table>



                <thead>



                    <tr>



                        <th>

                            Cliente

                        </th>



                        <th>

                            Servicio

                        </th>



                        <th>

                            Empleado

                        </th>



                        <th>

                            Fecha

                        </th>



                        <th>

                            Hora

                        </th>



                        <th>

                            Estado

                        </th>



                    </tr>



                </thead>



                <tbody>



                    ${

                        data

                            .map(

                                cita => `



                                    <tr>



                                        <td>

                                            ${escapeHTML(

                                                cita.customer_name ||

                                                "Cliente"

                                            )}

                                        </td>



                                        <td>

                                            ${escapeHTML(

                                                cita

                                                    .barber_services

                                                    ?.name ||

                                                "-"

                                            )}

                                        </td>



                                        <td>

                                            ${escapeHTML(

                                                cita

                                                    .barber_employees

                                                    ?.name ||

                                                "Cualquiera"

                                            )}

                                        </td>



                                        <td>

                                            ${cita.appointment_date}

                                        </td>



                                        <td>

                                            ${cita.start_time}

                                            -

                                            ${cita.end_time}

                                        </td>



                                        <td>



                                            <span class="estado">



                                                ${obtenerTextoEstado(

                                                    cita.status

                                                )}



                                            </span>



                                            ${

                                                cita.status ===

                                                "pending"



                                                    ? `



                                                        <div class="acciones-cita">



                                                            <button

                                                                type="button"

                                                                class="btn-aceptar"

                                                                onclick="actualizarEstadoCita(

                                                                    '${cita.id}',

                                                                    'confirmed'

                                                                )">



                                                                Aceptar



                                                            </button>



                                                            <button

                                                                type="button"

                                                                class="btn-rechazar"

                                                                onclick="actualizarEstadoCita(

                                                                    '${cita.id}',

                                                                    'rejected'

                                                                )">



                                                                Rechazar



                                                            </button>



                                                        </div>



                                                    `



                                                    : ""

                                            }



                                        </td>



                                    </tr>



                                `

                            )

                            .join("")

                    }



                </tbody>



            </table>



        </div>



    `;

}





// =====================================================

// ESTADOS DE CITAS

// =====================================================



function obtenerTextoEstado(

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

// ACTUALIZAR ESTADO DE CITA

// =====================================================



async function actualizarEstadoCita(

    id,

    nuevoEstado

) {



    const esAceptacion =

        nuevoEstado ===

        "confirmed";



    const confirmacion =

        await Swal.fire({



            title:

                esAceptacion

                    ? "¿Aceptar cita?"

                    : "¿Rechazar cita?",



            text:

                esAceptacion

                    ? "La cita quedará confirmada para el cliente."

                    : "La cita será marcada como rechazada.",



            icon:

                esAceptacion

                    ? "question"

                    : "warning",



            showCancelButton:

                true,



            confirmButtonText:

                esAceptacion

                    ? "Sí, aceptar"

                    : "Sí, rechazar",



            cancelButtonText:

                "Cancelar",



            confirmButtonColor:

                esAceptacion

                    ? "#264f7d"

                    : "#b42318",



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

            .from(

                "barber_appointments"

            )

            .update({

                status:

                    nuevoEstado

            })

            .eq(

                "id",

                id

            )

            .eq(

                "business_id",

                negocioActual.id

            );



    if (error) {



        console.error(

            "Error actualizando cita:",

            error

        );



        Swal.fire({

            icon:

                "error",



            title:

                "No se pudo actualizar",



            text:

                error.message,



            confirmButtonColor:

                "#264f7d"

        });



        return;

    }



    await cargarCitas();



    Toast.fire({

        icon:

            "success",



        title:

            esAceptacion

                ? "Cita aceptada"

                : "Cita rechazada"

    });

}





// =====================================================

// MODALES

// =====================================================



function abrirModal(

    id

) {



    const modal =

        document.getElementById(

            id

        );



    if (modal) {



        modal.classList.add(

            "active"

        );

    }

}





function cerrarModal(

    id

) {



    const modal =

        document.getElementById(

            id

        );



    if (modal) {



        modal.classList.remove(

            "active"

        );

    }

}





// =====================================================

// CERRAR SESIÓN

// =====================================================



document

    .getElementById(

        "btnCerrarSesion"

    )

    .addEventListener(

        "click",

        async () => {



            const confirmacion =

                await Swal.fire({



                    title:

                        "¿Cerrar sesión?",



                    text:

                        "Tendrás que iniciar sesión nuevamente para entrar al panel.",



                    icon:

                        "question",



                    showCancelButton:

                        true,



                    confirmButtonText:

                        "Sí, cerrar sesión",



                    cancelButtonText:

                        "Cancelar",



                    confirmButtonColor:

                        "#264f7d",



                    cancelButtonColor:

                        "#6b7280",



                    reverseButtons:

                        true

                });



            if (

                !confirmacion.isConfirmed

            ) {



                return;

            }



            await supabaseClient

                .auth

                .signOut();



            localStorage.removeItem(

                "mipymes_user"

            );



            window.location.href =

                "index.html";

        }

    );





// =====================================================

// ESCAPAR HTML

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
