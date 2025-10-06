'use client';

import { useState } from 'react';

export default function NewBookPage() {
  const [form, setForm] = useState({
    titulo: '',
    autor: '',
    anio_publicacion: new Date().getFullYear(),
    genero_id: '',
    num_copias: 1,
  });
  const [msg, setMsg] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name.includes('anio') || name.includes('num_copias') ? Number(value) : value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      genero_id: form.genero_id ? Number(form.genero_id) : undefined,
    };
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      window.location.href = '/books';
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error || 'Error al guardar');
    }
  }

  return (
    <section className="flex items-center justify-center">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-semibold">Agregar libro</h1>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="titulo" placeholder="Título" value={form.titulo} onChange={onChange} required />
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="autor" placeholder="Autor" value={form.autor} onChange={onChange} required />
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="anio_publicacion" type="number" value={form.anio_publicacion} onChange={onChange} required />
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="genero_id" placeholder="Género ID (opcional)" value={form.genero_id} onChange={onChange} />
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="num_copias" type="number" min={0} value={form.num_copias} onChange={onChange} required />
          <button type="submit" className="mt-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Guardar</button>
        </form>
        {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
      </div>
    </section>
  );
}
