// api/auth.js
// Endpoint serverless para Vercel

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Método no permitido' });
    return;
  }

  // Vercel puede requerir parseo manual del body
  let user = '', pass = '';
  if (req.body && typeof req.body === 'object') {
    user = req.body.user;
    pass = req.body.pass;
  } else {
    try {
      const data = JSON.parse(req.body);
      user = data.user;
      pass = data.pass;
    } catch {}
  }

  const USERS = [
    { user: 'Lmeneses@ridery.app', pass: '26902673', rol: 'Administrador' },
    { user: 'Lugonzales@ridery.app', pass: '21415701', rol: 'Administrador' },
    { user: 'Mgalindo@ridery.app', pass: '28055814', rol: 'Administrador' },
    { user: 'Marioly@ridery.app', pass: '26214838', rol: 'Administrador' },
    { user: 'Srahmen@ridery.app', pass: '29553104', rol: 'Administrador' },
    { user: 'Nserrano@ridery.app', pass: '29504559', rol: 'Administrador' },
    { user: 'Smoya@ridery.app', pass: '27814888', rol: 'Administrador' },
    { user: 'Ycabrera@ridery.app', pass: '30225899', rol: 'Administrador' },
    { user: 'Ccarrillo@ridery.app', pass: '18466236', rol: 'Administrador' },
    { user: 'Remoto', pass: 'Remoto2026', rol: 'Agente Remoto' }
  ];

  const found = USERS.find(u => u.user.toLowerCase() === user?.toLowerCase() && u.pass === pass);
  if (found) {
    res.status(200).json({ success: true, user: found.user, rol: found.rol });
  } else {
    res.status(200).json({ success: false, message: 'Usuario o contraseña incorrectos' });
  }
}
