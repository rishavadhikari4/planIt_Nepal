import { useParams } from "react-router-dom"
import { getStudioById } from "../../services/studios"
import BookableDetail from "../../components/ui/BookableDetail"

/** Studios record services either as an array or a comma-separated string. */
const serviceList = (studio) =>
  Array.isArray(studio.services)
    ? studio.services
    : typeof studio.services === "string"
      ? studio.services.split(",").map((s) => s.trim()).filter(Boolean)
      : []

const StudioDetails = () => {
  const { studioId } = useParams()

  return (
    <BookableDetail
      id={studioId}
      noun="studio"
      backPath="/studios"
      backLabel="Back to studios"
      imageKey="studioImage"
      fetchOne={getStudioById}
      unwrap={(response) => ({
        item: response?.data?.studio,
        bookedDates: response?.data?.bookedDates,
        totalBookings: response?.data?.totalBookings,
      })}
      facts={(studio) => {
        const services = serviceList(studio)
        return [
          ["Services", services.length ? services.join(", ") : null],
          ["Location", studio.location],
        ]
      }}
    />
  )
}

export default StudioDetails
