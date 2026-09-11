import React, { useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, Select, Textarea, Button, Badge, EmptyState, Modal } from "@/components/ui/Primitives";
import { diasEntre, formatoLargo, hoyISO } from "@/lib/dates";
import type { Desafio } from "@/types";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

function FormDesafio({ onClose }: { onClose: () => void }) {
  const crearDesafio = useKaizenStore((s) => s.crearDesafio);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<Desafio["tipo"]>("semanal");
  const [dificultad, setDificultad] = useState<Desafio["dificultad"]>("media");
  const [fechaLimite, setFechaLimite] = useState(hoyISO());
  const [ppRecompensa, setPpRecompensa] = useState(100);

  return (
    <Modal open onClose={onClose} title="Nuevo desafío">
      <div className="space-y-3">
        <Field label="Nombre">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Específico y verificable" />
        </Field>
        <Field label="Descripción">
          <Textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <Select value={tipo} onChange={(e) => setTipo(e.target.value as Desafio["tipo"])}>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="temporada">Temporada</option>
            </Select>
          </Field>
          <Field label="Dificultad">
            <Select value={dificultad} onChange={(e) => setDificultad(e.target.value as Desafio["dificultad"])}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </Select>
          </Field>
          <Field label="Fecha límite">
            <Input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} />
          </Field>
          <Field label="Recompensa (PP)">
            <Input type="number" value={ppRecompensa} onChange={(e) => setPpRecompensa(parseInt(e.target.value) || 0)} />
          </Field>
        </div>
        <Button
          className="w-full"
          onClick={() => {
            if (!nombre.trim()) return;
            crearDesafio({ nombre, descripcion, tipo, dificultad, fechaLimite, ppRecompensa });
            onClose();
          }}
        >
          Crear desafío
        </Button>
      </div>
    </Modal>
  );
}

function FormEvento({ onClose }: { onClose: () => void }) {
  const crearEvento = useKaizenStore((s) => s.crearEvento);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [inicio, setInicio] = useState(hoyISO());
  const [fin, setFin] = useState(hoyISO());
  const [efecto, setEfecto] = useState("");
  const [error, setError] = useState("");

  return (
    <Modal open onClose={onClose} title="Nuevo evento">
      <div className="space-y-3">
        <Field label="Nombre">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Semana de Concentración..." />
        </Field>
        <Field label="Descripción">
          <Textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio">
            <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Field>
          <Field label="Fin">
            <Input type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
          </Field>
        </div>
        <Field label="Efecto" hint='Ej. "peso de Intelecto +10" o "gastar 20% menos en gasolina"'>
          <Input value={efecto} onChange={(e) => setEfecto(e.target.value)} />
        </Field>
        {error && <Badge tone="red">{error}</Badge>}
        <Button
          className="w-full"
          onClick={() => {
            if (!nombre.trim()) return;
            const res = crearEvento({ nombre, descripcion, inicio, fin, efecto });
            if (!res.ok) setError(res.motivo ?? "No se pudo crear");
            else onClose();
          }}
        >
          Crear evento
        </Button>
      </div>
    </Modal>
  );
}

function FormCerrarTemporada({ onClose }: { onClose: () => void }) {
  const cerrarTemporada = useKaizenStore((s) => s.cerrarTemporada);
  const [nombre, setNombre] = useState("Temporada 2");
  const [narrativa, setNarrativa] = useState("");
  const [semanas, setSemanas] = useState(12);

  return (
    <Modal open onClose={onClose} title="Cerrar temporada y comenzar la siguiente">
      <div className="space-y-3">
        <Field label="Nombre de la nueva temporada">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Field>
        <Field label="Narrativa (2-3 líneas)">
          <Textarea rows={3} value={narrativa} onChange={(e) => setNarrativa(e.target.value)} />
        </Field>
        <Field label="Duración (semanas)" hint="Recomendado: 12, máximo por fatiga de temporada">
          <Input type="number" max={16} value={semanas} onChange={(e) => setSemanas(parseInt(e.target.value) || 12)} />
        </Field>
        <Button
          className="w-full"
          onClick={() => {
            cerrarTemporada(nombre, narrativa, semanas);
            onClose();
          }}
        >
          Cerrar temporada actual y comenzar
        </Button>
      </div>
    </Modal>
  );
}

export function TemporadaView() {
  const state = useKaizenStore();
  const t = state.temporadaActual;
  const setRetoFinal = useKaizenStore((s) => s.setRetoFinal);
  const completarRetoFinal = useKaizenStore((s) => s.completarRetoFinal);
  const completarDesafio = useKaizenStore((s) => s.completarDesafio);
  const eliminarDesafio = useKaizenStore((s) => s.eliminarDesafio);
  const [retoTexto, setRetoTexto] = useState(t.retoFinal.descripcion);
  const [modal, setModal] = useState<null | "desafio" | "evento" | "cerrar">(null);

  const hoy = hoyISO();
  const eventoActivo = t.eventos.find((e) => e.inicio <= hoy && hoy <= e.fin);
  const diasRestantes = Math.max(0, diasEntre(hoy, t.fin));

  const gruposDesafio: Desafio["tipo"][] = ["semanal", "mensual", "temporada"];

  return (
    <div className="space-y-5">
      <SectionTitle title="Temporada" subtitle={`${diasRestantes} días restantes`} />

      <Card>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-lg font-semibold">{t.nombre}</div>
            <div className="text-sm text-base-400 mt-1 max-w-xl">{t.narrativa}</div>
          </div>
          <Button variant="secondary" onClick={() => setModal("cerrar")}>
            Cerrar temporada
          </Button>
        </div>
        <div className="text-xs text-base-500 mt-2">
          {formatoLargo(t.inicio)} – {formatoLargo(t.fin)}
        </div>
      </Card>

      <Card>
        <SectionTitle title={state.config.textos.jefeTemporada} />
        {t.retoFinal.completado ? (
          <Badge tone="green">Superado el {t.retoFinal.fechaCompletado && formatoLargo(t.retoFinal.fechaCompletado)}</Badge>
        ) : (
          <div className="flex items-center gap-2">
            <Input value={retoTexto} onChange={(e) => setRetoTexto(e.target.value)} placeholder="Describe el reto final" />
            <Button variant="secondary" onClick={() => setRetoFinal(retoTexto)}>
              Guardar
            </Button>
            <Button onClick={() => completarRetoFinal()} disabled={!t.retoFinal.descripcion}>
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="Evento activo" />
        {eventoActivo ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{eventoActivo.nombre}</div>
              <div className="text-sm text-base-400">{eventoActivo.efecto}</div>
            </div>
            <Badge tone="blue">
              hasta {formatoLargo(eventoActivo.fin)}
            </Badge>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <EmptyState text="Sin evento activo." />
            <Button variant="secondary" onClick={() => setModal("evento")}>
              Crear evento
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title={state.config.textos.misiones} action={
          <Button onClick={() => setModal("desafio")} className="inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Nuevo desafío
          </Button>
        } />
        {gruposDesafio.map((tipo) => {
          const lista = t.desafios.filter((d) => d.tipo === tipo);
          if (lista.length === 0) return null;
          return (
            <div key={tipo} className="mb-4 last:mb-0">
              <div className="text-xs uppercase tracking-wide text-base-400 mb-2 capitalize">{tipo}</div>
              <div className="space-y-1.5">
                {lista.map((d) => (
                  <div key={d.id} className="flex items-center justify-between bg-base-850 rounded-lg px-3 py-2.5 text-sm">
                    <div>
                      <div className={d.completado ? "line-through text-base-500" : "text-base-200"}>{d.nombre}</div>
                      <div className="text-xs text-base-500">
                        {d.descripcion} · vence {formatoLargo(d.fechaLimite)} · +{d.ppRecompensa} PP
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!d.completado && (
                        <button onClick={() => completarDesafio(d.id)} className="text-emerald-400 hover:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => eliminarDesafio(d.id)} className="text-base-500 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {t.desafios.length === 0 && <EmptyState text="Sin desafíos activos." />}
      </Card>

      {modal === "desafio" && <FormDesafio onClose={() => setModal(null)} />}
      {modal === "evento" && <FormEvento onClose={() => setModal(null)} />}
      {modal === "cerrar" && <FormCerrarTemporada onClose={() => setModal(null)} />}
    </div>
  );
}
