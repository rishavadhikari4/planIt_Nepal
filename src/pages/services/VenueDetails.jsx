import { useParams } from "react-router-dom"
import { getVenueById } from "../../services/venues"
import BookableDetail from "../../components/ui/BookableDetail"

const VenueDetails = () => {
  const { venueId } = useParams()

  return (
    <BookableDetail
      id={venueId}
      noun="venue"
      backPath="/venues"
      backLabel="Back to venues"
      imageKey="venueImage"
      fetchOne={getVenueById}
      unwrap={(response) => ({
        item: response?.data?.venue,
        bookedDates: response?.data?.bookedDates,
        totalBookings: response?.data?.totalBookings,
      })}
      facts={(venue) => [
        ["Capacity", venue.capacity ? `${venue.capacity} guests` : null],
        ["Location", venue.location],
      ]}
    />
  )
}

export default VenueDetails
