import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export default async function handler(request) {
  // Solo permitir solicitudes POST.
  if (request.method !== "POST") {
    return Response.json(
      { ok: false, error: "Método no permitido" },
      { status: 405 }
    );
  }

  // Comprobar la sesión del usuario.
  const authHeader =
    request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return Response.json(
      { ok: false, error: "Sesión requerida" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return Response.json(
      { ok: false, error: "Sesión inválida" },
      { status: 401 }
    );
  }

  try {
    // Verificar las variables privadas del servidor.
    const {
      SUPABASE_URL,
      SUPABASE_SECRET_KEY,
      RESEND_API_KEY,
    } = process.env;

    if (
      !SUPABASE_URL ||
      !SUPABASE_SECRET_KEY ||
      !RESEND_API_KEY
    ) {
      console.error(
        "Faltan variables de entorno para enviar correos."
      );

      return Response.json(
        {
          ok: false,
          error: "Configuración del servidor incompleta",
        },
        { status: 500 }
      );
    }

    // Conectar con Supabase.
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SECRET_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Validar la identidad del usuario.
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return Response.json(
        { ok: false, error: "Sesión no válida" },
        { status: 401 }
      );
    }

    // Comprobar que sea administrador.
    const { data: admin, error: adminError } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (adminError) {
      console.error(
        "Error verificando administrador:",
        adminError
      );

      return Response.json(
        {
          ok: false,
          error: "Error verificando permisos",
        },
        { status: 500 }
      );
    }

    if (!admin) {
      return Response.json(
        {
          ok: false,
          error: "Acceso no autorizado",
        },
        { status: 403 }
      );
    }

    // Enviar el correo de prueba.
    const resend = new Resend(RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Caritas RD <onboarding@resend.dev>",
      to: ["k_suarez22@hotmail.com"],
      subject: "Prueba de notificaciones - Caritas RD",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 560px;
          margin: 0 auto;
          padding: 28px;
          background: #fff7fa;
          border-radius: 16px;
        ">
          <h1 style="
            color: #ec1763;
            text-align: center;
          ">
            Caritas RD
          </h1>

          <h2 style="
            color: #0b2a4a;
            text-align: center;
          ">
            ¡Notificaciones activadas!
          </h2>

          <p style="
            color: #475569;
            font-size: 15px;
            line-height: 1.7;
          ">
            ¡Hola! Este es nuestro primer correo
            de prueba enviado desde Caritas RD
            utilizando Resend y Netlify Functions.
          </p>

          <p style="
            color: #475569;
            font-size: 15px;
            line-height: 1.7;
          ">
            Si recibiste este mensaje, significa
            que la integración de envío de correos
            está funcionando correctamente.
          </p>

          <p style="
            text-align: center;
            color: #ec1763;
            font-weight: bold;
          ">
            ¡Pronto recibirás aquí las notificaciones
            de nuevas reservaciones!
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error enviando correo:", error);

      return Response.json(
        {
          ok: false,
          error: "No se pudo enviar el correo de prueba",
        },
        { status: 502 }
      );
    }

    return Response.json({
      ok: true,
      message: "Correo de prueba aceptado por Resend",
      emailId: data?.id || null,
    });
  } catch (error) {
    console.error(
      "Error interno enviando correo:",
      error
    );

    return Response.json(
      {
        ok: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

export const config = {
  path: "/api/test-email",
};