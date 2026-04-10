import { createContext, useContext, useState } from 'react'

interface BookingContextType {
  bookingOpen: boolean
  openBooking: () => void
  closeBooking: () => void
}

const BookingContext = createContext<BookingContextType>({
  bookingOpen: false,
  openBooking: () => {},
  closeBooking: () => {},
})

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <BookingContext.Provider value={{
      bookingOpen,
      openBooking: () => setBookingOpen(true),
      closeBooking: () => setBookingOpen(false),
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  return useContext(BookingContext)
}
