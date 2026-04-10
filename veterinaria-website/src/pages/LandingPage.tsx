import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Sterilization from '../components/Sterilization'
import Grooming from '../components/Grooming'
import BookingSection from '../components/booking/BookingSection'
import Hours from '../components/Hours'
import AboutUs from '../components/AboutUs'
import GoogleReviews from '../components/GoogleReviews'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import Gallery from '../components/Gallery'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Sterilization />
      <Grooming />
      <BookingSection />
      <Hours />
      <AboutUs />
      <GoogleReviews />
      <Testimonials />
      <FAQ />
      <Gallery />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </>
  )
}
