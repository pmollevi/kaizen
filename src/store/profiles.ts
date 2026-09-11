import { generarId } from "@/lib/id";

export interface Perfil {
  id: string;
  nombre: string;
  email?: string;
  passwordHash?: string;
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

// Hash local con Web Crypto: protege el perfil dentro de este navegador.
// No es una cuenta en la nube: no hay recuperación de contraseña ni sincronización entre dispositivos.
export async function hashPassword(password: string): Promise<string> {
  const datos = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function crearPerfil(nombre: string, email?: string, password?: string): Promise<Perfil> {
  const perfil: Perfil = {
    id: generarId("u"),
    nombre,
    email: email?.trim() || undefined,
    passwordHash: password ? await hashPassword(password) : undefined,
    creadoEn: new Date().toISOString(),
  };
  guardarPerfiles([...listarPerfiles(), perfil]);
  return perfil;
}

export async function verificarPassword(perfil: Perfil, password: string): Promise<boolean> {
  if (!perfil.passwordHash) return true; // perfiles antiguos sin contraseña: se dejan pasar
  return (await hashPassword(password)) === perfil.passwordHash;
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
