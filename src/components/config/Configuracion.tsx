import React, { useRef, useState } from "react";
import { useKaizenStore } from "@/store/useKaizenStore";
import { Card, SectionTitle, Field, Input, Select, Button, Badge, StepperPorcentaje } from "@/components/ui/Primitives";
import { generarId } from "@/lib/id";
import type { AreaId, Bono, ReconocimientoCatalogo } from "@/types";
import { Download, Upload, Plus, Trash2 } from "lucide-react";

function IdentidadYAreas() {
  const state = useKaizenStore();
  const setNombreUsuario = useKaizenStore((s) => s.setNombreUsuario);
  const actualizarTextos = useKaizenStore((s) => s.actualizarTextos);
  const actualizarPesos = useKaizenStore((s) => s.actualizarPesos);
  const actualizarAreaConfig = useKaizenStore((s) => s.actualizarAreaConfig);

  const [pesos, setPesos] = useState<Record<AreaId, number>>(
    Object.fromEntries(state.areas.map((a) => [a.id, Math.round(a.peso * 100)])) as Record<AreaId, number>
  );
  const suma = Object.values(pesos).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Identidad" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre del sistema">
            <Input value={state.config.textos.nombreSistema} onChange={(e) => actualizarTextos({ nombreSistema: e.target.value })} />
          </Field>
          <Field label="Nombre del jugador">
            <Input value={state.usuario.nombre} onChange={(e) => setNombreUsuario(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Áreas de desarrollo y pesos"
          subtitle="Los pesos deben sumar 100%."
          action={
            <Badge tone={suma === 100 ? "green" : "red"}>{suma}%</Badge>
          }
        />
        <div className="space-y-4">
          {state.areas.map((a) => (
            <div key={a.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-2 text-sm font-medium truncate">{a.nombre}</div>
              <div className="col-span-3">
                <StepperPorcentaje value={pesos[a.id]} onChange={(v) => setPesos((p) => ({ ...p, [a.id]: v }))} />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  disabled={a.metaDiaria === null}
                  value={a.metaDiaria ?? ""}
                  placeholder="meta diaria"
                  onChange={(e) => actualizarAreaConfig(a.id, { metaDiaria: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={a.metaSemanalBase}
                  placeholder="meta semanal base"
                  onChange={(e) => actualizarAreaConfig(a.id, { metaSemanalBase: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={a.topeMetaSemanal}
                  placeholder="tope"
                  onChange={(e) => actualizarAreaConfig(a.id, { topeMetaSemanal: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-base-500 mt-2">
          <span className="ml-[16.6%]">peso %</span>
          <span>meta diaria</span>
          <span>meta semanal base</span>
          <span>tope semanal</span>
        </div>
        <Button className="mt-4" disabled={suma !== 100} onClick={() => actualizarPesos(pesos)}>
          Guardar pesos
        </Button>
      </Card>
    </div>
  );
}

function Economia() {
  const state = useKaizenStore();
  const actualizar = useKaizenStore((s) => s.actualizarConfigEconomia);
  const actualizarImperio = useKaizenStore((s) => s.actualizarConfigImperio);
  const e = state.config.economia;

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Puntos de Progreso y nivel" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="PP base semanal">
            <Input type="number" value={e.ppBase} onChange={(ev) => actualizar({ ppBase: parseFloat(ev.target.value) || 0 })} />
          </Field>
          <Field label="Curva: base">
            <Input type="number" value={e.curvaBase} onChange={(ev) => actualizar({ curvaBase: parseFloat(ev.target.value) || 0 })} />
          </Field>
          <Field label="Curva: exponente">
            <Input
              type="number"
              step={0.05}
              value={e.curvaExponente}
              onChange={(ev) => actualizar({ curvaExponente: parseFloat(ev.target.value) || 0 })}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Progresión por área" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Umbral de nivel de área">
            <Input type="number" step={0.01} value={e.umbralNivelArea} onChange={(ev) => actualizar({ umbralNivelArea: parseFloat(ev.target.value) || 0 })} />
          </Field>
          <Field label="Semanas para subir nivel">
            <Input type="number" value={e.semanasParaNivelArea} onChange={(ev) => actualizar({ semanasParaNivelArea: parseInt(ev.target.value) || 1 })} />
          </Field>
          <Field label="Incremento por etapa">
            <Input type="number" step={0.01} value={e.incrementoPorEtapa} onChange={(ev) => actualizar({ incrementoPorEtapa: parseFloat(ev.target.value) || 0 })} />
          </Field>
          <Field label="Niveles por etapa">
            <Input type="number" value={e.nivelesPorEtapa} onChange={(ev) => actualizar({ nivelesPorEtapa: parseInt(ev.target.value) || 1 })} />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Protecciones y registro" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Tope de protecciones">
            <Input type="number" value={e.proteccionesMaxAcumulables} onChange={(ev) => actualizar({ proteccionesMaxAcumulables: parseInt(ev.target.value) || 0 })} />
          </Field>
          <Field label="Umbral protección mensual">
            <Input type="number" step={0.01} value={e.umbralProteccionMensual} onChange={(ev) => actualizar({ umbralProteccionMensual: parseFloat(ev.target.value) || 0 })} />
          </Field>
          <Field label="Ventana de protección (h)">
            <Input type="number" value={e.ventanaProteccionHoras} onChange={(ev) => actualizar({ ventanaProteccionHoras: parseInt(ev.target.value) || 0 })} />
          </Field>
          <Field label="Días de registro retroactivo">
            <Input type="number" value={e.diasRegistroRetroactivo} onChange={(ev) => actualizar({ diasRegistroRetroactivo: parseInt(ev.target.value) || 0 })} />
          </Field>
          <Field label="Días de racha por protección">
            <Input type="number" value={e.diasPorProteccion} onChange={(ev) => actualizar({ diasPorProteccion: parseInt(ev.target.value) || 1 })} />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Finanzas y dinero para lujos" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Tope Banco (meses de fondo)">
            <Input type="number" value={e.topeBancoRecompensasMeses} onChange={(ev) => actualizar({ topeBancoRecompensasMeses: parseInt(ev.target.value) || 1 })} />
          </Field>
          <Field label="Destino del sobrante">
            <Select value={e.destinoSobranteDefault} onChange={(ev) => actualizar({ destinoSobranteDefault: ev.target.value as any })}>
              <option value="ahorro">Ahorro</option>
              <option value="acumula">Acumula al mes siguiente</option>
              <option value="banco">Dinero para lujos</option>
            </Select>
          </Field>
          <Field label="Tope de dinero para lujos acumulado ($)">
            <Input
              type="number"
              value={state.finanzas.bancoRecompensas.tope}
              onChange={(ev) =>
                useKaizenStore.setState((s) => ({
                  finanzas: { ...s.finanzas, bancoRecompensas: { ...s.finanzas.bancoRecompensas, tope: parseFloat(ev.target.value) || 0 } },
                }))
              }
            />
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Submétricas de Imperio" subtitle="Deben sumar 1 (negocio + finanzas)." />
        <div className="grid grid-cols-3 gap-4">
          <Field label="Peso negocio">
            <Input type="number" step={0.05} value={state.config.imperio.pesoNegocio} onChange={(ev) => actualizarImperio({ pesoNegocio: parseFloat(ev.target.value) || 0 })} />
          </Field>
          <Field label="Peso finanzas">
            <Input type="number" step={0.05} value={state.config.imperio.pesoFinanzas} onChange={(ev) => actualizarImperio({ pesoFinanzas: parseFloat(ev.target.value) || 0 })} />
          </Field>
          <Field label="Meta semanal horas de negocio">
            <Input
              type="number"
              value={state.config.imperio.metaSemanalHorasNegocio}
              onChange={(ev) => actualizarImperio({ metaSemanalHorasNegocio: parseFloat(ev.target.value) || 0 })}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}

function Bonos() {
  const state = useKaizenStore();
  const setBonos = useKaizenStore((s) => s.setBonos);
  const actualizar = (id: string, cambios: Partial<Bono>) =>
    setBonos(state.config.bonos.map((b) => (b.id === id ? { ...b, ...cambios } : b)));

  return (
    <Card>
      <SectionTitle
        title="Bonos por resultados reales"
        action={
          <Button variant="ghost" onClick={() => setBonos([...state.config.bonos, { id: generarId("b"), nombre: "Nuevo bono", valorPP: 50 }])} className="inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Agregar
          </Button>
        }
      />
      <div className="space-y-2">
        {state.config.bonos.map((b) => (
          <div key={b.id} className="flex items-center gap-2">
            <Input className="flex-1" value={b.nombre} onChange={(e) => actualizar(b.id, { nombre: e.target.value })} />
            <Input className="w-24" type="number" value={b.valorPP} onChange={(e) => actualizar(b.id, { valorPP: parseInt(e.target.value) || 0 })} />
            <span className="text-xs text-base-500">PP</span>
            <button onClick={() => setBonos(state.config.bonos.filter((x) => x.id !== b.id))} className="text-base-500 hover:text-rose-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CatalogoReconocimientos() {
  const state = useKaizenStore();
  const setCatalogo = useKaizenStore((s) => s.setCatalogoReconocimientos);
  const actualizar = (id: string, cambios: Partial<ReconocimientoCatalogo>) =>
    setCatalogo(state.config.catalogoReconocimientos.map((r) => (r.id === id ? { ...r, ...cambios } : r)));

  return (
    <Card>
      <SectionTitle
        title={state.config.textos.logros}
        action={
          <Button
            variant="ghost"
            className="inline-flex items-center gap-1.5"
            onClick={() =>
              setCatalogo([
                ...state.config.catalogoReconocimientos,
                { id: generarId("ach"), nombre: "Nuevo reconocimiento", descripcion: "", rareza: "Común", categoria: "constancia", secreto: false },
              ])
            }
          >
            <Plus className="w-4 h-4" /> Agregar
          </Button>
        }
      />
      <div className="space-y-2">
        {state.config.catalogoReconocimientos.map((r) => (
          <div key={r.id} className="grid grid-cols-12 gap-2 items-center bg-white/[0.04] rounded-lg px-3 py-2.5">
            <Input className="col-span-3" value={r.nombre} onChange={(e) => actualizar(r.id, { nombre: e.target.value })} />
            <Input className="col-span-4" value={r.descripcion} onChange={(e) => actualizar(r.id, { descripcion: e.target.value })} />
            <Select className="col-span-2" value={r.rareza} onChange={(e) => actualizar(r.id, { rareza: e.target.value as any })}>
              <option>Común</option>
              <option>Raro</option>
              <option>Épico</option>
              <option>Legendario</option>
            </Select>
            <Select className="col-span-2" value={r.categoria} onChange={(e) => actualizar(r.id, { categoria: e.target.value as any })}>
              <option value="constancia">constancia</option>
              <option value="volumen">volumen</option>
              <option value="records">récords</option>
              <option value="financiero">financiero</option>
              <option value="temporada">temporada</option>
            </Select>
            <button onClick={() => actualizar(r.id, { secreto: !r.secreto })} className="col-span-1 justify-self-center">
              <Badge tone={r.secreto ? "blue" : "neutral"}>{r.secreto ? "secreto" : "visible"}</Badge>
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DatosYMitigaciones() {
  const state = useKaizenStore();
  const cargarEstado = useKaizenStore((s) => s.cargarEstado);
  const inputRef = useRef<HTMLInputElement>(null);

  const exportar = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kaizen-${state.usuario.nombre || "backup"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importar = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        cargarEstado(data);
      } catch {
        alert("El archivo no es un respaldo válido de Kaizen.");
      }
    };
    reader.readAsText(file);
  };

  const fallas = [
    ["Inflación de progreso", "La curva de nivel (base/exponente) y el PP base son editables por temporada, y las metas solo suben por etapas de 5 niveles (10%) con tope máximo, así la exigencia crece más lento que la curva de PP."],
    ["Auto-engaño en el registro", `Solo se puede registrar hasta ${state.config.economia.diasRegistroRetroactivo} días atrás; cada registro guarda la hora real de creación para poder auditarlo.`],
    ["Olvido del registro financiero", "Entrada de gasto en menos de 10 segundos, con últimas palabras clave y botón de repetir gasto frecuente; el panel principal muestra siempre el bloque financiero."],
    ["Abuso de protecciones", `Ventana de ${state.config.economia.ventanaProteccionHoras}h tras el cierre y tope de ${state.config.economia.proteccionesMaxAcumulables} acumulables.`],
    ["Desalineación presupuesto/realidad", "Modo mes atípico por presupuesto, que etiqueta el mes sin alterar las fórmulas del resto del sistema."],
    ["Fatiga de temporada", "El cierre de temporada limita la duración a un máximo razonable (recomendado 12 semanas)."],
    ["Dinero para lujos desconectado del esfuerzo", "El dinero para lujos ya no se desbloquea de golpe una vez al mes: se reparte entre las semanas del mes y cada semana libera solo la parte proporcional a tu cumplimiento real de esa semana."],
    ["Sobrecarga de métricas", "El catálogo de hábitos tiene 10 opciones fijas; agregar una nueva requiere tocar código. El asistente de planeación avisa cuando activas más de 7-8 a la vez."],
  ];

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Datos" subtitle="Exporta o importa el respaldo completo en JSON." />
        <div className="flex gap-3">
          <Button onClick={exportar} className="inline-flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Exportar JSON
          </Button>
          <Button variant="secondary" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> Importar JSON
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])}
          />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Fallas del sistema y su mitigación" />
        <div className="space-y-3">
          {fallas.map(([titulo, texto]) => (
            <div key={titulo}>
              <div className="text-sm font-medium text-base-200">{titulo}</div>
              <div className="text-sm text-base-400">{texto}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const SECCIONES = ["Identidad y áreas", "Economía", "Bonos", "Reconocimientos", "Datos"] as const;

export function ConfiguracionView() {
  const [seccion, setSeccion] = useState<(typeof SECCIONES)[number]>("Identidad y áreas");
  return (
    <div className="space-y-5">
      <SectionTitle title="Configuración" subtitle="Todo valor de las fórmulas se lee de aquí. Cero números mágicos en el código." />
      <div className="flex gap-1 border-b border-white/10 overflow-x-auto">
        {SECCIONES.map((s) => (
          <button
            key={s}
            onClick={() => setSeccion(s)}
            className={`px-3.5 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              seccion === s ? "border-sky-500 text-sky-400" : "border-transparent text-base-400 hover:text-base-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {seccion === "Identidad y áreas" && <IdentidadYAreas />}
      {seccion === "Economía" && <Economia />}
      {seccion === "Bonos" && <Bonos />}
      {seccion === "Reconocimientos" && <CatalogoReconocimientos />}
      {seccion === "Datos" && <DatosYMitigaciones />}
    </div>
  );
}
