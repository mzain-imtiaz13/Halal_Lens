import Footer from "./Landing/Footer";
import Navbar from "./Landing/Navbar";
import Hero from "./Landing/Hero";
import Discover from "./Landing/Discover";
import Testimonials from "./Landing/Testimonials";
import FAQs from "./Landing/FAQs";
import Features from "./Landing/Features";

const HalalLensLanding = () => {
  return (
    <div className="min-h-screen text-emerald-950 flex flex-col">
      <Hero />
      <Features/>
      <Discover />
      <Testimonials />
      <FAQs />
    </div>
  );
};

export default HalalLensLanding;
