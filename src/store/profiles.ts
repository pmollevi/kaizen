import { generarId } from "@/lib/id";

export interface Perfil {
  id: string;
  nombre: string;
  passwordHash?: string;
  passwordSalt?: string; // ausente = hash viejo sin sal (formato heredado, ver verificarPassword)
  creadoEn: string;
}

const KEY_PERFILES = "kaizen:perfiles";
const KEY_ACTIVO = "kaizen:activo";
const ITERACIONES_PBKDF2 = 100_000;

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

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

function generarSalt(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}

// Hash local con sal aleatoria por usuario + PBKDF2 (100k iteraciones): protege
// el perfil dentro de este navegador y evita que dos personas con la misma
// contraseña compartan el mismo hash. Sigue sin ser una cuenta en la nube: no
// hay sincronización entre dispositivos ni recuperación si se olvida.
async function hashPasswordConSal(password: string, saltHex: string): Promise<string> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBytes(saltHex) as BufferSource, iterations: ITERACIONES_PBKDF2, hash: "SHA-256" },
    material,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

// Formato heredado (antes de agregar sal): SHA-256 directo de la contraseña.
// Se conserva solo para poder verificar cuentas creadas antes de este cambio.
async function hashPasswordSinSalLegado(password: string): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return bytesToHex(new Uint8Array(buffer));
}

export async function crearPerfil(nombre: string, password?: string): Promise<Perfil> {
  const passwordSalt = password ? generarSalt() : undefined;
  const perfil: Perfil = {
    id: generarId("u"),
    nombre,
    passwordHash: password && passwordSalt ? await hashPasswordConSal(password, passwordSalt) : undefined,
    passwordSalt,
    creadoEn: new Date().toISOString(),
  };
  guardarPerfiles([...listarPerfiles(), perfil]);
  return perfil;
}

/** Migra en silencio los hashes viejos (sin sal) a PBKDF2+sal en el primer login exitoso. */
async function establecerPassword(perfilId: string, nuevaPassword: string): Promise<void> {
  const salt = generarSalt();
  const hash = await hashPasswordConSal(nuevaPassword, salt);
  guardarPerfiles(
    listarPerfiles().map((p) => (p.id === perfilId ? { ...p, passwordHash: hash, passwordSalt: salt } : p))
  );
}

export async function verificarPassword(perfil: Perfil, password: string): Promise<boolean> {
  if (!perfil.passwordHash) return true; // perfiles antiguos sin contraseña: se dejan pasar
  if (perfil.passwordSalt) {
    return (await hashPasswordConSal(password, perfil.passwordSalt)) === perfil.passwordHash;
  }
  const coincide = (await hashPasswordSinSalLegado(password)) === perfil.passwordHash;
  if (coincide) await establecerPassword(perfil.id, password); // migracion silenciosa a sal + PBKDF2
  return coincide;
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
