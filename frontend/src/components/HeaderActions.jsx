import { Plus, Minus, X } from "lucide-react"; 

export default function HeaderActions({ onAdd, onRemove, onClose, title }) {
  return (
    <div className="relative flex items-center justify-center w-full px-4 py-3 border rounded">

  {/* Left Buttons */}
  <div className="absolute flex items-center gap-2 left-4">
    <button 
      onClick={onAdd}
      className="p-2 text-white bg-green-500 rounded-full hover:bg-green-600"
    >
      <Plus size={12} />
    </button>

    <button 
      onClick={onRemove}
      className="p-2 text-white bg-yellow-500 rounded-full hover:bg-yellow-600"
    >
      <Minus size={12} />
    </button>

    <button 
      onClick={onClose}
      className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600"
    >
      <X size={12} />
    </button>
  </div>

  {/* Center Title */}
  <h1 className="w-full text-2xl font-semibold text-center">{title}</h1>
   

</div>


  );
}