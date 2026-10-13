/* Login MiPyMEs: dirige al panel según el módulo del negocio. */
const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");
const btnLogin = document.getElementById("btnLogin");

function mostrarMensaje(texto, tipo = "error") {
  if (!mensaje) return;
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  if (!email || !password) { mostrarMensaje("Escribe tu correo y contraseña."); return; }

  if (btnLogin) { btnLogin.disabled = true; btnLogin.textContent = "Iniciando sesión..."; }
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error("No se pudo identificar la cuenta.");

    const { data: perfil, error: perfilError } = await supabaseClient
      .from("profiles").select("id,full_name,phone,avatar_url,role").eq("id", user.id).single();
    if (perfilError) throw perfilError;

    localStorage.setItem("mipymes_user", JSON.stringify({
      id: user.id, email: user.email, full_name: perfil.full_name, role: perfil.role
    }));

    if (perfil.role === "client") {
      mostrarMensaje("Sesión iniciada correctamente.", "exito");
      window.location.href = "index.html";
      return;
    }

    if (perfil.role === "admin") {
      mostrarMensaje("Sesión iniciada correctamente.", "exito");
      window.location.href = "admin.html";
      return;
    }

    if (perfil.role === "business_owner") {
      const { data: negocios, error: negocioError } = await supabaseClient
        .from("businesses")
        .select("id,name,active,modules(slug,name)")
        .eq("owner_id", user.id)
        .eq("active", true);
      if (negocioError) throw negocioError;

      const negocioIglesia = (negocios || []).find(b =>
        ["iglesia", "comunidad", "church"].includes(String(b.modules?.slug || "").toLowerCase())
      );
      if (negocioIglesia) {
        mostrarMensaje("Sesión iniciada correctamente.", "exito");
        window.location.href = "admin-iglesia.html";
        return;
      }

      // Se conserva el destino del panel existente para Barbería y otros negocios.
      mostrarMensaje("Sesión iniciada correctamente.", "exito");
      window.location.href = "admin.html";
      return;
    }

    await supabaseClient.auth.signOut();
    throw new Error("La cuenta no tiene un rol válido para acceder.");
  } catch (error) {
    console.error("Error de inicio de sesión:", error);
    const msg = error?.message || "";
    if (/invalid login credentials/i.test(msg)) mostrarMensaje("Correo o contraseña incorrectos.");
    else if (/email not confirmed/i.test(msg)) mostrarMensaje("Confirma tu correo antes de iniciar sesión.");
    else mostrarMensaje(msg || "No se pudo iniciar sesión.");
  } finally {
    if (btnLogin) { btnLogin.disabled = false; btnLogin.textContent = "Iniciar sesión"; }
  }
});
