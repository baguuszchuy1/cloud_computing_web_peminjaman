import { Package, Projector, Laptop, Cable, Plug, Mic, Speaker, Camera, Aperture, Presentation, PenLine } from "lucide-react";
const MAP = [["proyektor", Projector], ["laptop", Laptop], ["kabel", Cable], ["listrik", Plug], ["terminal", Plug], ["mic", Mic], ["speaker", Speaker], ["kamera", Camera], ["tripod", Aperture], ["laser", Presentation], ["clicker", Presentation], ["papan", PenLine]];
const BG = ["from-blue-500 to-cyan-400", "from-indigo-500 to-blue-400", "from-sky-500 to-teal-400", "from-blue-600 to-violet-500", "from-cyan-500 to-emerald-400", "from-blue-500 to-indigo-600"];
export default function ItemImg({ item, className = "" }) {
  const w = /(^|\s)w-/.test(className) ? "" : "w-full ";
  if (item?.foto_url) return <img src={item.foto_url} alt={item.nama} className={w + "shrink-0 object-cover " + className} />;
  const n = (item?.nama || "").toLowerCase(), Icon = (MAP.find(([k]) => n.includes(k)) || [0, Package])[1];
  return <div className={w + "relative grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br text-white " + BG[(item?.id || 0) % 6] + " " + className}><span className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-white/15" /><span className="absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-white/10" /><Icon className="relative h-2/5 w-2/5 max-h-16 max-w-16" strokeWidth={1.4} /></div>;
}
