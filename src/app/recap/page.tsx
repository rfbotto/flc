import RecapHeader from './components/RecapHeader'
import ActivityStats from './components/ActivityStats'
import MonthlyBreakdown from './components/MonthlyBreakdown'
import TopSports from './components/TopSports'
import TopVenues from './components/TopVenues'
import ShareableOverview from './components/ShareableOverview'

export default function YearlyRecap() {
  const userData = {
    name: "Alex Johnson",
    profilePicture: "/placeholder-user.jpg",
    activeDays: 180,
    totalMinutes: 10800,
    totalSports: 12,
    totalBookings: 95,
    monthlyActivities: [
      { month: "Jan", count: 8 },
      { month: "Feb", count: 10 },
      { month: "Mar", count: 12 },
      { month: "Apr", count: 15 },
      { month: "May", count: 18 },
      { month: "Jun", count: 22 },
      { month: "Jul", count: 25 },
      { month: "Aug", count: 28 },
      { month: "Sep", count: 24 },
      { month: "Oct", count: 20 },
      { month: "Nov", count: 16 },
      { month: "Dec", count: 14 },
    ],
    topSports: [
      { name: "Tennis", count: 30 },
      { name: "Swimming", count: 25 },
      { name: "Running", count: 20 },
      { name: "Yoga", count: 15 },
      { name: "Basketball", count: 10 },
    ],
    topVenues: [
      { name: "City Sports Center", logo: "/placeholder.svg", count: 40 },
      { name: "Greenfield Park", logo: "/placeholder.svg", count: 30 },
      { name: "Sunset Gym", logo: "/placeholder.svg", count: 25 },
      { name: "Riverside Courts", logo: "/placeholder.svg", count: 20 },
      { name: "Mountain Trail", logo: "/placeholder.svg", count: 15 },
    ],
  }

  return (
    <div className="min-h-screen bg-white text-[#141414]">
      <RecapHeader name={userData.name} profilePicture={userData.profilePicture} />
      <ActivityStats
        activeDays={userData.activeDays}
        totalMinutes={userData.totalMinutes}
        totalSports={userData.totalSports}
        totalBookings={userData.totalBookings}
      />
      <MonthlyBreakdown data={userData.monthlyActivities} />
      <TopSports sports={userData.topSports} />
      <TopVenues venues={userData.topVenues} />
      <ShareableOverview
        userData={{
          name: userData.name,
          activeDays: userData.activeDays,
          totalMinutes: userData.totalMinutes,
          totalSports: userData.totalSports,
          totalBookings: userData.totalBookings,
          topSport: userData.topSports[0],
          topVenue: userData.topVenues[0],
        }}
      />
    </div>
  )
}

