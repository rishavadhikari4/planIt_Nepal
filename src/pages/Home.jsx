import { Mail, Phone, Home as HomeIcon, Flower, Utensils } from 'lucide-react';
import { submitContactForm } from '../api/contactService';
import Review from './review.jsx';
import '../styles/Home.css';
import { toast } from 'react-toastify';

const Home = () => {
  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      budget: e.target.budget.value,
      message: e.target.message.value,
    };

    const result = await submitContactForm(formData);

    if (result.message === 'Contact Created Successfully') {
      toast.success('Your message has been sent successfully!');
      e.target.reset();
    } else {
      toast.error('There was an error sending your message. Please try again later.');
      alert('There was an error sending your message. Please try again later.');
    }
  };
  return (
    <div className="welcome">
      <div className="hero-section">
        <img 
          src="https://thumbs.dreamstime.com/b/wedding-knot-illustration-hindu-tied-man-woman-dress-30426874.jpg?w=768"
          alt="Wedding celebration" 
          className="hero-image"
        />
        <div className="hero-content">
          <h1 className="welcome__title">Welcome to Wedding Planner</h1>
          <p className="welcome__description">
            Let us help you create the wedding of your dreams. From stunning venues to delicious dishes
            and beautiful decorations, we've got everything you need to make your special day perfect.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-header">
              <h2 className="feature-title">
                <HomeIcon className="w-5 h-5" /> Venues
              </h2>
            </div>
            <div className="feature-content">
              Discover beautiful locations for your special day
            </div>
          </div>

          <div className="feature-box">
            <div className="feature-header">
              <h2 className="feature-title">
                <Utensils className="w-5 h-5" /> Catering
              </h2>
            </div>
            <div className="feature-content">
              Explore our diverse menu options
            </div>
          </div>

          <div className="feature-box">
            <div className="feature-header">
              <h2 className="feature-title">
                <Flower className="w-5 h-5" /> Decorations
              </h2>
            </div>
            <div className="feature-content">
              Choose from stunning decoration themes
            </div>
          </div>
        </div>
        <div className="reviews-section">
          <div className="reviews-box">
            <div className="reviews-header">
              <h2 className="reviews-title">What Our Clients Say</h2>
            </div>
            <br/>
        <Review />
          </div>
        </div>

        <div className="contact-section">
          <div className="contact-box">
            <div className="contact-header">
              <h2 className="contact-title">Get in Touch</h2>
            </div>
            <div className="contact-content">
              <div className="contact-info">
                <p className="contact-item">
                  <Mail className="w-5 h-5" />
                  <span>Email: Weddingplanner@support.com</span>
                </p>
                <p className="contact-item">
                  <Phone className="w-5 h-5" />
                  <span>Phone: (555) 123-4567</span>
                </p>
              </div>

              <form onSubmit={onSubmit} className="contact-form">
                <div className="form-item">
                  <label htmlFor="name">Name</label>
                  <input type="text" name="name" id="name" placeholder="Your name" required />
                </div>
                <div className="form-item">
                  <label htmlFor="email">Email</label>
                  <input type="email" name="email" id="email" placeholder="Your email" required />
                </div>
                <div className="form-item">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    placeholder="Your phone number"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    minLength={10}
                  />
                </div>
                <div className="form-item">
                  <label htmlFor="budget">Budget</label>
                  <input
                    type="number"
                    name="budget"
                    id="budget"
                    placeholder="Your budget"
                    required
                    min={1000000}
                    max={10000000}
                    step={10000}
                  />
                  <small>Range: 10,00,000 to 10,000,000</small>
                </div>
                <div className="form-item">
                  <label htmlFor="message">Message</label>
                  <textarea name="message" id="message" placeholder="Tell us about your wedding plans..." required></textarea>
                </div>
                <button type="submit">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>© {new Date().getFullYear()} Wedding Planner. All rights reserved.</p>
        <p>Designed with ❤️ by Wedding Planner Team</p>
      </div>
    </div>
  );
};

export default Home;
