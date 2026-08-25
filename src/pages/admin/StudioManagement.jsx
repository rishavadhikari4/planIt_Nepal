import { deleteStudio, getAllStudios } from "../../services/studios"
import InventoryManager from "../../components/ui/InventoryManager"

/** Studios record services either as an array or a comma-separated string. */
const serviceCount = (studio) => {
  const services = Array.isArray(studio.services)
    ? studio.services
    : typeof studio.services === "string"
      ? studio.services.split(",").filter((s) => s.trim())
      : []
  if (services.length === 0) return "—"
  return `${services.length} ${services.length === 1 ? "service" : "services"}`
}

const AdminStudios = () => (
  <InventoryManager
    noun="studio"
    nounPlural="studios"
    title="Studios"
    description="Photo and video teams customers can book. Rates here are what they see."
    addPath="/admin-studios/addstudio"
    editPath={(id) => `/admin-studios/edit/${id}`}
    imageKey="studioImage"
    listKey="studios"
    countKey="totalStudios"
    fetchAll={getAllStudios}
    remove={deleteStudio}
    extraColumn={{
      label: "Services",
      render: (studio) => <span className="amount">{serviceCount(studio)}</span>,
    }}
  />
)

export default AdminStudios
