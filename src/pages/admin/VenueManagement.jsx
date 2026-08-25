import { deleteVenue, getAllVenues } from "../../services/venues"
import InventoryManager from "../../components/ui/InventoryManager"

const AdminVenues = () => (
  <InventoryManager
    noun="venue"
    nounPlural="venues"
    title="Venues"
    description="Everything customers can book as a venue. Prices and capacity here are what they see."
    addPath="/admin-venues/addVenue"
    editPath={(id) => `/admin-venues/edit/${id}`}
    imageKey="venueImage"
    listKey="venues"
    countKey="totalVenues"
    fetchAll={getAllVenues}
    remove={deleteVenue}
    extraColumn={{
      label: "Capacity",
      render: (venue) =>
        venue.capacity ? <span className="amount">{venue.capacity} guests</span> : "—",
    }}
  />
)

export default AdminVenues
