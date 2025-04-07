'use client';

import React, { useState } from 'react';

export default function SendWhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    try {
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${JSON.stringify(data)}`);
      } else {
        alert('Mensaje enviado correctamente');
      }
    } catch (error) {
      console.error(error);
      alert('Error en la solicitud');
    }
  };

  return (
    <div>
      <h1>Enviar Mensaje de WhatsApp</h1>
      <input
        type="text"
        placeholder="Número en formato internacional"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <textarea
        placeholder="Tu mensaje"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Enviar</button>
    </div>
  );
}
