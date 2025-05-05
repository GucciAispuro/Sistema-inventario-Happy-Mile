
const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Format items for email HTML
const formatItemsHtml = (items) => {
  const itemsHtml = items.map(item => {
    let statusColor = '#f97316'; // orange for Bajo
    if (item.status === 'Crítico' || item.status === 'Agotado') {
      statusColor = '#ef4444'; // red for Crítico or Agotado
    }
    
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.min_stock}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: ${statusColor}; font-weight: bold;">${item.status}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f8fafc;">
          <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0;">Artículo</th>
          <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0;">Categoría</th>
          <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0;">Cantidad Actual</th>
          <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0;">Mínimo Requerido</th>
          <th style="text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0;">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  `;
};

// Send low stock alert endpoint
router.post('/send-alert', async (req, res) => {
  try {
    console.log("Received low stock alert request");
    
    const { items, location, adminEmail, adminName, baseUrl } = req.body;
    
    if (!items || items.length === 0) {
      console.error("No items provided in request");
      return res.status(400).json({ error: "No se proporcionaron artículos con stock bajo" });
    }

    if (!adminEmail) {
      console.error("No admin email provided");
      return res.status(400).json({ error: "No se proporcionó email de administrador" });
    }

    console.log(`Sending alert to ${adminEmail} for ${location} with ${items.length} items`);

    const criticalItems = items.filter(item => item.status === 'Crítico' || item.status === 'Agotado');
    const lowItems = items.filter(item => item.status === 'Bajo');
    
    const urgencyLevel = criticalItems.length > 0 ? 'CRÍTICO' : 'BAJO';
    const urgencyColor = criticalItems.length > 0 ? '#ef4444' : '#f97316';
    
    const adminGreeting = adminName ? `${adminName}` : 'Administrador';
    
    const { data, error } = await resend.emails.send({
      from: "Inventario <onboarding@resend.dev>",
      to: adminEmail,
      subject: `[${urgencyLevel}] Alerta de Stock Bajo en ${location}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e293b;">Alerta de Stock Bajo</h1>
          <p style="color: #334155; margin-bottom: 20px;">Hola ${adminGreeting},</p>
          
          <div style="background-color: ${urgencyColor}; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin-top: 0;">¡Atención! Stock Bajo en ${location}</h2>
            <p>Se han detectado ${items.length} artículos con stock por debajo del mínimo requerido.</p>
          </div>
          
          <h3 style="color: #334155;">Detalle de Artículos:</h3>
          ${formatItemsHtml(items)}
          
          <div style="margin-top: 30px; background-color: #f8fafc; padding: 15px; border-radius: 5px;">
            <p style="color: #64748b; margin-bottom: 10px;">Resumen:</p>
            <ul style="color: #64748b; padding-left: 20px;">
              <li>Artículos Críticos/Agotados: ${criticalItems.length}</li>
              <li>Artículos con Stock Bajo: ${lowItems.length}</li>
              <li>Ubicación: ${location}</li>
            </ul>
          </div>
          
          <p style="color: #334155; margin-top: 30px;">Por favor, toma las medidas necesarias para reabastecer estos artículos lo antes posible.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Este es un mensaje automático del sistema de inventario.</p>
            <p>No responda a este correo electrónico.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("Email sent successfully:", data);
    return res.status(200).json({ success: true, messageId: data.id });
  } catch (error) {
    console.error("Error in send-low-stock-alert function:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
