'use client';

import { useEffect, useState } from 'react';


interface BookForm {
  titulo: string;
  autor: string;
  anio_publicacion: number;
  genero_id?: number;
  num_copias: number;
}

export default function EditBookPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [form, setForm] = useState<BookForm | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/books/${id}`);
      const data = await res.json();
      setForm({
        titulo: data.TITULO ?? data.titulo,
        autor: data.AUTOR ?? data.autor,
        anio_publicacion: Number(data.ANIO_PUBLICACION ?? data.anio_publicacion),
        genero_id: data.GENERO_ID !== undefined ? Number(data.GENERO_ID) : (data.genero_id !== undefined ? Number(data.genero_id) : undefined),
        num_copias: Number(data.NUM_COPIAS ?? data.num_copias),
      });
    })();
  }, [id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    const { name, value } = e.target;
  setForm((f) => f ? { ...f, [name]: name.includes('anio') || name.includes('num_copias') || name === 'genero_id' ? Number(value) : value } : f);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      window.location.href = '/books';
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error || 'Error al guardar');
    }
  }

  if (!form) return <p className="text-gray-500">Cargando...</p>;

  return (
    <section className="flex items-center justify-center">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-semibold">Editar libro #{id}</h1>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="titulo" placeholder="Título" value={form.titulo} onChange={onChange} required />
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="autor" placeholder="Autor" value={form.autor} onChange={onChange} required />
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="anio_publicacion" type="number" value={form.anio_publicacion} onChange={onChange} required />
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="genero_id" placeholder="Género ID (opcional)" value={form.genero_id ?? ''} onChange={onChange} />
          <input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200" name="num_copias" type="number" min={0} value={form.num_copias} onChange={onChange} required />
          <button type="submit" className="mt-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Guardar</button>
        </form>
        {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
      </div>
    </section>
  );
}
