
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LowStockAlertRequest {
  items: any[];
  location: string;
  adminEmail: string;
  adminName?: string;
  baseUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, location, adminEmail, adminName = "Administrador", baseUrl = window.location.origin } = await req.json() as LowStockAlertRequest;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No hay artículos con stock bajo para enviar alerta" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    if (!adminEmail) {
      return new Response(
        JSON.stringify({ error: "Se requiere un correo de administrador" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Import the template generation function logic directly 
    // since we can't import from the src folder
    const generateEmailHtml = (items: any[], location: string, adminName: string, baseUrl: string) => {
      const date = new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      
      const itemsHtml = items.map(item => {
        const stockStatus = 
          item.quantity === 0 ? 'Agotado' :
          item.quantity < item.min_stock / 2 ? 'Crítico' :
          'Bajo';
        
        const statusColor = 
          stockStatus === 'Agotado' ? '#dc2626' :
          stockStatus === 'Crítico' ? '#f59e0b' :
          '#f97316';
          
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.category}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.min_stock}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <span style="background-color: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                ${stockStatus}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Alerta de Stock Bajo</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f97316;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #fff;
              padding: 20px;
              border-left: 1px solid #e5e7eb;
              border-right: 1px solid #e5e7eb;
            }
            .footer {
              background-color: #f3f4f6;
              padding: 15px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-radius: 0 0 5px 5px;
              border: 1px solid #e5e7eb;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #f3f4f6;
              padding: 10px;
              text-align: left;
              border-bottom: 2px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              background-color: #f97316;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
            .highlighted {
              font-weight: bold;
              color: #f97316;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Alerta de Stock Bajo</h1>
            </div>
            <div class="content">
              <p>Estimado/a <span class="highlighted">${adminName}</span>,</p>
              
              <p>Este es un aviso automático para informarle que los siguientes artículos en la ubicación <span class="highlighted">${location}</span> están por debajo del nivel mínimo de stock requerido y necesitan ser reabastecidos.</p>
              
              <table>
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th>Categoría</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <p>Fecha del reporte: <span class="highlighted">${date}</span></p>
              
              <p>Por favor, tome las medidas necesarias para reabastecer estos artículos lo antes posible para evitar problemas de disponibilidad.</p>
              
              <div style="text-align: center;">
                <a href="${baseUrl}/inventory" class="button">Ver Inventario Completo</a>
              </div>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no responda a este mensaje.</p>
              <p>Sistema de Gestión de Inventario - © 2024</p>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    // Generate email subject with location
    const emailSubject = `⚠️ Alerta de Stock Bajo: ${location}`;
    
    // Generate HTML content for the email
    const htmlContent = generateEmailHtml(items, location, adminName, baseUrl);

    // Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: "Sistema de Inventario <onboarding@resend.dev>",
      to: [adminEmail],
      subject: emailSubject,
      html: htmlContent
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Alerta enviada correctamente", data: emailResponse }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in send-low-stock-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error desconocido al enviar alerta" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
