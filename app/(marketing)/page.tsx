import {
  CTASection,
  Features,
  Hero,
  LogosStrip,
  Products,
  Stats,
} from '@/components/marketing/landing/sections'

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogosStrip />
      <Products />
      <Features />
      <Stats />
      <CTASection />
    </>
  )
}
