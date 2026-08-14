import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const initial = { nombre:'', tipo:'albergue', ciudad:'', departamento:'', direccion:'', lat:'', lng:'', capacidad:'', personasAtendidas:'', contacto:'', estadoAcceso:'Accesible', nivelUrgencia:'media', estado:'activo' }
const emptyNeed = () => ({ id:`need-${Date.now()}-${Math.random().toString(36).slice(2)}`, item:'', cantidadRequerida:'', cantidadCubierta:'', unidad:'unidades', estado:'pendiente' })
const normalizeNeeds = (needs=[]) => needs.map(n => ({...n, cantidadRequerida:n.cantidadRequerida ?? '', cantidadCubierta:n.cantidadCubierta ?? '', unidad:n.unidad || 'unidades', estado:n.estado || 'pendiente'}))

export default function PlaceForm({ initialValues, onSubmit, submitLabel='Guardar lugar' }) {
  const navigate=useNavigate()
  const [form,setForm]=useState(initialValues ? {...initial,...initialValues} : initial)
  const [needs,setNeeds]=useState(()=>normalizeNeeds(initialValues?.necesidades))
  const [error,setError]=useState('')
  const update=(key,value)=>setForm(c=>({...c,[key]:value}))
  const updateNeed=(id,key,value)=>setNeeds(c=>c.map(n=>n.id===id?{...n,[key]:value}:n))
  const addNeed=()=>setNeeds(c=>[...c,emptyNeed()])
  const removeNeed=id=>setNeeds(c=>c.filter(n=>n.id!==id))
  const status=n=>{const r=Number(n.cantidadRequerida)||0,c=Number(n.cantidadCubierta)||0;return r>0&&c>=r?'cubierta':c>0?'parcial':'pendiente'}
  const submit=e=>{e.preventDefault();setError('');if(!form.nombre||!form.ciudad||!form.departamento){setError('Completa nombre, ciudad y departamento.');return}if(needs.some(n=>!n.item.trim())){setError('Todas las necesidades deben tener un nombre.');return}onSubmit({...form,lat:Number(form.lat)||3.4516,lng:Number(form.lng)||-76.532,capacidad:Number(form.capacidad)||0,personasAtendidas:Number(form.personasAtendidas)||0,necesidades:needs.map(n=>({...n,item:n.item.trim(),cantidadRequerida:Number(n.cantidadRequerida)||0,cantidadCubierta:Math.min(Number(n.cantidadCubierta)||0,Number(n.cantidadRequerida)||0),estado:status(n)}))})}
  const input=(key,label,type='text',placeholder='')=><label><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><input type={type} value={form[key]} onChange={e=>update(key,e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"/></label>
  return <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    {error&&<div className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
    <div className="grid gap-5 md:grid-cols-2">
      {input('nombre','Nombre del lugar','text','Ej. Albergue San José')}
      <Select label="Tipo" value={form.tipo} onChange={v=>update('tipo',v)} options={[['albergue','Albergue'],['rescate','Zona de rescate'],['acopio','Punto de acopio'],['salud','Centro de salud']]}/>
      {input('ciudad','Ciudad','text','Cali')}{input('departamento','Departamento','text','Valle del Cauca')}{input('direccion','Dirección','text','Calle / Carrera')}{input('contacto','Contacto','text','Teléfono')}{input('lat','Latitud','number','3.4516')}{input('lng','Longitud','number','-76.5320')}{input('capacidad','Capacidad','number','200')}{input('personasAtendidas','Personas atendidas','number','0')}
      <Select label="Estado de acceso" value={form.estadoAcceso} onChange={v=>update('estadoAcceso',v)} options={[['Accesible','Accesible'],['Vía parcialmente bloqueada','Vía parcialmente bloqueada'],['Vía bloqueada','Vía bloqueada']]}/>
      <Select label="Nivel de urgencia" value={form.nivelUrgencia} onChange={v=>update('nivelUrgencia',v)} options={[['alta','Alta'],['media','Media'],['baja','Baja']]}/>
      <Select label="Estado" value={form.estado} onChange={v=>update('estado',v)} options={[['activo','Activo'],['cerrado','Cerrado'],['en_riesgo','En riesgo']]}/>
    </div>
    <section className="mt-8 border-t border-slate-100 pt-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-lg font-bold text-slate-900">Necesidades actuales</h3><p className="mt-1 text-sm text-slate-500">Agrega cualquier recurso que haga falta; no hay una lista fija.</p></div><button type="button" onClick={addNeed} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700"><Plus size={17}/>Agregar necesidad</button></div>
      {needs.length===0?<div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><p className="font-semibold text-slate-700">No hay necesidades registradas</p><p className="mt-1 text-sm text-slate-500">Puedes agregar agua, alimentos, medicamentos o cualquier otro recurso.</p><button type="button" onClick={addNeed} className="mt-4 rounded-xl bg-[#0f3d5e] px-4 py-2.5 text-sm font-semibold text-white">+ Agregar primera necesidad</button></div>:<div className="mt-5 space-y-4">{needs.map((n,i)=><div key={n.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-bold text-slate-800">Necesidad #{i+1}</p><button type="button" onClick={()=>removeNeed(n.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 size={15}/>Eliminar</button></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="lg:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Necesidad</span><input value={n.item} onChange={e=>updateNeed(n.id,'item',e.target.value)} placeholder="Ej. Mantas, combustible, linternas..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"/></label>
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Cantidad requerida</span><input type="number" min="0" value={n.cantidadRequerida} onChange={e=>updateNeed(n.id,'cantidadRequerida',e.target.value)} placeholder="0" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"/></label>
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Unidad</span><select value={n.unidad} onChange={e=>updateNeed(n.id,'unidad',e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option>unidades</option><option>litros</option><option>kilogramos</option><option>raciones</option><option>kits</option><option>cajas</option><option>pares</option><option>personas</option><option>otro</option></select></label>
        <label className="md:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Cantidad cubierta</span><input type="number" min="0" value={n.cantidadCubierta} onChange={e=>updateNeed(n.id,'cantidadCubierta',e.target.value)} placeholder="0" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"/></label>
        <div className="md:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Estado calculado</span><div className="flex h-[42px] items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold">{status(n)==='cubierta'?<span className="text-emerald-700">✓ Cubierta</span>:status(n)==='parcial'?<span className="text-amber-700">◐ Parcial</span>:<span className="text-red-700">! Pendiente</span>}</div></div>
      </div></div>)}</div>}
    </section>
    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={()=>navigate(-1)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Cancelar</button><button className="rounded-xl bg-[#0f3d5e] px-5 py-2.5 text-sm font-semibold text-white">{submitLabel}</button></div>
  </form>
}

function Select({label,value,onChange,options}){return <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}
