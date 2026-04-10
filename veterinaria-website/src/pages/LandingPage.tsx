import { BookingProvider, useBooking } from '../lib/BookingContext'
import BookingModal from '../components/booking/BookingModal'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Sterilization from '../components/Sterilization'
import Grooming from '../components/Grooming'
import Hours from '../components/Hours'
import AboutUs from '../components/AboutUs'
import GoogleReviews from '../components/GoogleReviews'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import Gallery from '../components/Gallery'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'

function LandingContent() {
  const { bookingOpen, closeBooking } = useBooking()

  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Sterilization />
      <Grooming />
      <Hours />
      <AboutUs />
      <GoogleReviews />
      <Testimonials />
      <FAQ />
      <Gallery />
      <Contact />
      <Footer />
      <WhatsAppButton />
      <BookingModal open={bookingOpen} onClose={closeBooking} />
    </>
  )
}

export default function LandingPage() {
  return (
    <BookingProvider>
      <LandingContent />
    </BookingProvider>
  )
}
