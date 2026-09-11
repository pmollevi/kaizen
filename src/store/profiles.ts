import { generarId } from "@/lib/id";

export interface Perfil {
  id: string;
  nombre: string;
  creadoEn: string;
}

const KEY_PERFILES = "kaizen:perfiles";
const KEY_ACTIVO = "kaizen:activo";

export function listarPerfiles(): Perfil[] {
  try {
    const raw = localStorage.getItem(KEY_PERFILES);
    return raw ? (JSON.parse(raw) as Perfil[]) : [];
  } catch {
    return [];
  }
}

function guardarPerfiles(perfiles: Perfil[]) {
  localStorage.setItem(KEY_PERFILES, JSON.stringify(perfiles));
}

export function crearPerfil(nombre: string): Perfil {
  const perfil: Perfil = { id: generarId("u"), nombre, creadoEn: new Date().toISOString() };
  guardarPerfiles([...listarPerfiles(), perfil]);
  return perfil;
}

export function eliminarPerfil(id: string) {
  guardarPerfiles(listarPerfiles().filter((p) => p.id !== id));
  localStorage.removeItem(`kaizen:datos:${id}`);
  if (getPerfilActivo() === id) setPerfilActivo(null);
}

export function renombrarPerfil(id: string, nombre: string) {
  guardarPerfiles(listarPerfiles().map((p) => (p.id === id ? { ...p, nombre } : p)));
}

export function getPerfilActivo(): string | null {
  return localStorage.getItem(KEY_ACTIVO);
}

export function setPerfilActivo(id: string | null) {
  if (id) localStorage.setItem(KEY_ACTIVO, id);
  else localStorage.removeItem(KEY_ACTIVO);
}

export function claveDatos(id: string): string {
  return `kaizen:datos:${id}`;
}
